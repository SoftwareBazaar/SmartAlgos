# 🏦 Wallet Address Setup Guide

## 📍 Where to Add Your Wallet Addresses

### **Option 1: Add to Your `.env` File (Recommended)**

Add these lines to your `.env` file in the **Crypto Payment Configuration** section:

```env
# Crypto Payment Configuration
COINBASE_API_KEY=your_coinbase_commerce_api_key
COINBASE_WEBHOOK_SECRET=your_webhook_secret

# YOUR WALLET ADDRESSES - ADD THESE LINES:
BITCOIN_WALLET_ADDRESS=your_bitcoin_wallet_address_here
ETHEREUM_WALLET_ADDRESS=your_ethereum_wallet_address_here
BINANCE_WALLET_ADDRESS=your_binance_smart_chain_wallet_address_here

# Binance Integration (for crypto rates)
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key

# Optional: Other crypto services
BITPAY_API_KEY=your_bitpay_api_key
CRYPTOCOM_API_KEY=your_crypto_com_api_key

# Bitcoin/Ethereum RPC (for direct blockchain access)
BITCOIN_RPC_URL=https://mainnet.infura.io/v3/your_project_id
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_project_id
```

### **Option 2: Update the Crypto Payment Service**

I'll also update the service to use your real wallet addresses from the environment variables.

---

## 🔧 How to Get Your Wallet Addresses

### **Bitcoin Wallet Address:**
1. **Open your Bitcoin wallet** (Exodus, Electrum, Coinbase, etc.)
2. **Click "Receive"** or "Get Bitcoin"
3. **Copy the address** (starts with "1", "3", or "bc1")
4. **Example**: `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`

### **Ethereum Wallet Address:**
1. **Open your Ethereum wallet** (MetaMask, Trust Wallet, etc.)
2. **Click "Receive"** or "Copy Address"
3. **Copy the address** (starts with "0x")
4. **Example**: `0x742d35Cc6634C0532925a3b8D2C2c2C2c2c2c2c2c`

### **Binance Smart Chain Address:**
1. **Open your BSC wallet** (Trust Wallet, MetaMask with BSC network)
2. **Switch to BSC network** (Binance Smart Chain)
3. **Click "Receive"** or "Copy Address"
4. **Copy the address** (starts with "0x" - same format as Ethereum)
5. **Example**: `0x742d35Cc6634C0532925a3b8D2C2c2C2c2c2c2c2c`

---

## 📝 Step-by-Step Setup

### **Step 1: Create Your `.env` File**
```bash
# Copy the example file
cp env.example .env
```

### **Step 2: Add Your Wallet Addresses**
Open your `.env` file and add these lines:

```env
# Add these lines to your .env file:
BITCOIN_WALLET_ADDRESS=1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
ETHEREUM_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D2C2c2C2c2c2c2c2c
BINANCE_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D2C2c2C2c2c2c2c2c
```

**⚠️ Replace with YOUR actual wallet addresses!**

### **Step 3: Update the Crypto Payment Service**
The service will automatically use your addresses from the environment variables.

### **Step 4: Test Your Setup**
```bash
# Start your server
npm start

# Test crypto payments
node test-crypto-payments.js
```

---

## 🎯 Example `.env` Configuration

Here's what your `.env` file should look like:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Payment Gateway Configuration
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key

# Crypto Payment Configuration
COINBASE_API_KEY=your_coinbase_commerce_api_key
COINBASE_WEBHOOK_SECRET=your_webhook_secret

# YOUR WALLET ADDRESSES - ADD THESE:
BITCOIN_WALLET_ADDRESS=1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
ETHEREUM_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D2C2c2C2c2c2c2c2c
BINANCE_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D2C2c2C2c2c2c2c2c

# Binance Integration (for crypto rates)
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key

# Bitcoin/Ethereum RPC (for direct blockchain access)
BITCOIN_RPC_URL=https://mainnet.infura.io/v3/your_project_id
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_project_id
```

---

## 🔐 Security Notes

### **✅ DO:**
- Use **separate wallet addresses** for your platform
- **Keep your private keys safe** (never share them)
- **Test with small amounts** first
- **Monitor your wallet addresses** for incoming payments

### **❌ DON'T:**
- **Share your private keys** with anyone
- **Use your main wallet** for business transactions
- **Store private keys** in your code or database
- **Skip testing** with small amounts

---

## 🚀 Quick Setup Commands

```bash
# 1. Copy environment file
cp env.example .env

# 2. Edit your .env file (add your wallet addresses)
notepad .env  # Windows
# or
nano .env     # Linux/Mac

# 3. Start your server
npm start

# 4. Test crypto payments
node test-crypto-payments.js
```

---

## 📱 What Users Will See

Once you add your wallet addresses, users will see:

### **Bitcoin Payment:**
- **Amount**: 0.0004 BTC (for $18)
- **Address**: Your Bitcoin wallet address
- **QR Code**: For mobile scanning

### **Ethereum Payment:**
- **Amount**: 0.006 ETH (for $18)
- **Address**: Your Ethereum wallet address
- **QR Code**: For mobile scanning

### **Binance Coin Payment:**
- **Amount**: 0.06 BNB (for $18)
- **Address**: Your BSC wallet address
- **QR Code**: For mobile scanning

---

## 🎉 You're All Set!

After adding your wallet addresses to the `.env` file:

1. **Your crypto payments will work** with real addresses
2. **Users can send crypto** to your wallet addresses
3. **You'll receive payments** directly to your wallets
4. **System will track** all incoming transactions

**Remember**: Replace the example addresses with your actual wallet addresses! 🚀💰
