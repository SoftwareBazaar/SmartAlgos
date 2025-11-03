-- Clear all utility images to start fresh
-- Run this in Supabase SQL Editor

-- Update all utilities to have NULL image
UPDATE utilities
SET 
  image = NULL,
  image_timestamp = NULL,
  updated_at = NOW();

-- Verify the update
SELECT 
  id,
  name,
  image,
  image_timestamp
FROM utilities
ORDER BY name;

