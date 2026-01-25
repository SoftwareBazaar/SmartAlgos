# Email Download Link Fix Guide

## Problem
The site is not sending email download links after successful Paystack or Crypto payments.

## Root Causes Identified

### 1. Email Configuration Missing
The email service requires these environment variables:
- `EMAIL_USER` - Your Gmail address
- `EMAIL_PASSWORD` - Gmail App Password (NOT your regular password)
- `EMAIL_HOST` - SMTP host (default: smtp.gmail.com)
- `EMAIL_PORT` - SMTP port (default: 587)

### 2. Payment Logs Not Showing
If logs don't show payments, the verification endpoints might not be called.

## Solution Applied

### Changes Made

#### 1. Enhanced Paystack Payment Email (routes/paystackPayments.js)
- ✅ Added detailed logging for email configuration
- ✅ Better error handling with error codes
- ✅ Checks if EMAIL_USER and EMAIL_PASSWORD are set
- ✅ Uses correct database table name (`users_accounts` not `users`)
- ✅ Continues subscription creation even if email fails

#### 2. Enhanced Crypto Payment Email (routes/cryptoPayments.js)
- ✅ Added detailed logging for email configuration
- ✅ Better error handling with error codes
- ✅ Checks if EMAIL_USER and EMAIL_PASSWORD are set
- ✅ Uses correct database table name (`users_accounts` not `users`)
- ✅ Continues subscription creation even if email fails

#### 3. Created Test Script (test-payment-email-flow.js)
- ✅ Tests email service configuration
- ✅ Sends test email to verify setup
- ✅ Checks database connection
- ✅ Lists recent payments and subscriptions
- ✅ Provides setup instructions

## Setup Instructions

### Step 1: Get Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (required)
3. Go to **App Passwords** section
4. Select **Mail** as the app
5. Select **Other** as the device and name it "Smart Algos"
6. Click **Generate**
7. Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

### Step 2: Set Environment Variables

#### Local Development (.env file)
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

#### Railway Production
1. Go to your Railway project
2. Click on **Variables** tab
3. Add these variables:
   - `EMAIL_USER` = your-email@gmail.com
   - `EMAIL_PASSWORD` = your-16-char-app-password
   - `EMAIL_HOST` = smtp.gmail.com
   - `EMAIL_PORT` = 587

4. Click **Deploy** to restart with new variables

### Step 3: Test Email Setup

Run the test script:
```bash
node test-payment-email-flow.js
```

This will:
- ✅ Check if environment variables are set
- ✅ Send a test email to your configured email
- ✅ Check database connection
- ✅ List recent payments
- ✅ Verify payment endpoints

### Step 4: Verify Payment Flow

#### For Paystack Payments:
1. User completes payment on Paystack
2. Paystack redirects to `/payment-callback?reference=ALGO-xxx`
3. Frontend calls `/api/payments/paystack/verify/:reference`
4. Backend:
   - Verifies payment with Paystack API
   - Creates subscription
   - Generates download links
   - **Sends email with download links** ✅
   - Returns success response

#### For Crypto Payments:
1. User sends crypto to wallet address
2. User clicks "I've sent the payment"
3. Frontend calls `/api/payments/crypto/:transactionId/confirm`
4. Backend:
   - Updates payment status
   - Creates subscription
   - Generates download links
   - **Sends email with download links** ✅
   - Returns success response

## Debugging

### Check Server Logs

Look for these log messages:

#### Email Configuration Check:
```
📧 [Paystack] Email Configuration Check:
   - To: user@example.com
   - User Name: John Doe
   - EA Name: Test EA
   - Subscription Type: monthly
   - Subscription ID: abc-123
   - EMAIL_USER set: true
   - EMAIL_PASSWORD set: true
```

#### Email Success:
```
✅ [Paystack] Email sent successfully!
📬 [Paystack] Message ID: <message-id@gmail.com>
```

#### Email Failure:
```
❌ [Paystack] Email failed: Connection timeout
   Error code: ETIMEDOUT
```

### Common Issues

#### 1. "EMAIL NOT CONFIGURED"
**Problem:** EMAIL_USER or EMAIL_PASSWORD not set
**Solution:** Set environment variables (see Step 2)

#### 2. "Invalid login: 535-5.7.8 Username and Password not accepted"
**Problem:** Using regular Gmail password instead of App Password
**Solution:** Generate and use Gmail App Password (see Step 1)

#### 3. "Connection timeout"
**Problem:** Firewall blocking SMTP port 587
**Solution:** Check Railway/server firewall settings

#### 4. "No email address found for user"
**Problem:** User record doesn't have email
**Solution:** Check `users_accounts` table has email column populated

#### 5. Emails not received
**Problem:** Email sent but not in inbox
**Solution:** 
- Check spam/junk folder
- Verify EMAIL_USER is correct
- Check Gmail sent folder

### Manual Email Test

You can manually test email sending:

```javascript
const emailService = require('./services/emailService');

emailService.sendDownloadEmail({
  userEmail: 'test@example.com',
  userName: 'Test User',
  eaName: 'Test EA',
  downloadLinks: {
    zip_package: 'https://example.com/download.zip',
    ea_file: 'https://example.com/file.ex4'
  },
  subscriptionType: 'monthly',
  subscriptionId: 'test-123'
}).then(result => {
  console.log('Result:', result);
});
```

## Verification Checklist

- [ ] EMAIL_USER environment variable set
- [ ] EMAIL_PASSWORD environment variable set (App Password, not regular password)
- [ ] Test script runs successfully (`node test-payment-email-flow.js`)
- [ ] Test email received in inbox
- [ ] Railway environment variables configured
- [ ] Server restarted after adding variables
- [ ] Payment verification endpoints being called
- [ ] Server logs show email sending attempts
- [ ] Users receiving emails after payment

## Email Template

The email includes:
- ✅ Payment success confirmation
- ✅ Subscription details (EA name, type, ID)
- ✅ Download links (ZIP package + individual files)
- ✅ Installation instructions
- ✅ Support contact information
- ✅ Professional HTML formatting

## Support

If emails still not working after following this guide:

1. Check Railway logs for email errors
2. Verify Gmail App Password is correct
3. Test with different email address
4. Check if Gmail account has sending limits
5. Consider using alternative SMTP service (SendGrid, Mailgun, etc.)

## Alternative SMTP Services

If Gmail doesn't work, you can use:

### SendGrid
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

### Mailgun
```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-username
EMAIL_PASSWORD=your-mailgun-password
```

### AWS SES
```bash
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-ses-smtp-username
EMAIL_PASSWORD=your-ses-smtp-password
```

## Next Steps

1. Run test script: `node test-payment-email-flow.js`
2. Set up Gmail App Password
3. Configure Railway environment variables
4. Deploy and test with real payment
5. Monitor logs for email sending
6. Verify email received

---

**Last Updated:** January 25, 2026
**Status:** ✅ Email sending implemented and enhanced
