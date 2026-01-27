# Debug: Email Not Sent After Payment

## Situation
- ✅ Email service is configured (EMAIL_USER and EMAIL_PASSWORD set)
- ✅ Email configuration shows as ready
- ❌ Email not sent after payment

## Possible Causes

### 1. Payment Verification Endpoint Not Called
The email is sent during payment verification, not during payment initialization.

**Check:**
- Is the frontend calling the verification endpoint?
- For Paystack: `GET /api/payments/paystack/verify/:reference`
- For Crypto: `POST /api/payments/crypto/:transactionId/confirm`

### 2. Payment Status Still Pending
Email is only sent when payment status is "completed" or "confirmed".

**Check:**
- Run: `node check-recent-payments.js`
- Look for payment status
- If "pending", verification endpoint wasn't called

### 3. Subscription Creation Failed
Email is sent after subscription is created. If subscription creation fails, no email.

**Check:**
- Run: `node check-recent-payments.js`
- Look for matching subscription with payment reference
- Check Railway logs for subscription creation errors

### 4. Email Sending Failed Silently
Email service might have failed but didn't stop the process.

**Check:**
- Railway logs for email errors
- Look for: "❌ [Paystack] Email failed"
- Check error message and code

---

## Diagnostic Steps

### Step 1: Check Recent Payments

```bash
node check-recent-payments.js
```

This will show:
- Recent Paystack payments
- Recent Crypto payments
- Recent subscriptions
- Pending payments that need verification

**Look for:**
- Payment status (pending vs completed)
- Matching subscription for payment
- Payment reference matches subscription

### Step 2: Check Railway Logs

Go to Railway Dashboard → Deployments → View Logs

**Search for these patterns:**

#### Payment Verification:
```
🔍 [Paystack] ========== PAYMENT VERIFICATION START ==========
```

#### Email Attempt:
```
📧 [Paystack] ========== ATTEMPTING TO SEND EMAIL ==========
```

#### Email Success:
```
✅ [Paystack] Email sent successfully!
📬 [Paystack] Message ID: <xxx@gmail.com>
```

#### Email Failure:
```
❌ [Paystack] Email failed: [error message]
```

### Step 3: Check Payment Flow

#### For Paystack:
1. User completes payment on Paystack
2. Paystack redirects to: `/payment-callback?reference=ALGO-xxx`
3. Frontend should call: `GET /api/payments/paystack/verify/ALGO-xxx`
4. Backend verifies, creates subscription, sends email

**Check:**
- Is step 3 happening?
- Check browser network tab
- Check Railway logs for verification request

#### For Crypto:
1. User sends crypto
2. User clicks "I've sent the payment"
3. Frontend should call: `POST /api/payments/crypto/:id/confirm`
4. Backend confirms, creates subscription, sends email

**Check:**
- Is step 3 happening?
- Check browser network tab
- Check Railway logs for confirm request

### Step 4: Manual Email Resend

If payment was successful but email wasn't sent, you can manually resend:

```bash
# First, get subscription ID
node check-recent-payments.js

# Then resend email
node resend-subscription-email.js <subscription-id>
```

Example:
```bash
node resend-subscription-email.js abc-123-def-456
```

---

## Common Issues & Solutions

### Issue 1: Payment Verification Not Called

**Symptoms:**
- Payment shows as "pending" in database
- No verification logs in Railway
- User paid but no subscription created

**Solution:**
Check frontend payment callback handling:
- Paystack: Check `/payment-callback` route
- Crypto: Check "I've sent payment" button handler
- Ensure verification endpoint is called

**Frontend Code to Check:**
```javascript
// Paystack callback
const verifyPayment = async (reference) => {
  const response = await fetch(`/api/payments/paystack/verify/${reference}`);
  // Should trigger email sending
};

// Crypto confirm
const confirmPayment = async (transactionId) => {
  const response = await fetch(`/api/payments/crypto/${transactionId}/confirm`, {
    method: 'POST'
  });
  // Should trigger email sending
};
```

### Issue 2: Subscription Creation Failed

**Symptoms:**
- Payment verified successfully
- No subscription in database
- No email sent

**Solution:**
Check Railway logs for subscription creation errors:
```
❌ [Paystack] Error creating subscription
```

Common causes:
- Database connection issue
- Invalid EA ID
- User ID mismatch
- Database constraint violation

### Issue 3: Email Service Error

**Symptoms:**
- Payment verified
- Subscription created
- Email attempt logged but failed

**Solution:**
Check Railway logs for specific error:

**"Invalid login: 535-5.7.8"**
- Using wrong password
- Use App Password, not regular password

