# 🎯 Step-by-Step Guide: Running SQL in Supabase

## 📋 What You'll Do
You need to create the `subscriptions` table in your Supabase database. This will take about 2 minutes!

---

## 🚀 Step 1: Open Supabase Dashboard

1. Go to: **https://app.supabase.com**
2. **Log in** with your Supabase account
3. Click on your project: **ncikobfahncdgwvkfivz**
   - (This is the project connected to your app)

---

## 📝 Step 2: Open SQL Editor

1. Look at the **left sidebar** in Supabase
2. Click on the **"SQL Editor"** icon (looks like `</>` or a database icon)
3. Click **"New query"** button (usually at the top right)

---

## 📄 Step 3: Copy the SQL Code

1. Open the file: **`RUN_THIS_SQL.sql`** (in your project folder)
2. **Select ALL the text** (Ctrl+A or Cmd+A)
3. **Copy it** (Ctrl+C or Cmd+C)

OR you can copy this:

```sql
-- Drop the table if it exists (to start fresh)
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- Create the subscriptions table
CREATE TABLE public.subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users_accounts(id) ON DELETE CASCADE,
  ea_id BIGINT NOT NULL REFERENCES public.expert_advisors(id) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  price NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'bank_transfer', 'mobile_money', 'crypto')),
  payment_reference TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_ea_id ON public.subscriptions(ea_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_payment_reference ON public.subscriptions(payment_reference);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create security policies
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can do everything"
  ON public.subscriptions
  USING (true)
  WITH CHECK (true);
```

---

## ▶️ Step 4: Paste and Run

1. **Paste** the SQL code into the SQL Editor (Ctrl+V or Cmd+V)
2. Click the **"Run"** button (usually green button or says "RUN" at bottom right)
3. Wait a few seconds...

---

## ✅ Step 5: Verify It Worked

You should see:
- ✅ **"Success. No rows returned"** (This is GOOD!)
- OR a green checkmark
- OR "Query executed successfully"

If you see any **red error**, copy the error message and show me!

---

## 🔄 Step 6: Restart Your Server

1. Go back to your **terminal/command prompt**
2. Stop the current server (if running):
   - Press `Ctrl+C` to stop
   
3. Start the server again:
   ```powershell
   node server.js
   ```

---

## 🧪 Step 7: Test Everything

Run the download test:
```powershell
node test-download-after-payment.js
```

You should now see:
- ✅ User Authentication - **PASSED**
- ✅ Browse and Select EA - **PASSED**
- ✅ Initiate Payment - **PASSED**
- ✅ Create Subscription - **PASSED** (this was failing before!)
- ✅ Get Download Files - **PASSED**
- ✅ Download EA File - **PASSED**

---

## 🎉 That's It!

Your download-after-payment flow is now working!

---

## 🆘 Troubleshooting

### If you see "table already exists" error:
That's okay! The `DROP TABLE IF EXISTS` should handle it, but if not:
1. In Supabase SQL Editor, run this first:
   ```sql
   DROP TABLE IF EXISTS public.subscriptions CASCADE;
   ```
2. Then run the full SQL again

### If you see "foreign key constraint" error:
This means the `users_accounts` or `expert_advisors` tables don't exist. Let me know and I'll help!

### If you see "permission denied":
Make sure you're logged into Supabase with the correct account that owns the project.

---

## 📸 Visual Guide

**Where is SQL Editor?**
- Left sidebar → Look for icon that says "SQL Editor" or looks like `</>`

**Where is the Run button?**
- Usually at the bottom right of the SQL editor window
- Or at the top right
- Might say "RUN" or have a play ▶️ icon

**What does success look like?**
- Green text saying "Success"
- OR "Query executed successfully"
- OR "No rows returned" (this is good for CREATE TABLE commands)

---

Need help? Copy any error messages you see and let me know! 🙌

