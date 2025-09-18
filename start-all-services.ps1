# PowerShell script to start all Smart Algos services
# This script starts the backend server, frontend client, and desktop application

Write-Host "🚀 Starting Smart Algos Trading Platform - All Services" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Function to wait for a service to be ready
function Wait-ForService {
    param([int]$Port, [string]$ServiceName, [int]$TimeoutSeconds = 30)
    
    Write-Host "⏳ Waiting for $ServiceName to start on port $Port..." -ForegroundColor Yellow
    
    $elapsed = 0
    while ($elapsed -lt $TimeoutSeconds) {
        if (Test-Port -Port $Port) {
            Write-Host "✅ $ServiceName is ready on port $Port" -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds 2
        $elapsed += 2
    }
    
    Write-Host "❌ $ServiceName failed to start within $TimeoutSeconds seconds" -ForegroundColor Red
    return $false
}

try {
    # Step 1: Start Backend Server
    Write-Host "`n📡 Starting Backend Server..." -ForegroundColor Cyan
    if (Test-Port -Port 5000) {
        Write-Host "✅ Backend server already running on port 5000" -ForegroundColor Green
    } else {
        Write-Host "🚀 Starting backend server..." -ForegroundColor Yellow
        Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "." -WindowStyle Minimized
        Wait-ForService -Port 5000 -ServiceName "Backend Server" -TimeoutSeconds 15
    }

    # Step 2: Start Frontend Client
    Write-Host "`n🌐 Starting Frontend Client..." -ForegroundColor Cyan
    if (Test-Port -Port 3000) {
        Write-Host "✅ Frontend client already running on port 3000" -ForegroundColor Green
    } else {
        Write-Host "🚀 Starting frontend client..." -ForegroundColor Yellow
        Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "client" -WindowStyle Minimized
        Wait-ForService -Port 3000 -ServiceName "Frontend Client" -TimeoutSeconds 30
    }

    # Step 3: Start Desktop Application
    Write-Host "`n🖥️ Starting Desktop Application..." -ForegroundColor Cyan
    Write-Host "🚀 Starting Electron desktop app..." -ForegroundColor Yellow
    Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "desktop" -WindowStyle Normal

    Write-Host "`n🎉 All services started successfully!" -ForegroundColor Green
    Write-Host "=================================================" -ForegroundColor Cyan
    Write-Host "📡 Backend Server: http://localhost:5000" -ForegroundColor White
    Write-Host "🌐 Frontend Client: http://localhost:3000" -ForegroundColor White
    Write-Host "🖥️ Desktop App: Should open automatically" -ForegroundColor White
    Write-Host "`n💡 Press Ctrl+C to stop all services" -ForegroundColor Yellow

} catch {
    Write-Host "`n❌ Error starting services: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check the logs and try again" -ForegroundColor Yellow
}

# Keep the script running to monitor services
Write-Host "`n📊 Monitoring services... (Press Ctrl+C to exit)" -ForegroundColor Cyan
try {
    while ($true) {
        Start-Sleep -Seconds 10
        
        $backendStatus = if (Test-Port -Port 5000) { "✅ Running" } else { "❌ Stopped" }
        $frontendStatus = if (Test-Port -Port 3000) { "✅ Running" } else { "❌ Stopped" }
        
        Write-Host "`rBackend: $backendStatus | Frontend: $frontendStatus" -NoNewline -ForegroundColor White
    }
} catch {
    Write-Host "`n👋 Shutting down..." -ForegroundColor Yellow
}
