@echo off
REM ==============================================================================
REM SecureAI Gateway — Windows Shutdown Script (Batch)
REM Terminates all running SecureAI Gateway processes
REM ==============================================================================

echo Stopping SecureAI Gateway services on Windows...

REM Kill processes by window title
taskkill /F /FI "WINDOWTITLE eq SecureAI-*" >nul 2>&1

REM Free ports 8000, 8080, 5173
for %%p in (8000 8080 5173) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr /r ":%%p[ ]"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo ✅ All SecureAI Gateway services stopped on Windows.
