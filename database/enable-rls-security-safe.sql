-- ============================================
-- SAFE RLS ENABLEMENT SCRIPT
-- ============================================
-- This script safely enables RLS even if some tables don't exist
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. ENABLE RLS ON ALL EXISTING TABLES
-- ============================================

DO $$ 
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
      AND tablename IN (
        'ai_models',
        'ai_signal_jobs',
        'ea_reviews',
        'escrow_transactions',
        'expert_advisors_backup',
        'expert_advisors',
        'hft_bot_reviews',
        'hft_bots',
        'trading_signals',
        'payment_signin_jobs'
      )
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    RAISE NOTICE 'Enabled RLS on: %', table_name;
  END LOOP;
END $$;

-- ============================================
-- 2. EA REVIEWS POLICIES
-- ============================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ea_reviews') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Anyone can read EA reviews" ON public.ea_reviews;
    DROP POLICY IF EXISTS "Authenticated users can create EA reviews" ON public.ea_reviews;
    DROP POLICY IF EXISTS "Users can update their own EA reviews" ON public.ea_reviews;
    DROP POLICY IF EXISTS "Users can delete their own EA reviews" ON public.ea_reviews;
    DROP POLICY IF EXISTS "Service role can manage EA reviews" ON public.ea_reviews;

    -- Anyone can read reviews
    CREATE POLICY "Anyone can read EA reviews"
    ON public.ea_reviews
    FOR SELECT
    USING (true);

    -- Authenticated users can create reviews
    CREATE POLICY "Authenticated users can create EA reviews"
    ON public.ea_reviews
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

    -- Users can update their own reviews
    CREATE POLICY "Users can update their own EA reviews"
    ON public.ea_reviews
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

    -- Users can delete their own reviews
    CREATE POLICY "Users can delete their own EA reviews"
    ON public.ea_reviews
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

    -- Service role can manage all
    CREATE POLICY "Service role can manage EA reviews"
    ON public.ea_reviews
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

    RAISE NOTICE 'Created policies for: ea_reviews';
  END IF;
END $$;

-- ============================================
-- 3. ESCROW TRANSACTIONS POLICIES
-- ============================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'escrow_transactions') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own escrow transactions" ON public.escrow_transactions;
    DROP POLICY IF EXISTS "Service role can manage escrow transactions" ON public.escrow_transactions;

    -- Users can only see their own escrow transactions
    CREATE POLICY "Users can view their own escrow transactions"
    ON public.escrow_transactions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

    -- Service role can manage all escrow transactions
    CREATE POLICY "Service role can manage escrow transactions"
    ON public.escrow_transactions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

    RAISE NOTICE 'Created policies for: escrow_transactions';
  END IF;
END $$;

-- ============================================
-- 4. EXPERT ADVISORS POLICIES
-- ============================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'expert_advisors') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Anyone can read active expert advisors" ON public.expert_advisors;
    DROP POLICY IF EXISTS "Service role can manage expert advisors" ON public.expert_advisors;
    DROP POLICY IF EXISTS "Creators can update their own expert advisors" ON public.expert_advisors;

    -- Anyone can read active EAs
    CREATE POLICY "Anyone can read active expert advisors"
    ON public.expert_advisors
    FOR SELECT
    USING (is_active = true);

    -- Service role can manage all EAs (for admin panel)
    CREATE POLICY "Service role can manage expert advisors"
    ON public.expert_advisors
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

    RAISE NOTICE 'Created policies for: expert_advisors';
  END IF;
END $$;

-- ============================================
-- 5. EXPERT ADVISORS BACKUP POLICIES
-- ============================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'expert_advisors_backup') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Service role can access EA backup" ON public.expert_advisors_backup;

    -- Only service role can access backup table
    CREATE POLICY "Service role can access EA backup"
    ON public.expert_advisors_backup
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

    RAISE NOTICE 'Created policies for: expert_advisors_backup';
  END IF;
END $$;

