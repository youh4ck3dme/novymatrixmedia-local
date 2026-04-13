@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-web.ps1" %*
endlocal
