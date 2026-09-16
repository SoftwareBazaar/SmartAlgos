-- Portal schema for Smart Algos Capital.
-- Safe to re-run. Creates public.profiles if this project does not have it yet.

-- 1. Profiles (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'retail',
  subscription_status TEXT NOT NULL DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

UPDATE public.profiles SET role = 'retail' WHERE role IS NULL OR role = '';
UPDATE public.profiles SET subscription_status = 'free' WHERE subscription_status IS NULL OR subscription_status = '';
UPDATE public.profiles SET created_at = NOW() WHERE created_at IS NULL;
UPDATE public.profiles SET updated_at = NOW() WHERE updated_at IS NULL;

ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'retail';
ALTER TABLE public.profiles ALTER COLUMN subscription_status SET DEFAULT 'free';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_role_check
      CHECK (role IN ('retail', 'investor', 'admin'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_idx
  ON public.profiles (email)
  WHERE email IS NOT NULL;

INSERT INTO public.profiles (id, email, full_name, role, subscription_status)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  'retail',
  'free'
FROM auth.users u
ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = NOW();

CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, subscription_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    'retail',
    'free'
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. Backtest history & tear sheet storage
CREATE TABLE IF NOT EXISTS public.backtests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT,
  asset_class TEXT NOT NULL,
  strategy_name TEXT NOT NULL DEFAULT 'sample-sandbox',
  lookback_period TEXT NOT NULL,
  metrics JSONB NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS backtests_user_id_idx ON public.backtests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS backtests_email_idx ON public.backtests (email, created_at DESC);

-- 3. Purchases & strategy file access
CREATE TABLE IF NOT EXISTS public.strategy_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email TEXT,
  strategy_id TEXT NOT NULL,
  paystack_reference TEXT UNIQUE NOT NULL,
  amount_paid NUMERIC NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS strategy_purchases_user_id_idx ON public.strategy_purchases (user_id);
CREATE INDEX IF NOT EXISTS strategy_purchases_email_idx ON public.strategy_purchases (email);

-- 4. Prop investor allocation records
CREATE TABLE IF NOT EXISTS public.prop_allocations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  investor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  prop_firm_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  allocated_strategy TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'paused', 'breached')) DEFAULT 'active',
  allocated_equity NUMERIC,
  current_equity NUMERIC,
  pnl NUMERIC,
  max_dd_limit NUMERIC DEFAULT 5.0,
  current_dd NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS prop_allocations_investor_id_idx ON public.prop_allocations (investor_id);

ALTER TABLE public.backtests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prop_allocations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own backtests" ON public.backtests;
CREATE POLICY "Users read own backtests"
  ON public.backtests FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own strategy purchases" ON public.strategy_purchases;
CREATE POLICY "Users read own strategy purchases"
  ON public.strategy_purchases FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own allocations" ON public.prop_allocations;
CREATE POLICY "Users read own allocations"
  ON public.prop_allocations FOR SELECT
  USING (auth.uid() = investor_id);
