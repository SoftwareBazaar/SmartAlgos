# 🚀 Deploy Booking System to Railway

## ✅ Pre-Deployment Checklist

Your Railway environment variables are already set! ✓

**Admin Email Confirmed**: softwarebazaar.ke@gmail.com

---

## 📋 Step 1: Setup Database in Supabase (2 minutes)

Before deploying, we need to create the database table.

### Go to Supabase SQL Editor:

1. Visit: **https://supabase.com/dashboard**
2. Login and select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**
5. Copy and paste this SQL:

```sql
-- ============================================================
-- Consultation Bookings Table
-- Smart Algos Trading Platform
-- ============================================================

CREATE TABLE IF NOT EXISTS consultation_bookings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference            TEXT UNIQUE NOT NULL,
  service              TEXT NOT NULL,
  consultation_type    TEXT NOT NULL,
  date                 DATE NOT NULL,
  time                 TEXT NOT NULL,
  name                 TEXT NOT NULL,
  email                TEXT NOT NULL,
  phone                TEXT,
  notes                TEXT,
  amount               NUMERIC(10,2) DEFAULT 0,
  currency             TEXT DEFAULT 'USD',
  status               TEXT DEFAULT 'pending',
  payment_status       TEXT DEFAULT 'free',
  paystack_payment_id  TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_email      ON consultation_bookings(email);
CREATE INDEX IF NOT EXISTS idx_bookings_date       ON consultation_bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status     ON consultation_bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference  ON consultation_bookings(reference);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_booking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_booking_timestamp ON consultation_bookings;
CREATE TRIGGER trg_update_booking_timestamp
  BEFORE UPDATE ON consultation_bookings
  FOR EACH ROW EXECUTE FUNCTION update_booking_updated_at();

-- Row Level Security: admins see all, public can insert
ALTER TABLE consultation_bookings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert a booking (public landing page)
DROP POLICY IF EXISTS "allow_public_insert_booking" ON consultation_bookings;
CREATE POLICY "allow_public_insert_booking"
  ON consultation_bookings FOR INSERT
  WITH CHECK (true);

-- Allow service role (backend) full access
DROP POLICY IF EXISTS "allow_service_role_all" ON consultation_bookings;
CREATE POLICY "allow_service_role_all"
  ON consultation_bookings FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify table was created
SELECT 'consultation_bookings table created successfully ✅' AS result;
```

6. Click **"Run"** (or press Ctrl+Enter)
7. You should see: ✅ "consultation_bookings table created successfully"

---

## 📋 Step 2: Verify Railway Variables

Make sure these are set in Railway (you already have them):

✅ `ADMIN_EMAIL` = softwarebazaar.ke@gmail.com  
✅ `EMAIL_USER` = (your Gmail)  
✅ `EMAIL_PASSWORD` = (Gmail app password)  
✅ `EMAIL_HOST` = smtp.gmail.com  
✅ `EMAIL_PORT` = 587  
✅ `PAYSTACK_SECRET_KEY` = (your key)  
✅ `PAYSTACK_PUBLIC_KEY` = (your key)  
✅ `CLIENT_URL` = (your Railway frontend URL)  
✅ `SUPABASE_URL` = (your Supabase URL)  
✅ `SUPABASE_SERVICE_ROLE_KEY` = (your key)  

---

## 📋 Step 3: Deploy to Railway

### Option A: Using PowerShell Script (Recommended)

Run this script:

```powershell
.\deploy-booking-system.ps1
```

### Option B: Manual Git Commands

```powershell
# Add all changes
git add .

# Commit with message
git commit -m "Add consultation booking system - Free 30min & $5 deep-dive sessions"

# Push to trigger Railway deployment
git push origin main
```

**Note**: Replace `main` with your branch name if different (could be `master`)

---

## 📋 Step 4: Monitor Deployment

1. Go to Railway Dashboard: https://railway.app/dashboard
2. Select your project
3. Click on "Deployments" tab
4. Watch the build logs
5. Wait for "✓ Deployed" status (usually 2-3 minutes)

---

## 📋 Step 5: Test on Production

Once deployed, test your booking system:

### Test Free Booking:

1. Visit your Railway URL (e.g., `https://your-app.up.railway.app`)
2. Scroll to "Book a Consultation" section
3. Click "📅 Book Free Consultation"
4. Select a service (e.g., "Algo Development")
5. Choose "Free Consultation" (30 min)
6. Pick tomorrow's date and time
7. Fill in your details:
   - Name: Test User
   - Email: softwarebazaar.ke@gmail.com
   - Phone: +254700000000
8. Click "Book Free Session"
9. Check your email (softwarebazaar.ke@gmail.com) ✅

### Test Paid Booking:

