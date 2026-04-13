@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-flutter-auto.ps1" %*
endlocal
