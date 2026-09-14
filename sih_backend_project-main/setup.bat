@echo off
title ImpactGrid - Automated Setup
echo ========================================================
echo   Jharkhand Civic Intelligence Platform - First Time Setup
echo ========================================================
echo.

:: 1. Verify Node.js
echo [Step 1/5] Checking Node.js installation...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is NOT installed!
    echo Please download and install Node.js (LTS version) from https://nodejs.org/
    echo After installing Node.js, re-run this setup script.
    pause
    exit /b 1
)
node -v

:: 2. Verify Python
echo.
echo [Step 2/5] Checking Python installation...
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is NOT installed!
    echo Please download and install Python from https://www.python.org/
    echo Make sure to check "Add Python to PATH" during installation.
    echo After installing Python, re-run this setup script.
    pause
    exit /b 1
)
python --version

:: 3. Setup backend environment variables
echo.
echo [Step 3/5] Setting up environment configuration...
if not exist "%~dp0backend\.env" (
    if exist "%~dp0backend\.env.example" (
        copy "%~dp0backend\.env.example" "%~dp0backend\.env" >nul
        echo Created backend\.env from template successfully.
    ) else (
        echo [WARNING] backend\.env.example not found.
    )
) else (
    echo backend\.env already exists.
)

:: 4. Install Node.js Backend & Frontend dependencies
echo.
echo [Step 4/5] Installing Node.js packages...
echo Installing backend modules...
cd /d "%~dp0backend"
call npm install
if %errorlevel% neq 0 (
    echo [WARNING] Backend npm install had an issue. Continuing...
)

echo.
echo Installing frontend modules...
cd /d "%~dp0frontend"
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo [WARNING] Frontend npm install had an issue. Continuing...
)

:: 5. Install Python dependencies
echo.
echo [Step 5/5] Installing Python AI backend dependencies...
cd /d "%~dp0SIH_AI_backend\SIH_AI_backend"
call pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [WARNING] pip install had an issue. Continuing...
)

echo.
echo ========================================================
echo   SETUP COMPLETED SUCCESSFULLY!
echo ========================================================
echo.
echo You are all set!
echo To run the full system with all 3 services, simply double-click:
echo   ==> start_all.bat
echo.
pause

