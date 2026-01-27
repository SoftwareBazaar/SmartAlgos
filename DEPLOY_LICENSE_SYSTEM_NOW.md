# 🚀 Deploy License System - Action Plan

## ⏱️ Estimated Time: 10 Minutes

---

## ✅ Pre-Deployment Checklist

### 1. Database Setup (2 min)

```bash
# Run automated setup
node setup-license-tables.js
```

**OR** if that fails:
1. Open Supabase Dashboard → SQL Editor
2. Copy `database/create-licenses-tables.sql`
3. Paste and execute

**Verify:**
```bash
# Should show 3 tables created
✅ ea_licenses
✅ ea_license_usage  
✅ ea_license_regenerations
```

---

### 2. Environment Variables (2 min)

**Generate LICENSE_SECRET_SALT:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Add to `.env`:**
```env
LICENSE_SECRET_SALT=<paste-generated-value-here>
```

**Verify email is configured:**
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

---

### 3. Local Testing (3 min)

```bash
# Test the system
node test-license-system.js
```

**Expected Output:**
```
✅ License key generated: LB-M1-9C8E7F2A-20260227
✅ License created in database
✅ License validation result: Valid
✅ Email sent successfully
🎉 ALL TESTS PASSED
```

**If tests fail:**
- Check database tables exist
- Verify `LICENSE_SECRET_SALT` is set
- Check email configuration

---

### 4. Deploy to Railway (3 min)

```bash
# Commit all changes
git add .
git commit -m "feat: Add MT5 EA license generation system

- Integrated license generation into payment flows
- Added license API endpoints
- Created database tables for licenses
- Automatic email delivery with license keys
- Hardware-locked to MT5 accounts"

# Push to trigger Railway deployment
git push origin main
```

**Monitor deployment:**
1. Open Railway Dashboard
2. Watch build logs
3. Wait for "Deployment successful"

---

### 5. Verify Production (2 min)

**Test validation endpoint:**
```bash
curl -X POST https://your-backend.railway.app/api/licenses/validate \
  -H "Content-Type: application/json" \
  -d '{"licenseKey":"LB-M1-TEST-20260227","mt5Account":"12345678"}'
```

**Expected Response:**
```json
{
  "success": true,
  "valid": false,
  "reason": "License key not found"
}
```
*(This is correct - test key doesn't exist)*

**Check Railway environment variables:**
1. Open Railway Dashboard
2. Go to Variables tab
3. Verify `LICENSE_SECRET_SALT` is set
4. Verify `EMAIL_USER` and `EMAIL_PASSWORD` are set

---

## 🧪 Post-Deployment Testing

### Test 1: Make a Test Purchase

1. Go to your marketplace
2. Select an EA
3. **Enter MT5 account number** (e.g., `12345678`)
4. Complete payment (use test mode)
5. Check email for license key

**Expected:**
- ✅ Payment successful
- ✅ Subscription created
- ✅ License key generated
- ✅ Email received with license

### Test 2: Validate License

```bash
# Use the license key from email
curl -X POST https://your-backend.railway.app/api/licenses/validate \
  -H "Content-Type: application/json" \
  -d '{"licenseKey":"<your-license-key>","mt5Account":"12345678"}'
```

**Expected:**
```json
{
  "success": true,
  "valid": true,
  "license": { ... },
  "expiryDate": "2026-02-27"
}
```

### Test 3: Check User Dashboard

1. Login to user account
2. Navigate to "My Licenses" or subscriptions
3. Verify license key is displayed

### Test 4: Check Admin Panel

1. Login as admin
2. Go to license management
3. Verify license appears in list
4. Check statistics are accurate

---

## 🎯 Success Criteria

All of these should be ✅:

- [ ] Database tables created
- [ ] Environment variables set
- [ ] Local tests pass
- [ ] Deployed to Railway
- [ ] Production endpoint responds
- [ ] Test purchase creates license
- [ ] Email delivered with license
- [ ] License validation works
- [ ] User can see license
- [ ] Admin can manage licenses

---

## 🐛 Troubleshooting

### Issue: "Table does not exist"
**Solution:**
```bash
node setup-license-tables.js
```
Or run SQL manually in Supabase

### Issue: "LICENSE_SECRET_SALT not set"
**Solution:**
```bash
# Generate
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
LICENSE_SECRET_SALT=<generated-value>

# Add to Railway
# Dashboard → Variables → Add Variable
```

### Issue: "Email not sent"
**Solution:**
- Check `EMAIL_USER` and `EMAIL_PASSWORD` in Railway
- Verify Gmail app password is correct
- Check Railway logs for email errors

### Issue: "License not generated after payment"
**Solution:**
- Check payment metadata includes `mt5_account`
- Review Railway logs for errors
- Verify `paymentLicenseIntegration` is imported

### Issue: "License validation fails"
**Solution:**
- Verify MT5 account matches exactly
- Check license is active in database
- Ensure license hasn't expired

---

## 📊 Monitoring

### Check Railway Logs

```bash
# In Railway Dashboard
1. Go to Deployments
2. Click latest deployment
3. View logs
4. Search for "License" or "🔑"
```

**Look for:**
```
✅ License key generated: LB-M1-...
✅ License email sent successfully
✅ Subscription updated with license key
```

### Check Database

```sql
-- In Supabase SQL Editor
SELECT 
  license_key,
  customer_email,
  mt5_account,
  license_type,
  expiry_date,
  is_active
FROM ea_licenses
ORDER BY created_at DESC
LIMIT 10;
```

### Check Email Delivery

1. Check spam folder
2. Verify email address is correct
3. Check Railway logs for email errors
4. Test with `node test-license-system.js`

---

## 🎉 You're Live!

Once all checks pass:

1. ✅ License system is operational
2. ✅ Automatic generation on payment
3. ✅ Email delivery working
4. ✅ Validation endpoint active
5. ✅ Admin management available

---

## 📝 Next Steps

### Immediate (Today)
- [ ] Update user documentation with license instructions
- [ ] Add MT5 account input to payment forms
- [ ] Display license keys in user dashboard
- [ ] Test with real payment

### Short Term (This Week)
- [ ] Add license management to admin panel
- [ ] Create MT5 EA installation guide
- [ ] Set up monitoring alerts
- [ ] Configure cron jobs for expiring notifications

### Long Term (This Month)
- [ ] Integrate validation into MT5 EAs
- [ ] Add license regeneration UI
- [ ] Implement license analytics
- [ ] Create customer support workflows

---

## 📞 Need Help?

**Documentation:**
- `QUICK_START_LICENSE_SYSTEM.md` - Quick setup
- `LICENSE_SYSTEM_IMPLEMENTATION_COMPLETE.md` - Full docs
- `LICENSE_SYSTEM_DEPLOYED.md` - Deployment guide

**Testing:**
- `test-license-system.js` - Test suite
- `setup-license-tables.js` - Database setup

**Code:**
- `services/licenseService.js` - Core logic
- `routes/licenses.js` - API endpoints
- `database/create-licenses-tables.sql` - Schema

---

## ⚡ Quick Commands

```bash
# Setup database
node setup-license-tables.js

# Test system
node test-license-system.js

# Generate secret salt
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Deploy
git add . && git commit -m "feat: Add license system" && git push

# Test production
curl -X POST https://your-backend.railway.app/api/licenses/validate \
  -H "Content-Type: application/json" \
  -d '{"licenseKey":"TEST","mt5Account":"12345678"}'
```

---

**Ready? Let's deploy! 🚀**

Start with Step 1: Database Setup
