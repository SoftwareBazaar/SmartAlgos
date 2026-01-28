# Update EA Prices via Admin Panel

Since the SQL approach is having issues, update prices directly through the admin panel:

## Step-by-Step Instructions:

### 1. Login to Admin Panel
- Go to: https://smartalgosts.com/admin
- Login with your admin credentials

### 2. Update London Breakout EA
1. Find "London Breakout" in the EA list
2. Click "Edit"
3. Update prices:
   - **Weekly Price**: 19
   - **Monthly Price**: 55
   - **Yearly Price**: 399
4. Click "Save"

### 3. Update Multi Indicator EA
1. Find "Multi Indicator" in the EA list
2. Click "Edit"
3. Update prices:
   - **Weekly Price**: 19
   - **Monthly Price**: 55
   - **Yearly Price**: 399
4. Click "Save"

### 4. Update Gold Scalper EA
1. Find "Gold Scalper" in the EA list
2. Click "Edit"
3. Update prices:
   - **Weekly Price**: 19
   - **Monthly Price**: 55
   - **Yearly Price**: 399
4. Click "Save"

## Verify Prices

After updating, verify on the marketplace:
- Go to: https://smartalgosts.com/ea-marketplace
- Check each EA shows the correct prices

## If Connection Lost Error Persists

This error suggests the site might be down or having issues. Check:

1. **Railway Deployment Status:**
   - Go to Railway Dashboard
   - Check if deployment is successful
   - Look for any errors in logs

2. **Check Site Status:**
   - Try accessing: https://smartalgosts.com
   - If site is down, check Railway logs

3. **Possible Causes:**
   - Recent deployment still in progress
   - Environment variable issues
   - Database connection problems
   - Server restart needed

## Alternative: Direct Database Update

If admin panel doesn't work, use Supabase SQL Editor:

```sql
-- First, check what columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'expert_advisors' 
AND column_name LIKE '%price%';

-- Then update based on actual column names
-- (Replace column names if different)
UPDATE expert_advisors
SET 
  price_weekly = 19.00,
  price_monthly = 55.00,
  price_yearly = 399.00,
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM expert_advisors 
  WHERE LOWER(name) LIKE '%london%breakout%'
     OR LOWER(name) LIKE '%multi%indicator%'
     OR LOWER(name) LIKE '%gold%scalper%'
);
```

## Activate Paystack Live Mode

Once prices are updated, activate live payments:

1. Go to: https://dashboard.paystack.com/#/settings/developers
2. Copy your LIVE keys (sk_live_... and pk_live_...)
3. Update Railway environment variables:
   - PAYSTACK_SECRET_KEY=sk_live_YOUR_KEY
   - PAYSTACK_PUBLIC_KEY=pk_live_YOUR_KEY
   - PAYMENT_MODE=live
4. Redeploy the app

---

**Current Pricing:**
- Weekly: $19
- Monthly: $55
- Yearly (Lifetime): $399
