@echo off
title Stop Hengs DC Bot
cd /d "%~dp0"
echo.
echo  Menghentikan Hengs DC Bot (cuma Discord, WA bot aman)...
> STOP echo stop
REM Matikan HANYA node yang jalan dari folder discord-bot
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -like '*discord-bot*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }" 2>nul
echo  Selesai. Discord bot berhenti.
echo  Nyalain lagi: start-hidden.vbs (tersembunyi) / run-bot-forever.bat (keliatan)
timeout /t 3 >nul
