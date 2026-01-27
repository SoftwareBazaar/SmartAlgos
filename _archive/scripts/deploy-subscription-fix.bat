@echo off
echo ========================================
echo   Deploying Subscription Files Fix
echo ========================================
echo.

echo Step 1: Checking git status...
git status
echo.

echo Step 2: Adding modified files...
git add services/databaseService.js
git add SUBSCRIPTION_FILES_ERROR_FIXED.md
git add FIX_VERIFICATION_CHECKLIST.md
echo Files staged for commit
echo.

echo Step 3: Committing changes...
git commit -m "fix: add missing subscription methods to resolve 500 error on /api/subscriptions/:id/files"
echo.

echo Step 4: Pushing to Railway...
git push origin main
echo.

echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Railway will automatically redeploy your app.
echo.
echo Next steps:
echo 1. Check Railway dashboard for deployment status
echo 2. Wait 2-3 minutes for deployment to complete
echo 3. Test the endpoint: /api/subscriptions/14/files
echo.
pause