**"Connection timeout"**
- SMTP port blocked
- Check EMAIL_HOST and EMAIL_PORT

**"No email address found"**
- User record missing email
- Check users_accounts table

### Issue 4: Email Sent But Not Received

**Symptoms:**
- Logs show "Email sent successfully"
- User didn't receive email

**Solution:**
1. Check spam/junk folder
2. Verify EMAIL_USER is correct
3. Check Gmail sent folder
4. Try different email address
5. Check Gmail sending limits

---

## Testing Checklist

### Before Testing:
- [ ] EMAIL_USER set in Railway
- [ ] EMAIL_PASSWORD set in Railway
- [ ] EMAIL_HOST set in Railway
- [ ] EMAIL_PORT set in Railway
- [ ] Railway redeployed after adding variables
- [ ] Logs show "Email transporter created successfully"

### During Payment:
- [ ] Make test payment
- [ ] Watch Railway logs in real-time
- [ ] Check for verification request
- [ ] Check for subscription creation
- [ ] Check for email sending attempt
- [ ] Check for email success/failure

### After Payment:
- [ ] Run `node check-recent-payments.js`
- [ ] Verify payment status is "completed"
- [ ] Verify subscription was created
- [ ] Verify subscription has payment reference
- [ ] Check email inbox (and spam)

---

## Manual Verification Test

If you want to manually test the verification endpoint:

### For Paystack:
```bash
# Get a pending payment reference from database
# Then call verification endpoint manually

curl -X GET "https://your-backend.railway.app/api/payments/paystack/verify/ALGO-xxx" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### For Crypto:
```bash
# Get a pending payment ID from database
# Then call confirm endpoint manually

curl -X POST "https://your-backend.railway.app/api/payments/crypto/xxx/confirm" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Quick Fixes

### Fix 1: Resend Email for Existing Subscription
```bash
node resend-subscription-email.js <subscription-id>
```

### Fix 2: Manually Verify Pending Payment
Check Railway logs for the payment reference, then call verification endpoint manually.

### Fix 3: Check Email Configuration
```bash
node test-payment-email-flow.js
```

### Fix 4: Check Database Records
```bash
node check-recent-payments.js
```

---

## What to Check in Railway Logs

### Good Flow (Email Sent):
```
🔍 [Paystack] ========== PAYMENT VERIFICATION START ==========
🔍 [Paystack] Reference: ALGO-xxx
✅ [Paystack] Payment successful!
🔄 [Paystack] Creating subscription...
✅ [Paystack] Subscription created: sub-123
🔄 [Paystack] Generating download links...
✅ [Paystack] Download links generated
📧 [Paystack] ========== ATTEMPTING TO SEND EMAIL ==========
📧 [Paystack] Email Configuration Check:
   - EMAIL_USER set: true
   - EMAIL_PASSWORD set: true
✅ [Paystack] Email sent successfully!
📬 [Paystack] Message ID: <xxx@gmail.com>
📧 [Paystack] ========== EMAIL PROCESS COMPLETE ==========
🔍 [Paystack] ========== PAYMENT VERIFICATION COMPLETE ==========
```

### Bad Flow (Email Not Sent):
```
🔍 [Paystack] ========== PAYMENT VERIFICATION START ==========
🔍 [Paystack] Reference: ALGO-xxx
✅ [Paystack] Payment successful!
🔄 [Paystack] Creating subscription...
❌ [Paystack] Error creating subscription: [error]
```

OR

```
✅ [Paystack] Subscription created: sub-123
📧 [Paystack] ========== ATTEMPTING TO SEND EMAIL ==========
❌ [Paystack] EMAIL NOT CONFIGURED!
```

OR

```
✅ [Paystack] Subscription created: sub-123
📧 [Paystack] ========== ATTEMPTING TO SEND EMAIL ==========
❌ [Paystack] Email failed: [error]
```

---

## Next Steps

1. **Run diagnostic script:**
   ```bash
   node check-recent-payments.js
   ```

2. **Check Railway logs** for the specific payment

3. **Identify the issue** from the patterns above

4. **Apply the fix:**
   - If verification not called → Fix frontend
   - If subscription failed → Check database/logs
   - If email failed → Check error message
   - If email sent but not received → Check spam

5. **Resend email if needed:**
   ```bash
   node resend-subscription-email.js <subscription-id>
   ```

---

## Support

If still not working:
1. Share Railway logs (payment verification section)
2. Share output of `node check-recent-payments.js`
3. Share payment reference or transaction ID
4. Share any error messages

---

**Last Updated:** January 25, 2026
