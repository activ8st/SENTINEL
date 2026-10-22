$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot

$python = Join-Path $projectRoot 'venv\Scripts\python.exe'
$vite = Join-Path $projectRoot 'node_modules\vite\bin\vite.js'

if (-not (Test-Path -LiteralPath $python)) {
    throw "Virtual environment not found: $python"
}
if (-not (Test-Path -LiteralPath $vite)) {
    throw 'Frontend dependencies are missing. Run npm install first.'
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
$env:VITE_API_URL = "http://127.0.0.1:$backendPort"

$frontend = Start-Process `
    -FilePath 'node' `
    -ArgumentList @($vite, '--configLoader', 'runner') `
    -WorkingDirectory $projectRoot `
    -WindowStyle Hidden `
    -PassThru

try {
    Write-Host 'Frontend: http://localhost:5173'
    Write-Host "Backend:  http://127.0.0.1:$backendPort"
    Write-Host 'Press Ctrl+C to stop both servers.'
    & $python -m uvicorn backend.main:app --reload --port $backendPort
} finally {
    if ($frontend -and -not $frontend.HasExited) {
        Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue
    }
}
