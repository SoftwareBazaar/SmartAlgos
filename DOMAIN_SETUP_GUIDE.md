# Domain Setup Guide - smartalgosts.com

## ✅ Step 1: Configure DNS in Namecheap

1. **Login to Namecheap**
   - Go to: https://namecheap.com
   - Login to your account

2. **Go to Domain List**
   - Click "Domain List" in the left sidebar
   - Find `smartalgosts.com`
   - Click "Manage"

3. **Configure Advanced DNS**
   - Click "Advanced DNS" tab
   - Delete any existing A/CNAME records for @ and www

4. **Add These DNS Records:**

   ```
   Type: CNAME Record
   Host: @
   Value: web-production-fdb58.up.railway.app
   TTL: Automatic
   
   Type: CNAME Record
   Host: www
   Value: web-production-fdb58.up.railway.app
   TTL: Automatic
   ```

5. **Save Changes**
   - Click the green checkmark to save
   - DNS propagation takes 5-30 minutes

---

## ✅ Step 2: Add Custom Domain in Railway

1. **Login to Railway**
   - Go to: https://railway.app
   - Select your Smart Algos project

2. **Go to Settings**
   - Click on your service
   - Click "Settings" tab
   - Scroll to "Domains" section

3. **Add Custom Domain:**
   - Click "Add Domain"
   - Enter: `smartalgosts.com`
   - Click "Add"
   
4. **Add WWW Subdomain:**
   - Click "Add Domain" again
   - Enter: `www.smartalgosts.com`
   - Click "Add"

5. **Wait for SSL**
   - Railway will automatically provision SSL certificates
   - This takes 2-5 minutes
   - You'll see a green checkmark when ready

---

## ✅ Step 3: Update Environment Variables

Add these to Railway environment variables:

```bash
# Frontend URL
CLIENT_URL=https://smartalgosts.com

# Backend URL
BACKEND_URL=https://smartalgosts.com

# CORS Origins (add to existing)
CORS_ORIGIN=https://smartalgosts.com,https://www.smartalgosts.com
```

---

## ✅ Step 4: Test Your Domain

After DNS propagation (5-30 minutes):

1. **Test Main Domain:**
   ```
   https://smartalgosts.com
   ```

2. **Test WWW:**
   ```
   https://www.smartalgosts.com
   ```

3. **Test API:**
   ```
   https://smartalgosts.com/api/health
   ```

---

## 📧 Email Setup (Optional - FREE)

### Option 1: Email Forwarding (FREE)

1. **In Namecheap Dashboard:**
   - Go to "Domain List" → "Manage" → "Advanced DNS"
   - Scroll to "Mail Settings"
   - Click "Email Forwarding"

2. **Add Forwarders:**
   ```
   admin@smartalgosts.com → your.gmail@gmail.com
   support@smartalgosts.com → your.gmail@gmail.com
   info@smartalgosts.com → your.gmail@gmail.com
   ```

3. **Update Gmail Settings:**
   - Gmail → Settings → Accounts
   - "Send mail as" → Add: admin@smartalgosts.com
   - Use Gmail SMTP (already configured in your app)

### Option 2: Professional Email ($1/month)

Use Zoho Mail or Namecheap Private Email for dedicated inbox.

---

## 🔧 Troubleshooting

### Domain not working after 30 minutes?

1. **Check DNS Propagation:**
   - Go to: https://dnschecker.org
   - Enter: smartalgosts.com
   - Should show: web-production-fdb58.up.railway.app

2. **Check Railway Domain Status:**
   - Railway Dashboard → Your Service → Settings → Domains
   - Should show green checkmark

3. **Clear Browser Cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### SSL Certificate Issues?

- Railway auto-provisions SSL
- Takes 2-5 minutes after domain is added
- If stuck, remove domain and re-add it

---

## ✅ Success Checklist

- [ ] DNS records added in Namecheap
- [ ] Custom domain added in Railway
- [ ] SSL certificate active (green checkmark)
- [ ] https://smartalgosts.com loads
- [ ] https://www.smartalgosts.com loads
- [ ] API endpoint works: https://smartalgosts.com/api/health
- [ ] Email forwarding configured (optional)

---

**Next:** After domain is working, we'll update all URLs in the codebase to use smartalgosts.com
