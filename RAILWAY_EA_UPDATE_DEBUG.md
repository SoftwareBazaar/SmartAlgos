# 🚂 Railway EA Update Debugging Guide

## 🔍 Current Issue
```
Error: 500 Internal Server Error
Message: "Server error"
URL: https://web-production-fdb58.up.railway.app/api/eas/1
```

---

## ✅ Fixes Applied (Commit: 5553e7d)

### 1. **Enhanced Error Logging**
- Added comprehensive error logging with full stack traces
- Logs error name, message, code, details, and hints
- Returns detailed error info even in production mode
- Step-by-step logging throughout the update process

### 2. **Fixed Files Object Handling**
- Only includes non-null files in updates.files object
- Prevents errors when accessing properties on null values

### 3. **Added Debug Logging**
- Logs request body and files received
- Logs database mode detection (mock vs real)
- Logs update data being sent to database
- Logs full update object before processing

---

## 🔧 What to Check on Railway

### Step 1: Check Railway Logs
After deploying, try updating an EA and check Railway logs for:

```bash
# Look for these log messages in order:
[EA Update] ===== STARTING UPDATE FOR EA 1 =====
[EA Update] User: <user_id> <role>
[EA Update] Request body keys: [...]
[EA Update] Request body: {...}
[EA Update] Files received: [...]
[EA Update] Mode detected: MOCK or DATABASE
[EA Update] MOCK_AUTH: <value>
[EA Update] Has SUPABASE_SERVICE_ROLE_KEY: true/false
```

### Step 2: Identify Where It Fails

The logs will show exactly where the error occurs:

#### **If it fails at "Mode detected":**
- ❌ Issue: Environment variables not set correctly
- ✅ Fix: Check `SUPABASE_SERVICE_ROLE_KEY` in Railway

#### **If it fails at "Update object prepared":**
- ❌ Issue: Data validation or parsing problem
- ✅ Fix: Check the request body in logs

#### **If it fails at "Calling database update":**
- ❌ Issue: Database connection or schema problem
- ✅ Fix: Verify Supabase connection and schema

#### **If it fails inside database update:**
- ❌ Issue: Column mismatch or constraint violation
- ✅ Fix: Check database error details in logs

---

## 🚨 Common Railway Issues & Solutions

### Issue 1: File Upload Permissions
**Symptom:** Error when multer tries to save files

**Solution:**
```javascript
// Railway ephemeral filesystem - files are temporary
// This is EXPECTED and OK for uploads
```

**Check:**
- Multer creates upload directories automatically
- Files are saved temporarily then paths stored in DB
- No persistent file storage needed on Railway

### Issue 2: Environment Variables
**Required Environment Variables on Railway:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (not anon key!)
- `SUPABASE_ANON_KEY` - Anonymous key for RLS
- `NODE_ENV` - Should be `production`

**Check in Railway:**
```bash
# In Railway dashboard > Variables tab
# Verify all Supabase credentials are set
```

### Issue 3: Database Schema Mismatch
**Required Columns in `expert_advisors` table:**
- `id` (primary key)
- `name` (text)
- `description` (text)
- `version` (text)
- `status` (text)
- `category` (text)
- `tags` (text or array)
- `price_monthly` (numeric) ⚠️ NOT `price`
- `price_yearly` (numeric)
- `image` (text)
- `ea_file_path` (text)
- `updated_at` (timestamp)

### Issue 4: Mock Mode on Railway
**Problem:** If `MOCK_AUTH=true` or Supabase key is invalid

**Check Railway Logs For:**
```
[EA Update] Mode detected: MOCK
```

**Should See:**
```
[EA Update] Mode detected: DATABASE
```

**Fix:**
- Set `MOCK_AUTH=false` in Railway
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is valid (not placeholder)

---

## 📋 Deployment Checklist

