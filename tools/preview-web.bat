@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0preview-web.ps1" %*
endlocal
