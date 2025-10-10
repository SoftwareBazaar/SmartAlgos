@echo off
echo ========================================
echo    Smart Algos EA Demo Test
echo ========================================
echo.

echo [1/4] Checking if server is running...
curl -s http://localhost:5000/health > nul
if %errorlevel% neq 0 (
    echo ❌ Server not running! Please start the server first:
    echo    npm start
    echo.
    pause
    exit /b 1
)
echo ✅ Server is running

echo.
echo [2/4] Checking existing EAs...
node check-eas.js

echo.
echo [3/4] Running EA upload and payment demo...
node test-ea-upload.js

echo.
echo [4/4] Demo complete! Check the results above.
echo.
pause
