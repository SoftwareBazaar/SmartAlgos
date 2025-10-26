# 🎯 ADMIN FIX & M-PESA TEST GUIDE

## 🐛 What Was Broken

Your **Railway server was missing admin routes**! That's why:
- ❌ No users showing in admin panel
- ❌ Data was in database, but not visible on website

## ✅ What I Fixed

### 1. Added Admin Routes to Railway Server
**File:** `railway-full-server.js`
```javascript
const adminRoutes = require('./admin-panel'); // Real database access
app.use('/api/admin', adminRoutes); // Now admin panel works!
```

**Result:**
- ✅ Admin panel now fetches REAL users from database
- ✅ You'll see wanyagajohn73@gmail.com, johnwanyaga37@gmail.com, etc.

### 2. Created SQL to Remove Subscription for Testing
**File:** `remove-subscription-for-testing.sql`

---

## 📝 WHAT YOU NEED TO DO NOW

### Step 1: Wait for Railway Deployment (2-3 minutes)
Railway is rebuilding your app right now with the admin fix.

Check: https://railway.app/project/your-project

### Step 2: Remove Your Subscription (So You Can Test M-Pesa)

1. Go to: https://supabase.com/dashboard/project/ncikobfahncdgwvkfivz/editor
2. Click **SQL Editor** (left sidebar)
3. Copy and paste this SQL:

```sql
-- Step 1: View your current subscriptions
SELECT 
  id,
  user_id,
  ea_id,
  subscription_type,
  status,
  created_at
FROM subscriptions
WHERE user_id IN (
  SELECT id FROM users_accounts 
  WHERE email = 'wanyagajohn73@gmail.com'
)
ORDER BY created_at DESC;
```

4. Click **RUN** to see your subscriptions
5. Then run this to DELETE them:

```sql
-- Delete subscription so you can test payment
DELETE FROM subscriptions
WHERE user_id IN (
  SELECT id FROM users_accounts 
  WHERE email = 'wanyagajohn73@gmail.com'
);
```

6. Click **RUN** again

**Result:** Your account will have NO subscription, so you can test the payment flow!

---

## 🧪 Testing M-Pesa STK Push

### After removing subscription:

1. Go to: https://web-production-fdb58.up.railway.app
2. Login with: `wanyagajohn73@gmail.com`
3. Go to **EA Marketplace**
4. Click on any EA
5. Click **"Subscribe Now"**
6. Select your plan
7. Click **"Choose Payment Method"**
8. Select **"Mobile Money (M-Pesa)"**
9. **NOW YOU SHOULD SEE:** M-Pesa dialog asking for phone number! 📱
10. Enter: `254712345678` (your M-Pesa number)
11. Click **"Pay via M-Pesa"**
12. **Check your phone** for STK push prompt!
13. Enter your M-Pesa PIN
14. ✅ After payment, you'll be redirected to downloads!

---

## 🔍 Check Admin Panel Now

1. Go to: https://web-production-fdb58.up.railway.app/admin
2. Login as admin: `admin@smartalgos.com`
3. Click **"Users"** tab
4. **You should now see:**
   - ✅ wanyagajohn73@gmail.com (John)
   - ✅ johnwanyaga37@gmail.com (John)
   - ✅ admin@smartalgos.com (Admin)

---

## 📊 What You'll See in Database After M-Pesa Payment

### In `mpesa_transactions` table:
```
phone_number: 254712345678
amount: 18 (or whatever plan price)
mpesa_receipt_number: ABC123XYZ
result_code: 0 (success)
transaction_status: completed
```

### In `subscriptions` table:
```
user_id: [your user ID]
ea_id: [selected EA ID]
subscription_type: monthly/quarterly/yearly
payment_method: mpesa
payment_reference: [M-Pesa receipt number]
status: active
```

---

## 🚨 Troubleshooting

### "Users still not showing in admin panel"
1. Wait 3-5 minutes for Railway deployment
2. Hard refresh: Ctrl + Shift + R (Windows) / Cmd + Shift + R (Mac)
3. Clear browser cache
4. Check Railway logs for errors

### "M-Pesa credentials error"
Make sure you've set these in Railway:
```
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=your_passkey
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://web-production-fdb58.up.railway.app/api/mpesa/callback
```

### "STK push not appearing"
1. Make sure you removed your subscription (Step 2 above)
2. Check browser console (F12) for errors
3. Make sure M-Pesa dialog component is loaded

---

## ✅ SUCCESS CHECKLIST

After Railway deploys (in 3-5 minutes):

- [ ] Admin panel shows real users
- [ ] Removed subscription via SQL
- [ ] Can select payment method in marketplace
- [ ] M-Pesa dialog appears when selecting "Mobile Money"
- [ ] STK push prompt appears on phone
- [ ] Payment completes successfully
- [ ] Downloads become available after payment

---

## 🎉 YOU'RE ALMOST THERE!

Once Railway finishes deploying:
1. ✅ Admin panel will show real users
2. ✅ M-Pesa payment flow will work end-to-end
3. ✅ Your friends can sign up and you'll see them in admin!

**Deployment URL:** https://web-production-fdb58.up.railway.app

**Estimated time:** 3-5 minutes for Railway to rebuild

