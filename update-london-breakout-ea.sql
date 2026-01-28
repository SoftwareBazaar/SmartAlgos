-- Update London Breakout EA with complete details
-- Author: smartalgosts.com
-- Minimum Balance: $300
-- Lot Sizes: 0.05, 0.1, 0.5
-- Stop Loss: 20 pips

UPDATE expert_advisors
SET 
  -- Pricing
  price_weekly = 19.00,
  price_monthly = 55.00,
  price_yearly = 399.00,
  
  -- Author/Creator
  author = 'smartalgosts.com',
  creator = 'smartalgosts.com',
  
  -- Trading Parameters
  min_deposit = 300.00,
  recommended_balance = 300.00,
  
  -- Lot Size Settings
  min_lot_size = 0.05,
  max_lot_size = 0.5,
  recommended_lot_size = 0.1,
  
  -- Risk Management
  stop_loss_pips = 20,
  stop_loss = 20,
  
  -- Description Update (add trading specs)
  description = COALESCE(description, '') || E'\n\n' ||
    '📊 Trading Specifications:\n' ||
    '• Minimum Balance: $300\n' ||
    '• Recommended Lot Sizes: 0.05, 0.1, 0.5\n' ||
    '• Stop Loss: 20 pips (all lot sizes)\n' ||
    '• Strategy: London Breakout Scalping\n' ||
    '• Author: smartalgosts.com',
  
  -- Update timestamp
  updated_at = NOW()
  
WHERE LOWER(name) LIKE '%london%breakout%';

-- Verify the update
SELECT 
  id,
  name,
  author,
  price_weekly,
  price_monthly,
  price_yearly,
  min_deposit,
  min_lot_size,
  max_lot_size,
  recommended_lot_size,
  stop_loss_pips,
  updated_at
FROM expert_advisors
WHERE LOWER(name) LIKE '%london%breakout%';
