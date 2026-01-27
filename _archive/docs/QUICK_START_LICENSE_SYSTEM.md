# 🚀 Quick Start: License System

## 3-Minute Setup

### 1. Create Database Tables (1 min)

**Option A: Automated**
```bash
node setup-license-tables.js
```

**Option B: Manual (if automated fails)**
1. Open Supabase Dashboard → SQL Editor
2. Copy all content from `database/create-licenses-tables.sql`
3. Paste and click "Run"

### 2. Set Environment Variables (1 min)

Add to `.env`:
```env
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
LICENSE_SECRET_SALT=your-64-character-hex-string-here

# Already configured? Skip this
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 3. Test It Works (1 min)

```bash
node test-license-system.js
```

You should see:
```
✅ License key generated: LB-M1-9C8E7F2A-20260227
✅ License created in database
✅ License validation result: Valid
🎉 ALL TESTS PASSED
```

---

## ✅ That's It!

The license system is now active. When users pay:
- ✅ License automatically generated
- ✅ Email sent with license key
- ✅ MT5 EA can validate license

---

## 🔍 Verify It's Working

### Check License Routes

```bash
# Test validation endpoint (should work without auth)
curl -X POST http://localhost:5000/api/licenses/validate \
  -H "Content-Type: application/json" \
  -d '{"licenseKey":"LB-M1-TEST-20260227","mt5Account":"12345678"}'
```

### Check Payment Integration

Make a test payment and check:
1. Subscription created ✅
2. License key in subscription record ✅
3. Email received with license ✅

---

## 🐛 Troubleshooting

### "Table does not exist"
→ Run `node setup-license-tables.js` or create tables manually

### "LICENSE_SECRET_SALT not set"
→ Add to `.env` (generate with crypto.randomBytes)

### "Email not sent"
→ Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`

### "License validation fails"
→ Check MT5 account matches exactly (6-10 digits)

---

## 📖 Full Documentation

See `LICENSE_SYSTEM_IMPLEMENTATION_COMPLETE.md` for:
- Complete API reference
- Frontend integration examples
- Admin panel features
- Security details
- Cron job setup

---

## 🎯 Next Steps

1. **Frontend**: Add MT5 account input to payment forms
2. **Testing**: Make test purchase and verify license email
3. **Admin**: Add license management to admin dashboard
4. **MT5 EA**: Integrate validation endpoint
5. **Monitoring**: Set up cron jobs for expiring notifications

---

## 💡 Quick Tips

- License format: `LB-[TYPE]-[HASH]-[EXPIRY]`
- Types: W1 (weekly), M1 (monthly), M3 (3mo), M6 (6mo), Y1 (yearly), LT (lifetime)
- Hardware locked to MT5 account number
- Automatic generation on payment success
- Email includes installation instructions

---

**Ready to go! 🚀**
