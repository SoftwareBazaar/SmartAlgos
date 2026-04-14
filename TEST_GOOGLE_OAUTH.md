# How to Test Google OAuth Sign-In

## Quick Test Steps

### 1. Wait for Railway Deployment
After pushing to GitHub, Railway will automatically deploy. Wait 2-3 minutes for deployment to complete.

### 2. Test on Login Page

1. Go to: `https://smartalgosts.com/auth/login`
2. You should see:
   - Regular email/password form at the top
   - A divider line with "Or continue with"
   - A black Google sign-in button below

3. Click the Google button
4. Select your Google account in the popup
5. You should be automatically logged in and redirected to dashboard

### 3. Test on Register Page

1. Go to: `https://smartalgosts.com/auth/register`
2. You should see:
   - Regular registration form at the top
   - A divider line with "Or continue with"
   - A black Google sign-up button below

3. Click the Google button
4. Select your Google account in the popup
5. You should be automatically registered and redirected to dashboard

## What Happens Behind the Scenes

### For New Users (Register with Google)
- Account is created automatically
- Email is verified automatically (no OTP needed)
- Name is taken from Google profile
- Profile picture is taken from Google
- User is logged in immediately

### For Existing Users (Login with Google)
- Account is found by email
- Last login timestamp is updated
- Profile picture is updated if changed
- User is logged in immediately

## Expected Behavior

### Success
- Google popup appears
- User selects account
- Popup closes
- User is redirected to dashboard
- Green success toast appears: "Signed in with Google"

### Error Scenarios
- If popup is blocked: Browser will show popup blocker warning
- If user cancels: Red error toast appears: "Google sign-in was cancelled"
- If network error: Red error toast appears with error message

## Visual Appearance

The Google button should look like:
- Black background
- Google logo on the left
- Text: "Sign in with Google" (on login page)
- Text: "Sign up with Google" (on register page)
- Rounded pill shape
- Full width of the form

## Troubleshooting

### Button Not Appearing
- Check browser console for errors
- Verify `REACT_APP_GOOGLE_CLIENT_ID` is set in Railway environment
- Clear browser cache and reload

### Popup Blocked
- Allow popups for smartalgosts.com in browser settings
- Try again

### "Google login is not configured" Error
- Check Railway environment has `GOOGLE_CLIENT_ID` variable
- Restart Railway service
- Check Railway logs for configuration errors

### "Invalid Google token" Error
- Google Client ID might be incorrect
- Check both frontend and backend have same Client ID
- Verify Client ID is for correct Google Cloud project

## Railway Environment Check

Make sure these variables are set in Railway:

1. `GOOGLE_CLIENT_ID=197616881533-rjp7qc26c7ubl16ehovu75th79885v4g.apps.googleusercontent.com`
2. `REACT_APP_GOOGLE_CLIENT_ID=197616881533-rjp7qc26c7ubl16ehovu75th79885v4g.apps.googleusercontent.com`

## Database Verification

After signing in with Google, check Supabase `users_accounts` table:
- New row should be created
- `auth_provider` should be 'google'
- `is_email_verified` should be true
- `avatar_url` should have Google profile picture URL
- `email` should match Google account email

## Success Indicators

✅ Google button appears on both pages
✅ Clicking button opens Google popup
✅ Selecting account closes popup
✅ User is redirected to dashboard
✅ Success toast appears
✅ User data is saved in database
✅ User can access protected routes

---

**Ready to Test:** Yes
**Deployment:** Automatic via Railway
**Expected Deploy Time:** 2-3 minutes
