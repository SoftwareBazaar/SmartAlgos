# Test Crypto Payment After Deployment

## Quick Test Steps

### 1. Check Railway Deployment Status
1. Go to your Railway dashboard: https://railway.app/
2. Check if the latest deployment is complete
3. Look for commit `7df9d20` - "Fix crypto payment validation to accept KES currency"

### 2. Test on Production Site

**Manual Test:**
1. Go to: https://web-production-fdb58.up.railway.app
2. Navigate to EA Marketplace
3. Select any EA
4. Click "Subscribe"
5. Choose a subscription type (e.g., Monthly)
6. Select "Cryptocurrency" payment method
7. Choose a crypto (USDT recommended)
8. Click "Generate Payment Address"

**Expected Result:**
- ✅ No more "Validation failed" error
- ✅ Payment address generates successfully
- ✅ Shows KES amount (e.g., 1500 KES)
- ✅ Shows USD equivalent (e.g., $10.05 USD)
- ✅ Shows crypto amount in USDT/BTC/ETH/USDC
- ✅ Displays QR code
- ✅ Shows wallet address

### 3. Check Browser Console

Open Developer Tools (F12) and look for:
- ✅ No red errors
- ✅ Successful POST request to `/api/payments/crypto/generate`
- ✅ Status 200 (not 400)
- ✅ Response contains payment data

### 4. If Still Not Working

**Wait for Cache to Clear:**
- Clear browser cache (Ctrl+F5)
- Try in incognito/private mode
- Wait 5 more minutes for Railway CDN to update

**Check Railway Logs:**
1. Go to Railway dashboard
2. Click on your project
3. Click "Deployments"
4. Click on the latest deployment
5. Click "View Logs"
6. Look for any errors

**Restart Railway Service (if needed):**
1. Railway Dashboard → Your Project
2. Click on the service
3. Click "Restart"

## Quick API Test

You can also test directly with curl:

```bash
curl -X POST https://web-production-fdb58.up.railway.app/api/payments/crypto/generate \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1500,
    "currency": "KES",
    "cryptoCurrency": "usdt",
    "productType": "ea_subscription",
    "productId": "test-123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "...",
    "address": "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",
    "amount": "10.05000000",
    "currency": "usdt",
    "network": "TRC20",
    "qrCode": "data:image/png;base64,...",
    "expiresAt": "..."
  }
}
```

## Troubleshooting

### Error: Still getting 400 Bad Request
**Cause:** Railway hasn't finished deploying
**Solution:** Wait 2-3 more minutes, then try again

### Error: Different validation error
**Cause:** Missing required fields
**Solution:** Make sure EA is selected before trying to pay

### Error: 500 Internal Server Error
**Cause:** Database issue
**Solution:** Check Railway logs for database connection errors

## Conversion Rates Reference

| Currency | Rate to USD | Example |
|----------|-------------|---------|
| KES | 0.0067 | 1500 KES = 10.05 USD |
| USD | 1.0 | 10 USD = 10 USD |
| EUR | 1.1 | 10 EUR = 11 USD |
| GBP | 1.27 | 10 GBP = 12.70 USD |

## Success Indicators

✅ **Payment Generation Works:**
- No validation errors
- QR code displays
- Wallet address shown
- Timer counting down

✅ **Amounts Display Correctly:**
- KES amount matches selected subscription price
- USD equivalent shown (KES × 0.0067)
- Crypto amount calculated from USD value

✅ **Ready for Production:**
- All test payments generate successfully
- No console errors
- Clean user experience

---

**Note:** Railway deployment typically takes 2-5 minutes. If you test immediately after pushing, you might still see the old error. Wait a few minutes and refresh!

