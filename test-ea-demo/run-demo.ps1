Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Smart Algos EA Demo Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Checking if server is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Server not running! Please start the server first:" -ForegroundColor Red
    Write-Host "   npm start" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[2/4] Checking existing EAs..." -ForegroundColor Yellow
node check-eas.js

Write-Host ""
Write-Host "[3/4] Running EA upload and payment demo..." -ForegroundColor Yellow
node test-ea-upload.js

Write-Host ""
Write-Host "[4/4] Demo complete! Check the results above." -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
