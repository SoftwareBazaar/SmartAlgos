-- Fix Utilities Bucket MIME Types
-- Run this in Supabase SQL Editor to allow image uploads

-- Update utilities bucket to allow common image MIME types
UPDATE storage.buckets
SET 
  allowed_mime_types = ARRAY[
    'image/jpeg',    -- Standard JPEG
    'image/png',     -- PNG images
    'image/gif',     -- GIF images
    'image/webp',    -- WebP images
    'image/svg+xml', -- SVG images
    'image/bmp',     -- BMP images
    'image/tiff'     -- TIFF images
  ],
  public = true,  -- Ensure bucket is public
  file_size_limit = 10485760  -- 10MB limit
WHERE id = 'utilities';

-- If bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'utilities',
  'utilities',
  true,
  10485760,  -- 10MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff'
  ]
)
ON CONFLICT (id) 
DO UPDATE SET 
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff'
  ],
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

