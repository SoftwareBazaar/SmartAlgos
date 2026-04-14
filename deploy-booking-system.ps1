# Deploy Booking System to Railway
# This script commits and pushes changes to trigger Railway deployment

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploy Booking System to Railway" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is available
try {
    git --version | Out-Null
} catch {
    Write-Host "❌ Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "   Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not a git repository" -ForegroundColor Red
    Write-Host "   Please run 'git init' first" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "📋 Pre-Deployment Checklist:" -ForegroundColor Yellow
Write-Host ""

# Check if database SQL exists
Write-Host "Checking database SQL file..." -NoNewline
if (Test-Path "database\create_consultation_bookings.sql") {
    Write-Host " ✓" -ForegroundColor Green
} else {
    Write-Host " ✗" -ForegroundColor Red
    Write-Host "   Missing: database\create_consultation_bookings.sql" -ForegroundColor Red
    pause
    exit 1
}

# Check if booking routes exist
Write-Host "Checking booking routes..." -NoNewline
if (Test-Path "routes\bookings.js") {
    Write-Host " ✓" -ForegroundColor Green
} else {
    Write-Host " ✗" -ForegroundColor Red
    Write-Host "   Missing: routes\bookings.js" -ForegroundColor Red
    pause
    exit 1
}

# Check if booking component exists
Write-Host "Checking booking component..." -NoNewline
if (Test-Path "client\src\components\BookingSection\BookingSection.js") {
    Write-Host " ✓" -ForegroundColor Green
} else {
    Write-Host " ✗" -ForegroundColor Red
    Write-Host "   Missing: client\src\components\BookingSection\BookingSection.js" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Confirm deployment
Write-Host "⚠️  IMPORTANT: Before deploying, make sure you:" -ForegroundColor Yellow
Write-Host "   1. Created the database table in Supabase" -ForegroundColor Yellow
Write-Host "   2. Set all environment variables in Railway" -ForegroundColor Yellow
Write-Host "   3. Verified ADMIN_EMAIL = softwarebazaar.ke@gmail.com" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Ready to deploy? (yes/no)"

if ($confirm -ne "yes" -and $confirm -ne "y") {
    Write-Host ""
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 0
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Deployment..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check for uncommitted changes
Write-Host "Checking for changes..." -ForegroundColor Yellow
$status = git status --porcelain

if (-not $status) {
    Write-Host "✓ No changes to commit" -ForegroundColor Green
    Write-Host ""
    Write-Host "Everything is already up to date!" -ForegroundColor Green
    Write-Host ""
    pause
    exit 0
}

# Show what will be committed
Write-Host ""
Write-Host "Files to be committed:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Add all changes
Write-Host "Adding changes..." -ForegroundColor Yellow
git add .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to add changes" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "✓ Changes added" -ForegroundColor Green
Write-Host ""

# Commit changes
$commitMessage = "Add consultation booking system - Free 30min & `$5 deep-dive sessions"
Write-Host "Committing changes..." -ForegroundColor Yellow
Write-Host "Message: $commitMessage" -ForegroundColor Gray

git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to commit changes" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "✓ Changes committed" -ForegroundColor Green
Write-Host ""

# Get current branch
$branch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $branch" -ForegroundColor Gray
Write-Host ""

# Push to remote
Write-Host "Pushing to remote..." -ForegroundColor Yellow
Write-Host "This will trigger Railway deployment..." -ForegroundColor Gray
Write-Host ""

git push origin $branch

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Failed to push changes" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "- No remote repository configured" -ForegroundColor Yellow
    Write-Host "- Authentication failed" -ForegroundColor Yellow
    Write-Host "- Network connection issue" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Try running manually:" -ForegroundColor Yellow
    Write-Host "  git push origin $branch" -ForegroundColor Gray
    Write-Host ""
    pause
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ Deployment Triggered!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to Railway Dashboard:" -ForegroundColor White
Write-Host "   https://railway.app/dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Monitor deployment progress" -ForegroundColor White
Write-Host "   (usually takes 2-3 minutes)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Once deployed, test your booking system:" -ForegroundColor White
Write-Host "   - Visit your Railway URL" -ForegroundColor Gray
Write-Host "   - Scroll to 'Book a Consultation'" -ForegroundColor Gray
Write-Host "   - Test a free booking" -ForegroundColor Gray
Write-Host "   - Check email: softwarebazaar.ke@gmail.com" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Verify database:" -ForegroundColor White
Write-Host "   - Go to Supabase Dashboard" -ForegroundColor Gray
Write-Host "   - Check consultation_bookings table" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📧 Admin Email: softwarebazaar.ke@gmail.com" -ForegroundColor Green
Write-Host "📅 Booking Hours: 7 AM - 3 PM (Every day)" -ForegroundColor Green
Write-Host "💰 Pricing: Free 30min | `$5 Deep-dive 1hr30" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

pause
