# Railway Email Setup Guide

## Quick Setup (5 minutes)

### Step 1: Get Gmail App Password

1. **Go to Google Account Security**
   - Visit: https://myaccount.google.com/security
   - Sign in with your Gmail account

2. **Enable 2-Step Verification** (if not already enabled)
   - Click "2-Step Verification"
   - Follow the setup wizard
   - This is REQUIRED for App Passwords

3. **Generate App Password**
   - Go back to Security page
   - Click "App passwords" (or search for it)
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Enter name: **Smart Algos**
   - Click **Generate**
   - **COPY the 16-character password** (format: xxxx xxxx xxxx xxxx)
   - ⚠️ You won't be able to see it again!

### Step 2: Configure Railway

1. **Open Railway Dashboard**
   - Go to: https://railway.app/dashboard
   - Select your Smart Algos project

2. **Add Environment Variables**
   - Click on your service (backend)
   - Click **"Variables"** tab
   - Click **"+ New Variable"**

3. **Add These Variables:**

   ```
   Variable Name: EMAIL_USER
   Value: your-email@gmail.com
   ```

   ```
   Variable Name: EMAIL_PASSWORD
   Value: xxxx xxxx xxxx xxxx (your 16-char app password)
   ```

   ```
   Variable Name: EMAIL_HOST
   Value: smtp.gmail.com
   ```

   ```
   Variable Name: EMAIL_PORT
   Value: 587
   ```

4. **Deploy Changes**
   - Railway will automatically redeploy
   - Or click **"Deploy"** button
   - Wait for deployment to complete (~2-3 minutes)

### Step 3: Verify Setup

1. **Check Railway Logs**
   - Click **"Deployments"** tab
   - Click on latest deployment
   - Click **"View Logs"**
   - Look for: `✅ Email transporter created successfully`

2. **Test Email Sending**
   - Make a test payment
   - Check logs for:
     ```
     📧 [Paystack] Email Configuration Check:
        - EMAIL_USER set: true
        - EMAIL_PASSWORD set: true
     ✅ [Paystack] Email sent successfully!
     ```

3. **Check Your Inbox**
   - Email should arrive within 1-2 minutes
   - Check spam folder if not in inbox
   - Subject: "✅ Your [EA Name] Files Are Ready - Smart Algos"

## Troubleshooting

### Issue 1: "EMAIL NOT CONFIGURED" in logs

**Cause:** Environment variables not set or not loaded

**Solution:**
1. Verify variables are added in Railway dashboard
2. Check variable names are EXACTLY:
   - `EMAIL_USER` (not email_user or Email_User)
   - `EMAIL_PASSWORD` (not email_password)
3. Redeploy the service
4. Wait for deployment to complete

### Issue 2: "Invalid login: 535-5.7.8"

**Cause:** Using regular Gmail password instead of App Password

**Solution:**
1. Generate a new App Password (Step 1 above)
2. Update `EMAIL_PASSWORD` in Railway
3. Make sure to use the 16-character App Password
4. Remove any spaces from the password

### Issue 3: "Connection timeout"

**Cause:** SMTP port blocked or wrong host

**Solution:**
1. Verify `EMAIL_HOST` = `smtp.gmail.com`
2. Verify `EMAIL_PORT` = `587`
3. Check Railway doesn't block outbound SMTP
4. Try alternative port `465` with `EMAIL_PORT=465`

### Issue 4: Emails not received

**Possible Causes:**
- Email in spam folder ✅ Check spam
- Wrong email address ✅ Verify EMAIL_USER
- Gmail sending limits ✅ Check Gmail account
- Email service down ✅ Check logs for errors

**Solution:**
1. Check spam/junk folder first
2. Verify EMAIL_USER is correct email
3. Check Railway logs for email errors
4. Test with different email address
5. Check Gmail sent folder

### Issue 5: Variables not loading

**Cause:** Railway cache or deployment issue

**Solution:**
1. Delete all email variables
2. Re-add them one by one
3. Click "Deploy" manually
4. Clear Railway cache (Settings > Clear Cache)
5. Redeploy

## Testing

### Local Test (Before Deploying)

```bash
# Set environment variables in .env file
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Run test script
node test-payment-email-flow.js
```

### Production Test (After Deploying)

1. Make a small test payment
2. Monitor Railway logs in real-time
3. Check for email sending logs
4. Verify email received

## Security Notes

⚠️ **IMPORTANT:**
- Never commit EMAIL_PASSWORD to git
- Use App Password, not regular password
- Keep App Password secure
- Rotate App Password if compromised
- Don't share App Password

## Alternative: Use SendGrid (Recommended for Production)

If Gmail doesn't work or you need better reliability:

### 1. Sign up for SendGrid
- Go to: https://sendgrid.com
- Free tier: 100 emails/day
- Paid tier: More emails + better deliverability

### 2. Get API Key
- Dashboard > Settings > API Keys
- Create API Key with "Mail Send" permission
- Copy the API key

### 3. Configure Railway
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

### 4. Verify Domain (Optional but Recommended)
- Dashboard > Settings > Sender Authentication
- Verify your domain
- Better deliverability and no spam issues

## Monitoring

### Check Email Sending Status

**Railway Logs:**
```bash
# Look for these patterns:
✅ Email sent successfully
❌ Email failed
📧 Email Configuration Check
```

**Database:**
```sql
-- Check recent subscriptions
SELECT id, user_id, status, payment_method, created_at
FROM subscriptions
ORDER BY created_at DESC
LIMIT 10;

-- Check payment records
SELECT id, email, status, amount_usd, created_at
FROM paystack_payments
ORDER BY created_at DESC
LIMIT 10;
```

## Support Checklist

Before asking for help, verify:

- [ ] Gmail 2-Step Verification enabled
- [ ] App Password generated (not regular password)
- [ ] All 4 environment variables set in Railway
- [ ] Variable names are correct (case-sensitive)
- [ ] Railway service redeployed after adding variables
- [ ] Logs show "Email transporter created successfully"
- [ ] Test payment made
- [ ] Logs checked for email sending attempts
- [ ] Spam folder checked
- [ ] Gmail account not hitting sending limits

## Quick Reference

### Environment Variables
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### Log Patterns to Look For
```
✅ Email transporter created successfully
📧 [Paystack] Email Configuration Check
✅ [Paystack] Email sent successfully!
📬 [Paystack] Message ID: <xxx@gmail.com>
```

### Error Patterns
```
❌ EMAIL NOT CONFIGURED!
❌ Email server connection failed
❌ Invalid login: 535-5.7.8
❌ Connection timeout
```

---

**Need Help?**
- Check logs first
- Review this guide
- Test locally with test script
- Verify all environment variables
- Check spam folder

**Last Updated:** January 25, 2026
