# 🟣 Deploy to Heroku (Most Reliable)

Heroku is the industry-standard platform with excellent reliability and documentation.

## 🎯 Why Heroku?

- ✅ **Most reliable** - industry standard since 2007
- ✅ **Excellent documentation**
- ✅ **WebSocket support**
- ✅ **Many add-ons** (databases, monitoring, etc.)
- ✅ **Easy scaling**
- ✅ **Great for production**

---

## 💰 Pricing

Heroku no longer has a free tier, but offers affordable options:

- **Eco Dynos**: $5/month (sleeps after 30 min inactivity)
- **Basic**: $7/month (no sleep, better for production)
- **Standard**: $25/month (performance monitoring, autoscaling)

---

## 📋 Prerequisites

- Heroku account (sign up at https://heroku.com)
- Heroku CLI installed
- Git repository
- Credit card (required even for $5 plan)

---

## 🚀 Deployment Steps

### Step 1: Install Heroku CLI

**Windows:**
```powershell
# Download installer from: https://devcenter.heroku.com/articles/heroku-cli
# Or use Chocolatey:
choco install heroku-cli
```

**Mac:**
```bash
brew install heroku/brew/heroku
```

**Linux:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

Verify installation:
```bash
heroku --version
```

---

### Step 2: Login to Heroku

```bash
heroku login
# Press any key to open browser and login
```

---

### Step 3: Prepare Your Application

1. **Create `Procfile`** in project root:

```
web: npm start
```

2. **Update `package.json`**:

```json
{
  "scripts": {
    "start": "node server.js",
    "build": "cd client && npm install && npm run build",
    "heroku-postbuild": "cd client && npm install && npm run build"
  },
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

3. **Update `server.js`** to serve React build:

```javascript
// Add this AFTER all your API routes

// Serve React static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
}
```

---

### Step 4: Create Heroku App

```bash
# Create app (backend + frontend combined)
heroku create smart-algos-trading

# Or specify a custom name:
heroku create your-custom-name

# This creates a new Heroku app and adds a git remote
```

Your app will be available at: `https://smart-algos-trading.herokuapp.com`

---

### Step 5: Configure Environment Variables

```bash
# Node environment
heroku config:set NODE_ENV=production

# JWT Configuration
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set JWT_EXPIRE=7d

# Security
heroku config:set BCRYPT_ROUNDS=12

# Supabase
heroku config:set SUPABASE_URL=your-supabase-url
heroku config:set SUPABASE_ANON_KEY=your-supabase-anon-key
heroku config:set SUPABASE_SERVICE_KEY=your-supabase-service-key

# API Keys
heroku config:set POLYGON_API_KEY=your-polygon-key
heroku config:set MARKETAUX_API_KEY=your-marketaux-key

# CORS (use your Heroku app URL)
heroku config:set CLIENT_URL=https://smart-algos-trading.herokuapp.com
heroku config:set ALLOWED_ORIGINS=https://smart-algos-trading.herokuapp.com

# Rate Limiting
heroku config:set RATE_LIMIT_WINDOW_MS=900000
heroku config:set RATE_LIMIT_MAX_REQUESTS=100

# Frontend env vars (for build)
heroku config:set REACT_APP_API_URL=https://smart-algos-trading.herokuapp.com
heroku config:set REACT_APP_WS_URL=wss://smart-algos-trading.herokuapp.com
heroku config:set DISABLE_ESLINT_PLUGIN=true
heroku config:set CI=false
```

**Or set all at once** using `.env` file:

```bash
# Create a temporary env file
cat > heroku.env << 'EOF'
NODE_ENV=production
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
POLYGON_API_KEY=your-polygon-key
MARKETAUX_API_KEY=your-marketaux-key
CLIENT_URL=https://smart-algos-trading.herokuapp.com
ALLOWED_ORIGINS=https://smart-algos-trading.herokuapp.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
REACT_APP_API_URL=https://smart-algos-trading.herokuapp.com
REACT_APP_WS_URL=wss://smart-algos-trading.herokuapp.com
DISABLE_ESLINT_PLUGIN=true
CI=false
EOF

# Load all variables
heroku config:set $(cat heroku.env | xargs)

# Delete the file
rm heroku.env
```

---

### Step 6: Deploy!

```bash
# Commit all changes
git add .
git commit -m "Prepare for Heroku deployment"

# Deploy to Heroku
git push heroku master

# Or if your branch is main:
git push heroku main
```

Heroku will:
1. Detect Node.js app
2. Install dependencies
3. Run `heroku-postbuild` script (builds React)
4. Start the app with `Procfile` command

---

### Step 7: Open Your App

```bash
heroku open
```

This opens your app in the browser! 🎉

---

## 📊 Monitoring & Logs

### View Logs:
```bash
# Real-time logs
heroku logs --tail

# Last 100 lines
heroku logs -n 100

# Filter by source
heroku logs --source app
```

### Open Dashboard:
```bash
heroku dashboard
```

