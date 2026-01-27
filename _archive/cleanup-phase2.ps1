# Phase 2 Cleanup - Additional utility and setup files
Write-Host "Starting Phase 2 cleanup..." -ForegroundColor Green

# Create additional archive directories
New-Item -ItemType Directory -Force -Path "_archive/setup-scripts" | Out-Null
New-Item -ItemType Directory -Force -Path "_archive/admin-scripts" | Out-Null
New-Item -ItemType Directory -Force -Path "_archive/sql-scripts" | Out-Null
New-Item -ItemType Directory -Force -Path "_archive/test-files" | Out-Null
New-Item -ItemType Directory -Force -Path "_archive/deployment" | Out-Null

$count = 0

# Move setup scripts
$setupScripts = @(
    "setup-auth.bat", "setup-auth.sh", "setup-crypto-wallets.js",
    "setup-env.js", "setup-utilities.bat", "create-env-with-placeholders.js"
)
foreach ($file in $setupScripts) {
    if (Test-Path $file) {
        Move-Item $file "_archive/setup-scripts" -Force
        $count++
    }
}

# Move admin utility scripts
$adminScripts = @(
    "add-ea-files.js", "add-lotsize-calculator.js", "add-lotsize-via-api.js",
    "add-minimal-health.js", "create-admin-account.js", "create-admin-in-database.js",
    "create-admin-simple.js", "create-lot-calculator-admin.js", "create-lot-calculator-utility.js",
    "create-sample-ea-files.js", "create-supabase-accounts.js", "create-test-ea-with-files.js",
    "create-test-ea.js", "create-test-subscription.js", "enable-real-payments.js",
    "fix-ea-paths.js", "list-database-eas.js", "make-user-admin.js", "manage-admin.js",
    "migrate-utilities-to-supabase.js", "resend-subscription-email.js", "reset-utilities.js",
    "update-ea-default-images.js", "update-ea-file-paths.js", "update-ea-files-direct.js",
    "update-ea-with-uploaded-file.js", "upload-ea-files-to-supabase.js"
)
foreach ($file in $adminScripts) {
    if (Test-Path $file) {
        Move-Item $file "_archive/admin-scripts" -Force
        $count++
    }
}

# Move SQL utility scripts
$sqlScripts = @(
    "cancel-all-subscriptions.sql", "change-admin-email.sql", "clear-utility-images.sql",
    "CREATE_UTILITIES_BUCKET.sql", "debug-utility-images.sql", "fix-admin-and-test-mpesa.sql",
    "fix-supabase-storage-buckets.sql", "fix-utilities-bucket-mime-types.sql",
    "mpesa-database-migration.sql", "remove-subscription-for-testing.sql",
    "reset-utilities.sql", "SET_ADMIN_EMAIL.sql", "update-supabase-ea-files.sql"
)
foreach ($file in $sqlScripts) {
    if (Test-Path $file) {
        Move-Item $file "_archive/sql-scripts" -Force
        $count++
    }
}

# Move test files
$testFiles = @(
    "test-ea-file.ex4", "test-ea-manual.pdf", "test-ea-settings.set",
    "test-final-images.html", "test-fix-quick.bat", "test-flow.bat",
    "test-flow.ps1", "test-frontend-flow.html", "test-health-local.bat"
)
foreach ($file in $testFiles) {
    if (Test-Path $file) {
        Move-Item $file "_archive/test-files" -Force
        $count++
    }
}

# Move deployment/verification scripts
$deployScripts = @(
    "deploy_fixes.bat", "commit-and-push.ps1", "verify-build.js",
    "verify-ea-files-deployment.js", "verify-live-status.js",
    "verify-password.js", "verify-paystack-config.js", "change-admin-email.js"
)
foreach ($file in $deployScripts) {
    if (Test-Path $file) {
        Move-Item $file "_archive/deployment" -Force
        $count++
    }
}

# Move cleanup scripts themselves
if (Test-Path "cleanup-project-safe.js") { Move-Item "cleanup-project-safe.js" "_archive" -Force; $count++ }
if (Test-Path "cleanup_log_1761459788880.txt") { Move-Item "cleanup_log_1761459788880.txt" "_archive" -Force; $count++ }

# Move alternative deployment configs (keep only Railway)
if (Test-Path "render.yaml") { Move-Item "render.yaml" "_archive/deployment" -Force; $count++ }
if (Test-Path "vercel.json") { Move-Item "vercel.json" "_archive/deployment" -Force; $count++ }
if (Test-Path ".vercelignore") { Move-Item ".vercelignore" "_archive/deployment" -Force; $count++ }

# Move odd files
if (Test-Path "ple trading signals section to Markets page with 5 example signals") {
    Move-Item "ple trading signals section to Markets page with 5 example signals" "_archive" -Force
    $count++
}

Write-Host "Phase 2 cleanup complete! Moved $count files to _archive/" -ForegroundColor Green
Write-Host "Essential files kept:" -ForegroundColor Yellow
Write-Host "  - server.js, package.json, README.md" -ForegroundColor Cyan
Write-Host "  - test-email.js, test-platform-health.js (for testing)" -ForegroundColor Cyan
Write-Host "  - railway.json, railway-server.js, Procfile (for deployment)" -ForegroundColor Cyan
