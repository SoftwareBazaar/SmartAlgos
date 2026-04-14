# Fix Google OAuth Origin Mismatch Error

## Error Message
```
Error 400: origin_mismatch
Access blocked: Authorization Error
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy.
If you're the app developer, register the JavaScript origin in the Google Cloud Console.
```

## What This Means
Your Google OAuth Client ID is not configured to allow requests from `https://smartalgosts.com`. This is a security feature that prevents unauthorized websites from using your Google OAuth credentials.

## How to Fix (5 minutes)

### Step 1: Go to Google Cloud Console
1. Open: https://console.cloud.google.com/
2. Sign in with your Google account (the one that created the OAuth Client ID)

### Step 2: Select Your Project
1. Click the project dropdown at the top
2. Select the project that contains your OAuth Client ID
   - If you don't remember, it's likely named something like "Smart Algos" or similar

### Step 3: Navigate to OAuth Consent Screen
1. In the left sidebar, click "APIs & Services"
2. Click "Credentials"
3. Find your OAuth 2.0 Client ID in the list
   - It should start with: `197616881533-...`
4. Click on it to edit

### Step 4: Add Authorized JavaScript Origins
1. Scroll down to "Authorized JavaScript origins"
2. Click "+ ADD URI"
3. Add these URIs (one at a time):
   ```
   https://smartalgosts.com
   http://localhost:3000
   ```
4. Click "SAVE" at the bottom

### Step 5: Add Authorized Redirect URIs (if needed)
1. Scroll to "Authorized redirect URIs"
2. Click "+ ADD URI"
3. Add these URIs:
   ```
   https://smartalgosts.com
   https://smartalgosts.com/auth/login
   https://smartalgosts.com/auth/register
   http://localhost:3000
   ```
4. Click "SAVE"

### Step 6: Test Again
1. Wait 1-2 minutes for changes to propagate
2. Go to: https://smartalgosts.com/auth/login
3. Click "Sign in with Google"
4. Should work now!

## Visual Guide

### What You're Looking For:

**In Google Cloud Console > APIs & Services > Credentials:**

```
OAuth 2.0 Client IDs
┌─────────────────────────────────────────────────────┐
│ Name: Web client 1                                  │
│ Client ID: 197616881533-rjp7qc26c7ubl16ehovu...    │
│ Created: [date]                                     │
│ [Edit] [Delete]                                     │
└─────────────────────────────────────────────────────┘
```

Click "Edit" (pencil icon), then scroll to:

```
Authorized JavaScript origins
┌─────────────────────────────────────────────────────┐
│ URIs                                                │
│ + ADD URI                                           │
│                                                     │
│ https://smartalgosts.com                           │
│ http://localhost:3000                              │
└─────────────────────────────────────────────────────┘

Authorized redirect URIs
┌─────────────────────────────────────────────────────┐
│ URIs                                                │
│ + ADD URI                                           │
│                                                     │
│ https://smartalgosts.com                           │
│ https://smartalgosts.com/auth/login                │
│ https://smartalgosts.com/auth/register             │
│ http://localhost:3000                              │
└─────────────────────────────────────────────────────┘
```

## Alternative: Create New OAuth Client ID

If you can't find the existing one or want to start fresh:

### Step 1: Create New OAuth Client ID
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "+ CREATE CREDENTIALS"
3. Select "OAuth client ID"
4. Choose "Web application"
5. Name it: "Smart Algos Web Client"

### Step 2: Configure Origins and Redirects
Add the URIs listed above in Step 4 and Step 5

### Step 3: Copy New Client ID
1. Copy the new Client ID (starts with numbers)
2. Update your `.env` files:

**Backend `.env`:**
```
GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID_HERE
```

**Frontend `client/.env`:**
```
REACT_APP_GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID_HERE
```

### Step 4: Update Railway Environment Variables
1. Go to Railway dashboard
2. Click your project
3. Go to Variables
4. Update both:
   - `GOOGLE_CLIENT_ID`
   - `REACT_APP_GOOGLE_CLIENT_ID`
5. Redeploy

### Step 5: Commit and Push
```bash
git add .env client/.env
git commit -m "Update Google OAuth Client ID"
git push origin master
```

## Common Issues

### "Changes not taking effect"
- Wait 2-3 minutes after saving in Google Cloud Console
- Clear browser cache and try again
- Try in incognito/private browsing mode

### "Still getting origin_mismatch"
- Double-check the domain is exactly: `https://smartalgosts.com` (no trailing slash)
- Make sure you clicked "SAVE" in Google Cloud Console
- Verify you're editing the correct OAuth Client ID

### "Can't find my OAuth Client ID"
- Check all your Google Cloud projects
- Look for Client ID starting with: `197616881533-`
- If lost, create a new one (see Alternative section above)

## Quick Checklist

- [ ] Logged into Google Cloud Console
- [ ] Found correct project
- [ ] Navigated to APIs & Services > Credentials
- [ ] Found OAuth 2.0 Client ID
- [ ] Added `https://smartalgosts.com` to Authorized JavaScript origins
- [ ] Added redirect URIs
- [ ] Clicked SAVE
- [ ] Waited 2 minutes
- [ ] Tested on https://smartalgosts.com/auth/login
- [ ] Google sign-in works!

## Success Indicators

✅ Google popup opens
✅ Can select Google account
✅ Popup closes
✅ Redirected to dashboard
✅ Logged in successfully

---

**Time Required:** 5 minutes
**Difficulty:** Easy
**Status:** Configuration needed in Google Cloud Console
