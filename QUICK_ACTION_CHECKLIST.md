# ⚡ Quick Action Checklist

## 🎯 Do These 3 Things Now (25 minutes total)

### ✅ Step 1: Configure Password Reset (10 min)

**Go to:** https://supabase.com/dashboard

1. Select your project
2. **Authentication** → **Email Templates** → **Reset Password**
3. Paste this template:
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
4. Click **Save**
5. Go to **Authentication** → **URL Configuration**
6. Set **Site URL**: `https://smartalgosts.com`
7. Add **Redirect URLs**:
   - `https://smartalgosts.com/auth/reset-password`
   - `https://smartalgosts.com/*`
8. Click **Save**

**Test it:** https://smartalgosts.com/auth/forgot-password

---

### ✅ Step 2: Update EA Prices (5 min)

**Go to:** https://supabase.com/dashboard

1. Select your project
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the entire content from: `update-eas-final.sql`
5. Click **Run** (or press Ctrl+Enter)
6. Should see: "Success. No rows returned"

**Verify:** Go to https://smartalgosts.com/ea-marketplace
- Check prices show: Weekly $19, Monthly $55, Yearly $399

---

### ✅ Step 3: Activate Paystack Live (10 min)

**Get Live Keys:**
1. Go to: https://dashboard.paystack.com/#/settings/developers
2. Copy **Live Secret Key** (starts with `sk_live_`)
3. Copy **Live Public Key** (starts with `pk_live_`)

**Update Railway:**
1. Go to: https://railway.app
2. Select your project
3. Click **Variables** tab
4. Update these:
   - `PAYSTACK_SECRET_KEY` = your live secret key
   - `PAYSTACK_PUBLIC_KEY` = your live public key
   - `PAYMENT_MODE` = `live`
5. Click **Deploy** (or wait for auto-deploy)

**Test it:** Make a small test payment on your site

---

## 🧪 Quick Tests

### Test Password Reset:
```bash
node test-password-reset.js your-email@example.com
```
Then check your email and click the link.

### Test Platform:
```bash
node test-platform-health.js
```

### Check Railway Deployment:
Go to: https://railway.app → Your Project → Deployments
- Should show: "Active" with green checkmark

---

## ✅ Completion Checklist

Mark these off as you complete them:

- [ ] Supabase email template updated
- [ ] Site URL configured in Supabase
- [ ] Redirect URLs added in Supabase
- [ ] Tested password reset (received email)
- [ ] Successfully reset password
- [ ] Logged in with new password
- [ ] EA prices updated in Supabase
- [ ] Prices visible on website
- [ ] Paystack live keys added to Railway
- [ ] PAYMENT_MODE set to "live"
- [ ] Railway redeployed
- [ ] Tested live payment (small amount)
- [ ] Payment successful in Paystack dashboard

---

## 🆘 Quick Troubleshooting

### Password reset email not received?
- Check spam folder
- Wait 2-3 minutes
- Verify email template saved in Supabase
- Check Supabase → Logs → Auth Logs

### Prices not showing?
- Clear browser cache (Ctrl + Shift + R)
- Check SQL ran successfully (no errors)
- Verify in Supabase → Table Editor → expert_advisors

### Payment fails?
- Verify keys start with `sk_live_` and `pk_live_`
- Check PAYMENT_MODE is exactly "live" (lowercase)
- Wait for Railway to finish deploying
- Check Railway logs for errors

---

## 📞 Need More Help?

**Detailed Guides:**
- Password Reset: `PASSWORD_RESET_QUICK_START.md`
- EA Pricing: `update-eas-final.sql`
- Paystack: `ACTIVATE_LIVE_PAYMENTS_GUIDE.md`
- Full Summary: `TODAYS_WORK_SUMMARY.md`

**Test Scripts:**
- `test-password-reset.js` - Test password reset
- `test-platform-health.js` - Check platform status
- `test-email.js` - Test email system

---

**Time Required:** 25 minutes
**Difficulty:** Easy (just copy/paste and click)
**Result:** Fully functional password reset, updated prices, live payments

🚀 **Let's go!**
