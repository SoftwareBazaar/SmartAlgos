@echo off
echo ========================================
echo Deploying Health Check Fix to Railway
echo ========================================
echo.

echo Step 1: Checking git status...
git status
echo.

echo Step 2: Adding modified files...
git add server.js
git add railway.json
git add test-health-endpoint.js
git add RAILWAY_HEALTH_CHECK_PERMANENT_FIX.md
git add RAILWAY_BUILD_FIX_V2.md
git add RAILWAY_HEALTH_CHECK_FIX_FINAL.md
echo.

echo Step 3: Committing changes...
git commit -m "CRITICAL FIX: Reorder startup sequence to fix Railway health check - health endpoint now responds immediately before any service initialization"
echo.

echo Step 4: Pushing to Railway (main branch)...
git push origin master
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Railway will now rebuild and redeploy.
echo.
echo Monitor the deployment at:
echo https://railway.app/dashboard
echo.
echo The health check should now pass within 5-10 seconds!
echo.
echo To test locally first, run:
echo   npm run start:railway
echo   node test-health-endpoint.js
echo.
pause

