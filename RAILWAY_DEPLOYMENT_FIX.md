# 🚂 Railway Deployment - Error Fix

## ✅ ERRORS IDENTIFIED:

1. **CRITICAL**: `ENCRYPTION_KEY` environment variable missing
2. **WARNING**: Using `SUPABASE_ANON_KEY` instead of `SUPABASE_SERVICE_ROLE_KEY`
3. **WARNING**: `/app/uploads/` directory doesn't exist

---

## 🔧 QUICK FIX STEPS:

### Step 1: Generate Encryption Key

Run this command in your local terminal (Windows PowerShell):

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Copy the output** (will look like: `3k9v2B5m8n4P7q1...`)

---

### Step 2: Add Environment Variables in Railway

1. Go to your Railway project dashboard
2. Click on your service
3. Go to **"Variables"** tab
4. Click **"New Variable"**
5. Add these **THREE** variables:

```env
ENCRYPTION_KEY=paste_the_key_you_generated_above

SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

NODE_ENV=production
```

**To get your Supabase Service Role Key:**
- Go to https://supabase.com/dashboard
- Select your project
- Click **Settings** → **API**
- Find **"service_role"** (marked as secret)
- Copy the key (starts with `eyJ...`)

---

### Step 3: Fix Uploads Directory

Railway will automatically redeploy. Meanwhile, let's fix the code so this doesn't happen again.
