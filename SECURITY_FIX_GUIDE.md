# 🔒 Security Fix Guide - RLS Policies

## Critical Security Issue

Your Supabase tables have **Row Level Security (RLS) disabled**, which means anyone with your database URL can read/write data directly. This is a **CRITICAL** security vulnerability.

## What is RLS?

Row Level Security (RLS) is a PostgreSQL feature that restricts which rows users can access in database tables. Without RLS:
- ❌ Anyone can read all data
- ❌ Anyone can modify/delete data
- ❌ No user isolation
- ❌ Payment data exposed
- ❌ User data exposed

With RLS enabled:
- ✅ Users only see their own data
- ✅ Public data is read-only
- ✅ Admin operations protected
- ✅ Payment data secured
- ✅ User privacy protected

## Affected Tables

The following tables need RLS enabled:

1. ✅ `ea_reviews` - Expert Advisor reviews
2. ✅ `escrow_transactions` - Payment escrow data
3. ✅ `expert_advisors_backup` - EA backup data
4. ✅ `expert_advisors` - EA marketplace data
5. ✅ `hft_bot_reviews` - HFT bot reviews
6. ✅ `hft_bots` - HFT bot data
7. ✅ `trading_signals` - Trading signals
8. ✅ `payment_signin_jobs` - Payment processing jobs

## Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Security Script

1. Copy the entire contents of `database/enable-rls-security.sql`
2. Paste into the SQL Editor
3. Click **Run** (or press Ctrl+Enter)
4. Wait for completion (should take 5-10 seconds)

### Step 3: Verify RLS is Enabled

The script includes verification queries at the end. You should see:

```
✅ All tables show "RLS Enabled: true"
✅ Multiple policies created for each table
```

## What the Script Does

### 1. Enables RLS on All Tables
```sql
ALTER TABLE public.ea_reviews ENABLE ROW LEVEL SECURITY;
-- ... and 7 more tables
```

### 2. Creates Security Policies

#### Public Read Access
- Anyone can read active EAs
- Anyone can read reviews
- Anyone can read trading signals

#### User-Specific Access
- Users can only see their own escrow transactions
- Users can only edit their own reviews
- Users can only update their own EAs

#### Admin Access
- Service role (your backend) has full access
- Required for admin panel operations
- Required for payment processing

## Security Policies Explained

### EA Reviews
```sql
-- Anyone can read reviews (public)
SELECT: true

-- Only authenticated users can create reviews
INSERT: auth.uid() = user_id

-- Users can only edit/delete their own reviews
UPDATE/DELETE: auth.uid() = user_id
```

### Expert Advisors
```sql
-- Anyone can read active EAs (marketplace)
SELECT: is_active = true AND status = 'active'

-- Service role can manage all (admin panel)
ALL: service_role

-- Creators can update their own EAs
UPDATE: auth.uid() = creator_id
```

### Escrow Transactions
```sql
-- Users can only see their own transactions
SELECT: auth.uid() = buyer_id OR auth.uid() = seller_id

-- Service role can manage all (payment processing)
ALL: service_role
```

## Impact on Your Application

### ✅ No Code Changes Required

Your backend uses the **service role key** which bypasses RLS, so all your existing code will continue to work.

### ✅ Frontend Continues to Work

Your frontend uses the **anon key** which respects RLS policies. The policies are designed to allow:
- Reading public data (EAs, reviews, signals)
- Users managing their own data
- Admin operations via backend

### ✅ Enhanced Security

After enabling RLS:
- Direct database access is restricted
- User data is isolated
- Payment data is protected
- Admin operations are secured

## Testing After Enabling RLS

### Test 1: Public Access (Should Work)
```bash
# Visit your marketplace
https://smartalgosts.com/ea-marketplace

# Should display all active EAs
```

### Test 2: User Reviews (Should Work)
```bash
# Login as a user
# Create a review
# Edit your own review
# Try to edit someone else's review (should fail)
```

### Test 3: Admin Panel (Should Work)
```bash
# Login as admin
# Manage EAs
# View all transactions
# All admin operations should work
```

