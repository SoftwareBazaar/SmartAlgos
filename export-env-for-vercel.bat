@echo off
echo ================================================
echo  Exporting Railway Environment Variables
echo  for Vercel Migration
echo ================================================
echo.

REM Check if Railway CLI is installed
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Railway CLI not found.
    echo.
    echo Install it with:
    echo   npm install -g @railway/cli
    echo.
    echo Then run:
    echo   railway login
    echo   railway link
    echo   And re-run this script.
    pause
    exit /b 1
)

echo [1/3] Logging into Railway...
railway login

echo.
echo [2/3] Linking to your Railway project...
echo (Select your project when prompted)
railway link

echo.
echo [3/3] Exporting variables to .env.railway ...
railway variables > .env.railway

echo.
echo ================================================
echo  DONE! Variables saved to .env.railway
echo ================================================
echo.
echo Next steps:
echo  1. Open .env.railway and review the variables
echo  2. Go to vercel.com - your project - Settings - Environment Variables
echo  3. Import the .env.railway file there
echo     OR use: vercel env pull  (if Vercel CLI is installed)
echo.
echo IMPORTANT: Never commit .env.railway to Git!
echo.
pause
