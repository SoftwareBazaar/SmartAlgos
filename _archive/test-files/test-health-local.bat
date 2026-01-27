@echo off
echo ================================
echo Testing Railway Server Locally
echo ================================
echo.

echo Starting server...
echo Press Ctrl+C to stop
echo.

start /B node railway-full-server.js

echo Waiting for server to start...
timeout /t 3 /nobreak >nul

echo.
echo Testing health check...
curl http://localhost:5000/api/health

echo.
echo.
echo ================================
echo Server is running!
echo ================================
echo.
echo Test URLs:
echo - Health: http://localhost:5000/api/health
echo - Frontend: http://localhost:5000
echo - API: http://localhost:5000/api
echo.
echo Press any key to stop the server...

pause >nul

taskkill /F /IM node.exe /T >nul 2>&1

echo.
echo Server stopped.

