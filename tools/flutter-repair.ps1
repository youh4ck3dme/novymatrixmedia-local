$ErrorActionPreference = "Stop"

$projectRoot = "C:\Users\42195\Desktop\P R O J E  K  T Y\Thy..... SOS"
$flutter = "C:\flutter\bin\flutter.bat"
$cacheRoot = "C:\flutter\bin\cache"

Write-Host "Stopping stale flutter/dart processes..." -ForegroundColor Yellow
Get-CimInstance Win32_Process |
  Where-Object { $_.CommandLine -and $_.CommandLine -match "flutter|dart-sdk|flutter_tool|pub upgrade" } |
  ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }

Write-Host "Cleaning broken lock/snapshots..." -ForegroundColor Yellow
Remove-Item -LiteralPath "$cacheRoot\flutter.bat.lock" -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath "$cacheRoot\flutter_tools.snapshot" -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath "$cacheRoot\flutter_tools.stamp" -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath "$cacheRoot\dart-sdk\bin\snapshots\analysis_server.dart.snapshot" -Force -ErrorAction SilentlyContinue

Write-Host "Applying clean env..." -ForegroundColor Yellow
. "$projectRoot\tools\flutter-clean-shell.ps1"

Write-Host "Rebuilding Flutter tool (first run can take several minutes)..." -ForegroundColor Yellow
& $flutter --suppress-analytics --version

Write-Host "Repair complete." -ForegroundColor Green
