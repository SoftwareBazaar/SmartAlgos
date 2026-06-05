# Vercel Migration Guide
## Moving from Railway → Vercel

---

## Step 1: Export Variables from Railway

### Option A: Railway CLI (Recommended)
```bash
# Install Railway CLI if needed
npm install -g @railway/cli

# Log in
railway login

# Link to your project (run from this folder)
railway link

# Export all vars to a file
railway variables > .env.railway
```

Or just double-click **`export-env-for-vercel.bat`** — it does all the above automatically.

### Option B: Manual Download from Railway Dashboard
1. Go to [railway.app](https://railway.app) → your project
2. Click your service → **Variables** tab
3. Click the **Raw Editor** button (top right)
4. Copy everything and paste into a new file called `.env.railway`

---

## Step 2: Add Variables to Vercel

### Option A: Vercel Dashboard (Easy)
1. Go to [vercel.com](https://vercel.com) → your project → **Settings** → **Environment Variables**
2. Click **Import .env** and upload your `.env.railway` file
3. Select which environments to apply them to: **Production**, **Preview**, **Development**

### Option B: Vercel CLI (Automated)
```bash
npm install -g vercel
vercel login

# Import all vars at once
vercel env pull   # pulls from Vercel to local
```

Or run **`export-env-for-vercel.ps1`** which can push directly to Vercel.

---

## Step 3: Add These EXTRA Variables in Vercel

These don't exist in Railway — add them manually in Vercel dashboard:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://your-app.vercel.app` (your Vercel URL) |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app,https://smartalgosts.com` |

If you have a custom domain, replace `your-app.vercel.app` with it.

---

## Step 4: Deploy on Vercel

### First Deployment (via Dashboard)
1. Push your code to GitHub (if not already): `git push origin main`
2. Go to [vercel.com/new](https://vercel.com/new)
3. Click **Import Git Repository** → select your repo
4. Configure:
   - **Root Directory**: *(leave blank)*
   - **Framework Preset**: Other
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install`
5. Click **Deploy**

### Via Vercel CLI
```bash
npm install -g vercel
vercel
# Follow prompts → link to project → deploy
```

---

## Step 5: Update Your Custom Domain (if you have one)

1. In Vercel: **Settings** → **Domains** → Add your domain
2. Update DNS records at your domain registrar:
   - Add a `CNAME` record pointing to `cname.vercel-dns.com`
   - OR follow Vercel's specific instructions for your domain

---

## Step 6: Update Google OAuth

Your Google OAuth needs the new Vercel URL added as an authorized origin:

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. APIs & Services → Credentials → your OAuth client
3. Add to **Authorized JavaScript origins**:
   - `https://your-app.vercel.app`
   - `https://smartalgosts.com` (if custom domain)
4. Add to **Authorized redirect URIs**:
   - `https://your-app.vercel.app/api/auth/google/callback`

---

## Important Notes

### ⚠️ File Uploads Won't Work on Vercel
Vercel is serverless — the filesystem is read-only and ephemeral. Your `/uploads` folder **won't persist**. Since you're already using **Supabase Storage**, that's fine for EA files and images. Just make sure nothing is saving to `./uploads` in production.

### ⚠️ WebSockets (Socket.io)
Vercel serverless functions don't support persistent WebSocket connections. Socket.io will fall back to HTTP long-polling automatically, which still works but is less efficient. If real-time features are critical, you can keep Railway just for the WebSocket server or use a service like [Pusher](https://pusher.com) (has a free tier).

### ✅ Everything Else Works Fine
- Express API routes → served via `/api/index.js` serverless function
- React frontend → served as static files
- Supabase database → works perfectly (it's external)
- Paystack, email, etc. → all work via environment variables

---

## Troubleshooting

**Build fails?**
- Check Vercel build logs
- Make sure all env vars are set
- Try running `cd client && npm run build` locally first

**API calls return 404?**
- Verify `vercel.json` routes are correct
- Check that `/api/index.js` exports the app correctly

**CORS errors?**
- Add your Vercel URL to `ALLOWED_ORIGINS` env var in Vercel dashboard
- Vercel preview URLs are automatically allowed

**Google OAuth doesn't work?**
- Update authorized origins in Google Cloud Console (Step 6 above)
