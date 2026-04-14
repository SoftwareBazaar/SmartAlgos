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
