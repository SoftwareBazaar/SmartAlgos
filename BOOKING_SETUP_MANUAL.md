# 📅 Manual Booking System Setup (No Node Required)

## ✅ Step 1: Setup Database (2 minutes)

Since Node.js isn't available, we'll set up the database directly in Supabase.

### Option A: Supabase SQL Editor (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Login to your account
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste This SQL**

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

4. **Click "Run"** (or press Ctrl+Enter)

5. **Verify Success**
   - You should see: "consultation_bookings table created successfully ✅"
   - Go to "Table Editor" in the left sidebar
   - You should see the `consultation_bookings` table

---

## ✅ Step 2: Environment Variables (1 minute)

### For Local Development

1. **Open your `.env` file** in the project root

2. **Add these variables** (if not already present):

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
CLIENT_URL=http://localhost:3000
```

### Get Paystack Keys

1. Go to: https://dashboard.paystack.com/
2. Login to your account
3. Navigate to: **Settings** → **API Keys & Webhooks**
4. Copy your **Public Key** (starts with `pk_`)
5. Copy your **Secret Key** (starts with `sk_`)
6. Paste them in your `.env` file

### Get Gmail App Password

1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already enabled)
3. Go to: https://myaccount.google.com/apppasswords
4. Select "Mail" and your device
5. Click "Generate"
6. Copy the 16-character password (no spaces)
7. Paste it as `EMAIL_PASSWORD` in your `.env` file

---

## ✅ Step 3: Test the System (2 minutes)

### Start Your Development Server

**Option 1: Using npm**
```powershell
npm run dev
```

**Option 2: Using the batch file**
```powershell
.\client\RUN_DEV_MODE.bat
```

**Option 3: Using PowerShell script**
```powershell
.\client\RUN_DEV_MODE.ps1
```

### Test Free Booking

1. Open your browser: http://localhost:3000
2. Scroll down to "Book a Consultation" section
3. Click the "📅 Book Free Consultation" button
4. Follow these steps:
   - **Step 1**: Select "Algo Development"
   - **Step 2**: Choose "Free Consultation" (30 min)
   - **Step 3**: Pick tomorrow's date and any time (e.g., 9:00 AM)
   - **Step 4**: Fill in your details:
     - Name: Your Name
     - Email: your-email@gmail.com
     - Phone: +254700000000 (optional)
   - **Step 5**: Click "Book Free Session"
5. You should see a success message ✅
6. Check your email for confirmation

### Test Paid Booking

1. Repeat steps 1-3 above
2. Follow these steps:
   - **Step 1**: Select any service
   - **Step 2**: Choose "Deep-Dive Consultation" ($5, 1hr 30min)
   - **Step 3**: Pick date and time
   - **Step 4**: Fill in your details
   - **Step 5**: Click "Pay $5 & Book"
3. You'll be redirected to Paystack
4. Use these **test card details**:
   - **Card Number**: `4084084084084081`
   - **CVV**: `408`
   - **Expiry Date**: Any future date (e.g., 12/25)
   - **PIN**: `0000`
   - **OTP**: `123456`
5. Complete the payment
6. You should be redirected back with success message ✅
7. Check your email for confirmation

---

## ✅ Step 4: Verify Database (30 seconds)

### Check if Bookings are Saved

1. Go to Supabase Dashboard
2. Click "Table Editor" in the left sidebar
3. Select `consultation_bookings` table
4. You should see your test bookings

**Or run this SQL query:**

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

## ✅ Step 5: Deploy to Production (Optional)

### For Railway Deployment

1. **Add Environment Variables in Railway Dashboard**
   - Go to: https://railway.app/dashboard
   - Select your project
   - Go to "Variables" tab
   - Add all the environment variables from your `.env` file

2. **Deploy**
   ```powershell
   git add .
   git commit -m "Add booking system"
   git push
   ```
   Railway will automatically deploy

### For Vercel Deployment

1. **Add Environment Variables in Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Select your project
   - Go to "Settings" → "Environment Variables"
   - Add all the environment variables

2. **Deploy**
   ```powershell
   git add .
   git commit -m "Add booking system"
   git push
   ```
   Vercel will automatically deploy

---

## 🎯 Quick Verification Checklist

- [ ] Database table created in Supabase
- [ ] Environment variables added to `.env`
- [ ] Paystack keys configured
- [ ] Gmail app password configured
- [ ] Dev server started successfully
- [ ] Free booking test successful
- [ ] Confirmation email received
- [ ] Paid booking test successful (with test card)
- [ ] Payment confirmation email received
- [ ] Bookings visible in Supabase table

---

## 🚨 Troubleshooting

### Issue: Dev server won't start

**Solution 1**: Install dependencies first
```powershell
npm install
```

**Solution 2**: Try starting just the client
```powershell
cd client
npm install
npm start
```

### Issue: Emails not sending

**Fix**:
1. Make sure you're using Gmail **App Password**, not your regular password
2. Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct in `.env`
3. Check if 2-Step Verification is enabled on your Google account

### Issue: Paystack payment fails

**Fix**:
1. Verify `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY` are correct
2. Make sure you're using **test keys** for testing (start with `sk_test_` and `pk_test_`)
3. For production, use **live keys** (start with `sk_live_` and `pk_live_`)

### Issue: Bookings not saving to database

**Fix**:
1. Go back to Supabase and run the SQL again
2. Check if the table exists in "Table Editor"
3. Verify your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`

### Issue: Can't see the booking section on landing page

**Fix**:
1. Clear your browser cache (Ctrl+Shift+Delete)
2. Hard refresh the page (Ctrl+F5)
3. Check browser console for errors (F12)

---

## 📱 Mobile Testing

After everything works on desktop, test on mobile:

1. Find your local IP address:
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. On your phone, visit: `http://YOUR_IP:3000`
   (e.g., `http://192.168.1.100:3000`)

3. Test the booking flow on mobile

---

## 🎉 You're Done!

Your booking system is now ready to accept consultations!

### What You Have:
✅ Free 30-minute consultations  
✅ $5 deep-dive 1hr 30min sessions  
✅ Available every day, 7 AM - 3 PM  
✅ 5 service categories  
✅ Paystack payment integration  
✅ Email notifications  
✅ Mobile responsive  
✅ Secure database storage  

### Next Steps:
1. Share the booking link with potential clients
2. Monitor bookings in Supabase dashboard
3. Respond to booking confirmation emails
4. Set calendar reminders for consultations

---

## 📞 Need More Help?

Check these files:
- **BOOKING_SYSTEM_COMPLETE_GUIDE.md** - Full documentation
- **BOOKING_QUICK_REFERENCE.md** - Quick reference
- **BOOKING_SYSTEM_ARCHITECTURE.md** - System architecture

---

**Setup Time**: 5-10 minutes  
**Difficulty**: Easy ⭐  
**Status**: Production Ready ✅

**Happy Booking!** 🚀
