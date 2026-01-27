# Smart Algos Project Cleanup Script
# Safely archives unnecessary files to reduce project size

Write-Host "`n🧹 ========== PROJECT CLEANUP STARTING ==========" -ForegroundColor Cyan
Write-Host "This will move unnecessary files to _archive folder`n" -ForegroundColor Yellow

# Create archive directories
Write-Host "📁 Creating archive directories..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path "_archive/docs" | Out-Null
New-Item -ItemType Directory -Force -Path "_archive/tests" | Out-Null
New-Item -ItemType Directory -Force -Path "_archive/scripts" | Out-Null
New-Item -ItemType Directory -Force -Path "_archive/license-system" | Out-Null

$movedCount = 0

# Function to move files safely
function Move-FileSafely {
    param($Pattern, $Destination, $Description)
    
    $files = Get-ChildItem -Path . -Filter $Pattern -File -ErrorAction SilentlyContinue
    if ($files) {
        Write-Host "  Moving $Description..." -ForegroundColor Gray
        foreach ($file in $files) {
            Move-Item $file.FullName $Destination -Force
            $script:movedCount++
        }
    }
}

# 1. Move documentation files
Write-Host "`n📄 Archiving documentation files..." -ForegroundColor Green
Move-FileSafely "ACTION_*.md" "_archive/docs" "ACTION files"
Move-FileSafely "CHECK_*.md" "_archive/docs" "CHECK files"
Move-FileSafely "DEBUG_*.md" "_archive/docs" "DEBUG files"
Move-FileSafely "EMAIL_*.md" "_archive/docs" "EMAIL files"
Move-FileSafely "FIX_*.md" "_archive/docs" "FIX files"
Move-FileSafely "PAYMENT_*.md" "_archive/docs" "PAYMENT files"
Move-FileSafely "RAILWAY_*.md" "_archive/docs" "RAILWAY files"
Move-FileSafely "START_*.md" "_archive/docs" "START files"
Move-FileSafely "TEST_*.md" "_archive/docs" "TEST files"
Move-FileSafely "URGENT_*.md" "_archive/docs" "URGENT files"
Move-FileSafely "LICENSE_*.md" "_archive/docs" "LICENSE files"
Move-FileSafely "*_COMPLETE.md" "_archive/docs" "COMPLETE files"
Move-FileSafely "*_SUMMARY.md" "_archive/docs" "SUMMARY files"
Move-FileSafely "*_GUIDE.md" "_archive/docs" "GUIDE files"
Move-FileSafely "DEPLOY_*.md" "_archive/docs" "DEPLOY files"
Move-FileSafely "SETUP_*.md" "_archive/docs" "SETUP files"
Move-FileSafely "WHERE_*.txt" "_archive/docs" "WHERE files"
Move-FileSafely "GET_*.md" "_archive/docs" "GET files"
Move-FileSafely "QUICK_*.md" "_archive/docs" "QUICK files"
Move-FileSafely "SIMPLE_*.md" "_archive/docs" "SIMPLE files"
Move-FileSafely "IMPLEMENTATION_*.md" "_archive/docs" "IMPLEMENTATION files"

# Move emoji-named files
Get-ChildItem -Path . -Filter "*.md" -File | Where-Object { $_.Name -match "^[^\w]" } | ForEach-Object {
    Move-Item $_.FullName "_archive/docs" -Force
    $movedCount++
}

# 2. Move test files (keep essential ones)
Write-Host "`n🧪 Archiving test files..." -ForegroundColor Green

# Move all test files first
Get-ChildItem -Path . -Filter "test-*.js" -File | ForEach-Object {
    Move-Item $_.FullName "_archive/tests" -Force
    $movedCount++
}

Get-ChildItem -Path . -Filter "check-*.js" -File | ForEach-Object {
    Move-Item $_.FullName "_archive/tests" -Force
    $movedCount++
}

Get-ChildItem -Path . -Filter "check-*.sql" -File | ForEach-Object {
    Move-Item $_.FullName "_archive/tests" -Force
    $movedCount++
}

# Restore essential test files
if (Test-Path "_archive/tests/test-platform-health.js") {
    Copy-Item "_archive/tests/test-platform-health.js" "." -Force
    Write-Host "  ✅ Kept: test-platform-health.js" -ForegroundColor Green
}

if (Test-Path "_archive/tests/test-email.js") {
    Copy-Item "_archive/tests/test-email.js" "." -Force
    Write-Host "  ✅ Kept: test-email.js" -ForegroundColor Green
}

# 3. Move deployment scripts
Write-Host "`n🚀 Archiving deployment scripts..." -ForegroundColor Green
Move-FileSafely "deploy-*.bat" "_archive/scripts" "BAT deploy scripts"
Move-FileSafely "deploy-*.ps1" "_archive/scripts" "PS1 deploy scripts"
Move-FileSafely "push-to-github.ps1" "_archive/scripts" "GitHub push script"
Move-FileSafely "commit-*.ps1" "_archive/scripts" "Commit scripts"

# 4. Move license system files
Write-Host "`n🔑 Archiving license system files..." -ForegroundColor Green

