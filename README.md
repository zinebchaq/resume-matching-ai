# AI Resume Screening & Job Matching

> Système intelligent de classification et de matching de CVs développé dans le cadre du module Deep Learning & NLP — ENSA de Fès (2025/2026)
---
##  Description

Ce projet propose un système complet de :
- **Classification automatique de CVs** par catégorie professionnelle (TF-IDF + SVM)
- **Matching sémantique** entre un CV et une offre d'emploi (Sentence-BERT)
- **Génération automatique de résumés professionnels** en français (LLaMA3 via Ollama)
- **Interface web interactive** développée en React.js
---

## ⚙️ Prérequis

- Python 3.10+
- Node.js 18+
- Ollama installé sur votre machine

---

##  Installation et lancement

### 1. Cloner le projet

```bash
git clone https://github.com/maryem2104/resume-matching-ai/tree/main/projet_final
cd projet_final
```

### 2. Installer les dépendances Python

```bash
pip install fastapi uvicorn pdfplumber sentence-transformers
pip install deep-translator langdetect scikit-learn numpy torch
```

### 3. Lancer le backend (FastAPI)

```bash
cd dosssier/web_app
python api.py
```

> Le backend tourne sur **http://localhost:8000**

### 4. Installer les dépendances React

```bash
cd dosssier/web_app/client
npm install
npm run dev
```

> Le frontend tourne sur **http://localhost:5173**
---
### ⚠️ Configuration du fichier `run_app.bat si vous ne voulez pas passer par ligne de commande :

Avant de lancer le script, vous devez modifier les chemins selon l'emplacement de votre projet sur votre machine.

**Ouvrez `run_app.bat` avec un éditeur de texte (Bloc-notes ou VS Code) et modifiez ces deux lignes :**
```bat
:: Ligne 7 — Chemin du backend
cd /d D:\cycle_S4\DL_NLP\projet_final\dosssier\web_app

:: Ligne 11 — Chemin du frontend
cd /d D:\cycle_S4\DL_NLP\projet_final\dosssier\web_app\client
```
**Remplacez `D:\cycle_S4\DL_NLP\projet_final` par le chemin où vous avez cloné le projet**

**Comment trouver votre chemin :**
1. Ouvrez le dossier du projet dans l'explorateur Windows
2. Cliquez sur la barre d'adresse en haut
3. Copiez le chemin affiché
4. Collez-le dans `run_app.bat` en remplaçant l'ancien chemin
## 🧠 Modèles utilisés

| Modèle | Rôle | Performance |
|--------|------|-------------|
| TF-IDF + SVM | Classification de CVs | Accuracy : 72.03% |
| DistilBERT | Expérimentation comparative | Accuracy : 81.29% |
| Sentence-BERT (all-MiniLM-L6-v2) | Matching CV-Offre | Similarité cosinus |
| LLaMA3 (Ollama) | Résumé professionnel | Génération en français |
---
## 📊 Dataset

- **Resume Dataset** — Kaggle : 2484 CVs, 24 catégories professionnelles
---
## 👥 Auteurs

- Zineb Chaqchaq
- Maryem Filali

**Encadrant :** Pr. Oussama EL GANNOUR  
**Module :** Deep Learning & NLP — ENSA de Fès  
**Année universitaire :*
