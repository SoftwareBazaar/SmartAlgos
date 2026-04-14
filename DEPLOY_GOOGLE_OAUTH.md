# Deploy Google OAuth to Railway

## Deployment Status

**Commit:** 7d54988 - "Add Google OAuth sign-in to Login and Register pages"
**Branch:** master
**Status:** Pushed to GitHub, waiting for Railway deployment

## What to Check

### 1. Railway Dashboard
Go to: https://railway.app/dashboard

Check:
- Is the deployment running?
- Any build errors?
- Check the logs for any issues

### 2. Environment Variables in Railway

Make sure these are set:
```
GOOGLE_CLIENT_ID=197616881533-rjp7qc26c7ubl16ehovu75th79885v4g.apps.googleusercontent.com
REACT_APP_GOOGLE_CLIENT_ID=197616881533-rjp7qc26c7ubl16ehovu75th79885v4g.apps.googleusercontent.com
```

### 3. Manual Deployment Trigger

If Railway didn't auto-deploy, you can:

**Option A: Trigger from Railway Dashboard**
1. Go to Railway dashboard
2. Click on your project
3. Click "Deploy" button
4. Select "Deploy latest commit"

**Option B: Force Push**
```bash
git commit --allow-empty -m "Trigger Railway deployment for Google OAuth"
git push origin master
```

**Option C: Redeploy from Railway CLI**
```bash
railway up
```

## After Deployment

Once deployed, test at:
- Login: https://smartalgosts.com/auth/login
- Register: https://smartalgosts.com/auth/register

You should see the Google sign-in button on both pages.

## Troubleshooting

### If Google Button Doesn't Appear

1. **Check Browser Console**
   - Open DevTools (F12)
   - Look for errors related to Google OAuth
   - Check if `REACT_APP_GOOGLE_CLIENT_ID` is loaded

2. **Check Railway Build Logs**
   - Look for build errors
   - Verify client build completed successfully
   - Check if environment variables are available during build

3. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or clear cache completely

4. **Verify Environment Variables**
   - In Railway dashboard, check Settings > Variables
   - Make sure both `GOOGLE_CLIENT_ID` and `REACT_APP_GOOGLE_CLIENT_ID` are set
   - Restart the service after adding variables

### If Google Login Fails

1. **Check Backend Logs**
   - Look for "Google Auth" related errors
   - Verify token verification is working
   - Check database connection

2. **Verify Google Client ID**
   - Make sure it matches in both frontend and backend
   - Verify it's the correct Client ID from Google Cloud Console

3. **Check CORS Settings**
   - Verify Railway domain is allowed
   - Check if popups are blocked

## Files Changed

1. `client/src/pages/Auth/Login.js` - Added Google OAuth button
2. `client/src/pages/Auth/Register.js` - Added Google OAuth button
3. `.env` - Added GOOGLE_CLIENT_ID
4. `GOOGLE_OAUTH_SETUP_COMPLETE.md` - Documentation
5. `TEST_GOOGLE_OAUTH.md` - Testing guide

## Next Steps

1. Wait for Railway deployment (usually 2-3 minutes)
2. Check Railway dashboard for deployment status
3. Test the Google sign-in on both pages
4. Verify users can register and login with Google

---

**Note:** If Railway doesn't auto-deploy, use one of the manual trigger options above.
