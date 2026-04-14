# Bookings Route 404 Debug Guide

## Current Status

**Commit**: 1bb0c2c  
**Issue**: POST to `/api/bookings` returns 404  
**Error Message**: "⚠️ API route not found: POST /"

## What We Added

Added extensive logging to track the request flow:

1. **Route file loading** (`routes/bookings.js`)
2. **Server registration** (`server.js`)
3. **Request middleware** (logs every request to `/api/bookings`)
4. **Route handler** (logs when the actual POST handler is called)

## How to Debug

### Step 1: Check Railway Deployment

Wait for Railway to finish deploying commit `1bb0c2c`. You should see:
- Build logs showing the deployment
- Server starting up
- Health check responding

### Step 2: Check Railway Logs

Open Railway logs and look for these startup messages:

```
📅 [Bookings] Route file loaded
📅 [Bookings] Router object created: function
📅 [Server] About to register bookings routes...
📅 [Server] bookingsRoutes type: function
✅ Booking routes registered at /api/bookings
📅 [Bookings] All routes registered on router
📅 [Bookings] Router stack length: 5
```

If you see all these, the route is properly registered.

### Step 3: Test the Endpoint

#### Option A: Use the Test HTML File

1. Open `test-bookings-endpoint.html` in your browser
2. Click "Test Now" on the first test
3. Should return: `{ "success": true, "message": "Booking routes are working!" }`

#### Option B: Use curl

```bash
curl https://smartalgosts.com/api/bookings/test
```

#### Option C: Use Browser Console

Open https://smartalgosts.com and run in console:

```javascript
fetch('/api/bookings/test')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error(e));
```

### Step 4: Check Request Logs

When you make a request, Railway logs should show:

```
📅 [Server] Bookings middleware hit
📅 [Server] Method: POST
📅 [Server] Path: /
📅 [Server] Original URL: /api/bookings
📅 [Bookings] POST / handler called
```

## Possible Issues & Solutions

### Issue 1: Route File Not Loading

**Symptoms**: No "Route file loaded" message in logs

**Causes**:
- Syntax error in `routes/bookings.js`
- File not included in Railway deployment
- Import error in `server.js`

**Solution**:
- Check Railway build logs for errors
- Verify file exists in deployment
- Check `require('./routes/bookings')` in server.js line 40

### Issue 2: Route Not Registered

**Symptoms**: "Route file loaded" appears but no "Booking routes registered"

**Causes**:
- Error in server.js before route registration
- bookingsRoutes is not a valid Express router

**Solution**:
- Check server.js logs for errors before line 481
- Verify `typeof bookingsRoutes === 'function'` in logs

### Issue 3: Middleware Hit But Handler Not Called

**Symptoms**: "Bookings middleware hit" but no "POST / handler called"

**Causes**:
- Route path mismatch
- HTTP method mismatch
- Middleware blocking the request

**Solution**:
- Check if path is exactly `/` in the route handler
- Verify method is POST
- Check for middleware that might be blocking

### Issue 4: Still Getting 404

**Symptoms**: All logs appear correct but still 404

**Causes**:
- Route registered after 404 handler (unlikely, we verified order)
- Express router configuration issue
- Request not reaching the route

**Solution**:
- Check the order of middleware in server.js
- Verify no other middleware is catching `/api/bookings`
- Check if there's a proxy or load balancer issue

## Quick Tests

### Test 1: Health Endpoint
```bash
curl https://smartalgosts.com/health
```
Should return 200 OK

### Test 2: API Root
```bash
curl https://smartalgosts.com/api
```
Should return API info

### Test 3: Bookings Test Endpoint
```bash
curl https://smartalgosts.com/api/bookings/test
```
Should return booking route success message

### Test 4: Bookings POST (Free)
```bash
curl -X POST https://smartalgosts.com/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "service": "algo_development",
    "consultation_type": "free_30",
    "date": "2024-12-25",
    "time": "10:00",
    "name": "Test User",
    "email": "test@example.com",
    "amount": 0
  }'
```

## What to Share

If the issue persists, share:

1. **Railway startup logs** (first 50 lines after deployment)
2. **Request logs** (when you make a test request)
3. **Response** (what you get back from the API)
4. **Browser console errors** (if testing from frontend)

## Files Modified

- `routes/bookings.js` - Added detailed logging
- `server.js` - Added middleware logging and route registration logging
- `CHECK_RAILWAY_LOGS_BOOKINGS.md` - Log checking guide
- `test-bookings-endpoint.html` - Interactive testing tool
- `BOOKINGS_DEBUG_GUIDE.md` - This file

## Next Steps

1. Wait for Railway deployment to complete
2. Check Railway logs for the startup messages
3. Test the `/api/bookings/test` endpoint
4. Share the results

The extensive logging should help us pinpoint exactly where the request is failing.
