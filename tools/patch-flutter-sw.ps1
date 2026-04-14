param(
  [string]$AppRoot = "C:\Users\42195\Desktop\P R O J E  K  T Y\Thy..... SOS\mobile\tython_x_sos_app"
)

$ErrorActionPreference = "Stop"

$swPath = Join-Path $AppRoot "build\web\flutter_service_worker.js"
if (-not (Test-Path -LiteralPath $swPath)) {
  Write-Host "Service worker not found at: $swPath" -ForegroundColor Yellow
  exit 0
}

$content = Get-Content -Raw -LiteralPath $swPath

# Root cause fix:
# In some generated variants, downloadOffline() references `origin` without
# defining it in function scope. Patch it after each web build.
$pattern = "async function downloadOffline\(\)\s*\{\r?\n"
$insertion = "async function downloadOffline() {`r`n  var origin = self.location.origin;`r`n"

if ($content -match [regex]::Escape("async function downloadOffline() {") -and
    $content -notmatch "async function downloadOffline\(\)\s*\{\r?\n\s*var origin = self\.location\.origin;") {
  $patched = [regex]::Replace($content, $pattern, $insertion, 1)
  [System.IO.File]::WriteAllText($swPath, $patched)
  Write-Host "Patched flutter_service_worker.js (downloadOffline origin scope)." -ForegroundColor Green
} else {
  Write-Host "No service worker patch needed." -ForegroundColor Cyan
}
