param(
    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"

$projectRoot = "C:\Users\42195\Desktop\P R O J E  K  T Y\Thy..... SOS"
$appRoot = "$projectRoot\mobile\tython_x_sos_app"
$webRoot = "$appRoot\build\web"
$logRoot = "C:\thyton_env\tmp"

if (-not (Test-Path -LiteralPath $webRoot)) {
    throw "Web build not found at $webRoot. Run tools\build-web.bat first."
}

New-Item -ItemType Directory -Path $logRoot -Force | Out-Null

$serverOut = Join-Path $logRoot "preview-web-server.out.log"
$serverErr = Join-Path $logRoot "preview-web-server.err.log"
Remove-Item -LiteralPath $serverOut, $serverErr -Force -ErrorAction SilentlyContinue

Start-Process -FilePath "python" -ArgumentList @(
    "-m",
    "http.server",
    $Port,
    "--bind",
    "127.0.0.1"
) -WorkingDirectory $webRoot -RedirectStandardOutput $serverOut -RedirectStandardError $serverErr | Out-Null

Start-Sleep -Seconds 2
Start-Process "http://127.0.0.1:$Port"

Write-Host "Preview server started: http://127.0.0.1:$Port" -ForegroundColor Green
Write-Host "Web root: $webRoot" -ForegroundColor Cyan
