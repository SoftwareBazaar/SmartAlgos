@echo off
echo ========================================
echo  Testing 404 Fix
echo ========================================
echo.
echo Step 1: Testing server endpoints...
node test-404-fix.js
echo.
echo Step 2: Instructions for frontend testing
echo ========================================
echo.
echo To test the frontend fix:
echo   1. Open a new terminal
echo   2. Run: cd client
echo   3. Run: npm start
echo   4. Open browser to http://localhost:3000
echo   5. Try logging in or registering
echo   6. Open browser console (F12) and check for:
echo      - [API Client] Base URL: http://localhost:5000
echo      - No 404 errors in Network tab
echo.
echo ========================================
pause

