$ErrorActionPreference = "Stop"

$projectRoot = "C:\Users\42195\Desktop\P R O J E  K  T Y\Thy..... SOS"
$command = @"
`$ErrorActionPreference = 'Stop'
. '$projectRoot\tools\flutter-clean-shell.ps1'
Set-Location '$projectRoot\mobile\tython_x_sos_app'
Write-Host ''
Write-Host 'New clean Flutter shell is ready in this window.' -ForegroundColor Green
"@

Start-Process -FilePath "powershell.exe" -ArgumentList @(
  "-NoProfile",
  "-ExecutionPolicy",
  "Bypass",
  "-NoExit",
  "-Command",
  $command
)
