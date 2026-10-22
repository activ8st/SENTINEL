$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot

$python = Join-Path $projectRoot 'venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $python)) {
    throw "Virtual environment not found: $python"
}

$env:SENTINEL_AUTO_REFRESH_ENABLED = 'true'
Remove-Item Env:SSLKEYLOGFILE -ErrorAction SilentlyContinue

$backendPort = 8000
$portProbe = $null
try {
    $portProbe = [System.Net.Sockets.TcpListener]::new(
        [System.Net.IPAddress]::Loopback,
        $backendPort
    )
    $portProbe.Start()
} catch {
    $backendPort = 8001
} finally {
    if ($portProbe) {
        $portProbe.Stop()
    }
}

Write-Host "Backend: http://127.0.0.1:$backendPort"
& $python -m uvicorn backend.main:app --reload --port $backendPort
