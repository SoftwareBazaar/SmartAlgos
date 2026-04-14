# Booking System Setup Checker
# Run this to verify your booking system is ready

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Booking System Setup Checker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check if .env file exists
Write-Host "Checking .env file..." -NoNewline
if (Test-Path ".env") {
    Write-Host " ✓" -ForegroundColor Green
    
    # Read .env file
    $envContent = Get-Content ".env" -Raw
    
    # Check for required variables
    $requiredVars = @(
        "PAYSTACK_SECRET_KEY",
        "PAYSTACK_PUBLIC_KEY",
        "EMAIL_USER",
        "EMAIL_PASSWORD",
        "ADMIN_EMAIL",
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY"
    )
    
    Write-Host ""
    Write-Host "Checking environment variables:" -ForegroundColor Yellow
    
    foreach ($var in $requiredVars) {
        Write-Host "  - $var..." -NoNewline
        if ($envContent -match "$var=.+") {
            $value = ($envContent | Select-String "$var=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value }).Trim()
            if ($value -and $value -ne "your_" -and $value -ne "sk_test_" -and $value -ne "pk_test_") {
                Write-Host " ✓" -ForegroundColor Green
            } else {
                Write-Host " ⚠ (needs value)" -ForegroundColor Yellow
                $allGood = $false
            }
        } else {
            Write-Host " ✗ (missing)" -ForegroundColor Red
            $allGood = $false
        }
    }
} else {
    Write-Host " ✗" -ForegroundColor Red
    Write-Host "  .env file not found!" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# Check if booking component exists
Write-Host "Checking booking component..." -NoNewline
if (Test-Path "client\src\components\BookingSection\BookingSection.js") {
    Write-Host " ✓" -ForegroundColor Green
} else {
    Write-Host " ✗" -ForegroundColor Red
    $allGood = $false
}

# Check if booking routes exist
Write-Host "Checking booking routes..." -NoNewline
if (Test-Path "routes\bookings.js") {
    Write-Host " ✓" -ForegroundColor Green
} else {
    Write-Host " ✗" -ForegroundColor Red
    $allGood = $false
}

# Check if database SQL exists
Write-Host "Checking database SQL..." -NoNewline
if (Test-Path "database\create_consultation_bookings.sql") {
    Write-Host " ✓" -ForegroundColor Green
} else {
    Write-Host " ✗" -ForegroundColor Red
    $allGood = $false
}

# Check if node_modules exists
Write-Host "Checking dependencies..." -NoNewline
if (Test-Path "node_modules") {
    Write-Host " ✓" -ForegroundColor Green
} else {
    Write-Host " ⚠ (run 'npm install')" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "✓ All checks passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Setup database in Supabase (see BOOKING_SETUP_MANUAL.md)"
    Write-Host "2. Run: npm run dev"
    Write-Host "3. Visit: http://localhost:3000"
    Write-Host "4. Test the booking system"
} else {
    Write-Host "⚠ Some issues found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please fix the issues above and run this script again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Quick fixes:" -ForegroundColor Yellow
    Write-Host "- Missing .env? Copy from env.example"
    Write-Host "- Missing dependencies? Run: npm install"
    Write-Host "- Missing values? Check BOOKING_SETUP_MANUAL.md"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Pause so user can read the output
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
