@echo off
echo 🚀 Starting Smart Algos Desktop Application...

cd desktop

if exist package.json (
    echo ✅ Found package.json in desktop directory
    echo 📱 Starting desktop application...
    npm start
) else (
    echo ❌ package.json not found in desktop directory
    echo Please make sure you're in the correct directory
    pause
)

echo 🎉 Desktop application startup complete!
pause
