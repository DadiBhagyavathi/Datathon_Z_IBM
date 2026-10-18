# ==============================================================================
# SecureAI Gateway — Windows PowerShell Startup Script
# ==============================================================================

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "🛡️  SecureAI Gateway — Starting Full Application Stack (PowerShell)" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Stop any conflicting processes on target ports
$ports = @(8000, 8080, 5173)
foreach ($port in $ports) {
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid_val in $processes) {
        Stop-Process -Id $pid_val -Force -ErrorAction SilentlyContinue
    }
}

# 2. Start Python AI Engine (Port 8000)
Write-Host "Starting Python AI Engine (:8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot\ai-engine'; `$env:PYTHONPATH='.'; uvicorn app.main:app --host 127.0.0.1 --port 8000"

# 3. Start Go Security Backend (Port 8080)
Write-Host "Starting Go Security Backend (:8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot\backend-go'; `$env:PORT='8080'; go run cmd/api/main.go"

# 4. Start React Frontend (Port 5173)
Write-Host "Starting React Frontend (:5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ProjectRoot\frontend'; npm run dev -- --host"

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "🎉 SecureAI Gateway Stack is Launching!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "  • Frontend UI:    http://localhost:5173"
Write-Host "  • Go Backend API: http://localhost:8080"
Write-Host "  • AI Engine:      http://localhost:8000"
Write-Host ""
Write-Host "To stop all services: run .\scripts\stop_all.ps1"
Write-Host "======================================================================"
