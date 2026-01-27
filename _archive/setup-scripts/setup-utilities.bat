@echo off
echo.
echo ========================================
echo  Utilities Sync Setup
echo ========================================
echo.
echo This will set up utilities synchronization
echo between web and desktop versions.
echo.
echo IMPORTANT: Make sure your server is running!
echo If not, press Ctrl+C and run: npm start
echo.
pause
echo.
echo Running setup...
echo.
node setup-utilities-sync.js
echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Please refresh your browser (Ctrl+R or F5)
echo Images should now appear!
echo.
pause
