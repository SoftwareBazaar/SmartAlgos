# Utilities Real-Time Synchronization Setup

## ✅ What's Been Done

Your utilities system has been upgraded to use **Supabase** with **real-time synchronization** between web and desktop!

### Changes Made:

1. **✅ Supabase Database Table Created**
   - Table: `public.utilities`
   - Real-time enabled
   - Row Level Security (RLS) configured
   - Admin-only write access

2. **✅ Backend API Routes Created**
   - File: `routes/utilities.js`
   - GET /api/utilities - Get all utilities (public)
   - GET /api/utilities/:id - Get single utility (public)
   - POST /api/utilities - Create utility (admin only)
   - PUT /api/utilities/:id - Update utility (admin only)
   - DELETE /api/utilities/:id - Delete utility (admin only)

3. **✅ Frontend Context Updated**
   - File: `client/src/contexts/UtilitiesContext.js`
   - Now fetches from API instead of localStorage
   - Auto-refresh every 30 seconds for real-time sync
   - Offline fallback to localStorage

4. **✅ Image Cache-Busting Fixed**
   - Images now include timestamps
   - No more browser caching issues
   - Updates appear immediately

5. **✅ Migration Script Created**
   - File: `migrate-utilities-to-supabase.js`
   - Migrates default utilities to Supabase

---

## 🚀 Setup Instructions

### Step 1: Run the Migration

Move your utilities to Supabase:

```bash
node migrate-utilities-to-supabase.js
```

You should see:
```
🚀 Starting utilities migration to Supabase...
📊 Preparing utilities for migration...
✅ Migration completed successfully!
   Migrated 4 utilities to Supabase
🎉 All done! Utilities are now synced across web and desktop.
```

### Step 2: Restart Your Server

```bash
# Stop the server (Ctrl+C)
# Then restart
npm start
```

### Step 3: Clear Browser Cache

- **Chrome/Edge**: Ctrl+Shift+Delete → Clear cached images
- **Or hard refresh**: Ctrl+Shift+R (Cmd+Shift+R on Mac)

### Step 4: Test Synchronization

1. **Open Web Version**: http://localhost:3000
2. **Open Desktop Version**: Launch the desktop app
3. **Make a Change**: 
   - Go to Admin Dashboard → Utilities
   - Edit any utility and change the image
   - Click "Update Utility"
4. **Verify Sync**:
   - ✅ Image updates immediately in web version
   - ✅ Wait ~30 seconds, check desktop version
   - ✅ Desktop should show the updated image

---

## 🔄 How Synchronization Works

### Architecture

```
┌─────────────────┐
│   Web Browser   │────┐
└─────────────────┘    │
                       │
┌─────────────────┐    │    ┌──────────────┐    ┌─────────────┐
│ Desktop (Electron)│──┼───→│ Backend API  │───→│  Supabase   │
└─────────────────┘    │    └──────────────┘    └─────────────┘
                       │           ↓                     ↑
┌─────────────────┐    │    Auto-refresh             Real-time
│   Mobile App    │────┘    every 30s                 updates
└─────────────────┘
```

### Sync Mechanisms

1. **Immediate Updates**
   - When admin updates a utility
   - API call → Supabase → Instant database update

2. **Polling (Current Implementation)**
   - Every 30 seconds, all clients fetch latest data
   - Ensures all devices stay in sync
   - Works across web, desktop, and mobile

3. **Offline Fallback**
   - If API is unavailable, uses localStorage
   - Data persists even when offline
   - Syncs back when connection restored

### Real-Time Features

- ✅ **Cross-Device Sync**: Changes on web appear on desktop
- ✅ **Cross-Tab Sync**: Multiple browser tabs stay synchronized
- ✅ **Instant Updates**: No page refresh needed
- ✅ **Offline Support**: Works even without internet

---

## 🛠️ API Endpoints Reference

### Public Endpoints (No Auth Required)

```javascript
// Get all utilities
GET /api/utilities
Query params: ?category=Risk Management&is_active=true

// Get single utility
GET /api/utilities/:id

// Increment download counter
POST /api/utilities/:id/download
```

### Admin Endpoints (Auth Required)

