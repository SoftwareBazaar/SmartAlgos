# Simple Project Cleanup Script
Write-Host "Starting cleanup..." -ForegroundColor Green

# Create archive directory
New-Item -ItemType Directory -Force -Path "_archive" | Out-Null
New-Item -ItemType Directory -Force -Path "_archive/docs" | Out-Null
New-Item -ItemType Directory -Force -Path "_archive/tests" | Out-Null
New-Item -ItemType Directory -Force -Path "_archive/scripts" | Out-Null

$count = 0

# Move documentation files
Get-ChildItem -Filter "*_*.md" | Move-Item -Destination "_archive/docs" -Force -ErrorAction SilentlyContinue
$count += (Get-ChildItem "_archive/docs" -ErrorAction SilentlyContinue).Count

# Move test files
Get-ChildItem -Filter "test-*.js" | Move-Item -Destination "_archive/tests" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "check-*.js" | Move-Item -Destination "_archive/tests" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "check-*.sql" | Move-Item -Destination "_archive/tests" -Force -ErrorAction SilentlyContinue

# Move deployment scripts
Get-ChildItem -Filter "deploy-*.bat" | Move-Item -Destination "_archive/scripts" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "deploy-*.ps1" | Move-Item -Destination "_archive/scripts" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "push-*.ps1" | Move-Item -Destination "_archive/scripts" -Force -ErrorAction SilentlyContinue

# Move license system files
if (Test-Path "services/licenseService.js") { Move-Item "services/licenseService.js" "_archive" -Force }
if (Test-Path "services/licenseEmailService.js") { Move-Item "services/licenseEmailService.js" "_archive" -Force }
if (Test-Path "services/paymentLicenseIntegration.js") { Move-Item "services/paymentLicenseIntegration.js" "_archive" -Force }
if (Test-Path "routes/licenses.js") { Move-Item "routes/licenses.js" "_archive" -Force }

# Restore essential test files
if (Test-Path "_archive/tests/test-platform-health.js") { Copy-Item "_archive/tests/test-platform-health.js" "." -Force }
if (Test-Path "_archive/tests/test-email.js") { Copy-Item "_archive/tests/test-email.js" "." -Force }

# Update .gitignore
Add-Content .gitignore "`n_archive/" -ErrorAction SilentlyContinue

Write-Host "Cleanup complete! Files moved to _archive/" -ForegroundColor Green
Write-Host "Test your app with: npm start" -ForegroundColor Yellow
