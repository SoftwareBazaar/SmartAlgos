# Find Valid Category for Utilities

## The Problem
The `utilities` table has a check constraint on the `category` column that only allows specific values. We tried `'indicator'` but it's not allowed.

## Step 1: Find Valid Categories

Run this in Supabase SQL Editor:

```sql
-- Check the category constraint to see valid values
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'utilities'::regclass
  AND conname LIKE '%category%';

-- Also check existing utilities to see what categories are used
SELECT DISTINCT category 
FROM utilities 
ORDER BY category;
```

This will show you:
1. The exact constraint definition (which values are allowed)
2. What categories are currently being used in your database

## Step 2: Update the SQL File

Once you know the valid categories, I'll update `add-volatility-pivots-utility.sql` with the correct category.

## Common Category Values (Try These)

Based on typical utility systems, valid categories might be:
- `'trading-tool'` (I've already updated the SQL to try this)
- `'calculator'`
- `'analysis'`
- `'risk-management'`
- `'education'`
- `'market-data'`
- `'technical-indicator'`

## Quick Test

Try running the updated `add-volatility-pivots-utility.sql` now - I changed it to `'trading-tool'`.

If that fails, run the constraint check query above and tell me what categories are valid.
