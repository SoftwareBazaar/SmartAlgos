@echo off
echo ═══════════════════════════════════════════════════════════
echo  🚀 DEPLOYING CSP FIX FOR SUPABASE IMAGES
echo ═══════════════════════════════════════════════════════════
echo.

echo ⏳ Step 1/5: Building React frontend...
cd client
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
cd ..
echo ✅ Build complete!
echo.

echo ⏳ Step 2/5: Adding changes to git...
git add .
echo ✅ Changes staged!
echo.

echo ⏳ Step 3/5: Committing changes...
git commit -m "Fix: Add CSP meta tag to allow Supabase Storage images"
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ Nothing to commit or commit failed
)
echo.

echo ⏳ Step 4/5: Pushing to Railway...
git push origin master
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Push failed!
    pause
    exit /b 1
)
echo ✅ Pushed to Railway!
echo.

echo ═══════════════════════════════════════════════════════════
echo  ✅ DEPLOYMENT INITIATED!
echo ═══════════════════════════════════════════════════════════
echo.
echo Railway is now deploying your changes...
echo.
echo 📋 Next steps:
echo   1. Wait 2-3 minutes for Railway to deploy
echo   2. Check Railway dashboard for deployment status
echo   3. Once deployed, go to your site and hard refresh (Ctrl+Shift+R)
echo   4. Images should now display! 🎉
echo.
echo ═══════════════════════════════════════════════════════════
pause

