$ErrorActionPreference = "Stop"

param(
  [string]$ProjectId = "thyton-sos",
  [string]$Bucket = "thyton-sos.firebasestorage.app"
)

$corsFile = Join-Path $PSScriptRoot "..\storage.cors.json"
if (-not (Test-Path -LiteralPath $corsFile)) {
  throw "CORS file not found: $corsFile"
}

Write-Host "Applying Storage CORS from $corsFile to gs://$Bucket" -ForegroundColor Cyan
gsutil cors set $corsFile "gs://$Bucket"
if ($LASTEXITCODE -ne 0) {
  throw "gsutil cors set failed with exit code $LASTEXITCODE"
}

Write-Host "CORS applied. Current config:" -ForegroundColor Green
gsutil cors get "gs://$Bucket"
