-- Update EA Prices for London Breakout, Multi Indicator, and Gold Scalper
-- Weekly: $19, Monthly: $55, Lifetime: $399

-- Update London Breakout EA
UPDATE expert_advisors
SET 
  weekly_price = 19.00,
  monthly_price = 55.00,
  lifetime_price = 399.00,
  updated_at = NOW()
WHERE LOWER(name) LIKE '%london%breakout%';

-- Update Multi Indicator EA
UPDATE expert_advisors
SET 
  weekly_price = 19.00,
  monthly_price = 55.00,
  lifetime_price = 399.00,
  updated_at = NOW()
WHERE LOWER(name) LIKE '%multi%indicator%';

-- Update Gold Scalper EA
UPDATE expert_advisors
SET 
  weekly_price = 19.00,
  monthly_price = 55.00,
  lifetime_price = 399.00,
  updated_at = NOW()
WHERE LOWER(name) LIKE '%gold%scalper%';

-- Verify the updates
SELECT 
  id,
  name,
  weekly_price,
  monthly_price,
  lifetime_price,
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
  weekly_price,
  monthly_price,
  lifetime_price
FROM expert_advisors
ORDER BY name;
