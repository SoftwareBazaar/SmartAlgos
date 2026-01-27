-- Check Portfolio PnL Data in Supabase
-- Run this in Supabase SQL Editor to verify your uploaded data

-- 1. Check if you have any PnL data
SELECT 
  user_id,
  COUNT(*) as total_entries,
  SUM(pnl) as total_pnl,
  MIN(date) as first_date,
  MAX(date) as last_date
FROM portfolio_pnl
GROUP BY user_id;

-- 2. Check your specific user's data (replace with your user_id)
-- To find your user_id, run: SELECT id, email FROM users WHERE email = 'your@email.com';
SELECT 
  date,
  pnl,
  cumulative_pnl,
  source,
  created_at
FROM portfolio_pnl
WHERE user_id = 'YOUR_USER_ID_HERE'  -- Replace with your actual user_id
ORDER BY date DESC
LIMIT 20;

-- 3. Check if cumulative_pnl is NULL (needs recalculation)
SELECT 
  COUNT(*) as entries_without_cumulative
FROM portfolio_pnl
WHERE cumulative_pnl IS NULL;

-- 4. If cumulative_pnl is NULL, run this to recalculate it:
-- (Replace YOUR_USER_ID_HERE with your actual user_id)
WITH ordered_pnl AS (
  SELECT 
    id,
    date,
    pnl,
    SUM(pnl) OVER (PARTITION BY user_id ORDER BY date) as cumulative
  FROM portfolio_pnl
  WHERE user_id = 'YOUR_USER_ID_HERE'  -- Replace with your actual user_id
  ORDER BY date
)
UPDATE portfolio_pnl
SET cumulative_pnl = ordered_pnl.cumulative,
    updated_at = NOW()
FROM ordered_pnl
WHERE portfolio_pnl.id = ordered_pnl.id;

-- 5. Verify the cumulative calculation worked
SELECT 
  date,
  pnl,
  cumulative_pnl,
  CASE 
    WHEN pnl > 0 THEN '🟢 Profit'
    WHEN pnl < 0 THEN '🔴 Loss'
    ELSE '⚫ Flat'
  END as status
FROM portfolio_pnl
WHERE user_id = 'YOUR_USER_ID_HERE'  -- Replace with your actual user_id
ORDER BY date DESC
LIMIT 10;

-- 6. Get the value that should show on dashboard
SELECT 
  MAX(cumulative_pnl) as portfolio_value,
  (SELECT pnl FROM portfolio_pnl WHERE user_id = 'YOUR_USER_ID_HERE' ORDER BY date DESC LIMIT 1) as today_pnl,
  COUNT(*) as total_trades,
  COUNT(CASE WHEN pnl > 0 THEN 1 END) as winning_trades,
  ROUND(COUNT(CASE WHEN pnl > 0 THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) as win_rate
FROM portfolio_pnl
WHERE user_id = 'YOUR_USER_ID_HERE';  -- Replace with your actual user_id

-- 7. Find your user_id if you don't know it
SELECT 
  id as user_id,
  email,
  first_name,
  last_name,
  created_at
FROM users
WHERE email = 'wanyagajohn73@gmail.com'  -- Replace with your email
LIMIT 1;
