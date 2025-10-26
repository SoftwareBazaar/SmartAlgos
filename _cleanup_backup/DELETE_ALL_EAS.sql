-- DELETE ALL EAs FROM DATABASE
-- Run this in Supabase SQL Editor to clean up test EAs

-- Step 1: See what will be deleted
SELECT id, name, status, image FROM expert_advisors ORDER BY id;

-- Step 2: Delete all EAs
DELETE FROM expert_advisors;

-- Step 3: Reset ID sequence to start from 1
ALTER SEQUENCE expert_advisors_id_seq RESTART WITH 1;

-- Step 4: Verify deletion
SELECT COUNT(*) as remaining_eas FROM expert_advisors;

-- Success! Next EA will have ID = 1

