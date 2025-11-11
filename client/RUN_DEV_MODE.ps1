# PowerShell script to run React app in development mode
# This will show full error messages instead of minified ones

Write-Host "Starting React app in development mode..." -ForegroundColor Green
Write-Host "This will show full error messages to help debug React Error #31" -ForegroundColor Yellow

# Set NODE_ENV to development
$env:NODE_ENV = "development"

# Start the React development server
npm start

