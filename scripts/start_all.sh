#!/usr/bin/env bash
# ==============================================================================
# SecureAI Gateway — One-Command Startup Script
# Launches the Python AI Engine, Go Security Backend, and React Frontend
# ==============================================================================

set -uo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$PROJECT_ROOT/.logs"
mkdir -p "$LOG_DIR"

echo "======================================================================"
echo "🛡️  SecureAI Gateway — Starting Full Application Stack"
echo "======================================================================"

# 1. Clean up any existing instances on ports 8000, 8080, 5173
echo "Checking and freeing ports (8000, 8080, 5173)..."
fuser -k 8000/tcp 8080/tcp 5173/tcp 2>/dev/null || true
sleep 1

# 2. Start Python AI Engine (Port 8000)
echo -n "Starting Python AI Engine (:8000)... "
cd "$PROJECT_ROOT/ai-engine"
if command -v uvicorn >/dev/null 2>&1; then
    UVICORN_CMD="uvicorn"
elif python3.10 -m uvicorn --version >/dev/null 2>&1; then
    UVICORN_CMD="python3.10 -m uvicorn"
elif [ -f "$HOME/.local/bin/uvicorn" ]; then
    UVICORN_CMD="$HOME/.local/bin/uvicorn"
else
    UVICORN_CMD="python3 -m uvicorn"
fi
PYTHONPATH=. $UVICORN_CMD app.main:app --host 127.0.0.1 --port 8000 > "$LOG_DIR/ai-engine.log" 2>&1 &
echo $! > "$LOG_DIR/ai-engine.pid"
sleep 3
if curl -s http://127.0.0.1:8000/health | grep -q "ok"; then
    echo "✅ Running"
else
    echo "⚠️ Starting up (logs in $LOG_DIR/ai-engine.log)"
fi

# 3. Start Go Security Backend (Port 8080)
echo -n "Starting Go Security Backend (:8080)... "
cd "$PROJECT_ROOT/backend-go"
go run cmd/api/main.go > "$LOG_DIR/backend.log" 2>&1 &
echo $! > "$LOG_DIR/backend.pid"
sleep 2
if curl -s http://127.0.0.1:8080/api/v1/health | grep -q "ok"; then
    echo "✅ Running"
else
    echo "⚠️ Starting up (logs in $LOG_DIR/backend.log)"
fi

# 4. Start React Frontend (Port 5173)
echo -n "Starting React Frontend (:5173)... "
cd "$PROJECT_ROOT/frontend"
npm run dev -- --host > "$LOG_DIR/frontend.log" 2>&1 &
echo $! > "$LOG_DIR/frontend.pid"
sleep 2
echo "✅ Running"

echo ""
echo "======================================================================"
echo "🎉 SecureAI Gateway Stack is Live!"
echo "======================================================================"
echo "  • Frontend UI:    http://localhost:5173"
echo "  • Go Backend API: http://localhost:8080"
echo "  • AI Engine:      http://localhost:8000"
echo "  • Logs Directory: $LOG_DIR"
echo ""
echo "To run automated security tests: ./scripts/run_security_tests.sh"
echo "To stop all services:            ./scripts/stop_all.sh"
echo "======================================================================"
