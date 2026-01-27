# 🔍 Check Railway Logs for Email Errors

## 📊 How to View Logs

### Step 1: Go to Railway Dashboard
1. Visit: https://railway.app/
2. Login
3. Click your "Smart Algos" project

### Step 2: View Deployment Logs
1. Click "Deployments" (left sidebar)
2. Click the latest deployment (top one)
3. Scroll through logs

### Step 3: Look for Email Messages

Search for these keywords in logs:

#### ✅ Success Messages:
```
📧 Creating email transporter...
✅ Email transporter created successfully
🔍 Verifying email connection...
✅ Email server connection verified
📧 Sending download email to: user@example.com
✅ Email sent successfully!
Message ID: <abc123@gmail.com>
```

#### ❌ Error Messages:
```
⚠️ Email not configured
❌ Email server connection failed
❌ Failed to send download email
Error: Invalid login
Error: Connection timeout
```

## 🎯 Common Errors & Solutions

### Error: "Email not configured"
**Cause:** Variables not set in Railway
**Solution:**
- Railway Dashboard → Variables
- Add EMAIL_USER and EMAIL_PASSWORD
- Redeploy

### Error: "Invalid login" or "Username and Password not accepted"
**Cause:** Wrong app password or not using app password
**Solution:**
1. Go to Google Account → Security
2. Generate NEW App Password
3. Update EMAIL_PASSWORD in Railway
4. Use password WITHOUT spaces: `bwtfbygvuxwerpts`

### Error: "Connection timeout" or "ETIMEDOUT"
**Cause:** Railway can't connect to Gmail SMTP
**Solution:**
- Gmail might be blocking Railway's IP
- Try using port 465 instead of 587
- Or use a different email service (SendGrid, Mailgun)

### Error: "Less secure app access"
**Cause:** Gmail security settings
**Solution:**
- Use App Password (not regular password)
- Enable 2-Step Verification
- Generate new App Password

## 🧪 Test After Deployment

### Option 1: Make a Test Payment
1. Subscribe to an EA
2. Complete payment
3. Check Railway logs immediately
4. Look for email sending messages

### Option 2: Check Logs in Real-Time
1. Railway Dashboard → Deployments
2. Click latest deployment
3. Logs update in real-time
4. Watch for email messages

## 📧 What to Send Me

If still not working, send me:

1. **Screenshot of Railway Variables**
   - Show EMAIL_USER and EMAIL_PASSWORD exist
   - Hide the actual password value

2. **Railway Logs** (copy/paste):
   - Any lines with "email" or "📧"
   - Any error messages
   - Last 50 lines of logs

3. **Test Details:**
   - Did you make a test payment?
   - Which payment method? (Paystack/Crypto)
   - What happened after payment?

## 🔧 Quick Fixes to Try

### Fix 1: Remove Spaces from Password
Railway Variable should be:
```
EMAIL_PASSWORD=bwtfbygvuxwerpts
```
NOT:
```
EMAIL_PASSWORD=bwtf bygv uxwe rpts
```

### Fix 2: Verify Gmail Settings
1. Google Account → Security
2. 2-Step Verification: ON
3. App Passwords: Generate new one
4. Copy WITHOUT spaces
5. Update Railway variable

### Fix 3: Try Port 465
Add this variable in Railway:
```
EMAIL_PORT=465
```

### Fix 4: Alternative - Use SendGrid (Free)
If Gmail keeps failing:
1. Sign up: https://sendgrid.com/ (Free tier: 100 emails/day)
2. Get API key
3. Update Railway variables:
   ```
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=your_api_key
   EMAIL_FROM=softwarebazaar.ke@gmail.com
   ```

## 📊 Expected Log Flow

### When Payment Succeeds:
```
[Payment Route] Payment verified successfully
[Payment Route] Creating subscription...
[Payment Route] Subscription created: sub-123
[Payment Route] Generating download links...
[Payment Route] Download links generated
[Payment Route] 📧 Sending download email to: user@example.com
[Email Service] 📧 Creating email transporter...
[Email Service] Email User: softwarebazaar.ke@gmail.com
[Email Service] Email Host: smtp.gmail.com
[Email Service] Email Port: 587
[Email Service] ✅ Email transporter created successfully
[Email Service] 🔍 Verifying email connection...
[Email Service] ✅ Email server connection verified
[Email Service] ✅ Email sent successfully!
[Email Service] Message ID: <abc123@gmail.com>
[Payment Route] ✅ Download email sent successfully
```

## 🎯 Next Steps

1. **Check Railway logs NOW**
2. **Look for email-related messages**
3. **Copy any errors**
4. **Send me the logs**
5. **I'll fix it immediately!**

---

**The logs will tell us exactly what's wrong!** 🔍
