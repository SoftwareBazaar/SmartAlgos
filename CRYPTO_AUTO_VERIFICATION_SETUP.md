# 🚀 Automatic Crypto Payment Verification Setup

## ✅ What's Been Implemented

Your crypto payment system now has **automatic blockchain verification**! Payments are automatically confirmed when transactions are detected on the blockchain.

### Features:
- ✅ **Automatic Transaction Detection** - Checks blockchain every 2 minutes
- ✅ **Multi-Blockchain Support** - Bitcoin, Ethereum, USDT (TRC20/ERC20), USDC
- ✅ **Multiple API Providers** - BlockCypher, Etherscan, TronGrid (with fallbacks)
- ✅ **Confirmation Thresholds** - Waits for required confirmations before confirming
- ✅ **Background Monitoring** - Runs automatically without manual intervention

---

## 🔑 Required API Keys

To enable automatic verification, add these API keys to your Railway environment variables:

### Option 1: BlockCypher API (Recommended - Free Tier)
**Best for:** Bitcoin and Ethereum

1. **Sign up:** https://www.blockcypher.com/dev/
2. **Get API Key:** Dashboard → API Tokens → Create Token
3. **Free Tier:** 200 requests/hour (perfect for small-medium traffic)

**Railway Variable:**
```
BLOCKCYPHER_API_KEY=your_blockcypher_api_key_here
```

### Option 2: Etherscan API (Required for ERC20 tokens)
**Best for:** Ethereum, USDT (ERC20), USDC

1. **Sign up:** https://etherscan.io/apis
2. **Get API Key:** Account → API-KEYs → Add
3. **Free Tier:** 5 calls/second (100,000 calls/day)

