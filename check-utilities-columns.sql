-- First, check what columns exist in utilities table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'utilities'
ORDER BY ordinal_position;
