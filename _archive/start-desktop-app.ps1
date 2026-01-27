# PowerShell script to start the desktop application
# This script handles the directory change and npm start command

Write-Host "🚀 Starting Smart Algos Desktop Application..." -ForegroundColor Green

# Change to desktop directory
Set-Location -Path "desktop"

# Check if package.json exists
if (Test-Path "package.json") {
    Write-Host "✅ Found package.json in desktop directory" -ForegroundColor Green
    
    # Start the desktop application
    Write-Host "📱 Starting desktop application..." -ForegroundColor Yellow
    npm start
} else {
    Write-Host "❌ package.json not found in desktop directory" -ForegroundColor Red
    Write-Host "Please make sure you're in the correct directory" -ForegroundColor Yellow
}

Write-Host "🎉 Desktop application startup complete!" -ForegroundColor Green
