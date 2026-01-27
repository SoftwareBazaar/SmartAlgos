# PowerShell script to commit and push changes
git add -A
git commit -m "feat: Add portfolio simulation, sample trading signals, and enhanced sorting/filtering to EA Marketplace and HFT Bots"
Write-Host "Changes committed successfully!"
Write-Host "To push to remote, run: git push"
Write-Host "If using Railway/Render, they will auto-deploy on push"