### Test 4: Direct Database Access (Should Fail)
```bash
# Try to query database directly with anon key
# Should only return public data
# Should not return private user data
```

## Troubleshooting

### Issue: "Permission denied for table"

**Cause:** RLS policy too restrictive

**Fix:** Check if you're using the correct key:
- Frontend: Use `SUPABASE_ANON_KEY`
- Backend: Use `SUPABASE_SERVICE_KEY`

### Issue: "Users can't see their data"

**Cause:** Policy using wrong user ID check

**Fix:** Verify the policy uses `auth.uid()` correctly:
```sql
-- Correct
USING (auth.uid() = user_id)

-- Wrong
USING (user_id = 'some-hardcoded-id')
```

### Issue: "Admin panel not working"

**Cause:** Backend not using service role key

**Fix:** Check your `.env` file:
```env
SUPABASE_SERVICE_KEY=eyJhbGc... (service_role key)
# NOT the anon key
```

### Issue: "Marketplace not showing EAs"

**Cause:** Policy too restrictive

**Fix:** Check the EA policy allows public read:
```sql
CREATE POLICY "Anyone can read active expert advisors"
ON public.expert_advisors
FOR SELECT
USING (is_active = true AND status = 'active');
```

## Additional Security Recommendations

### 1. Enable Email Verification
```sql
-- In Supabase Dashboard → Authentication → Settings
-- Enable "Confirm email"
```

### 2. Set Up Rate Limiting
```sql
-- In Supabase Dashboard → Authentication → Rate Limits
-- Set appropriate limits for:
-- - Login attempts: 5 per 15 minutes
-- - Registration: 10 per hour
-- - Password reset: 5 per hour
```

### 3. Enable MFA (Multi-Factor Authentication)
```sql
-- In Supabase Dashboard → Authentication → Settings
-- Enable "Multi-Factor Authentication"
```

### 4. Review API Keys
```bash
# Ensure you're using the right keys:
# - Frontend: anon key (public, safe to expose)
# - Backend: service_role key (private, never expose)
```

### 5. Monitor Auth Logs
```bash
# Regularly check Supabase Dashboard → Logs → Auth Logs
# Look for:
# - Failed login attempts
# - Suspicious activity
# - Unusual patterns
```

## Deployment Checklist

Before going live:

- [ ] RLS enabled on all tables
- [ ] Policies tested and working
- [ ] Admin panel still functional
- [ ] Marketplace displays correctly
- [ ] User reviews work
- [ ] Payment processing works
- [ ] Email verification enabled
- [ ] Rate limiting configured
- [ ] API keys secured
- [ ] Auth logs monitored

## Emergency Rollback

If something breaks after enabling RLS:

### Option 1: Disable RLS Temporarily
```sql
-- ONLY USE IN EMERGENCY
ALTER TABLE public.expert_advisors DISABLE ROW LEVEL SECURITY;
-- Fix the issue, then re-enable
```

### Option 2: Drop Specific Policy
```sql
-- If a specific policy is causing issues
DROP POLICY "policy_name" ON public.table_name;
-- Fix and recreate the policy
```

### Option 3: Grant Temporary Access
```sql
-- Grant temporary full access (NOT RECOMMENDED)
GRANT ALL ON public.expert_advisors TO anon;
-- Remove after fixing
REVOKE ALL ON public.expert_advisors FROM anon;
```

## Support

If you encounter issues:

1. **Check Supabase Logs:**
   - Dashboard → Logs → Postgres Logs
   - Look for RLS-related errors

2. **Test Policies:**
   ```sql
   -- Test as anonymous user
   SET ROLE anon;
   SELECT * FROM expert_advisors;
   RESET ROLE;
   ```

3. **Verify Service Role:**
   ```sql
   -- Test as service role
   SET ROLE service_role;
   SELECT * FROM expert_advisors;
   RESET ROLE;
   ```

## Summary

**Time Required:** 5 minutes

**Risk Level:** Low (policies designed to maintain current functionality)

**Impact:** High (critical security improvement)

**Action Required:** Run `database/enable-rls-security.sql` in Supabase SQL Editor

---

**Status:** Ready to deploy

**Next Step:** Open Supabase SQL Editor and run the script
