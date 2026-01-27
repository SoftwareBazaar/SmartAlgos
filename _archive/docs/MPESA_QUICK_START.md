# 🚀 M-Pesa Quick Start - Get Running in 5 Minutes!

## ✅ Integration Complete!

Your M-Pesa Daraja API integration is **100% ready**. Follow these steps to start accepting payments:

---

## 📝 Step 1: Add Credentials (2 minutes)

1. Open your `.env` file
2. Add these lines:

```env
# M-Pesa Daraja API
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
```

**For testing**, use sandbox credentials from [Daraja Portal](https://developer.safaricom.co.ke/)

---

## 🗄️ Step 2: Setup Database (1 minute)

1. Open Supabase SQL Editor
2. Copy contents of `mpesa-database-migration.sql`
3. Run the script
4. Done! ✅

Or via command line:
```bash
psql -h your-supabase-host -U postgres -d postgres -f mpesa-database-migration.sql
```

---

## 🔄 Step 3: Restart Server (30 seconds)

```bash
npm start
```

Look for this in logs:
```
🟢 M-Pesa Service initialized in SANDBOX mode
```

---

## 🧪 Step 4: Test It! (1 minute)

### Option A: Via Frontend
1. Go to any payment page
2. Click "Pay Now"
3. Select "M-Pesa" option
4. Enter test phone: `254708374149`
5. Enter amount: `10`
6. Click "Send STK Push"
7. Check your phone for M-Pesa prompt!

### Option B: Via API
```bash
curl -X POST http://localhost:5000/api/mpesa/stk-push \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10,
    "phoneNumber": "254712345678",
    "accountReference": "TEST001",
    "transactionDesc": "Test Payment"
  }'
```

---

## 🎯 Using M-Pesa in Your Code

### Simple Usage:

```javascript
import MpesaPayment from './components/MpesaPayment';

<MpesaPayment
  amount={1000}
  accountReference="SUB_123"
  transactionDesc="AlgoSmart Subscription"
  onSuccess={(result) => {
    console.log('Paid!', result);
  }}
  onError={(error) => {
    console.error('Failed:', error);
  }}
/>
```

### With Payment Method Dialog (Recommended):

```javascript
import { PaymentMethodDialog } from './components/Payments';

<PaymentMethodDialog
  isOpen={true}
  amount={1000}
  currency="KES"
  accountReference="SUB_123"
  transactionDesc="Basic Subscription"
  onPaymentSuccess={(result) => {
    // Handle success
  }}
  onClose={() => {
    // Handle close
  }}
/>
```

This gives users choice of:
- 💳 Card (Paystack)
- 📱 M-Pesa
- ₿ Crypto

---

## 🔍 Check Integration Status

```bash
# Validate credentials
curl -X POST http://localhost:5000/api/mpesa/validate-credentials \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "valid": true,
  "message": "M-Pesa credentials are valid",
  "environment": "sandbox"
}
```

---

## 📱 Test Phone Numbers (Sandbox)

Use these for testing:
- `254708374149` (Safaricom test number)
- `254712345678` (Any valid format)

**Format**: `254XXXXXXXXX` (254 + 9 digits)

---

## 🐛 Troubleshooting

### "Invalid Access Token"
**Fix**: Check your consumer key and secret are correct

### "Invalid Phone Number"
**Fix**: Use format `254XXXXXXXXX` (not `+254`, `0712`, or `712`)

### "Callback Not Received"
**Fix**: 
- Make sure callback URL is publicly accessible
- Check it's HTTPS in production
- Verify no firewall blocking

### "STK Push Not Appearing"
**Fix**:
- Check phone number is correct
- Verify phone has M-Pesa active
- Try different phone number

---

## 📊 Monitor Transactions

### View in Database:
```sql
SELECT * FROM mpesa_transactions ORDER BY created_at DESC LIMIT 10;
```

### Via API:
```bash
curl -X GET http://localhost:5000/api/mpesa/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🌍 Going to Production

When ready for production:

1. Get production credentials from [Daraja Portal](https://developer.safaricom.co.ke/)
2. Update `.env`:
   ```env
   MPESA_ENVIRONMENT=production
   MPESA_CONSUMER_KEY=prod_consumer_key
   MPESA_CONSUMER_SECRET=prod_consumer_secret
   MPESA_BUSINESS_SHORTCODE=your_shortcode
   MPESA_PASSKEY=prod_passkey
   MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
   ```
3. Test with small amounts first
4. Monitor logs closely
5. Done! 🚀

---

## 📚 Full Documentation

- **Setup Guide**: `MPESA_SETUP_GUIDE.md` (Complete instructions)
- **Integration Summary**: `MPESA_INTEGRATION_COMPLETE.md` (What was built)
- **Database Migration**: `mpesa-database-migration.sql` (Database setup)
- **Environment Config**: `env.example` (Configuration reference)

---

## 🎉 You're Ready!

Your platform can now accept M-Pesa payments from **50M+ Kenyan users**!

**Next Steps:**
1. ✅ Add credentials → Test → Deploy
2. 📱 Tell your users about M-Pesa option
3. 💰 Start accepting mobile money!

---

## 💡 Pro Tips

1. **Phone Number**: Always display format example to users
2. **Amount**: M-Pesa requires integers (auto-rounded)
3. **Timeout**: STK Push expires in 60 seconds
4. **Receipt**: Always save `mpesaReceiptNumber` for support
5. **Reconciliation**: Use receipt numbers to match payments

---

## 🆘 Need Help?

1. Check `MPESA_SETUP_GUIDE.md` troubleshooting section
2. Review server logs (look for 🟢/🔴 emojis)
3. Test credentials: `/api/mpesa/validate-credentials`
4. Safaricom Support: apisupport@safaricom.co.ke

---

**🎊 Congratulations! Your M-Pesa integration is complete!**

Start accepting payments now! 🚀💚🇰🇪

---

*Built for AlgoSmart Trading Platform*