if (Test-Path "services/licenseService.js") {
    Move-Item "services/licenseService.js" "_archive/license-system" -Force
    $movedCount++
}

if (Test-Path "services/licenseEmailService.js") {
    Move-Item "services/licenseEmailService.js" "_archive/license-system" -Force
    $movedCount++
}

if (Test-Path "services/paymentLicenseIntegration.js") {
    Move-Item "services/paymentLicenseIntegration.js" "_archive/license-system" -Force
    $movedCount++
}

if (Test-Path "routes/licenses.js") {
    Move-Item "routes/licenses.js" "_archive/license-system" -Force
    $movedCount++
}

if (Test-Path "database/create-licenses-tables.sql") {
    Move-Item "database/create-licenses-tables.sql" "_archive/license-system" -Force
    $movedCount++
}

Move-FileSafely "test-license-system.js" "_archive/license-system" "License test"
Move-FileSafely "setup-license-tables.js" "_archive/license-system" "License setup"
Move-FileSafely "generate-salt.js" "_archive/license-system" "Salt generator"

# 5. Move old/duplicate files
Write-Host "`n📦 Archiving old/duplicate files..." -ForegroundColor Green

if (Test-Path "railway-full-server.js") {
    Move-Item "railway-full-server.js" "_archive" -Force
    $movedCount++
}

if (Test-Path "railway-server.js") {
    Move-Item "railway-server.js" "_archive" -Force
    $movedCount++
}

if (Test-Path "admin-panel.js") {
    Move-Item "admin-panel.js" "_archive" -Force
    $movedCount++
}

# 6. Move utility scripts
Write-Host "`n🔧 Archiving utility scripts..." -ForegroundColor Green
Move-FileSafely "add-*.js" "_archive/scripts" "Add scripts"
Move-FileSafely "create-*.js" "_archive/scripts" "Create scripts"
Move-FileSafely "update-*.js" "_archive/scripts" "Update scripts"
Move-FileSafely "migrate-*.js" "_archive/scripts" "Migration scripts"
Move-FileSafely "reset-*.js" "_archive/scripts" "Reset scripts"
Move-FileSafely "setup-*.js" "_archive/scripts" "Setup scripts"
Move-FileSafely "verify-*.js" "_archive/scripts" "Verify scripts"
Move-FileSafely "enable-*.js" "_archive/scripts" "Enable scripts"
Move-FileSafely "change-*.js" "_archive/scripts" "Change scripts"
Move-FileSafely "make-*.js" "_archive/scripts" "Make scripts"
Move-FileSafely "manage-*.js" "_archive/scripts" "Manage scripts"
Move-FileSafely "list-*.js" "_archive/scripts" "List scripts"
Move-FileSafely "resend-*.js" "_archive/scripts" "Resend scripts"
Move-FileSafely "cancel-*.sql" "_archive/scripts" "Cancel SQL scripts"
Move-FileSafely "clear-*.sql" "_archive/scripts" "Clear SQL scripts"
Move-FileSafely "fix-*.sql" "_archive/scripts" "Fix SQL scripts"
Move-FileSafely "remove-*.sql" "_archive/scripts" "Remove SQL scripts"
Move-FileSafely "set-*.sql" "_archive/scripts" "Set SQL scripts"

# 7. Move setup scripts
Move-FileSafely "setup-*.bat" "_archive/scripts" "Setup BAT files"
Move-FileSafely "setup-*.sh" "_archive/scripts" "Setup SH files"

# 8. Move test data
if (Test-Path "test-ea-demo") {
    Move-Item "test-ea-demo" "_archive" -Force -Recurse
    Write-Host "  Moved test-ea-demo folder" -ForegroundColor Gray
}

Move-FileSafely "test-*.ex4" "_archive" "Test EA files"
Move-FileSafely "test-*.pdf" "_archive" "Test PDF files"
Move-FileSafely "test-*.set" "_archive" "Test SET files"

# 9. Move cleanup logs
Move-FileSafely "cleanup_log_*.txt" "_archive" "Cleanup logs"

# Summary
Write-Host "`n✅ ========== CLEANUP COMPLETE ==========" -ForegroundColor Green
Write-Host "📊 Files moved to archive: $movedCount" -ForegroundColor Cyan
Write-Host "📁 Archive location: _archive/" -ForegroundColor Cyan
Write-Host "`n💡 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test your app locally: npm start" -ForegroundColor White
Write-Host "  2. If everything works, commit changes" -ForegroundColor White
Write-Host "  3. If you need archived files, they're in _archive/" -ForegroundColor White
Write-Host "  4. Add _archive/ to .gitignore to keep it local only`n" -ForegroundColor White

# Update .gitignore
Write-Host "📝 Updating .gitignore..." -ForegroundColor Green
$gitignoreContent = Get-Content .gitignore -ErrorAction SilentlyContinue
if ($gitignoreContent -notcontains "_archive/") {
    Add-Content .gitignore "`n# Archived files (local only)`n_archive/`n_cleanup_backup/"
    Write-Host "  ✅ Added _archive/ to .gitignore" -ForegroundColor Green
}

Write-Host "`n🎉 Project is now cleaner and ready for launch!" -ForegroundColor Green
Write-Host ""
