# 📧 Simple Admin Email Setup

## ✅ Option 1: Just See Requests in Dashboard (EASIEST - Start Here!)

**Add to Railway:**
```
ADMIN_EMAIL=johnwanyaga37@gmail.com
```

**What you get:**
- ✅ All requests saved to database
- ✅ See them in Admin Dashboard → Custom EA Requests
- ❌ No email notifications

**Time:** 30 seconds

---

## 📧 Option 2: Get Email Notifications (If you want)

### Step 1: Enable 2-Step Verification on Gmail

1. Go to: https://myaccount.google.com/security
2. Find "2-Step Verification"
3. Turn it ON
4. Follow the steps (verify with phone)

### Step 2: Create App Password

1. Still on Google Security page
2. Scroll down to "App passwords"
3. Click "Select app" → choose "Mail"
4. Click "Select device" → choose "Other" → type "Railway"
5. Click "Generate"
6. **Copy the 16-character code** (looks like: `abcd efgh ijkl mnop`)

### Step 3: Add to Railway

Add these TWO variables:

```
ADMIN_EMAIL=johnwanyaga37@gmail.com
GMAIL_USER=johnwanyaga37@gmail.com
GMAIL_PASS=paste_the_16_character_code_here
```

**What you get:**
- ✅ All requests saved to database
- ✅ See them in Admin Dashboard
- ✅ Get email notification for every request!

---

## 🎯 Quick Decision

**Don't want to deal with Gmail passwords?**
→ Use Option 1, just add `ADMIN_EMAIL`

**Want email notifications?**
→ Use Option 2, follow all 3 steps

---

## ⏱️ Time

- **Option 1:** 30 seconds
- **Option 2:** 5 minutes (mostly waiting for Google verification)

Both options work perfectly! Option 1 is simpler to start. 🚀

