@echo off
echo ========================================
echo Deploying Email Test Route to Railway
echo ========================================
echo.

echo Step 1: Adding changes to git...
git add railway-full-server.js routes/testEmail.js
echo.

echo Step 2: Committing changes...
git commit -m "Add test email route for debugging"
echo.

echo Step 3: Pushing to Railway...
git push origin main
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Wait 30-60 seconds for Railway to rebuild
echo 2. Test email: https://web-production-fdb58.up.railway.app/api/test-email
echo 3. Check Railway logs for email sending
echo.
echo If email works, make a test payment and check logs!
echo ========================================
pause