**Railway Variable:**
```
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### Option 3: TronGrid API (Optional - for TRC20)
**Best for:** USDT on Tron network (TRC20)

1. **Sign up:** https://www.trongrid.io/
2. **Get API Key:** Dashboard → API Keys → Create
3. **Free Tier:** Unlimited requests

**Railway Variable:**
```
TRON_API_KEY=your_tron_api_key_here
```

---

## 📝 Setup Instructions

### Step 1: Get Your API Keys

1. **BlockCypher** (if using Bitcoin/Ethereum):
   - Go to https://www.blockcypher.com/dev/
   - Sign up for free account
   - Create API token
   - Copy token

2. **Etherscan** (required for USDT/USDC on Ethereum):
   - Go to https://etherscan.io/apis
   - Sign up for free account
   - Create API key
   - Copy API key

3. **TronGrid** (optional, for TRC20 USDT):
   - Go to https://www.trongrid.io/
   - Sign up and get API key

### Step 2: Add to Railway

1. Go to your Railway project
2. Click on your service → **Variables** tab
3. Add each API key:
   ```
   BLOCKCYPHER_API_KEY=your_key_here
   ETHERSCAN_API_KEY=your_key_here
   TRON_API_KEY=your_key_here (optional)
   ```
4. **Redeploy** (Railway auto-deploys on variable changes)

### Step 3: Verify It's Working

After redeploying, check your Railway logs for:
```
✅ Blockchain monitoring service enabled - automatic payment verification active
✅ Crypto payment monitor started
```

If you see:
```
⚠️  Blockchain monitoring available but no API keys configured
```
→ Add the API keys and redeploy

---

## 🔄 How It Works

1. **User Initiates Payment**
   - User selects crypto and sees wallet address
   - Payment record created in database with status `pending`

2. **User Sends Crypto**
   - User sends crypto from their wallet to your address
   - Transaction broadcast to blockchain

3. **Automatic Monitoring** (Every 2 minutes)
   - System checks blockchain for transactions
   - Matches amount and recipient address
   - Waits for required confirmations:
     - Bitcoin: 1 confirmation
     - Ethereum: 12 confirmations (~3 minutes)
     - USDT TRC20: 19 confirmations (~1 minute)
     - USDT/USDC ERC20: 12 confirmations

4. **Auto-Confirmation**
   - When confirmations reached → status changes to `confirmed`
   - Subscription automatically activated
   - User gets access immediately

---

## 📊 Supported Cryptocurrencies

| Crypto | Network | API Used | Confirmations Required |
|--------|---------|----------|------------------------|
| BTC | Bitcoin | BlockCypher / Blockchain.info | 1 |
| ETH | Ethereum | BlockCypher / Etherscan | 12 |
| USDT | TRC20 (Tron) | TronGrid | 19 |
| USDT | ERC20 (Ethereum) | Etherscan | 12 |
| USDC | ERC20 (Ethereum) | Etherscan | 12 |

---

## 🔒 Security Features

- ✅ **Webhook Signature Verification** - Uses HMAC SHA256
- ✅ **Idempotency** - Prevents double-processing
- ✅ **Amount Verification** - Ensures exact amount matches
- ✅ **Timestamp Verification** - Only accepts transactions after payment creation
- ✅ **Rate Limiting** - Respects API limits

---

## 🧪 Testing

### Test with Real Transaction:
1. Create a small test payment ($2-5)
2. Send crypto to the displayed address
3. Wait 2-5 minutes
4. Payment should auto-confirm (check logs)

### Check Logs:
```bash
# In Railway logs, look for:
[Blockchain Monitor] Transaction confirmed on blockchain
[Crypto Payment Monitor] ✅ Payment confirmed: payment_id
```

---

## 🐛 Troubleshooting

### Payments Not Auto-Confirming?

1. **Check API Keys:**
   - Verify keys are in Railway variables
   - Check logs for "no API keys configured" warnings

2. **Check Rate Limits:**
   - BlockCypher: 200/hour (free tier)
   - Etherscan: 5/second (free tier)
   - If exceeded, wait an hour or upgrade

3. **Check Transaction:**
   - Verify transaction exists on blockchain explorer
   - Ensure amount matches exactly
   - Ensure transaction is to correct address

4. **Check Logs:**
   - Look for verification errors
   - Check if transaction found but not confirmed yet

### Manual Override:
If needed, you can manually confirm payments in the database:
```sql
UPDATE crypto_payments 
SET status = 'confirmed', confirmed_at = NOW() 
WHERE id = 'payment_id';
```

---

## 📈 Monitoring

### Check Pending Payments:
```sql
SELECT id, crypto_currency, crypto_amount, wallet_address, created_at, expires_at 
FROM crypto_payments 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

### Check Confirmed Payments:
```sql
SELECT id, crypto_currency, tx_hash, confirmations, confirmed_at 
FROM crypto_payments 
WHERE status = 'confirmed' 
ORDER BY confirmed_at DESC 
LIMIT 10;
```

---

## 🚀 Next Steps (Optional)

1. **Real-Time Exchange Rates:**
   - Integrate CoinGecko API for live rates
   - Currently using mock rates

2. **Email Notifications:**
   - Send email when payment confirmed
   - Send email if payment expires

3. **Admin Dashboard:**
   - View all pending/confirmed payments
   - Manual override interface

---

## ✅ Summary

**You're all set!** Just add the API keys and redeploy. Your crypto payments will now verify automatically without any manual intervention.

**Minimum Required:**
- `BLOCKCYPHER_API_KEY` OR `ETHERSCAN_API_KEY` (at least one)
- `USDT_WALLET_ADDRESS`, `BITCOIN_WALLET_ADDRESS`, `ETHEREUM_WALLET_ADDRESS` (your real wallet addresses)

**Recommended:**
- Both `BLOCKCYPHER_API_KEY` and `ETHERSCAN_API_KEY` for full coverage
- `TRON_API_KEY` if accepting USDT on Tron network

Questions? Check the logs or review the code in `services/blockchainMonitorService.js`!