### Check App Status:
```bash
heroku ps
```

---

## 🔧 Useful Commands

### Restart App:
```bash
heroku restart
```

### Run Commands:
```bash
# Open bash shell
heroku run bash

# Run node script
heroku run node your-script.js
```

### Scale Dynos:
```bash
# Scale up
heroku ps:scale web=2

# Scale down
heroku ps:scale web=1
```

### View Config:
```bash
# List all config vars
heroku config

# Get specific var
heroku config:get JWT_SECRET

# Remove var
heroku config:unset VAR_NAME
```

---

## 🔌 Add-ons (Optional)

### PostgreSQL Database:
```bash
heroku addons:create heroku-postgresql:mini
# Adds DATABASE_URL environment variable automatically
```

### Redis:
```bash
heroku addons:create heroku-redis:mini
# Adds REDIS_URL environment variable
```

### Monitoring (Recommended):
```bash
# Free monitoring
heroku addons:create papertrail:choklad  # Logs
heroku addons:create newrelic:wayne      # Performance
```

### Scheduled Jobs:
```bash
heroku addons:create scheduler:standard
heroku addons:open scheduler
# Configure cron jobs in the web interface
```

---

## 🌐 Custom Domain

### Add Custom Domain:
```bash
heroku domains:add www.yourdomain.com
```

### Configure DNS:
```
CNAME www.yourdomain.com → smart-algos-trading.herokuapp.com
```

### Enable SSL (Automatic with custom domains):
```bash
heroku certs:auto:enable
```

---

## 🚀 Auto-Deploy from GitHub

### Setup GitHub Integration:

1. Go to Heroku Dashboard
2. Select your app
3. Click **"Deploy"** tab
4. Choose **"GitHub"** as deployment method
5. Connect your repository
6. Enable **"Automatic deploys"** from `master` branch

Now every push to GitHub automatically deploys! 🎉

---

## 🐛 Troubleshooting

### App Crashes:
```bash
# Check logs
heroku logs --tail

# Check dyno status
heroku ps

# Restart
heroku restart
```

### Build Fails:
```bash
# Check Node version in package.json
"engines": {
  "node": "18.x",
  "npm": "9.x"
}

# View build log
heroku logs --tail

# Try local build
npm run heroku-postbuild
```

### WebSocket Issues:

Heroku supports WebSockets on all dynos! Ensure:

1. ✅ Use `wss://` (not `ws://`) in frontend
2. ✅ Server listens on `process.env.PORT`
3. ✅ Socket.io transports include polling:
   ```javascript
   io(SERVER_URL, {
     transports: ['websocket', 'polling']
   });
   ```

### Memory Issues:

Basic dynos have 512MB RAM. If you exceed:

```bash
# Upgrade to Standard dyno (2.5GB RAM)
heroku ps:resize web=standard-1x
```

### Timeout Issues:

Heroku has a 30-second request timeout. For long operations:
- Use background workers
- Implement progress updates
- Use streaming responses

---

## 💰 Cost Optimization

### Single Eco Dyno ($5/month):
- Sleeps after 30 minutes of inactivity
- Good for: Dev/staging environments
- First request after sleep takes 10-20 seconds

### Basic Dyno ($7/month):
- Never sleeps
- Good for: Low-traffic production apps
- Recommended minimum for production

### Multiple Dynos:
```bash
# Load balancing with 2 dynos
heroku ps:scale web=2  # $14/month for Basic

# Add worker dyno for background jobs
heroku ps:scale worker=1  # +$7/month
```

---

## 📈 Performance Tips

### Enable HTTP/2:
Automatically enabled on all Heroku apps!

### Add CDN:
```bash
heroku addons:create fastly:test
```

### Enable Gzip:
Already configured in your Express app with `compression` middleware ✅

### Monitoring:
```bash
# Add free APM
heroku addons:create scout:chair
```

---

## ✅ Verification Checklist

After deployment:

- [ ] App opens: `heroku open`
- [ ] Health check works: `https://your-app.herokuapp.com/api/health`
- [ ] Login page loads
- [ ] Can register new user
- [ ] Can login
- [ ] WebSocket connects (check browser console)
- [ ] API calls work (no CORS errors)
- [ ] Check logs: `heroku logs --tail`

---

## 🎉 Success!

Your app is now running on Heroku! 🟣

**URL**: https://smart-algos-trading.herokuapp.com

**Advantages:**
- ✅ Industry-standard reliability
- ✅ Excellent documentation
- ✅ Many add-ons
- ✅ Easy scaling
- ✅ Great for production

---

## 🔗 Useful Links

- Heroku Dashboard: https://dashboard.heroku.com
- Heroku DevCenter: https://devcenter.heroku.com
- Node.js on Heroku: https://devcenter.heroku.com/articles/deploying-nodejs
- Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
- Status: https://status.heroku.com

---

## 📞 Need Help?

- Check Heroku DevCenter docs
- Visit Heroku Help Center
- Check Stack Overflow with `[heroku]` tag

