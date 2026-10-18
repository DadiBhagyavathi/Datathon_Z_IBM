@echo off
REM ==============================================================================
REM SecureAI Gateway — Windows Startup Script (Batch)
REM Launches the Python AI Engine, Go Security Backend, and React Frontend
REM ==============================================================================

setlocal enabledelayedexpansion
set "PROJECT_ROOT=%~dp0.."
cd /d "%PROJECT_ROOT%"

echo ======================================================================
echo 🛡️  SecureAI Gateway — Starting Full Application Stack on Windows
echo ======================================================================

REM 1. Free ports 8000, 8080, 5173 if currently occupied
echo Checking and freeing ports (8000, 8080, 5173)...
for %%p in (8000 8080 5173) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r ":%%p[ ]"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
)
timeout /t 1 >nul

REM 2. Start Python AI Engine (Port 8000)
echo Starting Python AI Engine (:8000)...
start "SecureAI-AIEngine" cmd /k "cd /d "%PROJECT_ROOT%\ai-engine" && set PYTHONPATH=. && uvicorn app.main:app --host 127.0.0.1 --port 8000"

REM 3. Start Go Security Backend (Port 8080)
echo Starting Go Security Backend (:8080)...
start "SecureAI-GoBackend" cmd /k "cd /d "%PROJECT_ROOT%\backend-go" && set PORT=8080 && go run cmd/api/main.go"

REM 4. Start React Frontend (Port 5173)
echo Starting React Frontend (:5173)...
start "SecureAI-Frontend" cmd /k "cd /d "%PROJECT_ROOT%\frontend" && npm run dev -- --host"

echo.
echo ======================================================================
echo 🎉 SecureAI Gateway Stack is Launching!
echo ======================================================================
echo   • Frontend UI:    http://localhost:5173
echo   • Go Backend API: http://localhost:8080
echo   • AI Engine:      http://localhost:8000
echo.
echo To stop all services: run .\scripts\stop_all.bat
echo ======================================================================
