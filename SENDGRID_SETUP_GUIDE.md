# SendGrid Setup for Booking Emails

## Why SendGrid?

Gmail SMTP is timing out (Railway network blocks it). SendGrid is:
- ✅ More reliable for transactional emails
- ✅ Free tier: 100 emails/day (perfect for bookings)
- ✅ Works on Railway without issues
- ✅ Better deliverability rates

---

## Setup Steps (5 minutes)

### Step 1: Create SendGrid Account

1. Go to: https://sendgrid.com/
2. Click "Start for Free"
3. Sign up with your email
4. Verify your email address
5. Complete the onboarding (skip the sender verification for now)

### Step 2: Create API Key

1. In SendGrid dashboard, go to **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Name: `Smart Algos Bookings`
4. Permission Level: **Full Access** (or at least "Mail Send")
5. Click **"Create & View"**
6. **COPY THE API KEY** (starts with `SG.` - you won't see it again!)

Example: `SG.abc123xyz789...`

### Step 3: Add to Railway

1. Go to Railway dashboard
2. Select your project
3. Go to **Variables** tab
4. Click **"New Variable"**
5. Add:
   - **Name**: `SENDGRID_API_KEY`
   - **Value**: Paste your API key (the `SG.xxx` string)
6. Click **"Add"**

### Step 4: Deploy

Railway will automatically redeploy with the new environment variable.

Wait 2-3 minutes for deployment to complete.

---

## Verify Setup

### Check Railway Logs

After deployment, look for:

```
📧 [Bookings] SendGrid configured
✅ Bookings routes loaded and registered
```

If you see:
```
⚠️  [Bookings] SendGrid API key not found - emails will not be sent
```

Then the `SENDGRID_API_KEY` variable wasn't added correctly.

### Test a Booking

1. Go to: https://smartalgosts.com/#book-consultation
2. Make a test booking with YOUR email
3. Check Railway logs for:
   ```
   [Bookings] ✅ Confirmation email sent to your@email.com via SendGrid
   [Bookings] ✅ Admin notification sent via SendGrid
   ```

### Check Your Email

Look for email from: `Smart Algos <softwarebazaar.ke@gmail.com>`

Subject: `✅ Booking Confirmed – [Service] on [Date]`

---

## Troubleshooting

### "SendGrid API key not found"

**Problem**: Environment variable not set correctly

**Solution**:
1. Check Railway Variables tab
2. Make sure variable name is exactly: `SENDGRID_API_KEY`
3. Make sure value starts with `SG.`
4. Redeploy if needed

### "Unauthorized" Error

**Problem**: API key is invalid or expired

**Solution**:
1. Go back to SendGrid → Settings → API Keys
2. Delete the old key
3. Create a new one
4. Update Railway variable
5. Redeploy

### Emails Still Not Sending

**Problem**: SendGrid account not verified

**Solution**:
1. Check your SendGrid email for verification link
2. Complete sender verification
3. In SendGrid, go to Settings → Sender Authentication
4. Verify your domain or single sender email

### Emails Going to Spam

**Problem**: SendGrid needs sender verification

**Solution**:
1. In SendGrid: Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Use: softwarebazaar.ke@gmail.com
4. Check your Gmail for verification email
5. Click the verification link

---

## SendGrid Free Tier Limits

- **100 emails/day** (plenty for booking confirmations)
- **2,000 contacts**
- **Email API access**
- **Email activity for 30 days**

If you need more, upgrade to:
- **Essentials**: $19.95/month (50,000 emails)
- **Pro**: $89.95/month (1.5M emails)

---

## What Changed in Code

**Before** (Gmail SMTP):
```javascript
const nodemailer = require('nodemailer');
// ... manual SMTP configuration
```

**After** (SendGrid):
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// ... simple API calls
```

---

## Current Status

✅ Code updated to use SendGrid  
✅ Package.json includes @sendgrid/mail  
⏳ Waiting for you to:
  1. Create SendGrid account
  2. Get API key
  3. Add to Railway
  4. Test booking

---

## Quick Links

- **SendGrid Signup**: https://sendgrid.com/
- **SendGrid Dashboard**: https://app.sendgrid.com/
- **API Keys**: https://app.sendgrid.com/settings/api_keys
- **Sender Authentication**: https://app.sendgrid.com/settings/sender_auth

---

## After Setup

Once SendGrid is configured:
1. Test a booking
2. Check your email
3. Verify admin notification arrives
4. Booking system is complete! 🎉

The booking system works perfectly without emails (bookings are saved to database), but emails make it much better for customer experience.
