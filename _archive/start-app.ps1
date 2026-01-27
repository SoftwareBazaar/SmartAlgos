# PowerShell script to start the Smart Algos application
# This script starts both the backend server and the desktop application

Write-Host "Starting Smart Algos Application..." -ForegroundColor Green

# Start the backend server in the background
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd 'C:\Users\wanya\Desktop\My library  2\Algosmart'; node server.js" -WindowStyle Minimized

# Wait a moment for the server to start
Start-Sleep -Seconds 3

# Start the desktop application
Write-Host "Starting desktop application..." -ForegroundColor Yellow
Set-Location "C:\Users\wanya\Desktop\My library  2\Algosmart\desktop"
npm start

Write-Host "Application started successfully!" -ForegroundColor Green
