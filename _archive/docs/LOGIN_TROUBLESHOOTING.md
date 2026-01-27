# Login Error Troubleshooting

## Problem
"Username and password are required" error even though fields are filled.

## Root Cause
The backend API server is not running or not accessible. The frontend is trying to call `/api/auth/login` but getting a 404 error.

## Solution

### Option 1: Start Backend Server (Required)

**In a NEW terminal window**, run:

```powershell
cd "C:\Users\wanya\Desktop\My library  2\Algosmart"
npm start
```

This will start the backend server on port 5000 (or the port configured in your .env file).

### Option 2: Check API URL Configuration

The frontend is configured to use:
- **Development**: `http://localhost:5000`
- **Production**: `https://web-production-fdb58.up.railway.app`

Make sure:
1. Backend is running on port 5000
2. Or set `REACT_APP_API_URL` in your `.env` file to match your backend URL

### Option 3: Verify Backend is Running

Check if backend is running by visiting:
- `http://localhost:5000/api/health` (if health endpoint exists)
- Or check terminal for "Server running on port XXXX"

## Quick Test

1. **Start Backend** (Terminal 1):
   ```powershell
   cd "C:\Users\wanya\Desktop\My library  2\Algosmart"
   npm start
   ```

2. **Start Frontend** (Terminal 2):
   ```powershell
   cd "C:\Users\wanya\Desktop\My library  2\Algosmart\client"
   npm start
   ```

3. **Try Login Again** with:
   - Email: `demo@smartalgos.local`
   - Password: `Password123!`

## Expected Behavior

Once backend is running:
- Login should work
- You'll be redirected to `/dashboard`
- Then we can check for React Error #31 in the dashboard

