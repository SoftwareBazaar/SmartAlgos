@echo off
echo Testing Subscription/Download Flow
echo ==================================
echo.

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo Node.js is installed.
echo.

echo Running basic flow test...
node run-test-flow.js

echo.
echo Test completed!
pause
