-- Clear individual EA files but keep ZIP files
-- This ensures all users download the same ZIP file for testing

-- Show current state
SELECT 
  id,
  name,
  CASE WHEN ea_file IS NOT NULL THEN '✓' ELSE '✗' END as has_ea_file,
  CASE WHEN manual_file IS NOT NULL THEN '✓' ELSE '✗' END as has_manual,
  CASE WHEN settings_file IS NOT NULL THEN '✓' ELSE '✗' END as has_settings,
  CASE WHEN zip_file IS NOT NULL THEN '✓' ELSE '✗' END as has_zip
FROM expert_advisors
ORDER BY created_at DESC;

-- Clear individual files, keep only ZIP
UPDATE expert_advisors
SET 
  ea_file = NULL,
  manual_file = NULL,
  settings_file = NULL,
  updated_at = NOW()
WHERE ea_file IS NOT NULL 
   OR manual_file IS NOT NULL 
   OR settings_file IS NOT NULL;

-- Verify cleanup
SELECT 
  id,
  name,
  CASE WHEN ea_file IS NOT NULL THEN '✓' ELSE '✗' END as has_ea_file,
  CASE WHEN manual_file IS NOT NULL THEN '✓' ELSE '✗' END as has_manual,
  CASE WHEN settings_file IS NOT NULL THEN '✓' ELSE '✗' END as has_settings,
  CASE WHEN zip_file IS NOT NULL THEN '✓' ELSE '✗' END as has_zip
FROM expert_advisors
ORDER BY created_at DESC;

-- Show summary
SELECT 
  COUNT(*) as total_eas,
  COUNT(zip_file) as eas_with_zip,
  COUNT(ea_file) as eas_with_individual_files
FROM expert_advisors;
