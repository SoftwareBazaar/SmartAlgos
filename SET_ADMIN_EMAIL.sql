-- ============================================
-- SET YOUR EMAIL AS ADMIN IN SUPABASE
-- ============================================
-- This makes your email address an admin user
-- Run this in Supabase SQL Editor
-- ============================================

-- STEP 1: Check if you exist in the database
SELECT email, first_name, last_name, role 
FROM users_accounts 
WHERE email = 'johnwanyaga37@gmail.com';

-- If you see your email, proceed to STEP 2
-- If you see nothing, you need to register first on your website!

-- STEP 2: Make yourself admin
UPDATE users_accounts 
SET 
  role = 'admin',
  is_active = true,
  is_email_verified = true,
  updated_at = NOW()
WHERE email = 'johnwanyaga37@gmail.com';

-- STEP 3: Verify you're now admin
SELECT email, first_name, last_name, role, is_active 
FROM users_accounts 
WHERE email = 'johnwanyaga37@gmail.com';

-- You should see:
-- role: admin
-- is_active: true

-- ============================================
-- ✅ DONE! You're now an admin!
-- ============================================
-- Logout and login again to get admin access
-- ============================================

-- ============================================
-- BONUS: See all current admins
-- ============================================
SELECT email, first_name, last_name, role, created_at
FROM users_accounts 
WHERE role = 'admin'
ORDER BY created_at DESC;

-- ============================================
-- 💡 HOW TO RUN THIS:
-- ============================================
-- 1. Go to https://app.supabase.com
-- 2. Select your Algosmart project
-- 3. Click "SQL Editor" in left sidebar
-- 4. Click "New Query"
-- 5. Copy/paste this ENTIRE file
-- 6. Click "Run" button
-- 7. Check the output ✅
-- ============================================

