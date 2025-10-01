# Client Environment Configuration

## How to Configure API URLs

The client application needs to know where your backend API is running. Here's how to configure it:

### 1. Create `.env` files in the `client/` folder:

#### `.env.development` (for local development):
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
REACT_APP_VISME_EMBED_ENABLED=false
DISABLE_ESLINT_PLUGIN=true
```

#### `.env.production` (for production builds):
```env
REACT_APP_API_URL=https://your-production-api.com
REACT_APP_WS_URL=wss://your-production-api.com
REACT_APP_VISME_EMBED_ENABLED=false
DISABLE_ESLINT_PLUGIN=true
CI=false
```

### 2. Important Notes:

- **REACT_APP_API_URL**: The base URL of your backend API (without `/api` suffix)
  - Development: `http://localhost:5000`
  - Production: `https://your-domain.com` or `https://smart-algos.vercel.app`

- **DO NOT** include `/api` in the URL - the API client will add the proper paths automatically

- All environment variables for React must start with `REACT_APP_`

### 3. Example API Calls:

With `REACT_APP_API_URL=http://localhost:5000`, the API client will make calls to:
- Login: `http://localhost:5000/api/auth/login` ✅
- Profile: `http://localhost:5000/api/users/profile` ✅

### 4. Verify Configuration:

After setting up your `.env` file, restart your React development server:

```bash
npm start
```

Check the browser console for:
```
[API Client] Base URL: http://localhost:5000
[API Client] Environment: development
```

### 5. Common Issues:

❌ **Wrong**: Setting `REACT_APP_API_URL=http://localhost:5000/api`
   - Results in: `http://localhost:5000/api/api/auth/login` (404 error)

✅ **Correct**: Setting `REACT_APP_API_URL=http://localhost:5000`
   - Results in: `http://localhost:5000/api/auth/login`

## What Was Fixed

The 404 error was caused by:
1. Production baseURL included `/api` suffix
2. API calls added another `/api` prefix
3. Result: Double `/api/api/` in URLs → 404 Not Found

The fix:
- Removed `/api` from production baseURL in `apiClient.js`
- Added environment variable support
- Added better error logging for debugging

