@echo off
echo Starting Smart Algos Application...

echo Starting backend server...
start "Backend Server" cmd /k "cd /d "C:\Users\wanya\Desktop\My library  2\Algosmart" && node server.js"

echo Waiting for server to start...
timeout /t 3 /nobreak > nul

echo Starting desktop application...
cd /d "C:\Users\wanya\Desktop\My library  2\Algosmart\desktop"
npm start

echo Application started successfully!
pause
