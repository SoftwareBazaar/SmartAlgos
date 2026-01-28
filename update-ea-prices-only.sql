-- Simple price update for all 3 EAs
-- Only updates columns we know exist: price_weekly, price_monthly, price_yearly

-- Update all three EAs at once
UPDATE expert_advisors
SET 
  price_weekly = 19.00,
  price_monthly = 55.00,
  price_yearly = 399.00,
  updated_at = NOW()
WHERE LOWER(name) LIKE '%london%breakout%'
   OR LOWER(name) LIKE '%multi%indicator%'
   OR LOWER(name) LIKE '%gold%scalper%';

-- Verify the updates
SELECT 
  id,
  name,
  price_weekly,
  price_monthly,
  price_yearly,
  updated_at
FROM expert_advisors
WHERE LOWER(name) LIKE '%london%breakout%'
   OR LOWER(name) LIKE '%multi%indicator%'
   OR LOWER(name) LIKE '%gold%scalper%'
ORDER BY name;

-- Show all EAs with prices
SELECT 
  id,
  name,
  price_weekly AS "Weekly ($)",
  price_monthly AS "Monthly ($)",
  price_yearly AS "Yearly ($)"
FROM expert_advisors
ORDER BY name;
