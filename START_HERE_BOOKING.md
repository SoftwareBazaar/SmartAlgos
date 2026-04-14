# 🚀 START HERE - Booking System Setup

## Your booking system is already built! Just follow these 3 simple steps:

---

## Step 1: Setup Database (2 minutes) ⚡

### Go to Supabase and run this SQL:

1. Visit: **https://supabase.com/dashboard**
2. Login and select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**
5. Copy the SQL from: `database/create_consultation_bookings.sql`
6. Paste it and click **"Run"**
7. You should see: ✅ "consultation_bookings table created successfully"

**That's it for the database!**

---

## Step 2: Add Your Keys (1 minute) 🔑

### Edit your `.env` file and add these:

```env
# Get from https://dashboard.paystack.com/settings/developer
PAYSTACK_SECRET_KEY=sk_live_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_public_key

# Your Gmail for sending emails
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
ADMIN_EMAIL=admin@smartalgos.com

# Your website URL
CLIENT_URL=http://localhost:3000
```

### Where to get these:

**Paystack Keys:**
- Go to: https://dashboard.paystack.com/settings/developer
- Copy your Public Key and Secret Key

**Gmail App Password:**
- Go to: https://myaccount.google.com/apppasswords
- Generate a new app password
- Copy the 16-character password

---

## Step 3: Test It! (2 minutes) 🎉

### Start your server:

```powershell
npm run dev
```

Or double-click: `client\RUN_DEV_MODE.bat`

### Test the booking:

1. Open: **http://localhost:3000**
2. Scroll to **"Book a Consultation"** section
3. Click **"📅 Book Free Consultation"**
4. Fill in the form and submit
5. Check your email ✅

---

## ✅ Quick Verification

Run this to check your setup:

```powershell
.\check-booking-setup.bat
```

Or:

```powershell
.\check-booking-setup.ps1
```

---

## 🎯 What You Get

After setup, you'll have:

✅ **Free 30-min consultations** (first session)  
✅ **$5 deep-dive sessions** (1hr 30min follow-ups)  
✅ **Available every day** (7 AM - 3 PM)  
✅ **5 service categories**  
✅ **Paystack payments**  
✅ **Email notifications**  
✅ **Mobile responsive**  

---

## 🚨 Having Issues?

### Issue: Can't find .env file
**Fix**: Create it by copying `env.example`:
```powershell
copy env.example .env
```

### Issue: npm command not found
**Fix**: Install Node.js from https://nodejs.org/

### Issue: Emails not sending
**Fix**: Use Gmail App Password, not your regular password

### Issue: Payment not working
**Fix**: Make sure Paystack keys are correct

---

## 📚 Need More Help?

Check these detailed guides:

1. **BOOKING_SETUP_MANUAL.md** - Step-by-step manual setup
2. **BOOKING_SYSTEM_COMPLETE_GUIDE.md** - Full documentation
3. **BOOKING_QUICK_REFERENCE.md** - Quick reference card

---

## 🎉 That's It!

Your booking system is ready in just 3 steps!

**Total Time**: 5 minutes  
**Difficulty**: Easy ⭐  

---

**Questions?** Check the guides above or test locally first!

**Ready?** Let's go! 🚀
