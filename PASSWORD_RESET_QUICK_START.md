# 🚀 Password Reset - Quick Start

## ✅ What's Fixed

Your password reset system is now fully functional! Here's what you need to do:

## 📋 3-Step Setup (15 minutes)

### Step 1: Deploy Code (5 min)
```bash
deploy-password-reset-fix.bat
```
Wait for Railway to finish deploying (2-3 minutes)

### Step 2: Configure Supabase Email (5 min)

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Email Templates**
4. Click **"Reset Password"** template
5. Replace the content with:

```html
<h2>Reset Your Password</h2>
<p>Hi there,</p>
<p>Someone requested a password reset for your Smart Algos Trading account.</p>
<p>Click the button below to reset your password:</p>
<p><a href="{{ .SiteURL }}/auth/reset-password?access_token={{ .Token }}&type=recovery" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>
<p>Or copy this link: {{ .SiteURL }}/auth/reset-password?access_token={{ .Token }}&type=recovery</p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>This link expires in 1 hour.</p>
<p>Best regards,<br>Smart Algos Team</p>
```

6. Click **Save**

### Step 3: Configure URLs (5 min)

1. Still in Supabase Dashboard
2. Go to **Authentication** → **URL Configuration**
3. Set **Site URL**: `https://smartalgosts.com`
4. Under **Redirect URLs**, add:
   - `https://smartalgosts.com/auth/reset-password`
   - `https://smartalgosts.com/*` (wildcard for all pages)
5. Click **Save**

## 🧪 Test It

### Option A: Test on Your Site
1. Go to: https://smartalgosts.com/auth/forgot-password
2. Enter your email
3. Check your inbox (and spam folder!)
4. Click the reset link
5. Enter new password
6. Login with new password

### Option B: Test with Script
```bash
node test-password-reset.js your-email@example.com
```

## 🎨 What Users Will See

### Forgot Password Page
- Clean, modern design
- Email input field
- "Send Reset Instructions" button
- Success message after submission

### Reset Password Page
- Password input with show/hide toggle
- Confirm password field
- Real-time validation
- Password requirements shown
- Success message with auto-redirect

### Email
- Professional branded email
- Clear "Reset Password" button
- Link expires in 1 hour
- Security notice

## 🔐 Password Requirements

Users must create passwords with:
- ✅ At least 8 characters
- ✅ One uppercase letter
- ✅ One lowercase letter  
- ✅ One number
- ✅ One special character (@$!%*?&)

Example: `MyPass123!`

## ❓ Common Issues

### "Email not received"
- Check spam/junk folder
- Wait 2-3 minutes (email can be delayed)
- Verify email address is correct
- Check Supabase auth logs

### "Invalid reset link"
- Link expires after 1 hour - request new one
- Link can only be used once
- Make sure you clicked the full link from email

### "Password reset failed"
- Check password meets all requirements
- Try a different password
- Check Railway logs for errors

## 📞 Need Help?

1. Check `PASSWORD_RESET_SETUP_GUIDE.md` for detailed instructions
2. Check Railway logs: Railway Dashboard → Deployments → View Logs
3. Check Supabase logs: Supabase Dashboard → Logs → Auth Logs

## ✅ Checklist

Before marking as complete:

- [ ] Code deployed to Railway
- [ ] Supabase email template updated
- [ ] Site URL configured in Supabase
- [ ] Redirect URLs added in Supabase
- [ ] Tested forgot password flow
- [ ] Received reset email
- [ ] Successfully reset password
- [ ] Logged in with new password

---

**Time Required:** 15 minutes total

**Status:** Ready to deploy and configure

**Next:** Run `deploy-password-reset-fix.bat`
