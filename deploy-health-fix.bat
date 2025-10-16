@echo off
echo ================================
echo Railway Health Check Fix Deployment
echo ================================
echo.

echo Stage 1: Checking git status...
git status

echo.
echo Stage 2: Adding fixed files...
git add railway-full-server.js
git add RAILWAY_HEALTH_CHECK_FINAL_FIX.md
git add railway.json

echo.
echo Stage 3: Committing changes...
git commit -m "Fix: Immediate health check response for Railway deployment"

echo.
echo Stage 4: Pushing to Railway...
git push origin master

echo.
echo ================================
echo Deployment pushed to Railway!
echo ================================
echo.
echo Next steps:
echo 1. Go to Railway dashboard: https://railway.app/
echo 2. Watch deployment logs
echo 3. Health check should pass within 30 seconds
echo 4. Test: https://your-app.railway.app/api/health
echo.

pause
