# 📧 Admin Email Setup Guide

## Quick Setup

To receive Custom EA request notifications, you need to configure email in Railway.

### Step 1: Add Email Variables to Railway

Go to **Railway Dashboard** → Your Project → **Variables** tab and add:

```env
ADMIN_EMAIL=johnwanyaga37@gmail.com
```

### Step 2: Configure Gmail SMTP (Optional but Recommended)

If you want actual email delivery, also add:

```env
GMAIL_USER=johnwanyaga37@gmail.com
GMAIL_PASS=your_app_password_here
```

**Important**: You need to use a **Gmail App Password**, not your regular Gmail password.

#### How to Get Gmail App Password:

1. Go to your Google Account: https://myaccount.google.com/
2. Click **Security** on the left
3. Enable **2-Step Verification** (if not enabled)
4. Scroll down to **App Passwords**
5. Select **Mail** and your device
6. Click **Generate**
7. Copy the 16-character password
8. Paste it as `GMAIL_PASS` in Railway

### Step 3: Make Your Account Admin

Make sure `johnwanyaga37@gmail.com` has admin role in the database:

1. Register/login with that email on your site
2. Or set it directly in Supabase

### Step 4: How It Works

Once configured:
- ✅ Clients submit Custom EA requests
- ✅ Admin receives email notification at `johnwanyaga37@gmail.com`
- ✅ Requests appear in Admin Dashboard under "Custom EA Requests"

### Step 5: Test It

Submit a test request from the Custom EA form, then check:
- Your email inbox (`johnwanyaga37@gmail.com`)
- Admin Dashboard → Custom EA Requests tab

---

## Without Email Configuration

If you don't configure email:
- ⚠️ Emails won't be sent
- ✅ Requests will still be saved to the database
- ✅ You can still see them in Admin Dashboard
- ✅ Email notifications will be logged to console (for debugging)

---

## Summary

**Minimum Required:**
```
ADMIN_EMAIL=johnwanyaga37@gmail.com
```

**Full Email Setup:**
```
ADMIN_EMAIL=johnwanyaga37@gmail.com
GMAIL_USER=johnwanyaga37@gmail.com
GMAIL_PASS=xxxx_xxxx_xxxx_xxxx
```

After adding variables, Railway auto-redeploys in 2-3 minutes!

