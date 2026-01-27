# 📧 Email Testing & Payment Debugging Guide

## Current Status
✅ Email service configured in Railway (EMAIL_USER and EMAIL_PASSWORD set)
✅ Email sending code added to both Paystack and Crypto payment routes
✅ Test email route created and registered
⚠️ **ISSUE**: No payment logs appearing when you make test payments

## Step 1: Test Email Service Directly

### Test the email endpoint:
```
https://web-production-fdb58.up.railway.app/api/test-email
```

**What to expect:**
- Email should be sent to: softwarebazaar.ke@gmail.com
- Check your inbox (and spam folder)
- Railway logs should show:
  ```
  🧪 ========== EMAIL TEST STARTED ==========
  📧 Sending test email to: softwarebazaar.ke@gmail.com
  ✅ Email sent successfully
  🧪 ========== EMAIL TEST COMPLETE ==========
  ```

**If email arrives:** ✅ Email service works! Problem is with payment flow.
**If email doesn't arrive:** ❌ Email service issue - check credentials.

## Step 2: Test Payment Flow

### Make a test payment (Paystack or Crypto)

**What should happen:**
1. Payment is initiated
2. Payment is verified
3. Subscription is created
4. Download links are generated
5. **Email is sent to customer**

### Check Railway Logs for Payment

**Expected logs for Paystack payment:**
```
🔍 [Paystack] ========== PAYMENT VERIFICATION START ==========
🔍 [Paystack] Reference: ref_xxxxx
✅ [Paystack] Payment successful!
🔄 [Paystack] Creating subscription...
✅ [Paystack] Subscription created: xxx
🔄 [Paystack] Generating download links...
✅ [Paystack] Download links generated
📧 [Paystack] ========== SENDING EMAIL ==========
📧 [Paystack] To: customer@email.com
✅ [Paystack] Email sent successfully!
```

**Expected logs for Crypto payment:**
```
✅ Payment confirmed on blockchain!
🔄 Creating subscription...
✅ Subscription created: xxx
📧 Sending download email to: customer@email.com
✅ Email sent successfully
```

## Step 3: Debugging - If No Payment Logs Appear

### Problem: Payment verification endpoint not being called

**Possible causes:**

1. **Paystack callback URL not configured**
   - Check Paystack dashboard settings
   - Callback URL should be: `https://web-production-fdb58.up.railway.app/api/payments/paystack/callback`

2. **Frontend not calling verify endpoint**
   - Check browser console after payment
   - Should see API call to `/api/payments/paystack/verify/:reference`

3. **Authentication issue**
   - Verify endpoint requires auth token
   - Check if user is logged in when making payment

### How to check:

**In Railway logs, search for:**
- `[Paystack]` - Any Paystack activity
- `PAYMENT VERIFICATION` - Verification attempts
- `Email sent` - Email sending attempts
- Your payment reference number

**If you see NO logs at all:**
- Payment verification endpoint is not being called
- Check frontend payment flow
- Check Paystack webhook configuration

## Step 4: Frontend Payment Flow Check

### Check browser console after payment:

**For Paystack:**
```javascript
// Should see these logs:
"💰 Payment successful"
"🔍 Verifying payment..."
"✅ Payment verified"
"📦 Download links received"
```

**For Crypto:**
```javascript
// Should see these logs:
"✅ Payment confirmed on blockchain!"
"📦 Confirm response data"
"📦 Download links"
"🎯 Calling onPaymentSuccess"
```

## Step 5: Manual Email Test (If Needed)

If you want to manually trigger email sending for an existing subscription:

```javascript
// Create test-manual-email.js
const emailService = require('./services/emailService');

const testData = {
  userEmail: 'customer@email.com',
  userName: 'Test Customer',
  eaName: 'London Breakout Bot',
  downloadLinks: {
    zip_package: 'https://your-download-link.com/file.zip',
    ea_file: 'https://your-download-link.com/file.ex4',
    set_file: 'https://your-download-link.com/file.set',
    manual: 'https://your-download-link.com/manual.pdf'
  },
  subscriptionType: 'monthly',
  subscriptionId: 'test-123'
};

emailService.sendDownloadEmail(testData)
  .then(result => console.log('Result:', result))
  .catch(error => console.error('Error:', error));
```

## Quick Checklist

- [ ] Test email endpoint works (Step 1)
- [ ] Email arrives in inbox
- [ ] Make test payment
- [ ] Check Railway logs for payment verification
- [ ] Check Railway logs for email sending
- [ ] Check email inbox for download email
- [ ] If no logs: Check frontend console
- [ ] If no logs: Check Paystack webhook config

## Next Steps

1. **Run deploy-email-test.bat** to deploy the test route
2. **Wait 60 seconds** for Railway to rebuild
3. **Visit test email URL** to test email service
4. **Make a test payment** and watch Railway logs
5. **Report back** what you see in logs and email

---

**Remember:** The key is to see if payment verification logs appear. If they don't, the problem is that the verify endpoint isn't being called, not the email service itself.
