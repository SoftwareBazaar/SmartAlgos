-- ============================================
-- MINIMAL RLS ENABLEMENT - NO COLUMN ASSUMPTIONS
-- ============================================
-- This script ONLY enables RLS and gives service role full access
-- Run this first to fix the security warnings
-- Then we can add specific policies later

-- ============================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================

DO $$ 
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
      AND rowsecurity = false  -- Only tables without RLS
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    RAISE NOTICE 'Enabled RLS on: %', table_name;
  END LOOP;
END $$;

-- ============================================
-- 2. GRANT SERVICE ROLE FULL ACCESS TO ALL TABLES
-- ============================================
-- This ensures your backend (using service_role key) can still access everything

DO $$ 
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  LOOP
    -- Drop existing service role policy if exists
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS "Service role full access" ON public.%I', table_name);
    EXCEPTION WHEN OTHERS THEN
      -- Ignore errors
    END;
    
    -- Create service role policy
    EXECUTE format('
      CREATE POLICY "Service role full access"
      ON public.%I
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true)
    ', table_name);
    
    RAISE NOTICE 'Created service role policy for: %', table_name;
  END LOOP;
END $$;

-- ============================================
-- 3. ALLOW PUBLIC READ ACCESS TO KEY TABLES
-- ============================================
-- This allows your website to display marketplace data

DO $$ 
BEGIN
  -- Expert Advisors - allow public read
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'expert_advisors') THEN
    DROP POLICY IF EXISTS "Public read access" ON public.expert_advisors;
    CREATE POLICY "Public read access"
    ON public.expert_advisors
    FOR SELECT
    USING (true);
    RAISE NOTICE 'Created public read policy for: expert_advisors';
  END IF;

  -- EA Reviews - allow public read
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ea_reviews') THEN
    DROP POLICY IF EXISTS "Public read access" ON public.ea_reviews;
    CREATE POLICY "Public read access"
    ON public.ea_reviews
    FOR SELECT
    USING (true);
    RAISE NOTICE 'Created public read policy for: ea_reviews';
  END IF;

  -- HFT Bots - allow public read
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hft_bots') THEN
    DROP POLICY IF EXISTS "Public read access" ON public.hft_bots;
    CREATE POLICY "Public read access"
    ON public.hft_bots
    FOR SELECT
    USING (true);
    RAISE NOTICE 'Created public read policy for: hft_bots';
  END IF;

  -- HFT Bot Reviews - allow public read
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hft_bot_reviews') THEN
    DROP POLICY IF EXISTS "Public read access" ON public.hft_bot_reviews;
    CREATE POLICY "Public read access"
    ON public.hft_bot_reviews
    FOR SELECT
    USING (true);
    RAISE NOTICE 'Created public read policy for: hft_bot_reviews';
  END IF;

  -- Trading Signals - allow public read
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'trading_signals') THEN
    DROP POLICY IF EXISTS "Public read access" ON public.trading_signals;
    CREATE POLICY "Public read access"
    ON public.trading_signals
    FOR SELECT
    USING (true);
    RAISE NOTICE 'Created public read policy for: trading_signals';
  END IF;

  -- AI Models - allow public read
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_models') THEN
    DROP POLICY IF EXISTS "Public read access" ON public.ai_models;
    CREATE POLICY "Public read access"
    ON public.ai_models
    FOR SELECT
    USING (true);
    RAISE NOTICE 'Created public read policy for: ai_models';
  END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check policies created
SELECT 
  schemaname,
  tablename,
  policyname,
  roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Summary
SELECT 
  '✅ RLS Security Enabled!' as status,
  COUNT(*) as tables_secured
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true;
