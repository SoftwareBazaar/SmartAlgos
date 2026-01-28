-- Find all columns in expert_advisors table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'expert_advisors'
ORDER BY ordinal_position;
