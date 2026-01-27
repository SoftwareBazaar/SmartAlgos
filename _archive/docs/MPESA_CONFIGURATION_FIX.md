# 🔧 M-Pesa Configuration Error - FIX GUIDE

## ❌ **The Error You're Getting**

```
errorCode: '500.001.1001'
errorMessage: 'Merchant does not exist'
```

**What this means:** Your M-Pesa Business Shortcode is **invalid** or **not configured correctly** in the Safaricom system.

---

## 🎯 **The Problem**

The M-Pesa API is rejecting your requests because:
1. ❌ The Business Shortcode doesn't exist in Safaricom's system
2. ❌ The Shortcode doesn't match your Consumer Key/Secret
3. ❌ You're using production credentials in sandbox mode (or vice versa)
4. ❌ The Shortcode is not activated for STK Push/Lipa Na M-Pesa

---

## ✅ **How to Fix**

### **Step 1: Verify Your M-Pesa Environment**

Check what environment you're using:

```bash
# In your .env or Railway variables
MPESA_ENVIRONMENT=sandbox  # or production
```

**Important:** Sandbox and Production have **different** credentials!

---

### **Step 2: Get Correct Credentials**

#### **For SANDBOX (Testing):**

1. Go to: https://developer.safaricom.co.ke/
2. **Login** or **Create Account**
3. Go to **"My Apps"** → **Create New App**
4. Select **"Lipa Na M-Pesa Sandbox"**
5. Click **"Create App"**

You'll get:
- **Consumer Key**
- **Consumer Secret**

6. Go to **"Test Credentials"** tab:
   - **Shortcode:** Usually `174379` or `601426` (Safaricom test shortcode)
   - **Passkey:** Provided in the portal
   - **Test Phone:** `254708374149` (Safaricom test number)

#### **For PRODUCTION (Real Money):**

1. You need a **registered business** with Safaricom
2. Apply for M-Pesa Paybill/Till Number
3. Register on Daraja Portal
4. Get approval from Safaricom
5. Receive production credentials

**Note:** Production requires business registration and can take weeks to approve.

---

### **Step 3: Update Environment Variables**

#### **On Railway:**

1. Go to https://railway.app/dashboard
2. Select your project
3. Go to **"Variables"** tab
4. Update these variables:

```bash
# For SANDBOX Testing
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=<your_sandbox_consumer_key>
MPESA_CONSUMER_SECRET=<your_sandbox_consumer_secret>
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=<your_sandbox_passkey>
MPESA_CALLBACK_URL=https://web-production-fdb58.up.railway.app/api/mpesa/callback
```

5. Click **"Deploy"** to apply changes

---

### **Step 4: Common Sandbox Test Credentials**

If you just created a Daraja account, try these **common sandbox values**:

```bash
MPESA_ENVIRONMENT=sandbox
MPESA_BUSINESS_SHORTCODE=174379
# Get these from your Daraja portal:
MPESA_CONSUMER_KEY=<from your app>
MPESA_CONSUMER_SECRET=<from your app>
MPESA_PASSKEY=<from test credentials tab>
```

**Shortcode Options for Sandbox:**
- `174379` - Most common
- `601426` - Alternative
- `600000` - Sometimes used

**Test Phone Numbers:**
- `254708374149` - Official Safaricom test number
- Your actual M-Pesa number (works in sandbox too)

---

### **Step 5: Verify Configuration**

After updating, run this to verify:

```bash
node check-mpesa-env.js
```

Should show:
```
✅ MPESA_CONSUMER_KEY: Set
✅ MPESA_CONSUMER_SECRET: Set
✅ MPESA_BUSINESS_SHORTCODE: Set (174379)
✅ MPESA_PASSKEY: Set
✅ MPESA_ENVIRONMENT: sandbox
```

---

## 🧪 **Test After Fixing**

1. **Wait 2-3 minutes** for Railway to redeploy

2. **Try payment again:**
   - Enter phone: `254728103441` (your number)
   - Amount: `7` KES
   - Click "Send STK Push"

3. **Expected result:**
   - ✅ "STK Push sent! Check your phone"
   - ✅ M-Pesa prompt on your phone
   - ✅ Can complete payment

---

## 🔍 **Check Logs**

If still failing, check Railway logs:

```
Click "Deployments" → Select latest → "View Logs"
```

Look for:
```
✅ M-Pesa Service initialized in SANDBOX mode
✅ M-Pesa access token generated successfully
```

Or errors:
```
❌ Failed to generate M-Pesa access token: Invalid credentials
❌ STK Push failed: Merchant does not exist
```

---

## 📋 **Troubleshooting Checklist**

| Check | Status | Action |
|-------|--------|--------|
| Daraja account created | ☐ | Create at developer.safaricom.co.ke |
| App created in Daraja | ☐ | Create "Lipa Na M-Pesa Sandbox" app |
| Consumer Key copied | ☐ | From "Keys" tab |
| Consumer Secret copied | ☐ | From "Keys" tab |
| Passkey copied | ☐ | From "Test Credentials" tab |
| Shortcode correct | ☐ | Use 174379 for sandbox |
| Environment set to sandbox | ☐ | `MPESA_ENVIRONMENT=sandbox` |
| Variables updated in Railway | ☐ | In "Variables" tab |
| Server redeployed | ☐ | Wait 2-3 minutes |

---

## 🎯 **Quick Fix Checklist**

**Most Common Issue:** Using wrong Business Shortcode

**Quick Fix:**
1. Set `MPESA_BUSINESS_SHORTCODE=174379` (Safaricom sandbox)
2. Verify Consumer Key/Secret match your Daraja app
3. Set `MPESA_ENVIRONMENT=sandbox`
4. Redeploy
5. Test again

---

## 💡 **Production Deployment (Later)**

When ready to accept real payments:

1. **Register your business** with Safaricom
2. **Apply for M-Pesa Paybill** or Till Number
3. **Register on Daraja Portal** with business details
4. **Submit for approval** (takes 2-4 weeks)
5. **Receive production credentials**
6. Update environment to `production`
7. **Test with small real amounts** (10 KES)

---

## 📞 **Get Help**

**Safaricom Daraja Support:**
- Email: apisupport@safaricom.co.ke
- Portal: https://developer.safaricom.co.ke/support

**Documentation:**
- STK Push: https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate

---

## ✅ **Summary**

**Your Issue:** `Merchant does not exist (500.001.1001)`

**Root Cause:** Invalid Business Shortcode

**Fix:**
1. Use Safaricom's sandbox shortcode: `174379`
2. Get Consumer Key/Secret from Daraja Portal
3. Get Passkey from Test Credentials tab
4. Set `MPESA_ENVIRONMENT=sandbox`
5. Update Railway variables
6. Redeploy
7. Test again

**Once you fix this, the M-Pesa payment will work!** 🚀

---

**Last Updated:** October 27, 2025

