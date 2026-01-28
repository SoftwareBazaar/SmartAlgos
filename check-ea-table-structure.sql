-- Check the structure of expert_advisors table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'expert_advisors'
ORDER BY ordinal_position;

-- Show current EA data
SELECT * FROM expert_advisors LIMIT 3;
