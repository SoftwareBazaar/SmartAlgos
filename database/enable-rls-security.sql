-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS) FOR ALL TABLES
-- ============================================
-- This fixes the critical security warnings in Supabase
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE IF EXISTS public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_signal_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ea_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expert_advisors_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expert_advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hft_bot_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hft_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trading_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_signin_jobs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. AI MODELS POLICIES
-- ============================================

-- Check if table exists before creating policies
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_models') THEN
    -- Anyone can read active AI models
    EXECUTE 'CREATE POLICY "Anyone can read active AI models"
    ON public.ai_models
    FOR SELECT
    USING (is_active = true)';

    -- Service role can manage all AI models
    EXECUTE 'CREATE POLICY "Service role can manage AI models"
    ON public.ai_models
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true)';
  END IF;
END $$;

-- ============================================
-- 3. AI SIGNAL JOBS POLICIES
-- ============================================

-- Check if table exists before creating policies
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_signal_jobs') THEN
    -- Only service role can access AI signal jobs
    EXECUTE 'CREATE POLICY "Service role can manage AI signal jobs"
    ON public.ai_signal_jobs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true)';
  END IF;
END $$;

-- ============================================
-- 4. EA REVIEWS POLICIES
-- ============================================

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

-- ============================================
-- 5. ESCROW TRANSACTIONS POLICIES
-- ============================================

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

-- ============================================
-- 6. EXPERT ADVISORS POLICIES
-- ============================================

-- Anyone can read active EAs
CREATE POLICY "Anyone can read active expert advisors"
ON public.expert_advisors
FOR SELECT
USING (is_active = true AND status = 'active');

-- Service role can manage all EAs (for admin panel)
CREATE POLICY "Service role can manage expert advisors"
ON public.expert_advisors
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Creators can update their own EAs
CREATE POLICY "Creators can update their own expert advisors"
ON public.expert_advisors
FOR UPDATE
TO authenticated
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

-- ============================================
-- 7. EXPERT ADVISORS BACKUP POLICIES
-- ============================================

-- Only service role can access backup table
CREATE POLICY "Service role can access EA backup"
ON public.expert_advisors_backup
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 8. HFT BOT REVIEWS POLICIES
-- ============================================

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

-- ============================================
-- 9. HFT BOTS POLICIES
-- ============================================

-- Anyone can read active HFT bots
CREATE POLICY "Anyone can read active HFT bots"
ON public.hft_bots
FOR SELECT
USING (is_active = true AND status = 'active');

-- Service role can manage all HFT bots
CREATE POLICY "Service role can manage HFT bots"
ON public.hft_bots
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 10. TRADING SIGNALS POLICIES
-- ============================================

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

-- ============================================
-- 11. PAYMENT SIGNIN JOBS POLICIES
-- ============================================

-- Only service role can access payment jobs
CREATE POLICY "Service role can manage payment signin jobs"
ON public.payment_signin_jobs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

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
ORDER BY tablename, policyname;
