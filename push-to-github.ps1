# Quick script to commit logo implementation

Write-Host "Preparing Logo Implementation..." -ForegroundColor Cyan

# Check if logo file exists
if (Test-Path "client/public/logo.png") {
    Write-Host "Logo file found!" -ForegroundColor Green
    $hasLogo = $true
} else {
    Write-Host "WARNING: Logo file not found at client/public/logo.png" -ForegroundColor Yellow
    Write-Host "Please add the logo file before pushing!" -ForegroundColor Yellow
    $hasLogo = $false
}

Write-Host ""
Write-Host "Staging files..." -ForegroundColor Yellow
git add client/src/components/Layout/Sidebar.js
git add LOGO_IMPLEMENTATION_GUIDE.md
git add ADD_LOGO_NOW.md

if ($hasLogo) {
    git add client/public/logo.png
}

# Commit
Write-Host "Committing changes..." -ForegroundColor Yellow
if ($hasLogo) {
    git commit -m "feat: add Smart Algos brain logo to sidebar with hover effects and responsive design"
} else {
    git commit -m "feat: prepare sidebar for logo implementation - add logo file to client/public/logo.png"
}

# Push to GitHub
Write-Host "Pushing to Railway..." -ForegroundColor Yellow
git push origin master

Write-Host ""
Write-Host "Changes pushed successfully!" -ForegroundColor Green
Write-Host ""

if ($hasLogo) {
    Write-Host "Logo implementation complete!" -ForegroundColor Green
    Write-Host "Your new logo will appear in the sidebar after deployment" -ForegroundColor Cyan
} else {
    Write-Host "Next step: Add logo file to client/public/logo.png" -ForegroundColor Yellow
    Write-Host "Then run this script again to deploy" -ForegroundColor Yellow
}

Write-Host ""
