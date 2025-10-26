-- ============================================
-- 🔥 RUN THIS IN SUPABASE SQL EDITOR NOW
-- ============================================
-- This will make your image buckets public
-- so images display correctly
-- ============================================

-- STEP 1: Make storage buckets public
UPDATE storage.buckets 
SET public = true 
WHERE id IN ('ea-images', 'ea-screenshots', 'ea-files');

-- STEP 2: Grant public read access
CREATE POLICY IF NOT EXISTS "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('ea-images', 'ea-screenshots', 'ea-files'));

-- STEP 3: Allow authenticated users to upload
CREATE POLICY IF NOT EXISTS "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('ea-images', 'ea-screenshots', 'ea-files') 
  AND auth.role() = 'authenticated'
);

-- STEP 4: Allow authenticated users to update their uploads
CREATE POLICY IF NOT EXISTS "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (
  bucket_id IN ('ea-images', 'ea-screenshots', 'ea-files') 
  AND auth.role() = 'authenticated'
);

-- STEP 5: Allow authenticated users to delete their uploads
CREATE POLICY IF NOT EXISTS "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('ea-images', 'ea-screenshots', 'ea-files') 
  AND auth.role() = 'authenticated'
);

-- ============================================
-- VERIFICATION QUERY
-- Run this after to verify buckets are public:
-- ============================================
SELECT id, name, public 
FROM storage.buckets 
WHERE id IN ('ea-images', 'ea-screenshots', 'ea-files');

-- All three should show public = true

-- ============================================
-- 💡 HOW TO RUN THIS:
-- ============================================
-- 1. Go to https://app.supabase.com
-- 2. Select your Algosmart project
-- 3. Click "SQL Editor" in left sidebar
-- 4. Click "New Query"
-- 5. Copy/paste this ENTIRE file
-- 6. Click "Run" button (or press Ctrl+Enter)
-- 7. Wait for "Success" message
-- 8. Refresh your admin dashboard
-- 9. Images should now display! ✅
-- ============================================

