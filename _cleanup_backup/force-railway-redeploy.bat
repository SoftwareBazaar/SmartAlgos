@echo off
echo ============================================
echo Force Railway Redeploy
echo ============================================
echo.
echo This will trigger a fresh deployment
echo.

git commit --allow-empty -m "chore: Force Railway redeploy to load new env vars"
git push origin master

echo.
echo ============================================
echo Deployment triggered!
echo Wait 2-3 minutes then test:
echo   https://web-production-fdb58.up.railway.app/api/economic-calendar/breaking
echo ============================================
pause

