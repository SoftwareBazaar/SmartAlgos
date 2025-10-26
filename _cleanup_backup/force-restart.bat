@echo off
echo.
echo ========================================
echo  Force Restart Server
echo ========================================
echo.
echo Killing all Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo.
echo Starting fresh server...
echo.
start /B npm start
echo.
echo ========================================
echo  Server Restarted!
echo ========================================
echo.
echo Please wait 5 seconds for server to start...
timeout /t 5 /nobreak
echo.
echo Now refresh your browser (Ctrl+R or F5)
echo.
pause
