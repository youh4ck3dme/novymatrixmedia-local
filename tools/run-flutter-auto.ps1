param(
    [switch]$ConfigureFirebase
)

$ErrorActionPreference = "Stop"

$projectRoot = "C:\Users\42195\Desktop\P R O J E  K  T Y\Thy..... SOS"
$appRoot = "$projectRoot\mobile\tython_x_sos_app"

. "$projectRoot\tools\flutter-clean-shell.ps1"

Set-Location $appRoot

Write-Host ""
Write-Host "Project root : $projectRoot" -ForegroundColor Cyan
Write-Host "App root     : $appRoot" -ForegroundColor Cyan
Write-Host "Flutter      : C:\flutter\bin\flutter.bat" -ForegroundColor Cyan
Write-Host ""

if ($ConfigureFirebase) {
    Write-Host "Running FlutterFire configure..." -ForegroundColor Yellow
    flutterfire configure --project=thyton-sos --platforms=android,ios,web --android-package-name=com.tythonx.sos --ios-bundle-id=com.tythonx.sos --yes
}

Write-Host "Running flutter pub get..." -ForegroundColor Yellow
flutter pub get

Write-Host "Running flutter analyze..." -ForegroundColor Yellow
flutter analyze

Write-Host "Running flutter test..." -ForegroundColor Yellow
flutter test

Write-Host ""
Write-Host "Automatic Flutter setup finished." -ForegroundColor Green
