-- Update All EAs with Correct Column Names
-- Based on actual database schema

-- 1. Update London Breakout EA with complete details
UPDATE expert_advisors
SET 
  -- Pricing
  price_weekly = 19.00,
  price_monthly = 55.00,
  price_yearly = 399.00,
  
  -- Creator/Author (use creator_name, not author)
  creator_name = 'smartalgosts.com',
  
  -- Trading Parameters
  min_deposit = 300.00,
  recommended_deposit = 300.00,
  
  -- Risk Management (no separate lot size columns, will add to description)
  stop_loss_enabled = true,
  take_profit_enabled = true,
  max_risk_per_trade = 2.0,  -- 2% risk per trade
  
  -- Description with trading specs
  description = COALESCE(description, 'London Breakout EA - Professional scalping strategy') || E'\n\n' ||
    '📊 TRADING SPECIFICATIONS:\n' ||
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' ||
    '• Minimum Balance: $300\n' ||
    '• Recommended Lot Sizes:\n' ||
    '  - Conservative: 0.05\n' ||
    '  - Standard: 0.1\n' ||
    '  - Aggressive: 0.5\n' ||
    '• Stop Loss: 20 pips (all lot sizes)\n' ||
    '• Strategy: London Session Breakout\n' ||
    '• Trading Style: Scalping\n' ||
    '• Author: smartalgosts.com\n' ||
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  
  -- Update timestamp
  updated_at = NOW()
  
WHERE LOWER(name) LIKE '%london%breakout%';

-- 2. Update Multi Indicator EA
UPDATE expert_advisors
SET 
  price_weekly = 19.00,
  price_monthly = 55.00,
  price_yearly = 399.00,
  creator_name = 'smartalgosts.com',
  updated_at = NOW()
WHERE LOWER(name) LIKE '%multi%indicator%';

-- 3. Update Gold Scalper EA
UPDATE expert_advisors
SET 
  price_weekly = 19.00,
  price_monthly = 55.00,
  price_yearly = 399.00,
  creator_name = 'smartalgosts.com',
  updated_at = NOW()
WHERE LOWER(name) LIKE '%gold%scalper%';

-- Verify all updates
SELECT 
  name,
  creator_name AS author,
  price_weekly AS "Weekly ($)",
  price_monthly AS "Monthly ($)",
  price_yearly AS "Yearly ($)",
  min_deposit AS "Min Deposit",
  recommended_deposit AS "Recommended",
  stop_loss_enabled AS "SL Enabled",
  max_risk_per_trade AS "Max Risk %"
FROM expert_advisors
WHERE LOWER(name) LIKE '%london%breakout%'
   OR LOWER(name) LIKE '%multi%indicator%'
   OR LOWER(name) LIKE '%gold%scalper%'
ORDER BY name;
