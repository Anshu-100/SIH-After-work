@echo off
title ImpactGrid - Multi-Server Launcher
echo ========================================================
echo   Jharkhand Civic Intelligence Platform - Server Runner
echo ========================================================

echo [1/3] Starting Python FastAPI AI Backend (Port 8000)...
start "Python AI Backend (Port 8000)" cmd /k "cd /d "%~dp0SIH_AI_backend\SIH_AI_backend" && python -m uvicorn main:app --port 8000"

ping 127.0.0.1 -n 3 >nul

echo [2/3] Starting Node.js Express Backend (Port 5000)...
start "Node.js Backend (Port 5000)" cmd /k "cd /d "%~dp0backend" && node server.js"

ping 127.0.0.1 -n 3 >nul

echo [3/3] Starting React Vite Frontend (Port 5173)...
start "React Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo ========================================================
echo   All 3 servers launched successfully in separate windows!
echo.
echo   - Frontend:    http://localhost:5173
echo   - Analytics:   http://localhost:5173/analytics
echo   - Hotspot Map: http://localhost:5173/hotspot-map
echo   - Challenges:  http://localhost:5173/challenges
echo   - Node API:    http://localhost:5000
echo   - AI Backend:  http://localhost:8000
echo ========================================================

