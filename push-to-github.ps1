# Quick script to commit and push Railway deployment fixes

Write-Host "🚀 Pushing Railway deployment fixes to GitHub..." -ForegroundColor Cyan

# Add all changes
git add .

# Commit with a descriptive message
git commit -m "Fix Railway deployment: Add uploads directory creation for mock-users.json"

# Push to GitHub
git push origin master

Write-Host "✅ Changes pushed to GitHub successfully!" -ForegroundColor Green
Write-Host "🔄 Railway will auto-deploy in 1-2 minutes" -ForegroundColor Yellow
