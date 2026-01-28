# Activate Live Payments & Update EA Prices

## EA Pricing Structure

All three EAs now have the same pricing:

| EA Name | Weekly | Monthly | Lifetime |
|---------|--------|---------|----------|
| London Breakout | $19 | $55 | $399 |
| Multi Indicator | $19 | $55 | $399 |
| Gold Scalper | $19 | $55 | $399 |

## Step 1: Update EA Prices in Database

### Option A: Using Node.js Script (Recommended)
```bash
node update-prices-activate-paystack.js
```

### Option B: Using SQL
1. Go to Supabase Dashboard
2. Open SQL Editor
3. Run the script: `update-ea-prices-and-activate-paystack.sql`

## Step 2: Activate Paystack Live Mode

### Get Your Live API Keys

1. Go to Paystack Dashboard: https://dashboard.paystack.com/#/settings/developers
2. Copy your **LIVE** keys (not test keys):
   - Live Secret Key (starts with `sk_live_`)
   - Live Public Key (starts with `pk_live_`)

### Update Railway Environment Variables

1. Go to Railway Dashboard: https://railway.app
2. Select your project
3. Click on **Variables** tab
4. Update these variables:

```
PAYSTACK_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
PAYSTACK_PUBLIC_KEY=pk_live_YOUR_LIVE_PUBLIC_KEY
PAYMENT_MODE=live
```

5. Click **Deploy** or wait for auto-deployment

### Verify Live Mode is Active

After deployment, check:

1. **In Railway Logs:**
   - Look for: "Paystack initialized in LIVE mode"
   - Should NOT see: "TEST mode"

2. **Test a Payment:**
   - Use a real card (small amount)
   - Check Paystack Dashboard for the transaction
   - Verify it appears in "Live" transactions, not "Test"

## Step 3: Verify Prices on Website

1. Go to: https://smartalgosts.com/ea-marketplace
2. Check each EA shows correct prices:
   - Weekly: $19
   - Monthly: $55
   - Lifetime: $399

## Important Notes

⚠️ **Before Going Live:**
- Test thoroughly with test keys first
- Verify email notifications work
- Check download system works
- Test on multiple devices

✅ **Live Mode Checklist:**
- [ ] Live API keys added to Railway
- [ ] PAYMENT_MODE set to "live"
- [ ] App redeployed
- [ ] Test payment successful
- [ ] Transaction appears in Paystack Live dashboard
- [ ] Email sent to customer
- [ ] Download link works
- [ ] EA files delivered correctly

🔒 **Security:**
- Never commit live keys to Git
- Keep secret keys secure
- Only use live keys in production
- Monitor transactions regularly

## Troubleshooting

### Prices Not Showing
- Clear browser cache
- Check database was updated
- Verify EA names match exactly

### Still in Test Mode
- Check Railway environment variables
- Ensure keys start with `sk_live_` and `pk_live_`
- Redeploy the application
- Check Railway logs for confirmation

### Payments Failing
- Verify live keys are correct
- Check Paystack account is activated
- Ensure business is verified on Paystack
- Check Railway logs for errors

## Support

If you encounter issues:
1. Check Railway deployment logs
2. Check Paystack dashboard for errors
3. Verify environment variables are set correctly
4. Test with a small amount first

---

**Status After Running Scripts:**
- ✅ EA prices updated
- ⏳ Paystack live mode (requires manual key update)
- ✅ Ready for production testing
