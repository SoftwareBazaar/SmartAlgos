-- Fix EA Files - Add missing file paths to database
-- This updates both EAs to have complete file sets

-- Update EA #5 (Multi Indicator Scalping Arrows)
UPDATE expert_advisors
SET 
  ea_file_path = 'https://example.com/multi-indicator-scalping.ex4',
  manual_file_path = 'https://example.com/multi-indicator-scalping.pdf',
  updated_at = NOW()
WHERE id = 5;

-- Update EA #1 (Gold Scalper Pro v2.0)  
UPDATE expert_advisors
SET 
  ea_file_path = 'https://example.com/gold-scalper-pro-v2.ex4',
  manual_file_path = 'https://example.com/gold-scalper-pro-v2.pdf',
  updated_at = NOW()
WHERE id = 1;

-- Verify the updates
SELECT 
  id,
  name,
  CASE WHEN ea_file_path IS NOT NULL THEN '✅ Has EA File' ELSE '❌ Missing' END as ea_file,
  CASE WHEN set_file_path IS NOT NULL THEN '✅ Has Set File' ELSE '❌ Missing' END as set_file,
  CASE WHEN manual_file_path IS NOT NULL THEN '✅ Has Manual' ELSE '❌ Missing' END as manual
FROM expert_advisors
WHERE id IN (1, 5)
ORDER BY id;

