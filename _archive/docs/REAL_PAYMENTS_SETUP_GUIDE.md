# 🚀 Real Payments Setup Guide

## Overview
This guide will help you transition from mock/test subscriptions to real payment processing with M-Pesa and Crypto payments.

---

## ✅ What Has Been Done

### 1. **Removed Mock Authentication Bypass**
   - ✅ Updated `client/src/pages/EAMarketplace/EAMarketplace.js` to check real subscriptions
   - ✅ Removed temporary `return true` that was showing downloads for all EAs

### 2. **Implemented M-Pesa Subscription Creation**
   - ✅ Added `processSuccessfulPayment()` function in `routes/mpesa.js`
   - ✅ M-Pesa callbacks now automatically create subscriptions in database
   - ✅ Supports all subscription types: weekly, monthly, quarterly, yearly

### 3. **Improved Crypto Payment Handling**
   - ✅ Updated `routes/cryptoPayments.js` to support all subscription types
   - ✅ Crypto payments now properly parse metadata for subscription duration
   - ✅ Automatic subscription creation on payment confirmation

### 4. **Created Helper Scripts**
   - ✅ `cancel-all-subscriptions.sql` - Cancels all existing test subscriptions
   - ✅ `enable-real-payments.js` - Checks environment configuration
   - ✅ `test-real-payments.js` - Tests complete payment flow

---

## 🔧 Setup Steps

### Step 1: Cancel All Test Subscriptions

Run the SQL script to cancel all existing test subscriptions:

**Using Supabase SQL Editor:**
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `cancel-all-subscriptions.sql`
4. Run the query

**Using psql:**
```bash
psql <your-connection-string> -f cancel-all-subscriptions.sql
```

**Expected Output:**
```
 total_cancelled | status
-----------------+-----------
              X  | cancelled
```

---

### Step 2: Configure Environment Variables

Set the following environment variables (in `.env` file or your hosting platform):

#### **Required: Disable Mock Mode**
```bash
MOCK_AUTH=false
```

#### **Required: Supabase Configuration**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

#### **Required: M-Pesa Configuration**
```bash
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_BUSINESS_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback
MPESA_ENVIRONMENT=sandbox   # or "production"
```

📚 **Get M-Pesa Credentials:**
- **Sandbox:** https://developer.safaricom.co.ke/
- **Production:** Register on Daraja Portal with your business details

#### **Optional: Crypto Wallet Addresses**
```bash
BTC_WALLET_ADDRESS=your_bitcoin_address
ETH_WALLET_ADDRESS=your_ethereum_address
USDT_WALLET_ADDRESS=your_usdt_trc20_address
```

---

### Step 3: Verify Configuration

Run the helper script to check your environment:

```bash
node enable-real-payments.js
```

This will check:
- ✅ MOCK_AUTH is set to false
- ✅ Supabase credentials are configured
- ✅ M-Pesa credentials are configured
- ✅ Crypto wallet addresses (optional)

**Expected Output:**
```
✅ MOCK_AUTH: false
✅ Supabase key appears to be configured
✅ M-Pesa credentials appear to be configured
✅ Environment check passed!
```

---

### Step 4: Update Frontend Payment Flow

The frontend M-Pesa and Crypto payment components need to include metadata for subscription creation.

**For M-Pesa (already handled in the backend):**
When initiating STK Push, ensure you pass:
```javascript
{
  amount: 5,  // or subscription price
  phoneNumber: userPhone,
  metadata: {
    eaId: selectedEA.id,
    ea_id: selectedEA.id,
    subscriptionType: 'weekly',  // or monthly, quarterly, yearly
    subscription_type: 'weekly'
  }
}
```

**For Crypto (already in the code):**
```javascript
{
  eaId: selectedEA.id,
  amount: price,
  subscriptionType: 'monthly',
  currency: 'USD'
}
```

---

### Step 5: Restart Your Server

After configuring environment variables, restart your server:

**Locally:**
```bash
npm start
```

**On Railway:**
1. Go to your Railway project
2. Navigate to Variables
3. Add/update the environment variables
4. Click "Deploy" or wait for auto-deploy

**On Vercel:**
1. Go to Project Settings → Environment Variables
2. Add/update variables
3. Redeploy the project

---

## 🧪 Testing

### Test with Small Amounts

Run the comprehensive test script:

```bash
# Set your test credentials first
export TEST_USER_EMAIL=test@smartalgos.com
export TEST_USER_PASSWORD=Test123!@#
export TEST_PHONE=254712345678  # Your actual M-Pesa number

# Run tests
node test-real-payments.js
```

This will:
1. ✅ Check environment configuration
2. ✅ Login with test user
3. ✅ Fetch available EAs
4. ✅ Initiate M-Pesa STK Push (5 KES)
5. ✅ Initialize crypto payment (1 USD)
6. ✅ Check created subscriptions

### Manual M-Pesa Testing

**Test with 5 KES:**
1. Login to your application
2. Select an EA to subscribe
3. Choose "Weekly" subscription (set price to 5 KES for testing)
4. Enter your phone number: `254712345678`
5. Click "Pay with M-Pesa"
6. You'll receive STK Push on your phone
7. Enter your M-Pesa PIN
8. Wait 5-10 seconds for confirmation
9. Check "My Subscriptions" - should see new active subscription