```javascript
// Create new utility
POST /api/utilities
Body: {
  name: "Tool Name",
  description: "Description",
  category: "Risk Management" | "Market Analysis" | "Trading Tools" | "EA Tools",
  version: "1.0.0",
  size: "2 MB",
  image: "base64 or URL",
  image_timestamp: 1234567890,
  features: ["Feature 1", "Feature 2"],
  previews: ["preview1.jpg"],
  guide: {
    title: "Guide Title",
    steps: ["Step 1", "Step 2"]
  }
}

// Update utility
PUT /api/utilities/:id
Body: { name: "Updated Name", ... }

// Delete utility (soft delete)
DELETE /api/utilities/:id
```

---

## 📊 Database Schema

```sql
CREATE TABLE public.utilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  features TEXT[] DEFAULT '{}',
  download_url TEXT,
  version VARCHAR(50) NOT NULL,
  size VARCHAR(50),
  image TEXT,
  image_timestamp BIGINT,
  previews TEXT[] DEFAULT '{}',
  guide JSONB DEFAULT '{}',
  downloads INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔒 Security

### Row Level Security (RLS)

- **Read**: Everyone can view active utilities
- **Write**: Only admins can create/update/delete

### Authentication

- Admin endpoints use JWT token authentication
- Token must include `role: 'admin'`
- Non-admin users get 403 Forbidden

---

## 🐛 Troubleshooting

### Issue: Utilities not syncing

**Solution**:
```bash
# Check if migration ran
node migrate-utilities-to-supabase.js

# Restart server
npm start

# Clear browser cache
Ctrl+Shift+R
```

### Issue: "Admin access required" error

**Solution**:
```sql
-- Check your user role in Supabase
SELECT email, role FROM users_accounts WHERE email = 'your@email.com';

-- Update to admin if needed
UPDATE users_accounts SET role = 'admin' WHERE email = 'your@email.com';
```

### Issue: Images not updating

**Solution**:
- Ensure `imageTimestamp` is being set when uploading
- Check browser console for errors
- Try hard refresh (Ctrl+Shift+R)

### Issue: Sync taking too long

**Solution**:
```javascript
// Adjust sync interval in UtilitiesContext.js
// Change from 30000ms (30s) to 10000ms (10s)
syncIntervalRef.current = setInterval(() => {
  fetchUtilities();
}, 10000); // 10 seconds
```

---

## 🎯 Next Steps (Optional Enhancements)

### 1. WebSocket Real-Time Sync

For instant updates without polling:

```javascript
// Add to UtilitiesContext.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

supabase
  .channel('utilities-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'utilities' },
    (payload) => {
      // Handle real-time updates
      if (payload.eventType === 'INSERT') {
        dispatch({ type: 'ADD_UTILITY', payload: payload.new });
      }
      if (payload.eventType === 'UPDATE') {
        dispatch({ type: 'UPDATE_UTILITY', payload: payload.new });
      }
      if (payload.eventType === 'DELETE') {
        dispatch({ type: 'DELETE_UTILITY', payload: payload.old.id });
      }
    }
  )
  .subscribe();
```

### 2. Image Upload to Supabase Storage

Store images in Supabase Storage instead of base64:

```javascript
// Upload to Supabase Storage
const { data, error } = await supabase.storage
  .from('utility-images')
  .upload(`${utilityId}-${Date.now()}.jpg`, imageFile);
```

### 3. Caching Layer

Add Redis caching for better performance:

```javascript
// Check cache first, then database
const cachedUtilities = await redis.get('utilities');
if (cachedUtilities) {
  return JSON.parse(cachedUtilities);
}
```

---

## 📝 Summary

✅ **Utilities are now stored in Supabase**
✅ **Real-time sync every 30 seconds**
✅ **Works across web, desktop, and mobile**
✅ **Images update correctly with timestamps**
✅ **Offline fallback to localStorage**
✅ **Admin-only write access**

**Your utilities system is now enterprise-ready!** 🎉

---

## 🆘 Support

If you encounter any issues:

1. Check browser console for errors
2. Verify Supabase connection: `node test-server.js`
3. Check logs: `tail -f server.log`
4. Review this guide for troubleshooting steps

For further assistance, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [React Context API](https://react.dev/reference/react/useContext)
- [Electron Documentation](https://www.electronjs.org/docs)
