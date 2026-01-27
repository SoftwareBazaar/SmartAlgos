# 🚀 Quick Start: Enable Real Payments

## TL;DR - Get Real Payments Working in 5 Minutes

### 1️⃣ Cancel Test Subscriptions (1 min)
```bash
# In Supabase SQL Editor, run:
UPDATE subscriptions SET status = 'cancelled' WHERE status IN ('active', 'pending');
```

### 2️⃣ Set Environment Variables (2 min)
```bash
# Add to .env or Railway/Vercel environment
MOCK_AUTH=false
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_BUSINESS_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback
MPESA_ENVIRONMENT=sandbox
```

### 3️⃣ Restart Server (30 seconds)
```bash
npm start
# Or deploy on Railway/Vercel
```

### 4️⃣ Test with 5 KES (1 min)
```bash
node test-real-payments.js
# Or manually test in the app
```

### 5️⃣ Verify Subscription Created (30 seconds)
```sql
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;
```

---

## ✅ What Changed

### Frontend
- **Before:** Download worked for everyone (mock mode)
- **After:** Download requires active paid subscription

### M-Pesa Flow
- **Before:** Payment completed but no subscription created
- **After:** Payment → Callback → Auto-create subscription

### Crypto Flow
- **Before:** Basic payment tracking only
- **After:** Payment confirmed → Auto-create subscription with correct duration

---

## 🧪 Quick Test Script

```bash
# 1. Check environment
node enable-real-payments.js

# 2. Run payment test
export TEST_PHONE=254712345678  # Your actual M-Pesa number
node test-real-payments.js

# 3. Check results in Supabase
# Look for new subscription with payment_method='mpesa'
```

---

## 📁 Files Modified

### Backend
- `routes/mpesa.js` - Added subscription creation after payment
- `routes/cryptoPayments.js` - Improved subscription handling
- `routes/downloads.js` - Already enforcing subscription checks

### Frontend
- `client/src/pages/EAMarketplace/EAMarketplace.js` - Removed mock bypass

### New Files
- `cancel-all-subscriptions.sql` - Cancel test subscriptions
- `enable-real-payments.js` - Environment checker
- `test-real-payments.js` - Payment flow tester
- `REAL_PAYMENTS_SETUP_GUIDE.md` - Detailed guide

---

## 🎯 Expected Flow

### M-Pesa Payment (5 KES Test)
```
User clicks "Subscribe" 
→ Enters phone: 254712345678
→ Enters amount: 5 KES
→ System sends STK Push
→ User enters M-Pesa PIN on phone
→ Payment success
→ Safaricom sends callback
→ Server creates subscription
→ User can download EA files
```

### Crypto Payment
```
User clicks "Pay with Crypto"
→ System shows wallet address
→ User sends crypto
→ Blockchain confirms (wait time varies)
→ System detects payment
→ Server creates subscription
→ User can download EA files
```

---

## 🔍 Quick Verification

### Check if Mock Mode is OFF
```bash
node enable-real-payments.js
# Should show: ✅ MOCK_AUTH: false
```

### Check Subscriptions Table
```sql
SELECT 
  status, 
  payment_method, 
  COUNT(*) 
FROM subscriptions 
GROUP BY status, payment_method;
```

### Check M-Pesa Transactions
```sql
SELECT 
  status, 
  COUNT(*),
  SUM(amount) as total_amount
FROM mpesa_transactions
GROUP BY status;
```

---

## ⚠️ Common Issues

| Issue | Quick Fix |
|-------|-----------|
| "Downloads work without payment" | Set `MOCK_AUTH=false`, restart server |
| "STK Push not received" | Check phone format: `254712345678` |
| "Payment OK but no subscription" | Check M-Pesa metadata includes `eaId` |
| "Callback not working" | Callback URL must be public HTTPS |

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Downloads are blocked without subscription
- ✅ M-Pesa payment creates subscription automatically
- ✅ Server logs show: `✅ Subscription created successfully`
- ✅ User can download after payment completes

---

## 💡 Testing Tips

1. **Start with 5 KES:** Minimum M-Pesa amount, safe for testing
2. **Use sandbox first:** Test with Safaricom test environment
3. **Watch server logs:** Real-time feedback on what's happening
4. **Check database:** Verify subscriptions are actually created
5. **Test download:** Confirm EA files are accessible after payment

---

## 📚 Full Documentation

For detailed setup, troubleshooting, and production deployment:
👉 See `REAL_PAYMENTS_SETUP_GUIDE.md`

---

**Ready to test?** Run `node test-real-payments.js` now! 🚀

