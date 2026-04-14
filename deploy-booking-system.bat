@echo off
echo.
echo ========================================
echo   Deploy Booking System to Railway
echo ========================================
echo.

REM Check if git is available
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in PATH
    echo         Please install Git from: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

REM Check if we're in a git repository
if not exist ".git" (
    echo [ERROR] Not a git repository
    echo         Please run 'git init' first
    echo.
    pause
    exit /b 1
)

echo Pre-Deployment Checklist:
echo.

REM Check if database SQL exists
echo Checking database SQL file...
if exist "database\create_consultation_bookings.sql" (
    echo   [OK] Database SQL found
) else (
    echo   [ERROR] Missing: database\create_consultation_bookings.sql
    pause
    exit /b 1
)

REM Check if booking routes exist
echo Checking booking routes...
if exist "routes\bookings.js" (
    echo   [OK] Booking routes found
) else (
    echo   [ERROR] Missing: routes\bookings.js
    pause
    exit /b 1
)

REM Check if booking component exists
echo Checking booking component...
if exist "client\src\components\BookingSection\BookingSection.js" (
    echo   [OK] Booking component found
) else (
    echo   [ERROR] Missing: client\src\components\BookingSection\BookingSection.js
    pause
    exit /b 1
)

echo.
echo ========================================
echo.

echo IMPORTANT: Before deploying, make sure you:
echo   1. Created the database table in Supabase
echo   2. Set all environment variables in Railway
echo   3. Verified ADMIN_EMAIL = softwarebazaar.ke@gmail.com
echo.

set /p confirm="Ready to deploy? (yes/no): "

if /i not "%confirm%"=="yes" if /i not "%confirm%"=="y" (
    echo.
    echo Deployment cancelled.
    echo.
    pause
    exit /b 0
)

echo.
echo ========================================
echo   Starting Deployment...
echo ========================================
echo.

REM Check for uncommitted changes
echo Checking for changes...
git status --porcelain > temp_status.txt
set /p status=<temp_status.txt
del temp_status.txt

if "%status%"=="" (
    echo [OK] No changes to commit
    echo.
    echo Everything is already up to date!
    echo.
    pause
    exit /b 0
)

REM Show what will be committed
echo.
echo Files to be committed:
git status --short
echo.

REM Add all changes
echo Adding changes...
git add .

if %errorlevel% neq 0 (
    echo [ERROR] Failed to add changes
    pause
    exit /b 1
)

echo [OK] Changes added
echo.

REM Commit changes
echo Committing changes...
echo Message: Add consultation booking system - Free 30min ^& $5 deep-dive sessions

git commit -m "Add consultation booking system - Free 30min & $5 deep-dive sessions"

if %errorlevel% neq 0 (
    echo [ERROR] Failed to commit changes
    pause
    exit /b 1
)

echo [OK] Changes committed
echo.

REM Get current branch
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set branch=%%i
echo Current branch: %branch%
echo.

REM Push to remote
echo Pushing to remote...
echo This will trigger Railway deployment...
echo.

git push origin %branch%

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to push changes
    echo.
    echo Possible issues:
    echo - No remote repository configured
    echo - Authentication failed
    echo - Network connection issue
    echo.
    echo Try running manually:
    echo   git push origin %branch%
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   [SUCCESS] Deployment Triggered!
echo ========================================
echo.

echo Next steps:
echo.
echo 1. Go to Railway Dashboard:
echo    https://railway.app/dashboard
echo.
echo 2. Monitor deployment progress
echo    ^(usually takes 2-3 minutes^)
echo.
echo 3. Once deployed, test your booking system:
echo    - Visit your Railway URL
echo    - Scroll to 'Book a Consultation'
echo    - Test a free booking
echo    - Check email: softwarebazaar.ke@gmail.com
echo.
echo 4. Verify database:
echo    - Go to Supabase Dashboard
echo    - Check consultation_bookings table
echo.

echo ========================================
echo.

echo Admin Email: softwarebazaar.ke@gmail.com
echo Booking Hours: 7 AM - 3 PM ^(Every day^)
echo Pricing: Free 30min ^| $5 Deep-dive 1hr30
echo.

echo ========================================
echo.

pause
