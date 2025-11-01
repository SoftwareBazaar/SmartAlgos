# 🔧 Fix Utility Images Disappearing - CRITICAL SETUP

## ❌ Problem
Utility images disappear after upload because there's no Supabase storage bucket for utilities!

## ✅ Solution
Run this SQL in Supabase to create the utilities bucket.

---

## 🚀 RUN THIS SQL NOW IN SUPABASE

### **STEP 1: Go to Supabase SQL Editor**
1. Open: https://app.supabase.com
2. Select your **Algosmart** project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"** button

### **STEP 2: Copy & Paste This SQL**

Open file: `fix-supabase-storage-buckets.sql` and copy the ENTIRE file, then paste into Supabase SQL Editor.

**OR** use this simpler version:

```sql
-- CREATE UTILITIES BUCKET
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'utilities',
  'utilities',
  true,
  52428800,
  NULL
)
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = NULL;

-- CREATE POLICIES
CREATE POLICY IF NOT EXISTS "Public can view utilities"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'utilities');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload utilities"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'utilities');

CREATE POLICY IF NOT EXISTS "Authenticated users can update utilities"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'utilities')
WITH CHECK (bucket_id = 'utilities');

CREATE POLICY IF NOT EXISTS "Authenticated users can delete utilities"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'utilities');

-- VERIFY IT WORKED
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'utilities';
```

### **STEP 3: Run the SQL**
1. Click the **"Run"** button (or press Ctrl+Enter)
2. Look for success messages ✅
3. Check the output - should show `utilities` bucket with `public = true`

---

## ✅ What This Does
- ✅ Creates `utilities` bucket in Supabase Storage
- ✅ Makes it public (so images display)
- ✅ Sets 50MB file size limit
- ✅ Creates upload/update/delete policies
- ✅ Fixes disappearing images permanently!

---

## 🎯 After Running SQL
1. Railway will auto-redeploy (already pushed to GitHub)
2. Test by uploading a utility image
3. Image should persist across logins!

---

## 📞 If It Doesn't Work
Run the verification query at the end of the SQL to check if bucket was created.

**Expected Result:**
```
id: utilities
name: utilities  
public: true
```

If `public` is `false`, run this:
```sql
UPDATE storage.buckets 
SET public = true 
WHERE id = 'utilities';
```

**Done!** 🎉

