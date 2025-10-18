-- Update EA files in Supabase database
-- This adds ea_file, set_file, and manual_file URLs to existing EAs

-- Update Gold Scalper Pro v2.0 (ID: 1)
UPDATE expert_advisors
SET 
  ea_file = 'https://example.com/gold-scalper-pro-v2.ex4',
  set_file = 'https://example.com/gold-scalper-pro-v2.set',
  manual_file = 'https://example.com/gold-scalper-pro-v2.pdf',
  updated_at = NOW()
WHERE id = 1;

-- Update Multi Indicator Scalping Arrows EA (ID: 5)
UPDATE expert_advisors
SET 
  ea_file = 'https://example.com/multi-indicator-scalping.ex4',
  set_file = 'https://example.com/multi-indicator-scalping.set',
  manual_file = 'https://example.com/multi-indicator-scalping.pdf',
  updated_at = NOW()
WHERE id = 5;

-- Verify the updates
SELECT id, name, 
       CASE WHEN ea_file IS NOT NULL THEN 'YES' ELSE 'NO' END as has_ea_file,
       CASE WHEN set_file IS NOT NULL THEN 'YES' ELSE 'NO' END as has_set_file,
       CASE WHEN manual_file IS NOT NULL THEN 'YES' ELSE 'NO' END as has_manual_file
FROM expert_advisors
WHERE id IN (1, 5);