**What happens:**
1. STK Push is sent to your phone
2. You complete payment with M-Pesa PIN
3. Safaricom sends callback to your server
4. Server creates subscription in database
5. User can now download EA files

### Manual Crypto Testing

1. Login to your application
2. Select an EA to subscribe
3. Choose "Pay with Crypto"
4. Select crypto currency (BTC, ETH, or USDT)
5. Copy the payment address
6. Send the required amount from your wallet
7. Wait for blockchain confirmation (varies by network)
8. System auto-detects payment and creates subscription

---

## 🔍 Monitoring and Debugging

### Check Subscriptions
```bash
# In Supabase SQL Editor
SELECT 
  id, user_id, ea_id, 
  subscription_type, payment_method, 
  amount, status, 
  start_date, end_date
FROM subscriptions
ORDER BY created_at DESC
LIMIT 10;
```

### Check M-Pesa Transactions
```bash
SELECT 
  id, user_id, amount, phone_number,
  status, mpesa_receipt_number,
  created_at
FROM mpesa_transactions
ORDER BY created_at DESC
LIMIT 10;
```

### Check Crypto Payments
```bash
SELECT 
  id, user_id, amount_usd, crypto_currency,
  status, tx_hash,
  created_at
FROM crypto_payments
ORDER BY created_at DESC
LIMIT 10;
```

### Server Logs

Watch for these log messages:

**M-Pesa Success:**
```
✅ M-Pesa transaction stored in database
📞 M-Pesa callback received
💚 Payment successful - Processing subscription
✅ Subscription created successfully: <subscription-id>
```

**Crypto Success:**
```
✅ Crypto payment initialized
💰 Payment confirmed
✅ Subscription created from crypto payment
```

---

## ⚠️ Important Notes

### M-Pesa Sandbox vs Production

**Sandbox (Testing):**
- Use test credentials from Safaricom Developer Portal
- Test phone numbers only
- No real money involved
- Good for development

**Production (Live):**
- Requires business registration with Safaricom
- Real phone numbers
- Real money transactions
- Use only when ready to go live

### Minimum Payment Amounts

- **M-Pesa:** 5 KES minimum (good for testing)
- **Bitcoin:** Network fees may be high for small amounts
- **Ethereum:** Gas fees may exceed payment for small amounts
- **USDT (TRC20):** Low fees, good for small test amounts

### Callback URL Requirements

Your M-Pesa callback URL must be:
- ✅ Publicly accessible (no localhost)
- ✅ HTTPS (SSL certificate required)
- ✅ Responds within 30 seconds
- ✅ Returns `ResultCode: 0` to acknowledge

**For local testing:**
Use ngrok or similar tunnel:
```bash
ngrok http 5000
# Use the https URL: https://abc123.ngrok.io/api/mpesa/callback
```

---

## 📋 Troubleshooting

### Issue: Downloads still work without subscription
**Cause:** MOCK_AUTH is still enabled or Supabase key is placeholder
**Fix:** 
```bash
# Set explicitly
MOCK_AUTH=false

# Verify Supabase key doesn't contain:
# - "your-"
# - "example"
# - "changeme"
```

### Issue: M-Pesa STK Push not received
**Possible causes:**
1. Phone number format wrong (use 254XXXXXXXXX)
2. M-Pesa credentials incorrect
3. Network/connectivity issues

**Fix:**
```bash
# Validate credentials
node check-mpesa-env.js

# Test query to check transaction status
GET /api/mpesa/query/:checkoutRequestID
```

### Issue: Payment successful but no subscription created
**Cause:** Metadata missing from payment request
**Fix:** Ensure payment includes:
```javascript
{
  metadata: {
    eaId: 'ea-uuid-here',
    subscriptionType: 'weekly'
  }
}
```

### Issue: Crypto payment not detecting
**Cause:** Blockchain monitoring not configured
**Current Status:** Manual confirmation required
**Workaround:** Implement webhook from blockchain explorer service

---

## ✅ Success Checklist

Before going live, verify:

- [ ] MOCK_AUTH=false in environment
- [ ] All test subscriptions cancelled
- [ ] M-Pesa credentials configured (sandbox or production)
- [ ] M-Pesa callback URL is public and HTTPS
- [ ] Crypto wallet addresses configured
- [ ] Tested with 5 KES M-Pesa payment
- [ ] Subscription created after successful payment
- [ ] Download works with real subscription
- [ ] Download blocked without subscription
- [ ] Server logs showing successful flow

---

## 🎉 You're Ready!

Once all checks pass:
1. ✅ Mock mode disabled
2. ✅ Real payment methods working
3. ✅ Subscriptions created automatically
4. ✅ Downloads require active subscription

Your payment system is now live and ready for real users!

---

## 📞 Support

If you encounter issues:
1. Check server logs for errors
2. Verify environment variables
3. Test with small amounts first
4. Review M-Pesa callback logs

For M-Pesa issues:
- Safaricom Support: support@safaricom.co.ke
- Developer Portal: https://developer.safaricom.co.ke/support

---

**Last Updated:** October 27, 2025

