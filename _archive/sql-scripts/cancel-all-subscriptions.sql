-- Cancel All Subscriptions Script
-- This script cancels all active and pending subscriptions
-- Use this to reset the system before testing real payments

-- Update all subscriptions to cancelled status
UPDATE subscriptions
SET 
  status = 'cancelled',
  updated_at = NOW()
WHERE status IN ('active', 'pending', 'trialing');

-- Show results
SELECT 
  COUNT(*) as total_cancelled,
  status
FROM subscriptions
WHERE status = 'cancelled'
GROUP BY status;

-- Show remaining subscriptions by status
SELECT 
  status,
  COUNT(*) as count
FROM subscriptions
GROUP BY status
ORDER BY count DESC;

-- Optional: Delete all subscriptions completely (uncomment if you want to start fresh)
-- WARNING: This will permanently delete all subscription records
-- DELETE FROM subscriptions;
-- SELECT 'All subscriptions deleted' as message;

-- Show M-Pesa transactions that may need cleanup
SELECT 
  COUNT(*) as total_transactions,
  status,
  SUM(amount) as total_amount
FROM mpesa_transactions
GROUP BY status;

-- Optional: Reset M-Pesa transactions (uncomment if needed)
-- UPDATE mpesa_transactions SET status = 'cancelled' WHERE status = 'pending';

