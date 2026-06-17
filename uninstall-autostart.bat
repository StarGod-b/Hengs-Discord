@echo off
title Hapus Auto-start - Hengs DC Bot
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
echo.
if exist "%STARTUP%\HengsDC.lnk" del "%STARTUP%\HengsDC.lnk" >nul 2>&1
if exist "%STARTUP%\HengsDC.lnk" (echo  GAGAL - hapus manual: Win+R, shell:startup, hapus HengsDC.lnk) else (echo  Auto-start Discord NONAKTIF.)
echo.
echo  (Kalau bot lagi jalan, stop pakai stop-bot.bat.)
pause
