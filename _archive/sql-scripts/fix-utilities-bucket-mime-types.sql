-- Fix Utilities Bucket MIME Types
-- Run this in Supabase SQL Editor to allow image uploads

-- Update utilities bucket to allow ALL MIME types (NULL = allow all)
UPDATE storage.buckets
SET 
  allowed_mime_types = NULL,  -- NULL = allow all MIME types
  public = true,  -- Ensure bucket is public
  file_size_limit = 10485760  -- 10MB limit
WHERE id = 'utilities';

-- If bucket doesn't exist, create it with NO MIME type restrictions
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'utilities',
  'utilities',
  true,
  10485760,  -- 10MB
  NULL  -- NULL = allow all MIME types (no restrictions)
)
ON CONFLICT (id) 
DO UPDATE SET 
  allowed_mime_types = NULL,  -- Remove MIME type restrictions
  public = true,
  file_size_limit = 10485760;

-- Verify the bucket configuration
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'utilities';