1. Repeat steps 1-3 above
2. Choose "Deep-Dive Consultation" ($5, 1hr 30min)
3. Fill in details and submit
4. Use Paystack test card:
   - Card: `4084084084084081`
   - CVV: `408`
   - Expiry: `12/25`
   - PIN: `0000`
   - OTP: `123456`
5. Complete payment
6. Check your email ✅

---

## 📋 Step 6: Verify Database

Check if bookings are saved:

1. Go to Supabase Dashboard
2. Click "Table Editor"
3. Select `consultation_bookings` table
4. You should see your test bookings

Or run this SQL:

```sql
SELECT 
  reference,
  name,
  email,
  service,
  consultation_type,
  date,
  time,
  status,
  payment_status,
  created_at
FROM consultation_bookings
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🎯 What You'll Have After Deployment

✅ **Free 30-minute consultations** for first-time clients  
✅ **$5 deep-dive sessions** (1hr 30min) for follow-ups  
✅ **Available every day** from 7 AM to 3 PM  
✅ **5 service categories**: Algo Dev, Stock Trading, Forex, Web Dev, Other  
✅ **Automatic email confirmations** to customers  
✅ **Admin notifications** to softwarebazaar.ke@gmail.com  
✅ **Secure Paystack payments**  
✅ **Beautiful, mobile-responsive UI**  
✅ **Database storage** of all bookings  

---

## 🚨 Troubleshooting

### Issue: Deployment fails

**Check Railway logs:**
1. Go to Railway Dashboard
2. Click on your service
3. Check "Deployments" → "View Logs"
4. Look for error messages

**Common fixes:**
- Make sure all environment variables are set
- Check if build completed successfully
- Verify package.json scripts are correct

### Issue: Emails not sending

**Fix:**
1. Verify `EMAIL_USER` and `EMAIL_PASSWORD` in Railway
2. Make sure you're using Gmail App Password
3. Check Railway logs for email errors

### Issue: Paystack payment fails

**Fix:**
1. Verify `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY`
2. Make sure `CLIENT_URL` is set to your Railway URL
3. Check if using correct keys (test vs live)

### Issue: Bookings not saving

**Fix:**
1. Verify database table was created in Supabase
2. Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. Check Railway logs for database errors

---

## 📊 Monitoring Your Bookings

### View in Supabase Dashboard:

1. Go to Supabase Dashboard
2. Table Editor → `consultation_bookings`
3. Filter by date, status, etc.

### Check Recent Bookings:

```sql
SELECT * FROM consultation_bookings 
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Check Today's Bookings:

```sql
SELECT * FROM consultation_bookings 
WHERE date = CURRENT_DATE
ORDER BY time;
```

### Check Pending Payments:

```sql
SELECT * FROM consultation_bookings 
WHERE payment_status = 'pending';
```

---

## 📧 Email Notifications

After each booking, two emails are sent:

### Customer Email (to the person who booked):
- Booking confirmation
- Service details
- Date and time
- Reference number
- Payment status

### Admin Email (to softwarebazaar.ke@gmail.com):
- New booking alert
- Customer details
- Service requested
- Session type
- Payment status

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Railway deployment successful
- [ ] Database table created in Supabase
- [ ] Landing page loads correctly
- [ ] Booking section visible
- [ ] Free booking test successful
- [ ] Confirmation email received (customer)
- [ ] Admin notification received (softwarebazaar.ke@gmail.com)
- [ ] Paid booking test successful (with test card)
- [ ] Payment confirmation email received
- [ ] Bookings visible in Supabase table
- [ ] Mobile view works correctly

---

## 📱 Share Your Booking Link

Once everything works, share this with clients:

**Direct Booking Link:**
```
https://your-railway-url.up.railway.app/#book-consultation
```

Or tell them to:
1. Visit your website
2. Scroll to "Book a Consultation" section
3. Click "📅 Book Free Consultation"

---

## 🔄 Future Updates

To update the booking system:

1. Make changes to your code
2. Commit: `git commit -m "Update booking system"`
3. Push: `git push origin main`
4. Railway will automatically redeploy

---

## 📞 Support

If you encounter issues:

1. **Check Railway logs** for errors
2. **Check Supabase logs** for database issues
3. **Test locally first** with `npm run dev`
4. **Verify environment variables** in Railway
5. **Check email** (softwarebazaar.ke@gmail.com) for notifications

---

## 🎯 Next Steps After Deployment

1. **Test thoroughly** on production
2. **Share booking link** with potential clients
3. **Monitor bookings** in Supabase dashboard
4. **Respond to booking emails** promptly
5. **Set calendar reminders** for consultations
6. **Track conversion rates** (free vs paid)

---

**Deployment Time**: 5-10 minutes  
**Status**: Ready to Deploy ✅  
**Admin Email**: softwarebazaar.ke@gmail.com  

---

**Let's deploy!** 🚀
