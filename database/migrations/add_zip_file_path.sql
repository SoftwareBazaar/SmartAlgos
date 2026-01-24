-- Add zip_file_path column to expert_advisors table
-- This column stores the path/URL to the ZIP package containing all EA files
-- Used for auto-download after payment

ALTER TABLE expert_advisors 
ADD COLUMN IF NOT EXISTS zip_file_path TEXT;

-- Add comment to document the column
COMMENT ON COLUMN expert_advisors.zip_file_path IS 'Path or URL to ZIP package containing EA files (ex4/ex5, SET, manual PDF, screenshots) for auto-download after payment';
