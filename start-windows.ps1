# PowerShell script to start Algosmart Platform
Write-Host "🚀 Starting Algosmart Platform..." -ForegroundColor Green

Write-Host "`n📡 Starting backend server..." -ForegroundColor Yellow
$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev" -PassThru

Write-Host "`n⏳ Waiting 3 seconds for backend to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

Write-Host "`n🌐 Starting frontend React app..." -ForegroundColor Yellow
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; npm start" -PassThru

Write-Host "`n✅ Algosmart Platform is starting up!" -ForegroundColor Green
Write-Host "📱 Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend API will be available at: http://localhost:5000" -ForegroundColor Cyan  
Write-Host "🔌 WebSocket will be available at: ws://localhost:5000" -ForegroundColor Cyan

Write-Host "`nPress Ctrl+C to stop all services." -ForegroundColor Yellow

# Keep the script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "`n🛑 Shutting down services..." -ForegroundColor Red
    if ($backend -and !$backend.HasExited) {
        Stop-Process -Id $backend.Id -Force
    }
    if ($frontend -and !$frontend.HasExited) {
        Stop-Process -Id $frontend.Id -Force
    }
}
