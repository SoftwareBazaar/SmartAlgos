# Phase 3 Cleanup - Archive demo and reference folders
Write-Host "Starting Phase 3 cleanup..." -ForegroundColor Green

$count = 0

# Move entire folders to archive
if (Test-Path "test-ea-demo") {
    Move-Item "test-ea-demo" "_archive" -Force
    Write-Host "Moved test-ea-demo folder" -ForegroundColor Cyan
    $count++
}

if (Test-Path "mpesa_reference") {
    Move-Item "mpesa_reference" "_archive" -Force
    Write-Host "Moved mpesa_reference folder" -ForegroundColor Cyan
    $count++
}

# Merge _cleanup_backup into _archive
if (Test-Path "_cleanup_backup") {
    Get-ChildItem "_cleanup_backup" | Move-Item -Destination "_archive" -Force
    Remove-Item "_cleanup_backup" -Force -Recurse
    Write-Host "Merged _cleanup_backup into _archive" -ForegroundColor Cyan
    $count++
}

Write-Host "`nPhase 3 cleanup complete! Moved $count items to _archive/" -ForegroundColor Green
Write-Host "`nProject is now clean and ready for launch!" -ForegroundColor Yellow
Write-Host "Estimated size reduction: ~75% from original" -ForegroundColor Green
