-- SQL Script to set up Payment and Subscription tables in Supabase

-- 1. Crypto Payments Table
CREATE TABLE IF NOT EXISTS public.crypto_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount_usd DECIMAL(10, 2) NOT NULL,
    crypto_currency TEXT NOT NULL,
    crypto_amount TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    network TEXT NOT NULL,
    product_type TEXT DEFAULT 'ea_subscription',
    product_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending', -- pending, confirmed, expired
    tx_hash TEXT,
    confirmations INTEGER DEFAULT 0,
    confirmed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Paystack Payments Table
CREATE TABLE IF NOT EXISTS public.paystack_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    amount_usd DECIMAL(10, 2) NOT NULL,
    amount_ngn DECIMAL(20, 2),
    paystack_reference TEXT UNIQUE,
    access_code TEXT,
    product_type TEXT DEFAULT 'ea_subscription',
    product_id UUID NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, confirmed, failed
    metadata JSONB DEFAULT '{}'::jsonb,
    paystack_data JSONB DEFAULT '{}'::jsonb,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. M-Pesa Transactions Table
CREATE TABLE IF NOT EXISTS public.mpesa_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    merchant_request_id TEXT,
    checkout_request_id TEXT UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    phone_number TEXT NOT NULL,
    account_reference TEXT,
    transaction_desc TEXT,
    status TEXT DEFAULT 'pending', -- pending, completed, failed
    result_code TEXT,
    result_desc TEXT,
    mpesa_receipt_number TEXT UNIQUE,
    transaction_date TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    callback_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Subscriptions Table (Update if already exists to include payment_reference)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ea_id UUID NOT NULL, -- references expert_advisors.id
    subscription_type TEXT NOT NULL, -- weekly, monthly, quarterly, yearly
    payment_method TEXT NOT NULL, -- crypto, paystack, mpesa
    payment_reference TEXT NOT NULL, -- references payment table ID
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'active', -- active, cancelled, expired
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    has_access BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Download Logs (Optional but recommended)
CREATE TABLE IF NOT EXISTS public.download_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ea_id UUID NOT NULL,
    file_type TEXT NOT NULL, -- ea_file, set_file, manual
    downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.crypto_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paystack_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mpesa_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policies (Allow users to see their own records)
CREATE POLICY "Users can view their own crypto payments" ON public.crypto_payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own paystack payments" ON public.paystack_payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own mpesa transactions" ON public.mpesa_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own download logs" ON public.download_logs
    FOR SELECT USING (auth.uid() = user_id);
