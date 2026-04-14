# 🚀 DEPLOY NOW - Booking System

## Quick 3-Step Deployment

---

## ✅ Step 1: Setup Database (2 minutes)

### Copy this SQL and run it in Supabase:

1. Go to: https://supabase.com/dashboard
2. Click: **SQL Editor** → **New Query**
3. Paste the SQL from: `database/create_consultation_bookings.sql`
4. Click: **Run**
5. See: ✅ "table created successfully"

---

## ✅ Step 2: Deploy to Railway (1 minute)

### Run this command:

**Option A: PowerShell**
```powershell
.\deploy-booking-system.ps1
```

**Option B: Batch File**
```powershell
.\deploy-booking-system.bat
```

**Option C: Manual**
```powershell
git add .
git commit -m "Add booking system"
git push origin main
```

---

## ✅ Step 3: Test It (2 minutes)

1. Wait for Railway deployment (2-3 minutes)
2. Visit your Railway URL
3. Scroll to "Book a Consultation"
4. Test a free booking
5. Check email: **softwarebazaar.ke@gmail.com** ✅

---

## 🎯 What You Get

✅ Free 30-min consultations  
✅ $5 deep-dive 1hr 30min sessions  
✅ Available 7 AM - 3 PM daily  
✅ 5 service categories  
✅ Paystack payments  
✅ Email notifications to: **softwarebazaar.ke@gmail.com**  

---

## 📊 Monitor Bookings

**Supabase Dashboard:**
- Go to: https://supabase.com/dashboard
- Table Editor → `consultation_bookings`

**SQL Query:**
```sql
SELECT * FROM consultation_bookings 
ORDER BY created_at DESC LIMIT 10;
```

---

## 🚨 Quick Troubleshooting

**Deployment fails?**
- Check Railway logs
- Verify all environment variables are set

**Emails not working?**
- Verify EMAIL_USER and EMAIL_PASSWORD in Railway
- Check: softwarebazaar.ke@gmail.com

**Bookings not saving?**
- Verify database table was created
- Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

---

## ✨ That's It!

**Total Time**: 5 minutes  
**Admin Email**: softwarebazaar.ke@gmail.com  
**Status**: Ready to Deploy! 🚀

---

**Let's go!** Run the deployment script now! 🎉
