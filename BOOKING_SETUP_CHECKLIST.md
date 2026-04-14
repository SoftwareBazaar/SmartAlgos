# 📋 Booking System Setup Checklist

## Quick Start Guide - Get Your Booking System Live in 5 Minutes!

---

## ✅ Step 1: Database Setup (2 minutes)

### Option A: Run Setup Script
```bash
node scripts/setup-bookings-table.js
```

### Option B: Manual SQL
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste the SQL from `database/create_consultation_bookings.sql`
5. Click **Run**

**Verify**: You should see "consultation_bookings table created successfully ✅"

---

## ✅ Step 2: Environment Variables (1 minute)

Add these to your `.env` file:

```env
# Paystack (for $5 consultations)
PAYSTACK_SECRET_KEY=sk_live_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_live_your_public_key_here

# Email Notifications
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
ADMIN_EMAIL=admin@smartalgos.com

# Frontend URL (for payment callbacks)
CLIENT_URL=https://your-domain.com
```

### Get Paystack Keys:
1. Go to [Paystack Dashboard](https://dashboard.paystack.com/)
2. Navigate to **Settings** → **API Keys & Webhooks**
3. Copy your **Public Key** and **Secret Key**

### Gmail App Password:
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to **App Passwords**
4. Generate password for "Mail"
5. Copy the 16-character password

---

## ✅ Step 3: Test the System (2 minutes)

### Test Free Booking:
1. Visit your landing page: `http://localhost:3000` (or your domain)
2. Scroll to "Book a Consultation" section
3. Click **"📅 Book Free Consultation"** button
4. Select a service (e.g., "Algo Development")
5. Choose **"Free Consultation"** (30 min)
6. Pick tomorrow's date and any time
7. Fill in your details:
   - Name: Test User
   - Email: your-email@gmail.com
   - Phone: +254700000000 (optional)
8. Click **"Book Free Session"**
9. Check your email for confirmation ✅

### Test Paid Booking:
1. Repeat steps 1-4 above
2. Choose **"Deep-Dive Consultation"** ($5, 1hr 30min)
3. Pick date and time
4. Fill in details
5. Click **"Pay $5 & Book"**
6. Use Paystack test card:
   - **Card**: `4084084084084081`
   - **CVV**: `408`
   - **Expiry**: Any future date (e.g., 12/25)
   - **PIN**: `0000`
   - **OTP**: `123456`
7. Complete payment
8. Check email for confirmation ✅

---

## ✅ Step 4: Verify Database (30 seconds)

Check if bookings are saved:

1. Go to Supabase Dashboard
2. Navigate to **Table Editor**
3. Select `consultation_bookings` table
4. You should see your test bookings

Or run this SQL:
```sql
SELECT * FROM consultation_bookings ORDER BY created_at DESC LIMIT 5;
```

---

## ✅ Step 5: Deploy to Production (if needed)

### Railway Deployment:
```bash
# Make sure environment variables are set in Railway dashboard
railway up
```

### Vercel Deployment:
```bash
vercel --prod
```

**Important**: Add all environment variables in your hosting dashboard!

---

## 🎯 What You Get

After completing these steps, you'll have:

✅ **Free 30-minute consultations** for first-time clients  
✅ **$5 deep-dive sessions** (1hr 30min) for follow-ups  
✅ **Available every day** from 7 AM to 3 PM  
✅ **5 service categories**: Algo Dev, Stock Trading, Forex, Web Dev, Other  
✅ **Automatic email confirmations** to customers  
✅ **Admin notifications** for new bookings  
✅ **Secure Paystack payments** with automatic verification  
✅ **Beautiful, mobile-responsive UI**  
✅ **Database storage** of all bookings  

---

## 🔍 Quick Verification Checklist

- [ ] Database table created
- [ ] Environment variables set
- [ ] Paystack keys configured
- [ ] Email credentials configured
- [ ] Free booking test successful
- [ ] Paid booking test successful
- [ ] Confirmation emails received
- [ ] Bookings visible in database
- [ ] Mobile responsive (test on phone)
- [ ] Production deployment complete

---

## 🚨 Common Issues & Fixes

### Issue: Emails not sending
**Fix**: 
- Use Gmail App Password (not regular password)
- Enable "Less secure app access" if needed
- Check EMAIL_USER and EMAIL_PASSWORD are correct

### Issue: Paystack payment fails
**Fix**:
- Verify PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY
- Check if using test keys for testing
- Ensure CLIENT_URL is set correctly

### Issue: Bookings not saving
**Fix**:
- Run database setup script again
- Check Supabase connection
- Verify RLS policies are enabled

### Issue: Time slots not showing
**Fix**:
- Check browser console for errors
- Clear browser cache
- Verify date range is correct

---

## 📞 Need Help?

1. **Check the logs**: `npm run dev` and look for errors
2. **Test locally first**: Make sure it works on localhost
3. **Verify environment variables**: Double-check all keys
4. **Check Supabase**: Ensure table exists and RLS is enabled

---

## 🎉 You're Done!

Your consultation booking system is now live and ready to accept bookings!

**Next Steps**:
1. Share the booking link with clients
2. Monitor bookings in Supabase dashboard
3. Respond to booking confirmation emails
4. Set up calendar reminders for consultations

---

**Estimated Setup Time**: 5-10 minutes  
**Difficulty**: Easy ⭐  
**Status**: Production Ready ✅

---

## 📚 Additional Resources

- **Full Guide**: See `BOOKING_SYSTEM_COMPLETE_GUIDE.md`
- **API Documentation**: Check `/api/bookings` endpoints
- **Database Schema**: See `database/create_consultation_bookings.sql`
- **Component Code**: `client/src/components/BookingSection/BookingSection.js`

---

**Happy Booking!** 🚀
