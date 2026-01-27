Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Deploying Subscription Files Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Checking git status..." -ForegroundColor Yellow
& git status
Write-Host ""

Write-Host "Step 2: Adding modified files..." -ForegroundColor Yellow
& git add services/databaseService.js
& git add SUBSCRIPTION_FILES_ERROR_FIXED.md
& git add FIX_VERIFICATION_CHECKLIST.md
Write-Host "Files staged for commit" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Committing changes..." -ForegroundColor Yellow
& git commit -m "fix: add missing subscription methods to resolve 500 error on /api/subscriptions/:id/files"
Write-Host ""

Write-Host "Step 4: Pushing to Railway..." -ForegroundColor Yellow
& git push origin master
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "   Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Railway will automatically redeploy your app." -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check Railway dashboard for deployment status"
Write-Host "2. Wait 2-3 minutes for deployment to complete"
Write-Host "3. Test the endpoint: /api/subscriptions/14/files"
Write-Host ""
