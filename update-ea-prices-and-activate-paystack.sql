-- Update EA Prices for London Breakout, Multi Indicator, and Gold Scalper
-- Weekly: $19, Monthly: $55, Yearly (Lifetime): $399

-- Update London Breakout EA
UPDATE expert_advisors
SET 
  price_weekly = 19.00,
  price_monthly = 55.00,
  price_yearly = 399.00,
  updated_at = NOW()
WHERE LOWER(name) LIKE '%london%breakout%';

-- Update Multi Indicator EA
UPDATE expert_advisors
SET 
  price_weekly = 19.00,
  price_monthly = 55.00,
  price_yearly = 399.00,
  updated_at = NOW()
WHERE LOWER(name) LIKE '%multi%indicator%';

-- Update Gold Scalper EA
UPDATE expert_advisors
SET 
  price_weekly = 19.00,
  price_monthly = 55.00,
  price_yearly = 399.00,
  updated_at = NOW()
WHERE LOWER(name) LIKE '%gold%scalper%';

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

-- Show all EA prices
SELECT 
  id,
  name,
  price_weekly,
  price_monthly,
  price_yearly
FROM expert_advisors
ORDER BY name;
