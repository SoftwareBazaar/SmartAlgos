# Rollback script to restore last working state
Write-Host "⚠️  WARNING: This will rollback to the last working deployment!" -ForegroundColor Yellow
Write-Host "This will restore the project to commit 4533454f (last working state)" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Are you sure you want to continue? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "Rollback cancelled." -ForegroundColor Green
    exit
}

Write-Host "Starting rollback..." -ForegroundColor Cyan

# Reset to the last working commit
git reset --hard 4533454f

Write-Host "✅ Rollback complete!" -ForegroundColor Green
Write-Host "⚠️  To push to Railway (force push required), run:" -ForegroundColor Yellow
Write-Host "git push origin master --force" -ForegroundColor Red
Write-Host ""
Write-Host "Note: This will overwrite the remote branch. Make sure this is what you want!" -ForegroundColor Yellow
