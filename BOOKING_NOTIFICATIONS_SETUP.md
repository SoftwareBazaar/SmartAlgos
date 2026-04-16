# 🔔 Booking Email Notifications Setup

## What's Been Added

### 1. Admin Email Notifications ✅
When someone books a consultation, you'll receive an email with:
- Customer name, email, phone
- Service type
- Date and time
- Payment status
- Booking reference

### 2. Customer Confirmation Emails ✅
Customers receive a professional confirmation email with:
- Booking details
- Service information
- Date and time
- Reference number
- Your contact information

### 3. Slot Availability System ✅
- Booked time slots are automatically hidden
- Shows warning when slots are taken
- Prevents double-booking
- Real-time availability check

## Setup Required (5 Minutes)

### Step 1: Set Environment Variables in Railway

1. Go to Railway Dashboard: https://railway.app
2. Select your Smart Algos project
3. Click on your service
4. Go to "Variables" tab
5. Add these variables:

```
ADMIN_EMAIL=softwarebazaar.ke@gmail.com
SENDGRID_API_KEY=your_sendgrid_api_key_here
```

### Step 2: Get SendGrid API Key (If You Don't Have One)

1. Go to https://sendgrid.com
2. Sign up for free account (100 emails/day free)
3. Go to Settings → API Keys
4. Click "Create API Key"
5. Name it: "Smart Algos Bookings"
6. Select "Full Access"
7. Copy the API key
8. Paste it in Railway as `SENDGRID_API_KEY`

### Step 3: Verify Email Sender

1. In SendGrid, go to Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Fill in your details:
   - From Name: Smart Algos
   - From Email: softwarebazaar.ke@gmail.com
   - Reply To: softwarebazaar.ke@gmail.com
4. Check your email and click verification link

### Step 4: Redeploy (Automatic)

Railway will automatically redeploy when you save the environment variables.

## How It Works

### When Someone Books:

1. **Customer receives:**
   - Professional confirmation email
   - All booking details
   - Your contact information
   - Booking reference

2. **You receive:**
   - Admin notification email
   - Customer contact details
   - Booking information
   - Payment status

3. **System updates:**
   - Marks time slot as booked
   - Hides slot from future bookings
   - Saves to database

## Email Templates

### Customer Confirmation Email:
```
Subject: ✅ Booking Confirmed – [Service] on [Date]

- Service: Algo Development
- Session Type: Free 30-Minute Consultation
- Date: Mon, Apr 15
- Time: 7:00 PM (EAT)
- Payment: Free (First Session)
- Reference: BOOK-1234567890-ABC123

We will reach out to confirm the meeting link before your session.
```

### Admin Notification Email:
```
Subject: 📅 New Booking: John Doe – Apr 15 7:00 PM

Name: John Doe
Email: john@example.com
Phone: +254 700 000 000
Service: Algo Development
Session: Free 30-min
Date: 2024-04-15
Time: 19:00
Payment: 🆓 Free session
Reference: BOOK-1234567890-ABC123
```

## Testing

### Test the Complete Flow:

1. Go to: https://smartalgosts.com/book-consultation
2. Fill in booking form
3. Submit booking
4. Check your email (ADMIN_EMAIL)
5. Customer should receive confirmation

### If Emails Don't Arrive:

1. Check spam/junk folder
2. Verify SendGrid API key is correct
3. Verify sender email is verified in SendGrid
4. Check Railway logs for errors:
   ```
   Railway Dashboard → Deployments → View Logs
   Search for: "[Bookings]"
   ```

## Slot Availability

### How It Works:
- When user selects a date, system checks database
- Fetches all booked slots for that date
- Hides booked time slots
- Shows warning: "⚠️ X slots already booked for this date"

### Example:
```
Available slots for Apr 15:
✅ 7:00 PM (EAT)
❌ 7:30 PM (EAT) - Booked
✅ 8:00 PM (EAT)
❌ 8:30 PM (EAT) - Booked
✅ 9:00 PM (EAT)
```

## Troubleshooting

### No Admin Email Received?

**Check 1: Environment Variables**
```bash
# In Railway, verify these are set:
ADMIN_EMAIL=softwarebazaar.ke@gmail.com
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_USER=softwarebazaar.ke@gmail.com
```

**Check 2: SendGrid Logs**
1. Go to SendGrid Dashboard
2. Click "Activity"
3. Search for recent emails
4. Check delivery status

**Check 3: Railway Logs**
```
Look for:
✅ "[Bookings] ✅ Admin notification sent"
❌ "[Bookings] ❌ Admin notification error"
```

### Customer Not Receiving Email?

**Check 1: Spam Folder**
- Ask customer to check spam/junk

**Check 2: Email Address**
- Verify email address is correct
- Check for typos

**Check 3: SendGrid Status**
- Check SendGrid activity feed
- Verify sender is verified

### Slots Not Hiding?

**Check 1: Database**
```sql
-- Run in Supabase SQL Editor:
SELECT * FROM consultation_bookings 
WHERE date = '2024-04-15' 
ORDER BY time;
```

**Check 2: Browser Console**
- Open browser console (F12)
- Look for: "[Booking] X slots booked for..."
- Check for errors

## Environment Variables Summary

Required in Railway:

```env
# Email Configuration
SENDGRID_API_KEY=SG.your_api_key_here
EMAIL_USER=softwarebazaar.ke@gmail.com
ADMIN_EMAIL=softwarebazaar.ke@gmail.com

# Already Set (Don't Change)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PAYSTACK_PUBLIC_KEY=your_paystack_key
PAYSTACK_SECRET_KEY=your_paystack_secret
```

## Features Summary

### ✅ Implemented:
- Admin email notifications
- Customer confirmation emails
- Slot availability checking
- Double-booking prevention
- Professional email templates
- Booking reference system
- Database integration

### 📧 Email Features:
- HTML formatted emails
- Responsive design
- Professional branding
- All booking details
- Contact information
- Reference numbers

### 🎯 Slot Management:
- Real-time availability
- Automatic slot hiding
- Visual warnings
- Database-backed
- No double-booking

## Next Steps

1. ✅ Set ADMIN_EMAIL in Railway
2. ✅ Set SENDGRID_API_KEY in Railway
3. ✅ Verify sender email in SendGrid
4. ✅ Test booking flow
5. ✅ Check email delivery
6. ✅ Verify slot hiding works

---

**Status:** ✅ Code Deployed

**Configuration Needed:** SendGrid API Key + Admin Email

**Time Required:** 5 minutes

**Test URL:** https://smartalgosts.com/book-consultation
