@echo off
echo ==================================================
echo   RECRUITER AI - DEMARRAGE AUTOMATIQUE (S4 PROJET)
echo ==================================================

:: 1. Lancer le BACKEND (API Python)
:: On se place dans le dossier web_app
start "BACKEND - API IA" cmd /k cd /d "D:\Données professionnelles de zineb\Données professionnelles de zineb\projet and stage\projet\resume-matching-ai-main\projet_final\dosssier\web_app"
echo [OK] Serveur IA en cours de demarrage...

:: 2. Lancer le FRONTEND (React / Vite)
:: On se place dans le dossier client
echo [OK] Preparation de l'interface React...
start "FRONTEND - CLIENT" cmd /k cd /d "D:\Données professionnelles de zineb\Données professionnelles de zineb\projet and stage\projet\resume-matching-ai-main\projet_final\dosssier\web_app\client"

:: 3. Attente et ouverture
echo.
echo [!] Lancement des moteurs IA et Web...
timeout /t 8
echo [!] Ouverture du navigateur...
start http://localhost:5173

echo ==================================================
echo   L'APPLICATION EST PRETE !
echo   Garde les deux fenetres noires ouvertes pour 
echo   que l'IA puisse fonctionner.
echo ==================================================
pause