### Before Pushing to Railway:
- [x] Enhanced error logging added
- [x] Files object handling fixed
- [x] Price mapping to price_monthly/price_yearly
- [x] Detailed debug logs at each step
- [ ] Environment variables verified on Railway
- [ ] Database schema matches expected columns
- [ ] Supabase connection working
- [ ] RLS policies allow service role updates

### After Pushing to Railway:
1. **Deploy the latest changes**
   ```bash
   git push origin master
   ```

2. **Watch Railway logs in real-time**
   - Go to Railway dashboard
   - Open your project
   - Click "View Logs"
   - Filter for "EA Update" messages

3. **Test EA Update**
   - Go to admin panel
   - Edit an EA
   - Try to update (with or without files)
   - Watch logs for error messages

4. **Identify the Error**
   - Look for the last successful log message
   - Check the error that follows
   - Match with common issues above

---

## 🔬 Expected Log Flow (Success)

```bash
[EA Update] ===== STARTING UPDATE FOR EA 1 =====
[EA Update] User: <user_id> admin
[EA Update] Request body keys: ['name', 'description', 'price', ...]
[EA Update] Request body: { "name": "...", "price": "299", ... }
[EA Update] Files received: ['image']  # or 'none' if no files
[EA Update] Mode detected: DATABASE
[EA Update] MOCK_AUTH: false
[EA Update] Has SUPABASE_SERVICE_ROLE_KEY: true
[EA Update] Image uploaded: /uploads/ea-images/image-123456.jpg
[EA Update] Update object prepared with keys: ['name', 'description', ...]
[EA Update] Full update object: { ... }
[EA Update] 🔄 Calling database update for EA 1...
[EA Update] Update data being sent to DB: { ... }
✅ [EA Update] Database update successful for EA 1
✅ [EA Update] Updated EA data: { ... }
```

## 🔬 Expected Log Flow (Error - With Details)

```bash
[EA Update] ===== STARTING UPDATE FOR EA 1 =====
[EA Update] User: <user_id> admin
[EA Update] Mode detected: DATABASE
[EA Update] 🔄 Calling database update for EA 1...
❌ [EA Update] Database update failed: Error
❌ [EA Update] DB Error details: {
  name: 'PostgrestError',
  message: 'Could not find the X column',
  code: 'PGRST204',
  details: null,
  hint: null
}
❌ [EA Update] Error: <error message>
❌ [EA Update] Error stack: <stack trace>
```

---

## 🛠️ Quick Fixes

### Fix 1: If "Column not found" error
```bash
# The database doesn't have the column we're trying to update
# Check the error message for the column name
# Either:
# - Add the column to the database
# - Remove it from the updates object in code
```

### Fix 2: If "Permission denied" error
```bash
# RLS policy is blocking the update
# Check Supabase > Authentication > Policies
# Ensure service role can update expert_advisors
```

### Fix 3: If "File upload" error
```bash
# Multer can't create directories or save files
# Check that upload directories are being created:
# - uploads/ea-images
# - uploads/ea-files
# Railway has ephemeral filesystem - this is OK
```

### Fix 4: If database connection error
```bash
# Supabase connection failed
# Check environment variables:
# - SUPABASE_URL is correct
# - SUPABASE_SERVICE_ROLE_KEY is valid
# - Network can reach Supabase
```

---

## 📊 Next Steps

1. **Deploy to Railway** with enhanced logging
2. **Test EA update** and capture logs
3. **Identify exact failure point** from logs
4. **Apply specific fix** based on error type
5. **Retest** and verify success

---

## 💡 Pro Tips

- **Real-time logs:** Use Railway CLI for live log streaming
  ```bash
  railway logs --follow
  ```

- **Test locally first:** Run with Railway env vars locally
  ```bash
  export SUPABASE_URL="your-url"
  export SUPABASE_SERVICE_ROLE_KEY="your-key"
  npm start
  ```

- **Check database directly:** Verify schema in Supabase dashboard
  - Go to Table Editor
  - Check expert_advisors table structure
  - Verify all columns exist

---

**With these enhanced logs, we'll see EXACTLY where and why the update is failing! 🎯**

