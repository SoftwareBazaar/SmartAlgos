# 🚂 Deploy to Railway (Fastest Setup)

Railway is the EASIEST platform to deploy your app - literally 5 minutes!

## 🎯 Why Railway?

- ✅ **Easiest deployment** - just connect GitHub and click
- ✅ **$5 free credit every month**
- ✅ **Perfect for WebSockets**
- ✅ **Automatic HTTPS**
- ✅ **Environment variables UI**
- ✅ **Great developer experience**

---

## 📋 Prerequisites

- GitHub account
- Railway account (sign up at https://railway.app)
- Your code pushed to GitHub

---

## 🚀 Quick Deployment (5 Minutes)

### Step 1: Sign Up & Connect GitHub

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Click **"Login with GitHub"**
4. Authorize Railway to access your repositories

### Step 2: Deploy Backend

1. **Create New Project**:
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose your repository: `Algosmart`
   - Railway will auto-detect it's a Node.js app

2. **Configure Build**:
   - Railway auto-detects everything!
   - It will run: `npm install && npm start`
   - No configuration needed! 🎉

3. **Add Environment Variables**:
   - Click on your service
   - Go to **"Variables"** tab
   - Click **"New Variable"** and add:

   ```env
   NODE_ENV=production
   JWT_SECRET=<generate-strong-secret-here>
   JWT_EXPIRE=7d
   BCRYPT_ROUNDS=12
   
   # Supabase
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_ANON_KEY=<your-supabase-anon-key>
   SUPABASE_SERVICE_KEY=<your-supabase-service-key>
   
   # API Keys
   POLYGON_API_KEY=<your-polygon-key>
   MARKETAUX_API_KEY=<your-marketaux-key>
   
   # CORS (update after getting frontend URL)
   CLIENT_URL=https://your-frontend.up.railway.app
   ALLOWED_ORIGINS=https://your-frontend.up.railway.app
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Get Backend URL**:
   - Click **"Settings"** → **"Domains"**
   - Click **"Generate Domain"**
   - Copy the URL (e.g., `smart-algos-api-production.up.railway.app`)

### Step 3: Deploy Frontend

1. **Add New Service to Same Project**:
   - In your project dashboard
   - Click **"+ New"** → **"GitHub Repo"**
   - Select same repository
   - Click **"Add Service"**

2. **Configure Frontend Build**:
   - Click the new service
   - Go to **"Settings"** → **"Build"**
   - Set **Root Directory**: `client`
   - Set **Build Command**: `npm install && npm run build`
   - Set **Start Command**: `npx serve -s build -l $PORT`

3. **Add Frontend Environment Variables**:
   ```env
   REACT_APP_API_URL=https://smart-algos-api-production.up.railway.app
   REACT_APP_WS_URL=wss://smart-algos-api-production.up.railway.app
   DISABLE_ESLINT_PLUGIN=true
   CI=false
   ```

4. **Generate Domain**:
   - Go to **"Settings"** → **"Domains"**
   - Click **"Generate Domain"**
   - Your frontend is now live!

5. **Update Backend CORS**:
   - Go back to backend service
   - Update `CLIENT_URL` and `ALLOWED_ORIGINS` with your frontend URL

---

## ⚡ Alternative: Single Service (Simpler)

Deploy both frontend and backend in one service:

### Setup:

1. **Update `package.json`**:
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "cd client && npm install && npm run build",
    "railway:build": "npm install && npm run build"
  }
}
```

2. **Create `railway.json`**:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

3. **Deploy**:
   - Railway will build both frontend and backend
   - Serve React build from Express server
   - One URL for everything!

---

## 🔧 Configuration Files

### Create `nixpacks.toml` (Optional - for custom build):

```toml
[phases.setup]
nixPkgs = ['nodejs-18_x', 'npm-8_x']

[phases.install]
cmds = ['npm install']

[phases.build]
cmds = ['cd client && npm install && npm run build && cd ..']

[start]
cmd = 'npm start'
```

---

## 🔄 Auto-Deploy

Railway automatically deploys on every push to `master`!

```bash
git add .
git commit -m "Update feature"
git push origin master
# Railway automatically deploys! 🎉
```

---

## 📊 Monitoring

### View Logs:
1. Click on your service
2. Click **"Deployments"** tab
3. Click on latest deployment
4. View real-time logs

### View Metrics:
1. Click **"Metrics"** tab
2. See CPU, Memory, Network usage

---

## 💰 Pricing

Railway uses **usage-based pricing**:

- ✅ **$5 free credit every month**
- ✅ **Pay only for what you use**
- ✅ Typical app costs: **$5-20/month**

### What $5 covers:
- ~300 hours of running time
- ~50GB data transfer
- Perfect for development/testing

### Cost Breakdown:
```
CPU: $0.000463/minute ($20/month at 100%)
Memory: $0.000231/GB/minute ($10/month for 1GB)
Network: $0.10/GB
```

**Typical costs:**
- Small app (always on): ~$5-10/month
- Medium traffic: ~$10-20/month
- Your free $5 credit covers a lot! 💰

---

## 🐛 Troubleshooting

### Build Fails:

**Check package.json:**
```json
{
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  }
}
```

**View build logs:**
1. Go to **"Deployments"**
2. Click failing deployment
3. Check logs for errors

### Port Issues:

Railway automatically sets `PORT` environment variable. Make sure your `server.js` uses:

```javascript
const PORT = process.env.PORT || 5000;
```

### Frontend Not Found:

If serving from Express, ensure you have in `server.js`:
```javascript
// Serve React build
app.use(express.static('client/build'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});
```

### WebSocket Connection Fails:

1. ✅ Check `REACT_APP_WS_URL` uses `wss://` (not `ws://`)
2. ✅ Verify CORS allows your frontend domain
3. ✅ Check backend logs for WebSocket errors

---

## 🎛️ Advanced Features

### Environment Groups:
- Share environment variables across services
- Settings → **"Shared Variables"**

### PR Deployments:
- Automatic preview deployments for PRs
- Settings → **"PR Deploys"** → Enable

### Webhooks:
- Get notified on deployment events
- Settings → **"Webhooks"**

### Custom Domains:
1. Go to **"Settings"** → **"Domains"**
2. Click **"Custom Domain"**
3. Add your domain
4. Update DNS:
   ```
   CNAME your-domain.com → your-app.up.railway.app
   ```

### Database Add-ons:
If you need PostgreSQL, Redis, etc.:
1. Click **"+ New"** → **"Database"**
2. Select database type
3. Railway automatically connects it!

---

## 🚀 Railway CLI (Optional)

Install for local development:

```bash
npm install -g @railway/cli
```

### Useful commands:

```bash
# Login
railway login

# Link project
railway link

# View logs
railway logs

# Run commands with Railway environment
railway run npm start

# Deploy
railway up
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Backend is accessible: `https://your-backend.up.railway.app/api/health`
- [ ] Frontend loads: `https://your-frontend.up.railway.app`
- [ ] Login works
- [ ] WebSocket connects (check browser console)
- [ ] No CORS errors
- [ ] API calls work (check Network tab)

---

## 🎉 Success!

Your app is now live on Railway! 🚂

**Advantages of Railway:**
- ✅ Fastest deployment (5-10 minutes)
- ✅ Great developer experience
- ✅ Auto-deploy on push
- ✅ $5 free monthly credit
- ✅ Perfect for full-stack apps

---

## 🔗 Useful Links

- Railway Dashboard: https://railway.app/dashboard
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

---

## 📞 Need Help?

Check Railway's excellent documentation or ask in their Discord community - they're super helpful!

