# 🚀 Quick Start: ZIP File Auto-Download

## ⚡ 3 Steps to Get It Working

### Step 1: Database Migration (2 minutes)

1. Open Supabase Dashboard
2. Click "SQL Editor" (left sidebar)
3. Click "New Query"
4. Paste this:

```sql
ALTER TABLE expert_advisors 
ADD COLUMN IF NOT EXISTS zip_file_path TEXT;
```

5. Click "Run"
6. ✅ Done!

---

### Step 2: Create Storage Bucket (1 minute)

1. In Supabase Dashboard, click "Storage"
2. Click "Create a new bucket"
3. Enter name: `ea-packages`
4. Toggle "Public bucket" to ON
5. Click "Create bucket"
6. ✅ Done!

---

### Step 3: Test It (5 minutes)

#### A. Upload ZIP as Admin

1. Go to your admin panel: `https://your-site.com/admin`
2. Click "EAs" tab
3. Click "Add EA" or edit existing
4. Look for green section: "📦 Complete EA Package (ZIP)"
5. Click "Choose File" and select a ZIP
6. Fill in EA details
7. Click "Save"
8. ✅ ZIP uploaded!

#### B. Test Download as User

1. Open site in incognito/private window
2. Register/login as regular user
3. Go to EA Marketplace
4. Click "Subscribe" on the EA you just uploaded
5. Complete payment (test mode)
6. **Watch:** ZIP file should auto-download!
7. ✅ Working!

---

## 🎯 What Should Happen

### When Admin Uploads ZIP:
- File uploads to Supabase Storage
- `zip_file_path` saved in database
- Green checkmark shows success

### When User Pays:
- Payment success dialog appears
- ZIP file automatically downloads
- File saves to Downloads folder
- Filename: `EA_Name_Package.zip`

---

## 🐛 Quick Troubleshooting

### "Column does not exist" error?
→ Run Step 1 (database migration)

### "Bucket not found" error?
→ Run Step 2 (create storage bucket)

### ZIP not downloading?
→ Check browser console for errors
→ Verify ZIP was uploaded (check database)
→ Try different browser

### Upload fails?
→ Check file is actually .zip
→ Check file size (max 100MB)
→ Check internet connection

---

## 📦 Creating a ZIP Package

Your ZIP should contain:

```
EA_Name_Package.zip
├── EA_Name.ex4          # The EA file
├── EA_Name.set          # Settings (optional)
├── Manual.pdf           # User guide (optional)
└── screenshots/         # Images (optional)
```

**Quick tip:** Right-click files → "Send to" → "Compressed (zipped) folder"

---

## ✅ Success Checklist

- [ ] Database migration run
- [ ] Storage bucket created
- [ ] Admin can upload ZIP
- [ ] ZIP shows in database
- [ ] User payment triggers download
- [ ] ZIP downloads to Downloads folder
- [ ] File can be extracted

---

## 🎉 You're Done!

Once all 3 steps are complete, your ZIP auto-download system is live!

Users will love the professional experience of getting everything in one file.

---

**Need Help?** Check `ZIP_DOWNLOAD_READY_TO_TEST.md` for detailed instructions.

**Questions?** All code is deployed and ready - just need those 2 database steps!
