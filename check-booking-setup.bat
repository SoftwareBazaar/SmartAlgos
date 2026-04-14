@echo off
echo.
echo ========================================
echo   Booking System Setup Checker
echo ========================================
echo.

set "allGood=true"

REM Check if .env file exists
echo Checking .env file...
if exist ".env" (
    echo   [OK] .env file found
    echo.
    echo Checking environment variables:
    
    findstr /C:"PAYSTACK_SECRET_KEY=" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo   [OK] PAYSTACK_SECRET_KEY
    ) else (
        echo   [MISSING] PAYSTACK_SECRET_KEY
        set "allGood=false"
    )
    
    findstr /C:"PAYSTACK_PUBLIC_KEY=" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo   [OK] PAYSTACK_PUBLIC_KEY
    ) else (
        echo   [MISSING] PAYSTACK_PUBLIC_KEY
        set "allGood=false"
    )
    
    findstr /C:"EMAIL_USER=" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo   [OK] EMAIL_USER
    ) else (
        echo   [MISSING] EMAIL_USER
        set "allGood=false"
    )
    
    findstr /C:"EMAIL_PASSWORD=" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo   [OK] EMAIL_PASSWORD
    ) else (
        echo   [MISSING] EMAIL_PASSWORD
        set "allGood=false"
    )
    
    findstr /C:"ADMIN_EMAIL=" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo   [OK] ADMIN_EMAIL
    ) else (
        echo   [MISSING] ADMIN_EMAIL
        set "allGood=false"
    )
    
    findstr /C:"SUPABASE_URL=" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo   [OK] SUPABASE_URL
    ) else (
        echo   [MISSING] SUPABASE_URL
        set "allGood=false"
    )
    
    findstr /C:"SUPABASE_SERVICE_ROLE_KEY=" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo   [OK] SUPABASE_SERVICE_ROLE_KEY
    ) else (
        echo   [MISSING] SUPABASE_SERVICE_ROLE_KEY
        set "allGood=false"
    )
) else (
    echo   [ERROR] .env file not found!
    set "allGood=false"
)

echo.

REM Check if booking component exists
echo Checking booking component...
if exist "client\src\components\BookingSection\BookingSection.js" (
    echo   [OK] BookingSection component found
) else (
    echo   [ERROR] BookingSection component not found
    set "allGood=false"
)

REM Check if booking routes exist
echo Checking booking routes...
if exist "routes\bookings.js" (
    echo   [OK] Booking routes found
) else (
    echo   [ERROR] Booking routes not found
    set "allGood=false"
)

REM Check if database SQL exists
echo Checking database SQL...
if exist "database\create_consultation_bookings.sql" (
    echo   [OK] Database SQL found
) else (
    echo   [ERROR] Database SQL not found
    set "allGood=false"
)

REM Check if node_modules exists
echo Checking dependencies...
if exist "node_modules" (
    echo   [OK] Dependencies installed
) else (
    echo   [WARNING] Dependencies not installed - run 'npm install'
    set "allGood=false"
)

echo.
echo ========================================

if "%allGood%"=="true" (
    echo.
    echo [SUCCESS] All checks passed!
    echo.
    echo Next steps:
    echo 1. Setup database in Supabase ^(see BOOKING_SETUP_MANUAL.md^)
    echo 2. Run: npm run dev
    echo 3. Visit: http://localhost:3000
    echo 4. Test the booking system
    echo.
) else (
    echo.
    echo [WARNING] Some issues found
    echo.
    echo Please fix the issues above and run this script again.
    echo.
    echo Quick fixes:
    echo - Missing .env? Copy from env.example
    echo - Missing dependencies? Run: npm install
    echo - Missing values? Check BOOKING_SETUP_MANUAL.md
    echo.
)

echo ========================================
echo.
pause
