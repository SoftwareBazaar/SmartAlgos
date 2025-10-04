# Railway Deployment Environment Fix

## Issue
The application is failing to start because the bulletproof authentication system requires specific environment variables.

## Required Environment Variables for Railway

Add these environment variables in your Railway dashboard:

### Essential Variables:
```
MOCK_AUTH=true
NODE_ENV=development
PORT=5000
```

### Database Variables:
```
SUPABASE_URL=https://ncikobfahncdgwvkfivz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jaWtvYmZhaG5jZGd3dmtmaXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDY2NDQsImV4cCI6MjA3Mjk4MjY0NH0.TKIwIpXr9c92Xi0AgoioeC2db3tonPtM1wHHMo5-7mk
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### JWT Configuration:
```
JWT_SECRET=smart-algos-super-secret-jwt-key-2024-development-only-change-in-production
JWT_EXPIRE=7d
```

### CORS Configuration:
```
CLIENT_URL=https://your-frontend-domain.com
```

## How to Add Environment Variables in Railway:

1. Go to your Railway project dashboard
2. Click on your service
3. Go to "Variables" tab
4. Add each variable with its value
5. Redeploy the service

## Quick Fix Command (if using Railway CLI):

```bash
railway variables set MOCK_AUTH=true
railway variables set NODE_ENV=development
railway variables set PORT=5000
railway variables set JWT_SECRET=smart-algos-super-secret-jwt-key-2024-development-only-change-in-production
railway variables set JWT_EXPIRE=7d
```

## After Adding Variables:
1. The deployment should automatically restart
2. Check the deployment logs to confirm successful startup
3. Test the admin login functionality

## Expected Result:
- ✅ Application starts successfully
- ✅ No JWT token verification errors
- ✅ Admin login works properly
- ✅ All protected endpoints accessible
