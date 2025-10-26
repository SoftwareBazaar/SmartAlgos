-- ============================================
-- ✅ SIMPLE SQL FIX FOR IMAGE DISPLAY
-- Copy and run this in Supabase SQL Editor
-- ============================================

-- STEP 1: Make storage buckets public
UPDATE storage.buckets 
SET public = true 
WHERE id IN ('ea-images', 'ea-screenshots', 'ea-files');

-- STEP 2: Drop any existing policies (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public can view EA images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view EA screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Public can view EA files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload EA images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload EA screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload EA files" ON storage.objects;

-- STEP 3: Create new policies (without IF NOT EXISTS)
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

-- STEP 4: Verify buckets are now public
SELECT id, name, public 
FROM storage.buckets 
WHERE id IN ('ea-images', 'ea-screenshots', 'ea-files');

-- All three should show public = true ✅

