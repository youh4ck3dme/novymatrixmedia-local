$ErrorActionPreference = "Stop"

$projectRoot = "C:\Users\42195\Desktop\P R O J E  K  T Y\Thy..... SOS"
$envRoot = "C:\thyton_env"
$flutterAlias = "C:\flutter"
$flutterSource = "$projectRoot\tools\flutter"

New-Item -ItemType Directory -Path $envRoot -Force | Out-Null
New-Item -ItemType Directory -Path "$envRoot\pubcache", "$envRoot\appdata", "$envRoot\localappdata", "$envRoot\tmp" -Force | Out-Null
if (-not (Test-Path -LiteralPath $flutterAlias)) {
    New-Item -ItemType Junction -Path $flutterAlias -Target $flutterSource | Out-Null
}

$env:GIT_CONFIG_GLOBAL = "$projectRoot\.gitconfig_flutter"
$env:APPDATA = "$envRoot\appdata"
$env:LOCALAPPDATA = "$envRoot\localappdata"
$env:PUB_CACHE = "$envRoot\pubcache"
$env:TEMP = "$envRoot\tmp"
$env:TMP = "$envRoot\tmp"
$env:DART_VM_OPTIONS = "--old_gen_heap_size=2048 --new_gen_semi_max_size=64"

if (-not (git config --global --get-all safe.directory 2>$null | Select-String -SimpleMatch "C:/flutter")) {
    git config --global --add safe.directory "C:/flutter" | Out-Null
}

$flutterBin = "$flutterAlias\bin"
$dartBin = "$flutterAlias\bin\cache\dart-sdk\bin"
$pubBin = "$envRoot\pubcache\bin"
$env:Path = "$dartBin;$flutterBin;$pubBin;$env:Path"

Write-Host "Clean Flutter shell is ready." -ForegroundColor Green
Write-Host "APPDATA      = $env:APPDATA"
Write-Host "LOCALAPPDATA = $env:LOCALAPPDATA"
Write-Host "PUB_CACHE    = $env:PUB_CACHE"
Write-Host "DART_VM_OPTIONS = $env:DART_VM_OPTIONS"
Write-Host "PATH += $pubBin"
Write-Host ""
Write-Host "Run commands like:" -ForegroundColor Cyan
Write-Host "  flutter --version"
Write-Host "  flutter pub get"
Write-Host "  flutterfire configure --project=thyton-sos"
