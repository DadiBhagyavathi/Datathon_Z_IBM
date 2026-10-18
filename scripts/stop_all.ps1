# ==============================================================================
# SecureAI Gateway — Windows PowerShell Stop Script
# ==============================================================================

Write-Host "Stopping SecureAI Gateway services on Windows..." -ForegroundColor Yellow

$ports = @(8000, 8080, 5173)
foreach ($port in $ports) {
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid_val in $processes) {
        Stop-Process -Id $pid_val -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "✅ All SecureAI Gateway services stopped on Windows." -ForegroundColor Green
