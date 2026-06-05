# ================================================
#  Export Railway Env Vars → Vercel Migration
# ================================================

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Exporting Railway Variables for Vercel" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check Railway CLI
$railwayInstalled = Get-Command railway -ErrorAction SilentlyContinue
if (-not $railwayInstalled) {
    Write-Host "ERROR: Railway CLI not found." -ForegroundColor Red
    Write-Host ""
    Write-Host "Install it with:"
    Write-Host "  npm install -g @railway/cli" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Then run: railway login && railway link"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[1/3] Logging into Railway..." -ForegroundColor Green
railway login

Write-Host ""
Write-Host "[2/3] Linking to your Railway project..." -ForegroundColor Green
Write-Host "(Select your project when prompted)"
railway link

Write-Host ""
Write-Host "[3/3] Exporting variables..." -ForegroundColor Green
railway variables > .env.railway

Write-Host ""
Write-Host "Variables saved to .env.railway" -ForegroundColor Green
Write-Host ""

# --- Optional: push directly to Vercel using Vercel CLI ---
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if ($vercelInstalled) {
    Write-Host "Vercel CLI detected!" -ForegroundColor Cyan
    $push = Read-Host "Do you want to push variables to Vercel now? (y/n)"
    
    if ($push -eq 'y' -or $push -eq 'Y') {
        Write-Host ""
        Write-Host "Pushing each variable to Vercel (production + preview + development)..." -ForegroundColor Yellow
        Write-Host "You may be prompted to select your Vercel project."
        Write-Host ""
        
        Get-Content .env.railway | ForEach-Object {
            $line = $_.Trim()
            # Skip empty lines and comments
            if ($line -eq '' -or $line.StartsWith('#')) { return }
            
            # Split on first = only
            $eqIndex = $line.IndexOf('=')
            if ($eqIndex -lt 0) { return }
            
            $key = $line.Substring(0, $eqIndex).Trim()
            $value = $line.Substring($eqIndex + 1).Trim()
            
            # Remove surrounding quotes if present
            if (($value.StartsWith('"') -and $value.EndsWith('"')) -or
                ($value.StartsWith("'") -and $value.EndsWith("'"))) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            
            Write-Host "  Setting: $key" -ForegroundColor Gray
            
            # Set for all environments
            echo $value | vercel env add $key production 2>$null
            echo $value | vercel env add $key preview 2>$null
            echo $value | vercel env add $key development 2>$null
        }
        
        Write-Host ""
        Write-Host "All variables pushed to Vercel!" -ForegroundColor Green
    }
} else {
    Write-Host "Vercel CLI not found. To push vars automatically, install it with:" -ForegroundColor Yellow
    Write-Host "  npm install -g vercel" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Then run this script again, OR manually import .env.railway in:" -ForegroundColor White
    Write-Host "  vercel.com → Your Project → Settings → Environment Variables" -ForegroundColor White
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  DONE! Next: Deploy to Vercel" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Make sure your code is pushed to GitHub" -ForegroundColor White
Write-Host "2. Go to vercel.com and import the repo" -ForegroundColor White
Write-Host "3. Set Root Directory to: (leave blank)" -ForegroundColor White
Write-Host "4. Framework Preset: Other" -ForegroundColor White
Write-Host "5. Build Command: cd client && npm install && npm run build" -ForegroundColor White
Write-Host "6. Output Directory: client/build" -ForegroundColor White
Write-Host "7. Deploy!" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"
