-- Update all EA prices to $19/month
UPDATE expert_advisors 
SET 
  price_monthly = 19.00,
  price_weekly = 5.00,
  price_yearly = 190.00,
  updated_at = NOW()
WHERE is_active = true;

-- Verify the update
SELECT id, name, price_monthly, price_weekly, price_yearly, updated_at 
FROM expert_advisors 
WHERE is_active = true
ORDER BY created_at DESC;
