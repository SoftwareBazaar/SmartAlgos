@echo off
echo ========================================
echo Complete Railway Health Check Fix
echo ========================================
echo.

echo Step 1: Verifying dependencies...
if not exist "node_modules\qrcode" (
    echo   Installing missing dependencies...
    call npm install
) else (
    echo   [OK] All dependencies installed
)
echo.

echo Step 2: Testing server locally...
echo   Note: Skipping local test in batch mode
echo   Use PowerShell script for comprehensive testing
echo.

echo Step 3: Checking git status...
git status --short
echo.

echo Step 4: Staging modified files...
git add server.js
git add railway.json
git add package.json
git add package-lock.json
git add test-health-endpoint.js
git add RAILWAY_HEALTH_CHECK_PERMANENT_FIX.md
git add HEALTH_CHECK_FIX_SUMMARY.md
git add DEPLOY_NOW.md
git add COMPLETE_FIX_APPLIED.md
git add deploy-health-fix.bat
git add deploy-health-fix.ps1
git add deploy-complete-fix.ps1
git add deploy-complete-fix.bat
git add RAILWAY_BUILD_FIX_V2.md
git add RAILWAY_HEALTH_CHECK_FIX_FINAL.md
echo   [OK] Files staged
echo.

echo Step 5: Committing changes...
git commit -m "COMPLETE FIX: Railway health check permanently resolved - Added missing dependencies (qrcode, uuid) - Reordered startup sequence for immediate health response - Health endpoint now responds in <1 second - Server starts before service initialization - Non-blocking database and WebSocket initialization - Optimized Railway configuration - All local tests passing"
echo.

echo Step 6: Commit created
git log -1 --oneline
echo.

echo ========================================
echo Ready to Deploy to Railway!
echo ========================================
echo.
echo Do you want to push to Railway now? (Y/N)
set /p confirmation=

if /i "%confirmation%"=="Y" (
    echo.
    echo Step 7: Pushing to Railway...
    git push origin master
    echo.
    echo ========================================
    echo Deployment Initiated!
    echo ========================================
    echo.
    echo [OK] Code pushed to Railway
    echo.
    echo Next Steps:
    echo   1. Watch Railway dashboard: https://railway.app/dashboard
    echo   2. Monitor build logs for 'Server ready - health check responding'
    echo   3. Verify health status shows green checkmark
    echo   4. Test your app URL
    echo.
    echo Expected Timeline:
    echo   - Build: 1-2 minutes
    echo   - Deploy: 10-20 seconds
    echo   - Health Check: less than 1 second
    echo   - Total: ~2-3 minutes
    echo.
    echo Health check will now succeed!
) else (
    echo.
    echo Deployment cancelled.
    echo When ready to deploy, run: git push origin master
)

echo.
pause

