# 🚂 Railway Paystack Environment Variables Setup

**Date:** October 4, 2025  
**Status:** ⚠️ NEEDS RAILWAY CONFIGURATION

---

## 🎯 **CURRENT STATUS:**

### **✅ Local Environment:**
- ✅ Paystack test keys are in `.env` file
- ✅ Keys are valid test keys
- ✅ Local development works

### **❌ Railway Production:**
- ❌ Railway doesn't read `.env` file
- ❌ Environment variables not set in Railway
- ❌ Production app runs in mock mode

---

## 🔧 **RAILWAY ENVIRONMENT VARIABLES:**

### **Your Paystack Test Keys:**
```
PAYSTACK_SECRET_KEY=sk_test_b3a69ff8ffd26705cbff454c139d22aff45587da
PAYSTACK_PUBLIC_KEY=pk_test_0d20061d6514ccb2b43966b104dc0cca878df69a
```

---

## 🚀 **HOW TO ADD TO RAILWAY:**

### **Option 1: Railway Dashboard (Recommended)**
1. Go to your Railway project: https://railway.app/project/your-project-id
2. Click on your service (the one running your app)
3. Go to **Variables** tab
4. Click **+ New Variable**
5. Add these two variables:

**Variable 1:**
- **Name:** `PAYSTACK_SECRET_KEY`
- **Value:** `sk_test_b3a69ff8ffd26705cbff454c139d22aff45587da`

**Variable 2:**
- **Name:** `PAYSTACK_PUBLIC_KEY`
- **Value:** `pk_test_0d20061d6514ccb2b43966b104dc0cca878df69a`

6. Click **Save** for each variable
7. Railway will automatically restart your deployment

### **Option 2: Railway CLI**
```bash
# Install Railway CLI (if not installed)
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Add environment variables
railway variables set PAYSTACK_SECRET_KEY=sk_test_b3a69ff8ffd26705cbff454c139d22aff45587da
railway variables set PAYSTACK_PUBLIC_KEY=pk_test_0d20061d6514ccb2b43966b104dc0cca878df69a
```

---

## 🧪 **VERIFY CONFIGURATION:**

### **Step 1: Check Railway Deployment**
After adding the variables, Railway will automatically restart. Check the deployment logs to see:

```
✅ Paystack connected to live API
✅ Real payment processing available
```

### **Step 2: Test in Production**
1. Visit your Railway app: `https://web-production-fdb58.up.railway.app`
2. Go to admin dashboard
3. Try to create a subscription
4. Check if Paystack integration works

### **Step 3: Check Environment Variables**
You can verify the variables are set by checking the Railway dashboard or using the CLI:

```bash
railway variables
```

---

## 📊 **EXPECTED RESULTS:**

### **Before Adding to Railway:**
```
⚠️  Paystack running in MOCK MODE (no real API calls)
Paystack Mock Mode: true
Secret Key Set: false
Public Key Set: false
```

### **After Adding to Railway:**
```
✅ Paystack connected to live API
Paystack Mock Mode: false
Secret Key Set: true
Public Key Set: true
```

---

## 🔒 **SECURITY NOTES:**

### **Test Keys:**
- ✅ **Safe for testing** - No real money charged
- ✅ **Test cards available** - Use Paystack test cards
- ✅ **Full functionality** - All features work in test mode

### **Environment Variables:**
- ✅ **Secure storage** - Railway encrypts environment variables
- ✅ **Not in code** - Keys are not exposed in your repository
- ✅ **Easy management** - Can be updated without code changes

---

## 🧪 **TEST CARDS (Paystack):**

### **Successful Payment:**
```
Card Number: 4084084084084081
Expiry: Any future date
CVV: Any 3 digits
PIN: 1234
```

### **Failed Payment:**
```
Card Number: 4084084084084085
Expiry: Any future date
CVV: Any 3 digits
PIN: 1234
```

### **Insufficient Funds:**
```
Card Number: 4084084084084082
Expiry: Any future date
CVV: Any 3 digits
PIN: 1234
```

---

## 📝 **NEXT STEPS:**

### **1. Add to Railway:**
- [ ] Go to Railway dashboard
- [ ] Add PAYSTACK_SECRET_KEY
- [ ] Add PAYSTACK_PUBLIC_KEY
- [ ] Wait for deployment restart

### **2. Verify Configuration:**
- [ ] Check deployment logs
- [ ] Test payment flow
- [ ] Verify no mock mode

### **3. Test Integration:**
- [ ] Create test subscription
- [ ] Use test cards
- [ ] Verify payment processing

---

## 🎊 **SUMMARY:**

**Current Status:** Paystack keys in `.env`, need to add to Railway  
**Next Step:** Add environment variables to Railway dashboard  
**Time Required:** 2-3 minutes  
**Result:** Real payment processing in production

**Once configured, you'll have:**
- ✅ Real payment processing in production
- ✅ Test mode for development
- ✅ Secure environment variable storage
- ✅ Easy key management

---

## 🚨 **IMPORTANT:**

**Railway does NOT read your `.env` file!**  
**You MUST add environment variables to Railway dashboard!**

**Your app is currently running in mock mode in production because Railway doesn't have the Paystack keys.**

---

**Ready to add Paystack keys to Railway? Go to your Railway dashboard and add the environment variables!** 🚀
