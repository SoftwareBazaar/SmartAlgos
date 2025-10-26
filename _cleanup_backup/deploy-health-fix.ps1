Write-Host "========================================"
Write-Host "Deploying Health Check Fix to Railway"
Write-Host "========================================"
Write-Host ""

Write-Host "Step 1: Checking git status..."
git status
Write-Host ""

Write-Host "Step 2: Adding modified files..."
git add server.js
git add railway.json
git add test-health-endpoint.js
git add RAILWAY_HEALTH_CHECK_PERMANENT_FIX.md
git add RAILWAY_BUILD_FIX_V2.md
git add RAILWAY_HEALTH_CHECK_FIX_FINAL.md
Write-Host ""

Write-Host "Step 3: Committing changes..."
git commit -m "CRITICAL FIX: Reorder startup sequence to fix Railway health check - health endpoint now responds immediately before any service initialization"
Write-Host ""

Write-Host "Step 4: Pushing to Railway (main branch)..."
git push origin master
Write-Host ""

Write-Host "========================================"
Write-Host "Deployment Complete!"
Write-Host "========================================"
Write-Host ""
Write-Host "Railway will now rebuild and redeploy."
Write-Host ""
Write-Host "Monitor the deployment at:"
Write-Host "https://railway.app/dashboard"
Write-Host ""
Write-Host "The health check should now pass within 5-10 seconds!"
Write-Host ""
Write-Host "To test locally first, run:"
Write-Host "  npm run start:railway"
Write-Host "  node test-health-endpoint.js"
Write-Host ""
Read-Host "Press Enter to continue"

