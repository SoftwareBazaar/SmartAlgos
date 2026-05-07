# 💰 Update All EA Prices to $19/Month

## Quick Update

All Expert Advisors are now **$19/month** (was varying prices).

---

## 🔧 How to Update

### Option 1: Supabase SQL Editor (Recommended)

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor"
4. Create new query
5. Copy and paste this SQL:

```sql
UPDATE expert_advisors 
SET 
  price_monthly = 19.00,
  price_weekly = 5.00,
  price_yearly = 190.00,
  updated_at = NOW()
WHERE is_active = true;
```

6. Click "Run"
7. Verify with:

```sql
SELECT id, name, price_monthly, price_weekly, price_yearly 
FROM expert_advisors 
WHERE is_active = true
ORDER BY created_at DESC;
```

### Option 2: Use SQL File

1. Download: `update-all-ea-prices-to-19.sql`
2. Go to Supabase SQL Editor
3. Copy entire file content
4. Run the query

---

## 📊 What Gets Updated

**All active EAs:**
- Monthly: **$19.00**
- Weekly: **$5.00**
- Yearly: **$190.00**

---

## ✅ Verify Update

Run this query to confirm:

```sql
SELECT 
  name,
  price_monthly,
  price_weekly,
  price_yearly,
  updated_at
FROM expert_advisors 
WHERE is_active = true
ORDER BY name;
```

You should see all prices as:
- Monthly: 19.00
- Weekly: 5.00
- Yearly: 190.00

---

## 🚀 Frontend Updates

The marketplace will automatically show **$19/month** for all EAs:

- Marketplace page: Shows $19
- Detail page: Shows $19
- Payment modal: Shows $19

No code changes needed - prices come from database!

---

## 📱 Test It

1. Go to: https://smartalgosts.com/ea-marketplace
2. See all EAs priced at **$19**
3. Click "Buy Now"
4. See **$19** in payment modal
5. Proceed to payment

---

## 💡 Pricing Structure

**$19/month = $228/year**

- Monthly: $19.00
- Weekly: $5.00 (for short-term testing)
- Yearly: $190.00 (save $38!)

---

## 🔄 If You Need to Change Again

Just run the SQL with different prices:

```sql
UPDATE expert_advisors 
SET 
  price_monthly = 29.00,  -- Change this
  price_weekly = 7.00,    -- Change this
  price_yearly = 290.00   -- Change this
WHERE is_active = true;
```

---

## ✨ Done!

All EAs are now **$19/month**! 🎉

The marketplace will automatically reflect the new prices.

---

## 📝 Files

- `update-all-ea-prices-to-19.sql` - SQL script to run in Supabase

---

**Your EA pricing is now unified at $19/month!** 💰
