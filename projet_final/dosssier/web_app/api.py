# -*- coding: utf-8 -*-
import os
import sys
import re
import pickle
import time
import warnings
import io
import requests
from typing import List, Optional

# Désactiver TF/Keras pour économiser de l'espace et éviter les erreurs Keras 3
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import numpy as np
import torch
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
from sentence_transformers import SentenceTransformer, util
from deep_translator import GoogleTranslator
from langdetect import detect, DetectorFactory

# ─────────────────────────────────────────────────────────────
#  CONFIGURATION & CHEMINS
# ─────────────────────────────────────────────────────────────
MODELS_DIR = os.path.join(os.getcwd(), "..", "..", "models-20260423T133445Z-3-001", "models")
SVM_PATH     = os.path.join(MODELS_DIR, "svm_model.pkl")
TFIDF_PATH   = os.path.join(MODELS_DIR, "tfidf_vectorizer.pkl")
ENCODER_PATH = os.path.join(MODELS_DIR, "label_encoder.pkl")
SBERT_MODEL  = 'sentence-transformers/all-MiniLM-L6-v2'
OLLAMA_URL   = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3"

app = FastAPI(title="Recruiter AI API")

# Activer CORS pour React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────
#  CHARGEMENT DES MODÈLES (Singleton)
# ─────────────────────────────────────────────────────────────
class ModelManager:
    def __init__(self):
        self.svm = None
        self.tfidf = None
        self.le = None
        self.sbert = None
        self.load_all()

    def load_all(self):
        print("🔄 Chargement des modèles IA...")
        try:
            with open(SVM_PATH, "rb") as f: self.svm = pickle.load(f)
            with open(TFIDF_PATH, "rb") as f: self.tfidf = pickle.load(f)
            with open(ENCODER_PATH, "rb") as f: self.le = pickle.load(f)
            self.sbert = SentenceTransformer(SBERT_MODEL)
            print("✅ Tous les modèles sont chargés.")
        except Exception as e:
            print(f"❌ Erreur chargement : {e}")

models = ModelManager()

# ─────────────────────────────────────────────────────────────
#  LOGIQUE DE TRAITEMENT
# ─────────────────────────────────────────────────────────────

SKILLS_DB = {
    "IT/DATA": ["python", "java", "sql", "machine learning", "deep learning", "aws", "azure", "docker", "kubernetes", "react", "node.js", "javascript", "cloud", "api", "git", "scrum", "agile", "mongodb", "postgresql", "tensorflow", "pytorch", "pandas", "numpy", "spark"],
    "GESTION": ["project management", "agile", "crm", "salesforce", "marketing", "kpi", "roi", "strategy", "business development", "negotiation", "stakeholder management"],
    "FINANCE": ["accounting", "finance", "audit", "tax", "excel", "sap", "quickbooks", "financial analysis", "forecasting"],
}

def extract_text_from_pdf(file_content):
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_content)) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t: text += t + "\n"
        return text.strip()
    except Exception as e:
        return ""

def translate_if_needed(text):
    if not text: return ""
    try:
        DetectorFactory.seed = 0
        lang = detect(text[:1000])
        if lang != "en":
            translator = GoogleTranslator(source=lang, target='en')
            chunks = [text[i:i+4500] for i in range(0, len(text), 4500)]
            return " ".join([translator.translate(c) for c in chunks])
    except:
        pass
    return text

def get_skills(text):
    found = []
    t = text.lower()
    for cat, skills in SKILLS_DB.items():
        for s in skills:
            if re.search(r'\b' + re.escape(s) + r'\b', t):
                found.append(s)
    return sorted(list(set(found)))

def generate_ollama_summary(cv_text: str) -> str:
    """Appelle Ollama LLaMA3 pour générer un résumé professionnel du CV."""
    prompt = f"""Tu es un expert RH. Lis ce CV et génère un résumé professionnel concis en FRANÇAIS (3-4 phrases maximum) qui met en valeur les compétences clés, l'expérience et les points forts du candidat. Réponds uniquement avec le résumé en français, sans introduction ni commentaire.

CV :
{cv_text[:2000]}

Résumé professionnel :"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )
        if response.status_code == 200:
            return response.json().get("response", "").strip()
        return None
    except Exception as e:
        print(f"❌ Erreur Ollama : {e}")
        return None

# ─────────────────────────────────────────────────────────────
#  ENDPOINTS
# ─────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"message": "Recruiter AI API est en ligne !"}

@app.post("/classify")
async def classify_cv(file: UploadFile = File(...)):
    print(f"📥 Reçu fichier pour classification : {file.filename}")
    content = await file.read()
    raw_text = extract_text_from_pdf(content)
    if not raw_text:
        raise HTTPException(400, "Impossible d'extraire le texte du PDF")

    text_en = translate_if_needed(raw_text)

    # Prediction SVM (Logic V2 amelioree)
    vec = models.tfidf.transform([text_en.lower()])
    scores = models.svm.decision_function(vec)[0]
    # Temperature scaling
    scaled = scores / 0.15
    exp_s = np.exp(scaled - scaled.max())
    proba = exp_s / exp_s.sum()

    top_indices = np.argsort(proba)[::-1][:5]
    results = []
    for i in top_indices:
        results.append({
            "category": models.le.inverse_transform([i])[0],
            "confidence": round(float(proba[i] * 100), 1)
        })

    return {
        "filename": file.filename,
        "prediction": results[0],
        "top_categories": results,
        "skills": get_skills(text_en)
    }

@app.post("/match")
async def match_cv_job(file: UploadFile = File(...), jd_text: str = Form(...)):
    content = await file.read()
    cv_raw = extract_text_from_pdf(content)
    if not cv_raw:
        raise HTTPException(400, "Impossible d'extraire le texte du CV")

    cv_en = translate_if_needed(cv_raw)
    jd_en = translate_if_needed(jd_text)

    # Embeddings SBERT
    cv_vec = models.sbert.encode(cv_en, convert_to_tensor=True)
    jd_vec = models.sbert.encode(jd_en, convert_to_tensor=True)

    similarity = float(util.cos_sim(cv_vec, jd_vec).item())

    # Matching skills
    cv_skills = set(get_skills(cv_en))
    jd_skills = set(get_skills(jd_en))
    common  = sorted(list(cv_skills.intersection(jd_skills)))
    missing = sorted(list(jd_skills - cv_skills))

    # Bonus skills
    bonus = (len(common) / len(jd_skills) * 10) if jd_skills else 0
    final_score = min(100, (similarity * 100) + bonus)

    return {
        "score": round(final_score, 1),
        "semantic_similarity": round(similarity * 100, 1),
        "common_skills": common,
        "missing_skills": missing,
        "cv_skills": sorted(list(cv_skills))
    }

@app.post("/summarize")
async def summarize_cv(file: UploadFile = File(...)):
    """Génère un résumé professionnel du CV via Ollama LLaMA3."""
    print(f"📥 Reçu fichier pour résumé : {file.filename}")
    content = await file.read()
    raw_text = extract_text_from_pdf(content)
    if not raw_text:
        raise HTTPException(400, "Impossible d'extraire le texte du PDF")

    text_en = translate_if_needed(raw_text)
    summary = generate_ollama_summary(text_en)

    if summary:
        return {"summary": summary, "status": "success"}
    else:
        return {
            "summary": None,
            "status": "error",
            "message": "Ollama n'est pas disponible. Assurez-vous qu'il tourne sur le port 11434 avec : ollama run llama3"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)