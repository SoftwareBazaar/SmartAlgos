-- Script to change admin from johnwanyaga37@gmail.com to softwarebazaar.ke@gmail.com
-- Run this in Supabase SQL Editor

-- Step 1: Remove admin role from old email
UPDATE users_accounts 
SET role = 'user', updated_at = NOW()
WHERE email = 'johnwanyaga37@gmail.com';

-- Step 2: Make new email admin (if user already exists)
UPDATE users_accounts 
SET role = 'admin', 
    is_active = true, 
    is_email_verified = true, 
    updated_at = NOW()
WHERE email = 'softwarebazaar.ke@gmail.com';

-- Step 3: If user doesn't exist, create new admin user
-- Default password: Admin123!@#
INSERT INTO users_accounts (
  email, 
  password_hash,
  first_name, 
  last_name, 
  role, 
  is_active, 
  is_email_verified,
  subscription_type, 
  subscription_status, 
  subscription_start_date,
  subscription_end_date,
  created_at, 
  updated_at
) 
SELECT 
  'softwarebazaar.ke@gmail.com',
  '$2a$12$hbblbxA8zi6uRjrGvNAoxO6TOX7rhyuGJge4aIphoZtlZyVGEmVbO',
  'Admin',
  'User',
  'admin',
  true,
  true,
  'institutional',
  'active',
  NOW(),
  NOW() + INTERVAL '365 days',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users_accounts WHERE email = 'softwarebazaar.ke@gmail.com'
);

-- Step 4: Verify the change
SELECT email, role, is_active, is_email_verified
FROM users_accounts
WHERE role = 'admin'
ORDER BY updated_at DESC;

