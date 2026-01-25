# 🚀 Quick Start: Fix Email Download Links (7 Minutes)

## The Problem
Users aren't receiving email download links after paying for EAs.

## The Solution
Configure email service with Gmail App Password.

---

## 📝 Step-by-Step (Follow Exactly)

### ⏱️ Step 1: Get Gmail App Password (2 min)

1. Open: https://myaccount.google.com/security
2. Click: **"2-Step Verification"** → Enable it
3. Go back, Click: **"App passwords"**
4. Select: **Mail** → **Other (Custom name)**
5. Type: **"Smart Algos"**
6. Click: **Generate**
7. **COPY THIS PASSWORD** (16 characters like: abcd efgh ijkl mnop)

⚠️ **IMPORTANT:** This is NOT your regular Gmail password!

---

### ⏱️ Step 2: Add to Railway (2 min)

1. Go to: https://railway.app/dashboard
2. Click: Your Smart Algos project
3. Click: Your backend service
4. Click: **"Variables"** tab
5. Click: **"+ New Variable"** (4 times)

**Add these EXACTLY:**

```
Variable 1:
Name: EMAIL_USER
Value: your-email@gmail.com

Variable 2:
Name: EMAIL_PASSWORD
Value: abcd efgh ijkl mnop (your 16-char password from Step 1)

Variable 3:
Name: EMAIL_HOST
Value: smtp.gmail.com

Variable 4:
Name: EMAIL_PORT
Value: 587
```

6. Railway will auto-deploy (or click **"Deploy"**)

---

### ⏱️ Step 3: Deploy Code (1 min)

Open terminal/command prompt in your project folder:

```bash
git add .
git commit -m "Fix: Add email sending for payment downloads"
git push origin main
```

Or double-click: `deploy-email-fix.bat`

---

### ⏱️ Step 4: Wait for Deployment (1 min)

1. Go to Railway dashboard
2. Click: **"Deployments"** tab
3. Wait for: **"Success"** status (usually 1-2 minutes)

---

### ⏱️ Step 5: Verify It Works (1 min)

1. Click: **"View Logs"** in Railway
2. Look for: `✅ Email transporter created successfully`
3. If you see it: **SUCCESS!** ✅

---

### ⏱️ Step 6: Test with Real Payment (Optional)

1. Make a small test payment
2. Check Railway logs for:
   ```
   📧 [Paystack] Email Configuration Check
   ✅ [Paystack] Email sent successfully!
   ```
3. Check your email inbox (and spam folder)
4. You should receive email with download links!

---

## ✅ Success Checklist

- [ ] Gmail 2-Step Verification enabled
- [ ] App Password generated (16 characters)
- [ ] All 4 variables added to Railway
- [ ] Code pushed to repository
- [ ] Railway deployment successful
- [ ] Logs show "Email transporter created"
- [ ] Test email received

---

## 🐛 Troubleshooting

### "EMAIL NOT CONFIGURED" in logs
**Fix:** Add EMAIL_USER and EMAIL_PASSWORD to Railway (Step 2)

### "Invalid login: 535-5.7.8"
**Fix:** Use App Password from Step 1, NOT your regular Gmail password

### Email not received
**Fix:** Check spam folder, verify EMAIL_USER is correct

### Variables not loading
**Fix:** Click "Deploy" button in Railway manually

---

## 📧 What Users Will Receive

After payment, users get an email with:
- ✅ Payment confirmation
- ✅ EA name and subscription details
- ✅ Download links (ZIP + individual files)
- ✅ Installation instructions
- ✅ Support contact

---

## 🎯 That's It!

Total time: **~7 minutes**

Your users will now receive email download links automatically after every payment! 🎉

---

## 📞 Need Help?

1. Check Railway logs first
2. Review `PAYMENT_EMAIL_FIX_SUMMARY.md` for details
3. Review `RAILWAY_EMAIL_SETUP.md` for Railway-specific help
4. Make sure you're using App Password, not regular password

---

**Last Updated:** January 25, 2026
