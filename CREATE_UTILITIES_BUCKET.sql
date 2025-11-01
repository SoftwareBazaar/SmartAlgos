-- ============================================
-- CREATE UTILITIES BUCKET IN SUPABASE
-- ============================================
-- This creates the utilities bucket for storing
-- utility images and files permanently
-- ============================================

-- STEP 1: Create utilities bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'utilities',
  'utilities',
  true,  -- MUST be public for images to display
  52428800,  -- 50MB limit
  NULL  -- Allow all file types
)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,  -- Ensure it's public
  file_size_limit = 52428800,
  allowed_mime_types = NULL;

-- STEP 2: Create public read policy
CREATE POLICY IF NOT EXISTS "Public can view utilities"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'utilities');

-- STEP 3: Create authenticated upload policy
CREATE POLICY IF NOT EXISTS "Authenticated users can upload utilities"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'utilities');

-- STEP 4: Create authenticated update policy
CREATE POLICY IF NOT EXISTS "Authenticated users can update utilities"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'utilities')
WITH CHECK (bucket_id = 'utilities');

-- STEP 5: Create authenticated delete policy
CREATE POLICY IF NOT EXISTS "Authenticated users can delete utilities"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'utilities');

-- ============================================
-- VERIFICATION
-- Run this to verify bucket was created:
-- ============================================
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'utilities';

-- Should show:
-- id: utilities
-- name: utilities
-- public: true
-- file_size_limit: 52428800

-- ============================================
-- 💡 HOW TO RUN THIS:
-- ============================================
-- 1. Go to https://app.supabase.com
-- 2. Select your Algosmart project
-- 3. Click "SQL Editor" in left sidebar
-- 4. Click "New Query"
-- 5. Copy/paste this ENTIRE file
-- 6. Click "Run" button
-- 7. Check the output to verify success ✅
-- ============================================

