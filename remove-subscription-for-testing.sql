-- Remove subscription to test M-Pesa payment flow
-- This will deactivate your active subscription so you can test the payment process

-- Step 1: View your current subscriptions
SELECT 
  id,
  user_id,
  ea_id,
  subscription_type,
  status,
  created_at
FROM subscriptions
WHERE user_id IN (
  SELECT id FROM users_accounts 
  WHERE email = 'wanyagajohn73@gmail.com'
)
ORDER BY created_at DESC;

-- Step 2: Delete the subscription (UNCOMMENT THIS AFTER CHECKING ABOVE)
-- DELETE FROM subscriptions
-- WHERE user_id IN (
--   SELECT id FROM users_accounts 
--   WHERE email = 'wanyagajohn73@gmail.com'
-- );

-- Step 3: Verify it's gone
-- SELECT COUNT(*) as remaining_subscriptions
-- FROM subscriptions
-- WHERE user_id IN (
--   SELECT id FROM users_accounts 
--   WHERE email = 'wanyagajohn73@gmail.com'
-- );

-- ✅ After running this, you'll be able to test the M-Pesa payment flow!

