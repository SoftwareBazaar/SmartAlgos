# 🚀 Deploy to Render (Recommended)

Complete guide to deploy your Smart Algos Trading Platform to Render.

## 📋 Prerequisites

- GitHub account
- Render account (sign up at https://render.com)
- Your code pushed to GitHub

---

## 🎯 Deployment Steps

### Step 1: Prepare Your Code

1. **Create a `render.yaml` file** in your project root:

```yaml
services:
  # Backend API Server
  - type: web
    name: smart-algos-api
    env: node
    region: oregon
    plan: free  # or 'starter' for $7/month
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_EXPIRE
        value: 7d
      - key: BCRYPT_ROUNDS
        value: 12
      - key: SUPABASE_URL
        sync: false  # You'll add this manually
      - key: SUPABASE_ANON_KEY
        sync: false
      - key: SUPABASE_SERVICE_KEY
        sync: false
      - key: POLYGON_API_KEY
        sync: false
      - key: MARKETAUX_API_KEY
        sync: false
      - key: CLIENT_URL
        value: https://smart-algos-web.onrender.com
      - key: ALLOWED_ORIGINS
        value: https://smart-algos-web.onrender.com
      - key: RATE_LIMIT_WINDOW_MS
        value: 900000
      - key: RATE_LIMIT_MAX_REQUESTS
        value: 100
    
  # Frontend React App
  - type: web
    name: smart-algos-web
    env: static
    region: oregon
    buildCommand: cd client && npm install && npm run build
    staticPublishPath: ./client/build
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: REACT_APP_API_URL
        value: https://smart-algos-api.onrender.com
      - key: REACT_APP_WS_URL
        value: wss://smart-algos-api.onrender.com
```

2. **Update `package.json`** - ensure you have:

```json
{
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  },
  "scripts": {
    "start": "node server.js",
    "build": "cd client && npm install && npm run build"
  }
}
```

3. **Create `.gitignore`** (if not exists):

```
node_modules/
.env
.env.local
client/node_modules/
client/build/
*.log
.DS_Store
```

4. **Commit and push** to GitHub:

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin master
```

---

### Step 2: Deploy on Render

#### Option A: Using render.yaml (Easier)

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Click "New +" → "Blueprint"**

3. **Connect your GitHub repository**

4. **Render will detect `render.yaml`** and create both services automatically

5. **Add environment variables**:
   - Go to each service
   - Click "Environment"
   - Add your secret keys:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_KEY`
     - `POLYGON_API_KEY`
     - `MARKETAUX_API_KEY`

#### Option B: Manual Setup (More Control)

1. **Create Backend Service**:
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Name: `smart-algos-api`
   - Environment: `Node`
   - Region: `Oregon` (or closest to you)
   - Branch: `master`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: `Free` or `Starter`

2. **Add Backend Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=<generate-a-strong-secret>
   JWT_EXPIRE=7d
   BCRYPT_ROUNDS=12
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_ANON_KEY=<your-supabase-anon-key>
   SUPABASE_SERVICE_KEY=<your-supabase-service-key>
   POLYGON_API_KEY=<your-polygon-key>
   MARKETAUX_API_KEY=<your-marketaux-key>
   CLIENT_URL=https://smart-algos-web.onrender.com
   ALLOWED_ORIGINS=https://smart-algos-web.onrender.com
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

3. **Create Frontend Service**:
   - Click "New +" → "Static Site"
   - Connect same GitHub repository
   - Name: `smart-algos-web`
   - Branch: `master`
   - Build Command: `cd client && npm install && npm run build`
   - Publish Directory: `client/build`

4. **Add Frontend Environment Variables**:
   ```
   REACT_APP_API_URL=https://smart-algos-api.onrender.com
   REACT_APP_WS_URL=wss://smart-algos-api.onrender.com
   ```

5. **Click "Create Static Site"**

---

### Step 3: Configure Custom Domains (Optional)

1. Go to your service → **Settings** → **Custom Domains**
2. Add your domain (e.g., `api.yourdomain.com`)
3. Follow DNS configuration instructions
4. Update `CLIENT_URL` and `ALLOWED_ORIGINS` with your custom domain

---

### Step 4: Verify Deployment

1. **Check Backend**:
   - Visit: `https://smart-algos-api.onrender.com/api/health`
   - Should return: `{ "status": "OK", ... }`

2. **Check Frontend**:
   - Visit: `https://smart-algos-web.onrender.com`
   - Should load your React app

3. **Test WebSocket**:
   - Login to your app
   - Check browser console for: `"WebSocket connected"`

4. **Test API Calls**:
   - Try logging in
   - Check Network tab - no 404 errors
   - All API calls should work

---

## ⚙️ Auto-Deploy Setup

Render automatically deploys when you push to GitHub!

1. **Enable Auto-Deploy**:
   - Go to service → **Settings** → **Build & Deploy**
   - Check "Auto-Deploy" is enabled

2. **Deploy on push**:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin master
   ```
   
3. Render will automatically build and deploy! 🎉

---

## 🔍 Monitoring & Logs

### View Logs:
1. Go to your service dashboard
2. Click **Logs** tab
3. See real-time logs

### Monitor Performance:
1. Click **Metrics** tab
2. View CPU, Memory, Response times

---

## ⚠️ Important Notes

### Free Tier Limitations:
- ⚠️ Services sleep after 15 minutes of inactivity
- ⚠️ First request after sleep takes 30-60 seconds to wake
- ⚠️ 750 hours/month free (enough for 1 service 24/7)
- ⚠️ Shared CPU and 512MB RAM

### Upgrade to Starter ($7/month) for:
- ✅ No sleeping
- ✅ More resources
- ✅ Better performance
- ✅ Priority support

---

## 🐛 Troubleshooting

### Build Fails:
```bash
# Check package.json has correct scripts
"scripts": {
  "start": "node server.js"
}

# Check Node version
"engines": {
  "node": ">=16.0.0"
}
```

### WebSocket Not Connecting:
- ✅ Verify `REACT_APP_WS_URL` uses `wss://` (not `ws://`)
- ✅ Check CORS settings allow frontend domain
- ✅ Review backend logs for connection errors

### 404 Errors:
- ✅ Verify `REACT_APP_API_URL` has NO `/api` suffix
- ✅ Check `CLIENT_URL` matches frontend URL exactly
- ✅ Verify static site has proper rewrites

### Database Connection Issues:
- ✅ Verify Supabase environment variables are correct
- ✅ Check Supabase allows connections from any IP
- ✅ Review database logs in Supabase dashboard

---

## 📚 Useful Commands

### View logs:
```bash
# In Render dashboard → Logs tab
# Or use Render CLI:
render logs -s smart-algos-api
```

### Manual Deploy:
```bash
# In Render dashboard:
# Click "Manual Deploy" → "Deploy latest commit"
```

### Restart Service:
```bash
# In Render dashboard → Settings:
# Click "Restart Service"
```

---

## 🎉 Success!

Your app should now be live at:
- **Frontend**: https://smart-algos-web.onrender.com
- **Backend**: https://smart-algos-api.onrender.com
- **API Health**: https://smart-algos-api.onrender.com/api/health

---

## 💰 Cost Estimate

### Free Tier:
- Backend: Free (with sleep)
- Frontend: Free
- **Total: $0/month**

### Production (Recommended):
- Backend: $7/month (Starter plan, no sleep)
- Frontend: Free
- **Total: $7/month**

### With Database:
- Backend: $7/month
- Frontend: Free
- PostgreSQL: $7/month (if not using Supabase)
- **Total: $7-14/month**

---

## 🔗 Useful Links

- Render Dashboard: https://dashboard.render.com
- Render Docs: https://render.com/docs
- Community Support: https://community.render.com
- Status Page: https://status.render.com

---

**Need help?** Check the troubleshooting section or create an issue on GitHub!

