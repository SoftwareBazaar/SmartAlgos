# Clear EA Files - Keep Only ZIP Files

## Purpose
Clear individual EA files (ea_file, manual_file, settings_file) but keep ZIP files so all your friends download the same file when testing the payment and download system.

## Option 1: Using Node.js Script (Recommended)

```bash
node clear-ea-files-keep-zip.js
```

This will:
- ✅ Keep all ZIP files intact
- 🗑️ Remove individual EA files
- 🗑️ Remove manual PDF files  
- 🗑️ Remove settings files
- 📊 Show detailed progress for each EA

## Option 2: Using SQL (Direct Database)

1. Go to your Supabase Dashboard
2. Open SQL Editor
3. Copy and paste the contents of `clear-ea-files-keep-zip.sql`
4. Run the query

The SQL script will:
- Show current state of all EAs
- Clear individual files
- Keep ZIP files
- Show verification results
- Display summary statistics

## What Happens After Cleanup?

✅ **For Users:**
- All users will download the same ZIP file for each EA
- Perfect for testing with friends
- Consistent download experience

✅ **For Admin:**
- Cleaner database
- Only one file type to manage (ZIP)
- Easier to update EAs (just replace the ZIP)

## Verification

After running the cleanup, check:

1. **In Admin Panel:**
   - Go to Admin Dashboard → EA Management
   - Check that EAs still have ZIP files
   - Individual files should be cleared

2. **Test Download:**
   - Make a test purchase
   - Download should work with ZIP file
   - All friends get the same file

## Rollback (If Needed)

If you need to restore individual files:
1. Upload new ZIP files through Admin Panel
2. The system will automatically extract and populate individual files
3. Or manually upload individual files through EA Editor

## Notes

- ⚠️ This action cannot be undone automatically
- 💾 Make sure you have backup ZIP files
- 🎯 Perfect for launch testing phase
- 🔄 You can always re-upload files later

## Current Status

After running this cleanup:
- Individual files: ❌ Cleared
- ZIP files: ✅ Retained
- Download system: ✅ Working
- Ready for testing: ✅ Yes
