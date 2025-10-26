@echo off
echo 🚀 Starting Algosmart Platform for Windows...

echo.
echo 📡 Starting backend server...
start "Backend Server" cmd /k "cd /d \"%~dp0\" && npm run dev"

echo.
echo ⏳ Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak >nul

echo.
echo 🌐 Starting frontend React app...
start "Frontend App" cmd /k "cd /d \"%~dp0client\" && npm start"

echo.
echo ✅ Algosmart Platform is starting up!
echo 📱 Frontend will be available at: http://localhost:3000
echo 🔧 Backend API will be available at: http://localhost:5000
echo 🔌 WebSocket will be available at: ws://localhost:5000
echo.
echo Press any key to close this window...
pause >nul
