@echo off
echo ==========================================
echo    Applying Smart Algos Payment Fixes
echo ==========================================

echo.
echo 1. Creating Database Table...
node scripts/create_paystack_table.js

echo.
echo 2. Rebuilding Frontend (Client)...
cd client
call npm run build
cd ..

echo.
echo 3. Committing and Pushing Changes...
git add .
git commit -m "Fix Paystack CSP, Duplicate Reference and DB Table"
git push

echo.
echo ==========================================
echo             Deployment Complete
echo ==========================================
pause
