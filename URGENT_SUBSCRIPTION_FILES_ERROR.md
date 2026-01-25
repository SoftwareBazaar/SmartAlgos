# 🚨 URGENT: Subscription Files Endpoint Error

## ⚡ Quick Summary

**Problem:** `/api/subscriptions/:id/files` endpoint returning 500 errors
**Impact:** Users cannot get download links
**Subscriptions Affected:** 14, 15, 16
**Status:** NEEDS IMMEDIATE ATTENTION

## 🎯 What You Need to Do RIGHT NOW

### Step 1: Get Railway Logs (2 minutes)

1. Go to: https://railway.app
2. Find SmartAlgos project
3. Click on service → Deployments → Latest deployment
4. Click "View Logs"
5. **Copy the FULL error message** that appears when you try to access subscription files

### Step 2: Try This in Browser Console (30 seconds)

Open your site and press F12, then paste:

```javascript
// Get your subscriptions first
fetch('https://smartalgos-production.up.railway.app/api/subscriptions', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ Your subscriptions:', data);
  
  // Now try to get files for subscription 15
  return fetch('https://smartalgos-production.up.railway.app/api/subscriptions/15/files', {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  });
})
.then(r => r.json())
.then(data => console.log('✅ Files response:', data))
.catch(err => console.error('❌ Error:', err));
```

## 🔍 Most Likely Causes

### Cause 1: JWT_SECRET Not Set in Railway ⚠️
The endpoint generates JWT tokens for download links. If JWT_SECRET is missing, it will crash.

**Check:** Go to Railway → Service → Variables
**Look for:** `JWT_SECRET`
**If missing:** Add it with any secure random string

**Quick fix:**
```
JWT_SECRET=your-super-secret-key-here-make-it-long-and-random
```

### Cause 2: Database Service Issue
The endpoint queries Supabase for subscription and EA data.

**Check Railway logs for:**
```
Error: Cannot read property 'id' of null
Error: Subscription not found
Error: EA not found
```

### Cause 3: Recent Code Change Broke Something
We just added `module.exports = router;` - might have caused an issue.

## 🚑 Emergency Fixes

### Fix 1: Add JWT_SECRET (if missing)

1. Go to Railway dashboard
2. Click your service
3. Go to "Variables" tab
4. Click "New Variable"
5. Add:
   - Name: `JWT_SECRET`
   - Value: `algosmart-secret-key-2026-production-jwt-token-signing`
6. Click "Add"
7. Service will auto-restart

### Fix 2: Verify Other Environment Variables

Make sure these are set:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
BACKEND_URL=https://smartalgos-production.up.railway.app
JWT_SECRET=your-secret-key
```

### Fix 3: Check Database Connection

In browser console:
```javascript
// Test if API is working at all
fetch('https://smartalgos-production.up.railway.app/api/health')
  .then(r => r.json())
  .then(data => console.log('Health check:', data));
```

## 📋 Information Needed

Please provide:

1. **Railway logs** - The actual error message when accessing `/api/subscriptions/15/files`
2. **Environment variables** - Which ones are set in Railway (don't share values, just names)
3. **Health check result** - Does `/api/health` work?
4. **Subscriptions list** - Can you get `/api/subscriptions` successfully?

## 🔧 Temporary Workaround

While we fix this, you can use the resend email endpoint to get download links via email:

```javascript
// In browser console
fetch('https://smartalgos-production.up.railway.app/api/subscriptions/15/resend-email', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  },
  body: '{}'
})
.then(r => r.json())
.then(data => console.log('Email sent:', data));
```

This will send an email with download links to wanyagajohn73@gmail.com.

## 🎯 Expected Railway Log Output

**If JWT_SECRET is missing:**
```
Error: secretOrPrivateKey must have a value
    at Object.module.exports [as sign] (...)
    at router.get (/app/routes/subscriptions.js:...)
```

**If database issue:**
```
Error: Cannot read property 'id' of null
    at router.get (/app/routes/subscriptions.js:...)
```

**If subscription not found:**
```
[Subscription Files] Subscription not found for ID: 15
```

## ⏱️ Time Estimate

- **Diagnosis:** 5 minutes
- **Fix:** 2 minutes (if JWT_SECRET missing)
- **Testing:** 2 minutes
- **Total:** ~10 minutes

## 🚀 Once Fixed

After fixing, test with:
```javascript
fetch('https://smartalgos-production.up.railway.app/api/subscriptions/15/files', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => console.log('✅ SUCCESS! Download links:', data));
```

---

**Priority:** CRITICAL
**Blocking:** User downloads
**Action Required:** Check Railway logs and environment variables
