Write-Host "Testing Subscription/Download Flow" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Running basic flow test..." -ForegroundColor Yellow
Write-Host ""

# Run the test
try {
    node run-test-flow.js
    Write-Host ""
    Write-Host "Test completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Test failed with error: $_" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"
