@echo off
echo ========================================
echo   Deploying Password Reset Fix
echo ========================================
echo.

echo [1/4] Adding changes to git...
git add -A

echo.
echo [2/4] Committing changes...
git commit -m "Fix password reset system - Supabase integration"

echo.
echo [3/4] Pushing to GitHub...
git push origin master

echo.
echo [4/4] Deployment initiated!
echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. Wait 2-3 minutes for Railway to deploy
echo 2. Configure Supabase email templates
echo 3. Test password reset flow
echo.
echo See PASSWORD_RESET_SETUP_GUIDE.md for details
echo.
pause
