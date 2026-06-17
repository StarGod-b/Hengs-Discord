@echo off
title Pasang Auto-start (tersembunyi) - Hengs DC Bot
cd /d "%~dp0"
set "BOTDIR=%~dp0"
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

echo.
echo  ===========================================================
echo    Pasang Auto-start TERSEMBUNYI - Hengs DC Bot
echo  ===========================================================
echo.
echo  [1/2] Siapkan folder logs + bersihin launcher lama...
if not exist "%BOTDIR%logs" mkdir "%BOTDIR%logs"
if exist "%STARTUP%\hengs-dc.bat" del "%STARTUP%\hengs-dc.bat" >nul 2>&1
echo        ok.

echo  [2/2] Pasang shortcut di folder Startup...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$w=New-Object -ComObject WScript.Shell; $s=$w.CreateShortcut($w.SpecialFolders('Startup')+'\HengsDC.lnk'); $s.TargetPath='%BOTDIR%start-hidden.vbs'; $s.WorkingDirectory='%BOTDIR:~0,-1%'; $s.Save()"
if exist "%STARTUP%\HengsDC.lnk" (echo        ok.) else (echo        GAGAL - lihat cara manual di docs)

echo.
echo  ===========================================================
echo   Auto-start TERSEMBUNYI terpasang. Tiap login -^> nyala sendiri.
echo  ===========================================================
echo   Nyalain sekarang : double-click start-hidden.vbs
echo   Stop             : stop-bot.bat (cuma matiin DC, WA aman)
echo   Matiin auto-start: uninstall-autostart.bat
echo   Lihat log        : logs\bot.log
echo.
echo   CATATAN: Discord bot RINGAN (nggak ada Chrome) - aman di background.
echo.
pause
