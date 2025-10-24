-- Fix Supabase Storage Buckets for Image Display
-- This script ensures buckets exist, are public, and have proper policies

-- ========================================
-- 1. CREATE STORAGE BUCKETS (if not exist)
-- ========================================

-- Create ea-images bucket for EA cover images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ea-images',
  'ea-images',
  true,  -- MUST be public for images to display
  10485760,  -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,  -- Ensure it's public
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

-- Create ea-screenshots bucket for EA screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ea-screenshots',
  'ea-screenshots',
  true,  -- MUST be public for images to display
  10485760,  -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,  -- Ensure it's public
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Create ea-files bucket for EA downloadable files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ea-files',
  'ea-files',
  true,  -- Public for easy downloads
  52428800,  -- 50MB limit
  NULL  -- Allow all file types
)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,  -- Ensure it's public
  file_size_limit = 52428800,
  allowed_mime_types = NULL;

-- ========================================
-- 2. DROP EXISTING POLICIES (clean slate)
-- ========================================

DROP POLICY IF EXISTS "Public can view EA images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view EA screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Public can view EA files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload EA images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload EA screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload EA files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update EA images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update EA screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update EA files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete EA images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete EA screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete EA files" ON storage.objects;

-- Drop any existing policies that might conflict
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;

-- ========================================
-- 3. CREATE NEW STORAGE POLICIES
-- ========================================

-- PUBLIC READ: Allow anyone to view images (CRITICAL for display)
CREATE POLICY "Public can view EA images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ea-images');

CREATE POLICY "Public can view EA screenshots"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ea-screenshots');

CREATE POLICY "Public can view EA files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ea-files');

-- AUTHENTICATED UPLOAD: Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload EA images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ea-images');

CREATE POLICY "Authenticated users can upload EA screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ea-screenshots');

CREATE POLICY "Authenticated users can upload EA files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ea-files');

-- AUTHENTICATED UPDATE: Allow authenticated users to update
CREATE POLICY "Authenticated users can update EA images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ea-images')
WITH CHECK (bucket_id = 'ea-images');

CREATE POLICY "Authenticated users can update EA screenshots"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ea-screenshots')
WITH CHECK (bucket_id = 'ea-screenshots');

CREATE POLICY "Authenticated users can update EA files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ea-files')
WITH CHECK (bucket_id = 'ea-files');

-- AUTHENTICATED DELETE: Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete EA images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ea-images');

CREATE POLICY "Authenticated users can delete EA screenshots"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ea-screenshots');

CREATE POLICY "Authenticated users can delete EA files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ea-files');

-- ========================================
-- 4. VERIFY SETUP
-- ========================================

-- Check bucket configuration
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE name IN ('ea-images', 'ea-screenshots', 'ea-files')
ORDER BY name;

-- Check storage policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;

