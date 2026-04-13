$ErrorActionPreference = "Stop"

$projectRoot = "C:\Users\42195\Desktop\P R O J E  K  T Y\Thy..... SOS"
$appRoot = "$projectRoot\mobile\tython_x_sos_app"

. "$projectRoot\tools\flutter-clean-shell.ps1"

Set-Location $appRoot

Write-Host ""
Write-Host "Building web from: $appRoot" -ForegroundColor Cyan
& "C:\flutter\bin\flutter.bat" build web
