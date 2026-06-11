import React, { useState } from 'react';
import { Upload, Search, Briefcase, FileText, CheckCircle, AlertCircle, BarChart3, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_BASE = "http://localhost:8000";

function App() {
  const [activeTab, setActiveTab] = useState('classify');
  const [file, setFile] = useState(null);
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [results, setResults] = useState(null);
  const [summary, setSummary] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResults(null);
    setSummary(null);
  };

  const runAnalysis = async () => {
    if (!file) return alert("Veuillez sélectionner un CV (PDF)");
    setLoading(true);
    setResults(null);
    setSummary(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      if (activeTab === 'classify') {
        const res = await axios.post(`${API_BASE}/classify`, formData);
        setResults({ type: 'classify', data: res.data });

        setLoadingSummary(true);
        try {
          const formData2 = new FormData();
          formData2.append('file', file);
          const sumRes = await axios.post(`${API_BASE}/summarize`, formData2);
          if (sumRes.data.status === 'success') {
            setSummary(sumRes.data.summary);
          } else {
            setSummary(null);
          }
        } catch (err) {
          setSummary(null);
        } finally {
          setLoadingSummary(false);
        }

      } else {
        if (!jdText) return alert("Veuillez saisir une offre d'emploi");
        formData.append('jd_text', jdText);
        const res = await axios.post(`${API_BASE}/match`, formData);
        setResults({ type: 'match', data: res.data });
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'analyse. Vérifiez que le backend tourne sur le port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>Recruiter AI Dashboard</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem' }}>
            L'intelligence artificielle au service du recrutement stratégique.
          </p>
        </motion.div>
      </header>

      <nav className="nav glass" style={{ padding: '0.5rem 1rem', borderRadius: '16px', width: 'fit-content', margin: '0 auto 3rem auto' }}>
        <div
          className={`nav-item ${activeTab === 'classify' ? 'active' : ''}`}
          onClick={() => { setActiveTab('classify'); setResults(null); setSummary(null); }}
        >
          <BarChart3 size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Screening & Classification
        </div>
        <div
          className={`nav-item ${activeTab === 'match' ? 'active' : ''}`}
          onClick={() => { setActiveTab('match'); setResults(null); setSummary(null); }}
        >
          <Briefcase size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Job Matching
        </div>
      </nav>

      <div className="grid">

        {/* ══════════════════════════════
            GAUCHE : Inputs + Résumé
        ══════════════════════════════ */}
        <motion.div layout className="card glass" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
            <Upload style={{ marginRight: 12, color: 'var(--primary)' }} />
            Importation des données
          </h2>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Curriculum Vitae (PDF)</label>
            <input type="file" accept=".pdf" onChange={handleFileChange} />
            {file && <p style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>📄 {file.name}</p>}
          </div>

          {activeTab === 'match' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Offre d'emploi</label>
              <textarea
                rows="6"
                placeholder="Collez ici la description du poste ou les exigences..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
            </motion.div>
          )}

          <button
            className="btn-primary"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
            onClick={runAnalysis}
            disabled={loading}
          >
            {loading ? <div className="loader"></div> : <><Search size={20} /> Lancer l'analyse IA</>}
          </button>

          {/* ── Résumé Ollama (gauche, en bas) ── */}
          {activeTab === 'classify' && (loadingSummary || summary || (results && results.type === 'classify')) && (
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: '#4ade80' }} />
                Résumé professionnel IA — LLaMA3
              </h4>

              {loadingSummary && (
                <div style={{
                  background: 'rgba(74, 222, 128, 0.05)',
                  border: '1px solid rgba(74, 222, 128, 0.2)',
                  borderRadius: '12px',
                  padding: '1.2rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div className="loader" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', margin: 0 }}>
                    LLaMA3 génère le résumé en français...
                  </p>
                </div>
              )}

              {!loadingSummary && summary && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'rgba(74, 222, 128, 0.08)',
                    border: '1px solid rgba(74, 222, 128, 0.3)',
                    borderRadius: '12px',
                    padding: '1.2rem 1.5rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-dim)',
                    lineHeight: '1.7'
                  }}
                >
                  {summary}
                </motion.div>
              )}

              {!loadingSummary && !summary && results && results.type === 'classify' && (
                <div style={{
                  background: 'rgba(251, 191, 36, 0.08)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '12px',
                  padding: '1rem 1.5rem',
                  fontSize: '0.85rem',
                  color: '#fbbf24'
                }}>
                  ⚠️ Ollama non disponible. Lancez : <code>ollama run llama3</code>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* ══════════════════════════════
            DROITE : Résultats
        ══════════════════════════════ */}
        <div className="results-container">
          <AnimatePresence mode="wait">

            {!results && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="card glass"
                style={{ textAlign: 'center', color: 'var(--text-dim)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <FileText size={64} style={{ margin: '0 auto 1.5rem auto', opacity: 0.2 }} />
                <p>En attente de données...</p>
                <p style={{ fontSize: '0.8rem' }}>Chargez un CV pour commencer l'analyse.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                className="card glass"
                style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <div className="loader" style={{ width: '48px', height: '48px', margin: '0 auto 2rem auto', borderWidth: '4px' }}></div>
                <h3>Analyse en cours...</h3>
                <p style={{ color: 'var(--text-dim)' }}>Extraction, traduction et calcul sémantique...</p>
              </motion.div>
            )}

            {results && results.type === 'classify' && (
              <motion.div
                key="classify-res"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card glass"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <div>
                    <h3 style={{ color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Catégorie Prédite</h3>
                    <h2 style={{ fontSize: '2rem', color: 'var(--accent)' }}>{results.data.prediction.category}</h2>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="score-badge">{results.data.prediction.confidence}%</div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Confiance</div>
                  </div>
                </div>

                <h4 style={{ marginBottom: '1rem' }}>Top 5 des domaines correspondants</h4>
                <div style={{ marginBottom: '2rem' }}>
                  {results.data.top_categories.map((cat, i) => (
                    <div key={i} style={{ marginBottom: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
                        <span>{cat.category}</span>
                        <span>{cat.confidence}%</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.confidence}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          style={{ height: '100%', background: i === 0 ? 'var(--accent)' : 'var(--primary)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <h4 style={{ marginBottom: '1rem' }}>Compétences détectées</h4>
                <div>
                  {results.data.skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
                </div>
              </motion.div>
            )}

            {results && results.type === 'match' && (
              <motion.div
                key="match-res"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card glass"
              >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                  <h3 style={{ color: 'var(--text-dim)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '0.5rem' }}>Score de Matching</h3>
                  <div className="score-badge" style={{ fontSize: '4rem', textShadow: '0 0 20px var(--primary-glow)' }}>
                    {results.data.score}%
                  </div>
                  <p style={{ marginTop: '0.5rem', fontWeight: 600, color: results.data.score > 60 ? '#4ade80' : '#f87171' }}>
                    {results.data.score > 75 ? "✨ Candidat Idéal" : results.data.score > 50 ? "✅ Candidat Potentiel" : "⚠️ Faible Correspondance"}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div className="glass" style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.3)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Similiarité Sémantique</p>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{results.data.semantic_similarity}%</p>
                  </div>
                  <div className="glass" style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.3)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Compétences Clés</p>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>{results.data.common_skills.length} matchés</p>
                  </div>
                </div>

                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                  <CheckCircle size={18} style={{ color: '#4ade80', marginRight: 8 }} />
                  Compétences Matchées
                </h4>
                <div style={{ marginBottom: '1.5rem' }}>
                  {results.data.common_skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
                </div>

                {results.data.missing_skills.length > 0 && (
                  <>
                    <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                      <AlertCircle size={18} style={{ color: '#f87171', marginRight: 8 }} />
                      Compétences Manquantes
                    </h4>
                    <div>
                      {results.data.missing_skills.map((s, i) => <span key={i} className="skill-tag missing">{s}</span>)}
                    </div>
                  </>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <footer style={{ marginTop: '5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.9rem', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2rem' }}>
        CV Screening & Job Matching v2.0 — Propulsé par TF-IDF · Sentence-BERT · LLaMA3
      </footer>
    </div>
  );
}

export default App;