-- ============================================
-- 6. HFT BOT REVIEWS POLICIES
-- ============================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hft_bot_reviews') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Anyone can read HFT bot reviews" ON public.hft_bot_reviews;
    DROP POLICY IF EXISTS "Authenticated users can create HFT bot reviews" ON public.hft_bot_reviews;
    DROP POLICY IF EXISTS "Users can update their own HFT bot reviews" ON public.hft_bot_reviews;
    DROP POLICY IF EXISTS "Users can delete their own HFT bot reviews" ON public.hft_bot_reviews;
    DROP POLICY IF EXISTS "Service role can manage HFT bot reviews" ON public.hft_bot_reviews;

    -- Anyone can read HFT bot reviews
    CREATE POLICY "Anyone can read HFT bot reviews"
    ON public.hft_bot_reviews
    FOR SELECT
    USING (true);

    -- Authenticated users can create reviews
    CREATE POLICY "Authenticated users can create HFT bot reviews"
    ON public.hft_bot_reviews
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

    -- Users can update their own reviews
    CREATE POLICY "Users can update their own HFT bot reviews"
    ON public.hft_bot_reviews
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

    -- Users can delete their own reviews
    CREATE POLICY "Users can delete their own HFT bot reviews"
    ON public.hft_bot_reviews
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

    -- Service role can manage all
    CREATE POLICY "Service role can manage HFT bot reviews"
    ON public.hft_bot_reviews
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

    RAISE NOTICE 'Created policies for: hft_bot_reviews';
  END IF;
END $$;

-- ============================================
-- 7. HFT BOTS POLICIES
-- ============================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hft_bots') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Anyone can read active HFT bots" ON public.hft_bots;
    DROP POLICY IF EXISTS "Service role can manage HFT bots" ON public.hft_bots;

    -- Anyone can read active HFT bots
    CREATE POLICY "Anyone can read active HFT bots"
    ON public.hft_bots
    FOR SELECT
    USING (is_active = true);

    -- Service role can manage all HFT bots
    CREATE POLICY "Service role can manage HFT bots"
    ON public.hft_bots
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

    RAISE NOTICE 'Created policies for: hft_bots';
  END IF;
END $$;

-- ============================================
-- 8. TRADING SIGNALS POLICIES
-- ============================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'trading_signals') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Anyone can read active trading signals" ON public.trading_signals;
    DROP POLICY IF EXISTS "Service role can manage trading signals" ON public.trading_signals;

    -- Anyone can read active trading signals
    CREATE POLICY "Anyone can read active trading signals"
    ON public.trading_signals
    FOR SELECT
    USING (is_active = true);

    -- Service role can manage all trading signals
    CREATE POLICY "Service role can manage trading signals"
    ON public.trading_signals
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

    RAISE NOTICE 'Created policies for: trading_signals';
  END IF;
END $$;

-- ============================================
-- 9. PAYMENT SIGNIN JOBS POLICIES
-- ============================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payment_signin_jobs') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Service role can manage payment signin jobs" ON public.payment_signin_jobs;

    -- Only service role can access payment jobs
    CREATE POLICY "Service role can manage payment signin jobs"
    ON public.payment_signin_jobs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

    RAISE NOTICE 'Created policies for: payment_signin_jobs';
  END IF;
END $$;

-- ============================================
-- 10. AI MODELS POLICIES (if exists)
-- ============================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_models') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Anyone can read active AI models" ON public.ai_models;
    DROP POLICY IF EXISTS "Service role can manage AI models" ON public.ai_models;

    -- Anyone can read active AI models
    CREATE POLICY "Anyone can read active AI models"
    ON public.ai_models
    FOR SELECT
    USING (is_active = true);

    -- Service role can manage all AI models
    CREATE POLICY "Service role can manage AI models"
    ON public.ai_models
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

    RAISE NOTICE 'Created policies for: ai_models';
  END IF;
END $$;

-- ============================================
-- 11. AI SIGNAL JOBS POLICIES (if exists)
-- ============================================

DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_signal_jobs') THEN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Service role can manage AI signal jobs" ON public.ai_signal_jobs;

    -- Only service role can access AI signal jobs
    CREATE POLICY "Service role can manage AI signal jobs"
    ON public.ai_signal_jobs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

    RAISE NOTICE 'Created policies for: ai_signal_jobs';
  END IF;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'ai_models',
    'ai_signal_jobs',
    'ea_reviews',
    'escrow_transactions',
    'expert_advisors_backup',
    'expert_advisors',
    'hft_bot_reviews',
    'hft_bots',
    'trading_signals',
    'payment_signin_jobs'
  )
ORDER BY tablename;

-- Check all policies created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Summary
SELECT 
  'RLS Security Enabled!' as status,
  COUNT(*) as tables_secured
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true;
