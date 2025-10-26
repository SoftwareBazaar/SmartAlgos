-- ============================================
-- FIX 1: View and Deactivate Subscriptions
-- ============================================

-- First, let's see all active subscriptions
SELECT 
    id, 
    user_id,
    ea_id,
    subscription_type,
    status,
    start_date,
    end_date,
    created_at
FROM subscriptions 
WHERE status = 'active'
ORDER BY created_at DESC;

-- To deactivate YOUR subscription (so you can test M-Pesa payment):
-- Replace 'YOUR_USER_ID' with your actual user_id from the query above

-- Option 1: Expire the subscription (keeps record)
UPDATE subscriptions 
SET 
    status = 'expired',
    end_date = NOW() - INTERVAL '1 day'
WHERE user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'your-email@example.com' -- Replace with your email
)
AND status = 'active';

-- Option 2: Just deactivate all your active subscriptions
UPDATE subscriptions 
SET status = 'expired'
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email = 'your-email@example.com' -- Replace with your email
)
AND status = 'active';

-- Verify subscriptions are deactivated
SELECT 
    id, 
    status,
    subscription_type,
    end_date
FROM subscriptions 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email = 'your-email@example.com'
);


-- ============================================
-- FIX 2: Check Why Users Don't Appear in Admin
-- ============================================

-- Check if users exist in auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Check if there's a users table (might be the issue)
SELECT 
    id,
    email,
    username,
    role,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- If users table doesn't exist, let's create it
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100),
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    subscription_tier VARCHAR(50) DEFAULT 'free',
    avatar_url TEXT,
    bio TEXT,
    phone VARCHAR(20),
    country VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync auth.users to users table (if users table was just created)
INSERT INTO users (id, email, role, created_at)
SELECT 
    id, 
    email, 
    'user' as role,
    created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM users)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role can manage all users" ON users;
CREATE POLICY "Service role can manage all users"
    ON users FOR ALL
    USING (auth.role() = 'service_role');

-- Create trigger to auto-create user record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role)
    VALUES (NEW.id, NEW.email, 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Check users table now
SELECT 
    u.id,
    u.email,
    u.username,
    u.role,
    u.subscription_tier,
    u.created_at,
    COUNT(s.id) as active_subscriptions
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
GROUP BY u.id, u.email, u.username, u.role, u.subscription_tier, u.created_at
ORDER BY u.created_at DESC;

