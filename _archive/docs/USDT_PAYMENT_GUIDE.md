# 💎 USDT Payment Setup Guide

## 🎯 Quick USDT Setup

### **Step 1: Add USDT Wallet to Railway**

In your Railway dashboard, add this environment variable:

```bash
USDT_WALLET_ADDRESS=your_usdt_trc20_wallet_address
```

**Example:**
```bash
USDT_WALLET_ADDRESS=TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE
```

### **Step 2: Test USDT Payment**

1. **Go to your EA Marketplace**
2. **Select an EA** → Click "Subscribe" 
3. **Choose "Cryptocurrency"**
4. **Select "USDT"**
5. **Get payment details:**
   - **Address:** Your USDT wallet address
   - **Amount:** Calculated USDT amount
   - **QR Code:** For mobile scanning
   - **Network:** TRC20 (Tron)

### **Step 3: Complete Payment**

1. **Open your USDT wallet** (Trust Wallet, MetaMask, etc.)
2. **Send USDT** to the displayed address
3. **Use TRC20 network** (Tron blockchain)
4. **Wait for confirmation** (10-30 minutes)
5. **Subscription activates** automatically!

---

## 🔧 USDT Configuration Details

### **Network:** TRC20 (Tron)
> [!IMPORTANT]
> **Minimum Payment:** $10.00 USD. 
> Most cryptocurrency exchanges (like Binance or OKX) have a **minimum withdrawal limit of 10 USDT**. Payments below this amount will not be processable by many users.

- **Fast transactions** (3-5 minutes)
- **Low fees** (~$1-2)
- **Widely supported** by wallets

### **Supported Wallets:**
- ✅ Trust Wallet
- ✅ MetaMask (with Tron network)
- ✅ TronLink
- ✅ Exodus
- ✅ Atomic Wallet

### **Exchange Support:**
- ✅ Binance
- ✅ Coinbase
- ✅ Kraken
- ✅ KuCoin

---

## 💰 USDT Payment Flow

### **User Experience:**
1. **Select EA** → Choose subscription
2. **Pick USDT** → See payment details
3. **Scan QR code** or copy address
4. **Send USDT** from wallet
5. **Wait confirmation** → Get access!

### **Your Experience:**
1. **USDT arrives** in your wallet
2. **System detects** payment automatically
3. **Subscription created** in database
4. **User gets** download access
5. **Email sent** with download links

---

## 🚀 Benefits of USDT

### **✅ For Users:**
- **Fast payments** (3-5 minutes)
- **Low fees** (~$1-2)
- **Global availability**
- **No bank account needed**

### **✅ For You:**
- **Instant settlement**
- **No chargebacks**
- **Global reach**
- **Lower fees** than cards

---

## 🔍 Testing USDT Payments

### **Test Script:**
```bash
node test-usdt-payment.js
```

### **Manual Test:**
1. **Start your server:** `npm start`
2. **Go to marketplace**
3. **Try USDT payment**
4. **Check payment generation**

---

## 📱 Mobile USDT Payments

### **QR Code Scanning:**
- **Trust Wallet:** Scan QR → Send USDT
- **MetaMask:** Scan QR → Switch to Tron → Send
- **TronLink:** Scan QR → Confirm → Send

### **Copy-Paste Method:**
- **Copy address** from payment screen
- **Paste in wallet** send field
- **Enter exact amount**
- **Send via TRC20**

---

## 🎯 Ready to Accept USDT!

**USDT payments work immediately** once you add your wallet address to Railway!

**No registration, no approval, no waiting!** 💎🚀
