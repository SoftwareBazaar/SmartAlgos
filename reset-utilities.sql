-- Reset Utilities to Only Lot Size Calculator and News Pro
-- Run this in Supabase SQL Editor

-- Step 1: Delete all utilities except Lot Size Calculator and News Pro
DELETE FROM utilities 
WHERE name NOT IN ('Lot Size Calculator', 'News Pro');

-- Step 2: Update or insert Lot Size Calculator
-- First check if it exists, then update or insert
UPDATE utilities
SET
  category = 'Risk Management',
  description = 'Advanced lot size calculator for precise position sizing based on risk management principles. Calculate optimal lot sizes for different account balances, risk percentages, and trading strategies.',
  version = '1.0',
  size = '2.5 MB',
  is_active = true,
  features = ARRAY['Account Balance Input', 'Risk Percentage Calculator', 'Stop Loss Distance Calculation'],
  updated_at = NOW()
WHERE name = 'Lot Size Calculator';

-- If no row was updated, insert it
INSERT INTO utilities (
  name,
  category,
  description,
  version,
  size,
  is_active,
  features,
  downloads,
  created_at,
  updated_at
)
SELECT
  'Lot Size Calculator',
  'Risk Management',
  'Advanced lot size calculator for precise position sizing based on risk management principles. Calculate optimal lot sizes for different account balances, risk percentages, and trading strategies.',
  '1.0',
  '2.5 MB',
  true,
  ARRAY['Account Balance Input', 'Risk Percentage Calculator', 'Stop Loss Distance Calculation'],
  0,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM utilities WHERE name = 'Lot Size Calculator'
);

-- Step 3: Update or insert News Pro
-- First check if it exists, then update or insert
UPDATE utilities
SET
  category = 'Market Analysis',
  description = 'Track important economic events and news releases that impact forex markets. Get real-time economic calendar updates with impact level indicators and currency pair filtering.',
  version = '1.8.5',
  size = '1.8 MB',
  is_active = true,
  features = ARRAY['Real-time economic events', 'Impact level indicators', 'Currency pair filtering'],
  updated_at = NOW()
WHERE name = 'News Pro';

-- If no row was updated, insert it
INSERT INTO utilities (
  name,
  category,
  description,
  version,
  size,
  is_active,
  features,
  downloads,
  created_at,
  updated_at
)
SELECT
  'News Pro',
  'Market Analysis',
  'Track important economic events and news releases that impact forex markets. Get real-time economic calendar updates with impact level indicators and currency pair filtering.',
  '1.8.5',
  '1.8 MB',
  true,
  ARRAY['Real-time economic events', 'Impact level indicators', 'Currency pair filtering'],
  0,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM utilities WHERE name = 'News Pro'
);

-- Step 4: Verify the results
SELECT 
  id,
  name,
  category,
  version,
  is_active,
  downloads
FROM utilities
ORDER BY name;

