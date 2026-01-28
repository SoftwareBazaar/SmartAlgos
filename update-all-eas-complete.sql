-- Update All EAs with Complete Information
-- Author: smartalgosts.com for all EAs
-- Prices: Weekly $19, Monthly $55, Yearly $399

-- 1. Update London Breakout EA
UPDATE expert_advisors
SET 
  price_weekly = 19.00,
  price_monthly = 55.00,
  price_yearly = 399.00,
  author = 'smartalgosts.com',
  creator = 'smartalgosts.com',
  min_deposit = 300.00,
  min_lot_size = 0.05,
  max_lot_size = 0.5,
  recommended_lot_size = 0.1,
  stop_loss_pips = 20,
  updated_at = NOW()
WHERE LOWER(name) LIKE '%london%breakout%';

-- 2. Update Multi Indicator EA
UPDATE expert_advisors
SET 
  price_weekly = 19.00,
  price_monthly = 55.00,
  price_yearly = 399.00,
  author = 'smartalgosts.com',
  creator = 'smartalgosts.com',
  updated_at = NOW()
WHERE LOWER(name) LIKE '%multi%indicator%';

-- 3. Update Gold Scalper EA
UPDATE expert_advisors
SET 
  price_weekly = 19.00,
  price_monthly = 55.00,
  price_yearly = 399.00,
  author = 'smartalgosts.com',
  creator = 'smartalgosts.com',
  updated_at = NOW()
WHERE LOWER(name) LIKE '%gold%scalper%';

-- Verify all updates
SELECT 
  name,
  author,
  price_weekly,
  price_monthly,
  price_yearly,
  min_deposit,
  min_lot_size,
  max_lot_size,
  stop_loss_pips
FROM expert_advisors
WHERE LOWER(name) LIKE '%london%breakout%'
   OR LOWER(name) LIKE '%multi%indicator%'
   OR LOWER(name) LIKE '%gold%scalper%'
ORDER BY name;
