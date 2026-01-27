# Restore essential files from archive without reverting cleanup
Write-Host "Restoring essential files from archive..." -ForegroundColor Green

$restored = 0

# Check if fix-image-display.js is already restored
if (!(Test-Path "fix-image-display.js")) {
    if (Test-Path "_archive/fix-image-display.js") {
        Copy-Item "_archive/fix-image-display.js" "." -Force
        Write-Host "✅ Restored fix-image-display.js" -ForegroundColor Cyan
        $restored++
    }
}

# Check for any other files that might be needed
# Add more files here if needed

if ($restored -eq 0) {
    Write-Host "No files needed to be restored." -ForegroundColor Yellow
} else {
    Write-Host "`n✅ Restored $restored file(s)" -ForegroundColor Green
    Write-Host "Run 'git add .' and 'git commit' to save changes" -ForegroundColor Yellow
}
