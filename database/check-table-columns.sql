-- Check actual column names for all tables before enabling RLS
-- Run this FIRST to verify column names

-- Check ai_models columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'ai_models'
ORDER BY ordinal_position;

-- Check ai_signal_jobs columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'ai_signal_jobs'
ORDER BY ordinal_position;

-- Check ea_reviews columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'ea_reviews'
ORDER BY ordinal_position;

-- Check escrow_transactions columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'escrow_transactions'
ORDER BY ordinal_position;

-- Check expert_advisors columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'expert_advisors'
ORDER BY ordinal_position;

-- Check hft_bot_reviews columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'hft_bot_reviews'
ORDER BY ordinal_position;

-- Check hft_bots columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'hft_bots'
ORDER BY ordinal_position;

-- Check trading_signals columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'trading_signals'
ORDER BY ordinal_position;

-- Check payment_signin_jobs columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'payment_signin_jobs'
ORDER BY ordinal_position;
