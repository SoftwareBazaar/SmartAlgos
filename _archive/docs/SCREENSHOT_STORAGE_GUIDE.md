# 📸 Screenshot Storage Guide

## Overview
This document explains how EA screenshots are stored, processed, and displayed in the Smart Algos platform.

---

## 🗂️ Screenshot Storage Architecture

### Storage Location
Screenshots are stored in **Supabase Storage** under the `ea-screenshots` bucket.

### Storage Flow
```
Frontend Upload → Backend Processing → Supabase Storage → Database Reference → Frontend Display
```

---

## 📤 Upload Process

### 1. **Frontend (EnhancedEAEditor.js)**
When an admin uploads screenshots:
```javascript
// Screenshots are added to FormData
formData.screenshots.forEach(screenshot => {
  submitData.append('screenshots', screenshot);
});
```

### 2. **Backend (routes/eas.js)**
The backend receives and processes screenshots:

#### For New EAs (`POST /api/eas`):
```javascript
// Upload to Supabase Storage
for (let i = 0; i < req.files.screenshots.length; i++) {
  const screenshot = req.files.screenshots[i];
  
  const uploadResult = await supabaseStorage.uploadImage(
    screenshot.buffer,
    screenshot.originalname,
    screenshot.mimetype,
    'ea-screenshots' // Bucket name
  );
  
  screenshotUrls.push(uploadResult.url);
}

// Save URLs to database
eaData.screenshots = screenshotUrls;
```

#### For EA Updates (`PUT /api/eas/:id`):
```javascript
// Same process as above
req.uploadedScreenshots = screenshotUrls;
updates.screenshots = req.uploadedScreenshots;
```

### 3. **Supabase Storage Service**
```javascript
// services/supabaseStorage.js
await supabase.storage
  .from('ea-screenshots')
  .upload(filePath, buffer, {
    contentType: mimetype,
    cacheControl: '3600',
    upsert: false
  });

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('ea-screenshots')
  .getPublicUrl(filePath);
```

### 4. **Database (expert_advisors table)**
Screenshots are stored as an **array of URLs**:
```sql
screenshots: [
  "https://[supabase-url]/storage/v1/object/public/ea-screenshots/screenshot-1.jpg",
  "https://[supabase-url]/storage/v1/object/public/ea-screenshots/screenshot-2.jpg",
  "https://[supabase-url]/storage/v1/object/public/ea-screenshots/screenshot-3.jpg"
]
```

---

## 🖼️ Display Process

### Frontend Display (EADetail.js)
Screenshots are displayed in the EA details page:
```javascript
{ea.screenshots && ea.screenshots.length > 0 && (
  <div className="grid grid-cols-2 gap-4">
    {ea.screenshots.map((screenshot, index) => (
      <img 
        key={index}
        src={screenshot}
        alt={`Screenshot ${index + 1}`}
        className="w-full h-48 object-cover rounded-lg"
      />
    ))}
  </div>
)}
```

---

## ❓ FAQ

### Q: Where are screenshots physically stored?
**A:** Screenshots are stored in **Supabase Storage** in the `ea-screenshots` bucket. They are NOT stored on the server filesystem.

### Q: Are screenshots related to the "Features" field?
**A:** No, screenshots and features are separate:
- **Screenshots**: Visual images showing the EA in action (stored as array of URLs)
- **Features**: Text descriptions of EA capabilities (stored as array of strings)

Example:
```javascript
{
  name: "Gold Scalper Pro",
  screenshots: [
    "https://.../screenshot1.jpg",
    "https://.../screenshot2.jpg"
  ],
  features: [
    "Real-time market analysis",
    "Automated trade execution",
    "Risk management system"
  ]
}
```

### Q: What happens to old screenshots when updating?
**A:** 
- New screenshots are uploaded to Supabase Storage
- The `screenshots` array in the database is updated with new URLs
- Old screenshot files remain in storage (consider cleanup strategy)

### Q: Can members see screenshots?
**A:** Yes! Screenshots are public and visible to all users viewing EA details.

### Q: Can members upload screenshots?
**A:** No! Only admins can upload/edit EA screenshots through the admin dashboard.

### Q: What file formats are supported?
**A:** Common image formats: JPG, JPEG, PNG, GIF, WebP

### Q: What's the size limit for screenshots?
**A:** Maximum 5MB per screenshot (configurable in `routes/eas.js`)

### Q: How many screenshots can I upload?
**A:** Maximum 10 screenshots per EA (configurable in multer settings)

---

## 🔧 Configuration

### Change Screenshot Limits
In `routes/eas.js`:
```javascript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB per file
  }
});

// Maximum screenshots
upload.fields([
  { name: 'screenshots', maxCount: 10 } // Change this number
])
```

### Change Storage Bucket
In `routes/eas.js`, change the bucket name:
```javascript
await supabaseStorage.uploadImage(
  screenshot.buffer,
  screenshot.originalname,
  screenshot.mimetype,
  'your-bucket-name' // Change this
);
```

---

## 🐛 Troubleshooting

### Screenshots not saving?
1. Check Supabase Storage configuration
2. Verify bucket permissions (should be public)
3. Check file size limits
4. Review backend logs for upload errors

### Screenshots not displaying?
1. Verify URLs are valid in database
2. Check Supabase Storage bucket is public
3. Verify CORS settings in Supabase
4. Check browser console for CORS errors

### Getting PGRST116 errors?
- This means the EA doesn't exist in the database
- The fallback system will use mock data
- Screenshots will be logged but not permanently saved

---

## 📊 Data Flow Diagram

```
┌─────────────────┐
│  Admin Upload   │
│  (Frontend)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FormData       │
│  Processing     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend Route  │
│  (routes/eas)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase       │
│  Storage Upload │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Get Public URL │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Save URL Array │
│  to Database    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Frontend       │
│  Display Images │
└─────────────────┘
```

---

## 🔐 Security

- Screenshots are stored with unique filenames (timestamp + random string)
- Only admins can upload screenshots
- Public read access for displaying to users
- File type validation prevents malicious uploads
- Size limits prevent storage abuse

---

## 💡 Best Practices

1. **Optimize Images**: Compress before upload to save storage
2. **Use Descriptive Names**: Help identify screenshots later
3. **Limit Count**: 3-5 screenshots per EA is usually sufficient
4. **Show Key Features**: Choose screenshots that highlight EA capabilities
5. **Clean Up Old Screenshots**: Periodically remove unused files from storage

---

## 🚀 Future Enhancements

- [ ] Automatic image optimization
- [ ] Screenshot thumbnail generation
- [ ] Screenshot reordering via drag-and-drop
- [ ] Screenshot captions/descriptions
- [ ] Automatic cleanup of orphaned screenshots
- [ ] CDN integration for faster loading

---

**Last Updated**: January 2025
**Version**: 1.0

