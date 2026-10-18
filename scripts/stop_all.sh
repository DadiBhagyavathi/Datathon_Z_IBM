#!/usr/bin/env bash
# ==============================================================================
# SecureAI Gateway — One-Command Stop Script
# Shuts down all running processes cleanly
# ==============================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$PROJECT_ROOT/.logs"

echo "Stopping SecureAI Gateway services..."

if [ -d "$LOG_DIR" ]; then
    for pidfile in "$LOG_DIR"/*.pid; do
        if [ -f "$pidfile" ]; then
            pid=$(cat "$pidfile" 2>/dev/null || true)
            if [ -n "$pid" ]; then
                kill "$pid" 2>/dev/null || true
            fi
            rm -f "$pidfile"
        fi
    done
fi

fuser -k 8000/tcp 8080/tcp 5173/tcp 2>/dev/null || true

echo "✅ All SecureAI Gateway services stopped."
