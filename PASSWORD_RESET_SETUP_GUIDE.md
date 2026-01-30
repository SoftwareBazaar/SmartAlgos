# Password Reset System - Setup Guide

## ✅ What Was Fixed

The password reset system has been completely rebuilt to work properly with Supabase authentication.

### Backend Changes (`routes/auth.js`)
1. **Forgot Password Endpoint** - Now properly sends reset emails via Supabase
2. **Reset Password Endpoint** - Uses Supabase's `updateUser` with access token
3. **Proper redirect URLs** - Configured for both development and production

### Frontend Changes
1. **ResetPassword.js** - Redesigned with modern UI matching your brand
2. **ForgotPassword.js** - Already had good UI, now works correctly
3. **AuthContext.js** - Updated to use `accessToken` instead of `token`

## 🔧 Supabase Configuration Required

### Step 1: Configure Email Templates in Supabase

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Email Templates**
4. Find **"Reset Password"** template
5. Update the template:

```html
<h2>Reset Your Password</h2>
<p>Hi there,</p>
<p>Someone requested a password reset for your Smart Algos Trading account.</p>
<p>Click the button below to reset your password:</p>
<p><a href="{{ .SiteURL }}/auth/reset-password?access_token={{ .Token }}&type=recovery">Reset Password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>This link expires in 1 hour.</p>
<p>Best regards,<br>Smart Algos Team</p>
```

### Step 2: Configure Site URL

1. In Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL** to:
   - Production: `https://smartalgosts.com`
   - Development: `http://localhost:3000`

3. Add **Redirect URLs**:
   - `https://smartalgosts.com/auth/reset-password`
   - `http://localhost:3000/auth/reset-password` (for testing)

### Step 3: Configure Email Settings

1. Go to **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. If using custom SMTP (recommended for production):
   - Enable custom SMTP
   - Add your email provider details (Gmail, SendGrid, etc.)
4. If using Supabase's default email (for testing):
   - No configuration needed
   - Limited to 3 emails per hour

## 🧪 How to Test

### Test Forgot Password Flow

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Go to Forgot Password page:**
   ```
   http://localhost:3000/auth/forgot-password
   ```

3. **Enter your email and submit**

4. **Check your email inbox** for the reset link

5. **Click the reset link** - Should redirect to:
   ```
   http://localhost:3000/auth/reset-password?access_token=...&type=recovery
   ```

6. **Enter new password** and submit

7. **Login with new password** to verify it worked

### Test on Production

1. **Deploy the changes to Railway:**
   ```bash
   git add -A
   git commit -m "Fix password reset system"
   git push origin master
   ```

2. **Wait for Railway deployment** (2-3 minutes)

3. **Test on live site:**
   ```
   https://smartalgosts.com/auth/forgot-password
   ```

## 🔍 Troubleshooting

### Email Not Received

**Check Spam Folder:**
- Supabase emails often go to spam
- Mark as "Not Spam" to receive future emails

**Check Supabase Logs:**
1. Go to Supabase Dashboard → **Logs** → **Auth Logs**
2. Look for password reset events
3. Check for any errors

**Verify Email Configuration:**
1. Supabase Dashboard → **Project Settings** → **Auth**
2. Check SMTP settings are correct
3. Test email delivery

### Invalid Reset Link Error

**Possible Causes:**
1. Link expired (1 hour timeout)
2. Link already used
3. Wrong redirect URL in Supabase settings

**Solution:**
- Request a new reset link
- Verify redirect URLs in Supabase match exactly

### Password Reset Fails

**Check Railway Logs:**
```bash
# In Railway Dashboard → Deployments → View Logs
# Look for errors like:
# "Password reset error: ..."
```

**Common Issues:**
- Access token expired
- Password doesn't meet requirements
- Supabase connection issue

## 📋 Password Requirements

Users must create passwords with:
- ✅ At least 8 characters
- ✅ One uppercase letter (A-Z)
- ✅ One lowercase letter (a-z)
- ✅ One number (0-9)
- ✅ One special character (@$!%*?&)

Examples of valid passwords:
- `MyPass123!`
- `Trading@2025`
- `Secure$Pass99`

## 🎨 UI Features

The new password reset page includes:
- Modern glassmorphism design
- Dark mode support
- Password visibility toggle
- Real-time validation
- Success/error states
- Mobile responsive
- SSL security badge
- Auto-redirect after success

## 🔐 Security Features

1. **No Email Enumeration** - Doesn't reveal if email exists
2. **Token Expiration** - Links expire after 1 hour
3. **One-Time Use** - Tokens can only be used once
4. **Strong Password Requirements** - Enforced on both frontend and backend
5. **Rate Limiting** - Prevents abuse (can be added if needed)

## 📝 API Endpoints

### POST `/api/auth/forgot-password`
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

### POST `/api/auth/reset-password`
**Request:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "password": "NewPass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

## ✅ Deployment Checklist

Before going live:

- [ ] Supabase email template configured
- [ ] Site URL set in Supabase
- [ ] Redirect URLs added in Supabase
- [ ] SMTP configured (for production)
- [ ] Code deployed to Railway
- [ ] Tested forgot password flow
- [ ] Tested reset password flow
- [ ] Tested with real email address
- [ ] Verified email delivery
- [ ] Tested on mobile devices

## 🚀 Next Steps

1. **Configure Supabase email templates** (Step 1 above)
2. **Deploy to Railway** (push to GitHub)
3. **Test the complete flow** (forgot → email → reset → login)
4. **Monitor for any issues** (check Railway logs)

---

**Status:** ✅ Code is ready - Just needs Supabase configuration

**Time to Complete:** 10-15 minutes for Supabase setup

**Need Help?** Check Railway logs or Supabase auth logs for errors
