@echo off
title Hengs DC Bot (auto-restart)
cd /d "%~dp0"
if not exist logs mkdir logs
if exist STOP del STOP >nul 2>&1
powershell -NoProfile -ExecutionPolicy Bypass -Command "while ($true) { if (Test-Path 'STOP') { Remove-Item 'STOP' -Force -ErrorAction SilentlyContinue; break }; Write-Host ('===== Hengs DC Bot - ' + (Get-Date) + ' =====') -ForegroundColor Cyan; node src/index.js; if (Test-Path 'STOP') { Remove-Item 'STOP' -Force -ErrorAction SilentlyContinue; break }; Write-Host ('Bot berhenti (code ' + $LASTEXITCODE + '). Restart 5 detik...') -ForegroundColor Red; Start-Sleep -Seconds 5 }"
echo.
echo Bot Discord berhenti.
timeout /t 3 >nul
