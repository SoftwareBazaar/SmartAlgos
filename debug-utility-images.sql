-- Debug Utility Images - Check what's actually in the database
-- Run this in Supabase SQL Editor

-- Check all utilities and their image fields
SELECT 
  id,
  name,
  image,
  image_timestamp,
  CASE 
    WHEN image IS NULL THEN '❌ NULL'
    WHEN image = '' THEN '❌ EMPTY'
    WHEN image LIKE '%undefined%' THEN '❌ UNDEFINED'
    WHEN image LIKE 'https://%' THEN '✅ SUPABASE URL'
    WHEN image LIKE 'http://%' THEN '✅ HTTP URL'
    WHEN image LIKE '/uploads/%' THEN '⚠️ LOCAL PATH'
    ELSE '⚠️ UNKNOWN FORMAT'
  END as image_status,
  LENGTH(image) as image_length,
  updated_at
FROM utilities
ORDER BY name;

