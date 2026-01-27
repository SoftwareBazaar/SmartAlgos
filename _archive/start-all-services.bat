@echo off
title Smart Algos Trading Platform - All Services

echo.
echo 🚀 Starting Smart Algos Trading Platform - All Services
echo =================================================
echo.

echo 📡 Starting Backend Server...
start "Backend Server" cmd /k "npm start"

echo.
echo ⏳ Waiting for backend server to start...
timeout /t 5 /nobreak >nul

echo 🌐 Starting Frontend Client...
start "Frontend Client" cmd /k "cd client && npm start"

echo.
echo ⏳ Waiting for frontend client to start...
timeout /t 10 /nobreak >nul

echo 🖥️ Starting Desktop Application...
start "Desktop App" cmd /k "cd desktop && npm start"

echo.
echo 🎉 All services started successfully!
echo =================================================
echo 📡 Backend Server: http://localhost:5000
echo 🌐 Frontend Client: http://localhost:3000
echo 🖥️ Desktop App: Should open automatically
echo.
echo 💡 Close this window to stop monitoring
echo.

:monitor
echo 📊 Services are running... (Press Ctrl+C to exit)
timeout /t 10 /nobreak >nul
goto monitor
