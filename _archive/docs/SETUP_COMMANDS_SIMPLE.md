# 🚀 Simple Setup Commands - Copy & Paste

## Step 1: Generate License Secret Salt

**Run this in your terminal (project root):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copy the output** (it will look like this):
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

## Step 2: Add to `.env` File

**Open `.env` file and add this line:**
```env
LICENSE_SECRET_SALT=paste-your-generated-value-here
```

**Example:**
```env
LICENSE_SECRET_SALT=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

Save the file!

---

## Step 3: Add to Railway

### Option A: Railway Dashboard (Easiest)
1. Go to https://railway.app
2. Open your project
3. Click your backend service
4. Click **Variables** tab
5. Click **+ New Variable**
6. Enter:
   - Name: `LICENSE_SECRET_SALT`
   - Value: (paste your generated string)
7. Click **Add**

### Option B: Railway CLI
```bash
railway variables set LICENSE_SECRET_SALT=your-generated-value-here
```

---

## Step 4: Setup Database Tables

### Option A: Automated (Recommended)
```bash
node setup-license-tables.js
```

### Option B: Manual (If automated fails)
1. Go to https://supabase.com
2. Open your project
3. Click **SQL Editor**
4. Click **New Query**
5. Open file: `database/create-licenses-tables.sql`
6. Copy ALL the content
7. Paste into Supabase SQL Editor
8. Click **Run**

---

## Step 5: Test Everything Works

```bash
node test-license-system.js
```

**Expected output:**
```
✅ License key generated: LB-M1-9C8E7F2A-20260227
✅ License created in database
✅ License validation result: Valid
🎉 ALL TESTS PASSED
```

---

## Step 6: Deploy to Railway

```bash
git add .
git commit -m "feat: Add license system"
git push origin main
```

Railway will automatically deploy!

---

## ✅ Done!

Your license system is now set up and ready to use!

**Next:** Make a test purchase to see licenses generated automatically.

---

## 🐛 Quick Troubleshooting

**"LICENSE_SECRET_SALT not set"**
→ Make sure you added it to `.env` AND Railway

**"Table does not exist"**
→ Run `node setup-license-tables.js` or create tables manually in Supabase

**"Email not sent"**
→ Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`

**Tests fail**
→ Check database connection and environment variables

---

## 📞 Need Help?

See detailed guide: `SETUP_LICENSE_SECRET_SALT.md`
