-- ============================================
-- SUPABASE SUBSCRIPTIONS TABLE SETUP
-- Copy and paste this entire file into Supabase SQL Editor
-- ============================================

-- Step 1: Drop the table if it exists (to start fresh)
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- Step 2: Create the subscriptions table with all required columns
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

-- Step 3: Create indexes for better performance
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_ea_id ON public.subscriptions(ea_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_payment_reference ON public.subscriptions(payment_reference);

-- Step 4: Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Step 5: Create security policies
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

-- Done! ✅

