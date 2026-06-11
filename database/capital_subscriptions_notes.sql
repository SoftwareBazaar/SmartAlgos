-- Optional: ensure profiles supports Capital subscription tiers.
-- Run in Supabase SQL editor (project: ncikobfahncdgwvkfivz).

-- profiles.subscription_status values used by Smart Algos Capital:
--   free | research-pro | quant-pro
-- profiles.subscription_expires_at — ISO timestamp, 30 days from last Paystack research payment

-- paystack_payments already stores completed Capital payments with:
--   product_type = 'research_subscription'
--   metadata->>'product_id' = 'research-pro' | 'quant-pro'

-- No new table required; backend syncs paystack_payments → profiles by email on verify.
