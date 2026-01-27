# Update Environment Variables for smartalgosts.com

## Railway Environment Variables to Add/Update

Go to Railway Dashboard → Your Project → Variables tab

### Add these new variables:

```bash
# Frontend URL
CLIENT_URL=https://smartalgosts.com

# Backend URL  
BACKEND_URL=https://smartalgosts.com

# Public URL
PUBLIC_URL=https://smartalgosts.com

# CORS Origins (if you have this variable)
CORS_ORIGIN=https://smartalgosts.com,https://www.smartalgosts.com
```

### Update existing callback URLs:

If you have M-Pesa configured, update:
```bash
MPESA_CALLBACK_URL=https://smartalgosts.com/api/mpesa/callback
```

If you have Paystack configured, update:
```bash
PAYSTACK_CALLBACK_URL=https://smartalgosts.com/api/payments/paystack/callback
```

---

## After Adding Variables:

1. Railway will automatically redeploy
2. Wait 2-3 minutes for deployment
3. Test your domain: https://smartalgosts.com
4. Test API: https://smartalgosts.com/api/health

---

## Success! Your site is now live at:
- 🌐 https://smartalgosts.com
- 🌐 https://www.smartalgosts.com
