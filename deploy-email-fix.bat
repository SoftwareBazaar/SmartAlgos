@echo off
echo ========================================
echo Deploying Email Download Link Fix
echo ========================================
echo.

echo Step 1: Testing email configuration locally...
node test-payment-email-flow.js
if errorlevel 1 (
    echo.
    echo WARNING: Email test failed!
    echo Please fix email configuration before deploying.
    echo See EMAIL_DOWNLOAD_LINK_FIX.md for setup instructions.
    pause
    exit /b 1
)

echo.
echo Step 2: Committing changes...
git add routes/paystackPayments.js
git add routes/cryptoPayments.js
git add test-payment-email-flow.js
git add EMAIL_DOWNLOAD_LINK_FIX.md
git add deploy-email-fix.bat
git commit -m "Fix: Enhanced email sending for payment download links with better logging and error handling"

echo.
echo Step 3: Pushing to repository...
git push origin main

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo IMPORTANT: Configure Railway Environment Variables
echo.
echo 1. Go to Railway Dashboard
echo 2. Select your project
echo 3. Click "Variables" tab
echo 4. Add these variables:
echo    - EMAIL_USER = your-email@gmail.com
echo    - EMAIL_PASSWORD = your-gmail-app-password
echo    - EMAIL_HOST = smtp.gmail.com
echo    - EMAIL_PORT = 587
echo.
echo 5. Click "Deploy" to restart
echo.
echo See EMAIL_DOWNLOAD_LINK_FIX.md for detailed instructions
echo.
pause
