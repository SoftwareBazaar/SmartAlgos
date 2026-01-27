# 📱 Test M-Pesa with Your Phone: +254746054224

## ✅ Your Setup

- **Phone Number**: +254746054224
- **API Format**: 254746054224 (without the +)
- **M-Pesa Credentials**: ✅ Added to `.env`
- **Server Status**: ✅ Running on http://localhost:5000

---

## 🧪 Quick Tests

### Test 1: Simple Test (No Login Required)

```bash
node test-mpesa-simple.js
```

This will:
- ✅ Check server health
- ✅ Test M-Pesa callback endpoint
- ✅ Verify integration is working

---

### Test 2: STK Push to Your Phone

**Option A: Using Test Script**

1. Edit `test-mpesa-stk-push.js` and add your login credentials:
   ```javascript
   // Line 17-18
   email: 'your-email@example.com',  // Your actual email
   password: 'your-password'          // Your actual password
   ```

2. Run the test:
   ```bash
   node test-mpesa-stk-push.js
   ```

3. Check your phone **254746054224** for M-Pesa prompt!

---

**Option B: Using PowerShell (With Auth Token)**

```powershell
# 1. First login to get token (replace email/password)
$loginBody = @{
    email = "your@email.com"
    password = "your-password"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest `
    -Uri http://localhost:5000/api/auth/login `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json" `
    -UseBasicParsing

$token = ($loginResponse.Content | ConvertFrom-Json).token

# 2. Initiate STK Push to your phone
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    amount = 10
    phoneNumber = "254746054224"
    accountReference = "TEST001"
    transactionDesc = "Test Payment"
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri http://localhost:5000/api/mpesa/stk-push `
    -Method POST `
    -Headers $headers `
    -Body $body `
    -UseBasicParsing
```

---

**Option C: Using Frontend (Best Option!)**

1. Open your browser: http://localhost:5000
2. Login to your account
3. Go to Payments page
4. Click "Pay Now"
5. Select **M-Pesa** payment method
6. Enter your phone: **254746054224**
7. Enter amount: **10** KES
8. Click "Send STK Push"
9. Check your phone! 📱

---

## 📱 What to Expect

### On Your Phone (254746054224):

1. **M-Pesa Prompt Appears**:
   ```
   Lipa Na M-Pesa
   AlgoSmart
   Amount: KES 10.00
   Enter PIN to confirm
   ```

2. **Enter Your M-Pesa PIN**

3. **You'll Get Confirmation**:
   ```
   ✅ KES 10.00 paid to AlgoSmart
   Receipt: XXXXXXXXX
   ```

### On Server Console:

```
📱 Initiating STK Push
✅ STK Push initiated successfully
📞 M-Pesa callback received
✅ Payment completed successfully!
💚 Receipt: XXXXXXXXX
```

---

## 🎯 Test Scenarios

### Scenario 1: Small Test Payment
```javascript
{
  amount: 10,
  phoneNumber: "254746054224",
  accountReference: "TEST_SMALL"
}
```

### Scenario 2: Subscription Payment
```javascript
{
  amount: 100,
  phoneNumber: "254746054224",
  accountReference: "SUB_BASIC_001",
  transactionDesc: "AlgoSmart Basic Subscription"
}
```

### Scenario 3: EA Purchase
```javascript
{
  amount: 500,
  phoneNumber: "254746054224",
  accountReference: "EA_SCALPER_PRO",
  transactionDesc: "Expert Advisor Purchase"
}
```

---

## 🐛 Troubleshooting

### Issue: "STK Push not received on phone"

**Solutions:**
1. ✅ Check phone number format: `254746054224` (no +, no spaces)
2. ✅ Ensure phone has active M-Pesa account
3. ✅ Check if phone has network connection
4. ✅ Verify M-Pesa credentials in `.env` are correct
5. ✅ Check if you're using sandbox vs production mode

### Issue: "Invalid credentials"

**Check your `.env` file:**
```env
MPESA_CONSUMER_KEY=your_key_here    # Must be valid
MPESA_CONSUMER_SECRET=your_secret   # Must be valid
MPESA_PASSKEY=your_passkey          # Must be valid
MPESA_ENVIRONMENT=sandbox           # sandbox or production
```

### Issue: "User cancelled"

This is normal! User cancelled the payment on their phone.
Result code: `1032`

### Issue: "Insufficient funds"

User doesn't have enough M-Pesa balance.
Result code: `1`

---

## 📊 Check Your Transactions

### View in Database:
```sql
SELECT * FROM mpesa_transactions 
WHERE phone_number = '254746054224' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Via API:
```bash
GET http://localhost:5000/api/mpesa/transactions
Authorization: Bearer YOUR_TOKEN
```

---

## 🎉 Success Indicators

When everything works, you'll see:

### ✅ In Server Logs:
```
🟢 M-Pesa Service initialized in SANDBOX mode
📱 Initiating STK Push: 254746054224
✅ STK Push initiated successfully
📞 M-Pesa callback received
✅ Payment successful: XXXXXXXXX
```

### ✅ On Your Phone:
- M-Pesa prompt received
- Payment confirmed
- SMS receipt received

### ✅ In Database:
```json
{
  "status": "completed",
  "phone_number": "254746054224",
  "amount": 10,
  "mpesa_receipt_number": "XXXXXXXXX"
}
```

---

## 💡 Tips

1. **Phone Number Format**: Always use `254746054224` (not +254 or 0746...)
2. **Test Amount**: Start with KES 10 for testing
3. **Timeout**: STK Push expires after 60 seconds
4. **Sandbox**: Payments are reversed at midnight in sandbox mode
5. **Receipt Numbers**: Always save M-Pesa receipt for support

---

## 🚀 You're Ready!

Your phone number **+254746054224** is ready to receive M-Pesa STK Push payments!

**Run the simple test now:**
```bash
node test-mpesa-simple.js
```

Then try STK Push with:
```bash
node test-mpesa-stk-push.js
```

Or just open http://localhost:5000 and use the beautiful UI! 🎨

---

**Questions? Check:**
- `MPESA_SETUP_GUIDE.md` - Full setup guide
- `MPESA_INTEGRATION_SUCCESS.md` - Status & testing
- `MPESA_QUICK_START.md` - 5-minute quickstart

---

*Your phone is ready to receive payments! 📱💚*

