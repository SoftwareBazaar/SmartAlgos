-- Add Volatility Pivots by SmartAlgos TradingView Indicator
-- Includes required version column
-- Run this in Supabase SQL Editor

-- First, delete the old entry if it exists (without download_url)
DELETE FROM utilities 
WHERE name = 'Volatility Pivots by SmartAlgos' 
  AND download_url IS NULL;

-- Add Volatility Pivots utility with TradingView link
INSERT INTO utilities (
  name,
  description,
  category,
  version,
  download_url,
  is_active
) VALUES (
  'Volatility Pivots by SmartAlgos',
  'FREE TradingView Indicator - Identifies high-probability market turning points by combining price expansion, volatility, and key structural zones. Highlights buy/sell opportunities when multiple conditions align: momentum strength, trend direction, volume activity, and proximity to support/resistance. Signals at key zones are especially powerful. Each signal is graded 1-8 (grades 5-8 are highest quality). Filters out noise and focuses on meaningful price movements. Works on all trading pairs.',
  'Market Analysis',
  '1.0',
  'https://www.tradingview.com/script/tuSHvcwO-Volatility-Pivots-by-SmartAlgos/',
  true
);

-- Verify the utility was added
SELECT 
  id,
  name,
  category,
  version,
  is_active,
  description
FROM utilities
WHERE name LIKE '%Volatility Pivots%';
