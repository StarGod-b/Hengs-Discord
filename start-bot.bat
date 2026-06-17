@echo off
title Discord Bot - Henzzz
cd /d "%~dp0"
echo.
echo  ========================================
echo   Discord Bot Henzzz - Starting...
echo  ========================================
echo.
node src/index.js
echo.
echo  Bot berhenti. Tekan tombol apapun untuk tutup.
pause > nul
