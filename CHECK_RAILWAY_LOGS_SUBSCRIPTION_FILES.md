# 🔍 Check Railway Logs for Subscription Files Error

## 🚨 Current Issue

**Error:** 500 Internal Server Error when accessing `/api/subscriptions/:id/files`

**Affected Subscriptions:**
- Subscription ID 14
- Subscription ID 15
- Subscription ID 16

**Error Message:**
```
[API GET /api/subscriptions/14/files] A server error occurred. Our team has been notified. Please try again later.
```

## 📋 What to Check in Railway Logs

### 1. Go to Railway Dashboard
- URL: https://railway.app
- Find your SmartAlgos project
- Click on your service
- Go to "Deployments" tab
- Click on latest deployment
- View logs

### 2. Look for Error Messages

Search for these patterns in logs:

**Pattern 1: Subscription Files Error**
```
[Subscription Files] Request for subscription ID: 14
[Subscription Files] User ID: ...
```

**Pattern 2: Database Errors**
```
❌ Error:
❌ [Subscription Files]
Error: ...
```

**Pattern 3: JWT/Token Errors**
```
jwt
token
expired
invalid
```

**Pattern 4: Database Connection Errors**
```
Supabase
connection
timeout
ECONNREFUSED
```

## 🔧 Common Causes & Fixes

### Cause 1: Missing JWT_SECRET Environment Variable
**Symptom:** Error about JWT signing or verification
**Fix:** Add JWT_SECRET to Railway environment variables

### Cause 2: Database Connection Issue
**Symptom:** Cannot connect to Supabase, timeout errors
**Fix:** Check SUPABASE_URL and SUPABASE_KEY in Railway

### Cause 3: Subscription Not Found
**Symptom:** "Subscription not found" in logs
**Fix:** Verify subscription IDs exist in database

### Cause 4: EA Not Found
**Symptom:** "EA not found" in logs
**Fix:** Verify EA IDs exist and are linked to subscriptions

### Cause 5: User Not Found
**Symptom:** "User not found" or user_id mismatch
**Fix:** Verify user authentication and subscription ownership

## 🎯 Quick Diagnostic Steps

### Step 1: Check if Deployment is Complete
```bash
# Railway should show "Deployed" status
# Check deployment time - should be recent
```

### Step 2: Check Environment Variables
Required variables:
- `JWT_SECRET` - For generating download tokens
- `SUPABASE_URL` - Database connection
- `SUPABASE_KEY` - Database authentication
- `BACKEND_URL` - For generating download links

### Step 3: Test Subscription Endpoint Directly

**Using Browser Console:**
```javascript
// First, get your token
const token = localStorage.getItem('token');

// Then test the endpoint
fetch('https://smartalgos-production.up.railway.app/api/subscriptions/15/files', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
.then(r => r.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

### Step 4: Check Subscription Details

**Verify subscription exists:**
```javascript
fetch('https://smartalgos-production.up.railway.app/api/subscriptions', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => console.log('Subscriptions:', data));
```

## 🔍 What Railway Logs Should Show

### Normal Flow (Success):
```
[Subscription Files] Request for subscription ID: 15
[Subscription Files] User ID: dabfa248-7964-4841-81e7-d833c7f88dc3
[Subscription Files] Found subscription: {
  id: 15,
  user_id: 'dabfa248-7964-4841-81e7-d833c7f88dc3',
  status: 'active',
  ea_id: 8
}
[Subscription Files] Date check: {
  now: '2026-01-25T...',
  endDate: '2126-01-25T...',
  hasExpired: false
}
[Subscription Files] Generated download token for subscription: 15
[Subscription Files] EA files available: {
  has_zip: true,
  ea_file: true,
  set_file: true,
  manual: true,
  screenshots: false
}
[Subscription Files] Download links generated: ['zip_package', 'ea_file', 'set_file', 'manual']
```

### Error Flow (What to look for):
```
❌ Error: Cannot read property 'id' of null
❌ Error: jwt must be provided
❌ Error: Invalid subscription ID
❌ Error: Subscription not found
❌ Error: EA not found
❌ Error: User does not own this subscription
```

## 🚨 Immediate Actions

### Action 1: Copy Full Error from Railway Logs
1. Go to Railway logs
2. Find the error for subscription 15
3. Copy the FULL error message including stack trace
4. Share it for analysis

### Action 2: Verify Environment Variables
Check these are set in Railway:
```
JWT_SECRET=<your-secret-key>
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-key>
BACKEND_URL=https://smartalgos-production.up.railway.app
```

### Action 3: Check Database
Verify in Supabase:
- Subscription 15 exists
- Subscription 15 has ea_id = 8
- EA 8 exists and has file paths
- User owns subscription 15

## 📝 Information to Collect

Please provide:
1. **Full error message from Railway logs** (including stack trace)
2. **Subscription details** (from database or API)
3. **Environment variables status** (which are set, which are missing)
4. **Deployment status** (is it fully deployed?)
5. **Recent changes** (any code changes since last working state?)

## 🔧 Potential Quick Fixes

### Fix 1: Restart Railway Service
Sometimes a simple restart helps:
1. Go to Railway dashboard
2. Click on your service
3. Click "Restart" button

### Fix 2: Redeploy
Force a new deployment:
1. Make a small change (add a comment)
2. Commit and push
3. Wait for Railway to redeploy

### Fix 3: Check Module Exports
The recent change added `module.exports = router;` to subscriptions.js
Verify this didn't break anything:
```javascript
// At the end of routes/subscriptions.js
module.exports = router;
```

## 📞 Next Steps

1. **Check Railway logs** - Get the actual error message
2. **Share the error** - Post the full error here
3. **Verify environment** - Check all required variables are set
4. **Test database** - Verify subscription and EA data exists

---

**Priority:** HIGH - Blocking user downloads
**Status:** Investigating
**Time Estimate:** 10-15 minutes to diagnose
