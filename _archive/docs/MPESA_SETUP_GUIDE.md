# 📱 M-Pesa Daraja API Setup Guide

Complete guide to integrate M-Pesa mobile money payments into your AlgoSmart platform.

---

## 🎯 Overview

M-Pesa is Kenya's leading mobile money service with 50M+ users. This integration enables:
- ✅ **STK Push** (Lipa Na M-Pesa Online) - Push payment prompt to customer's phone
- ✅ **Real-time callbacks** - Instant payment confirmation
- ✅ **Transaction tracking** - Query payment status
- ✅ **Automatic reconciliation** - Seamless payment processing

---

## 📋 Prerequisites

### 1. M-Pesa Daraja Developer Account

1. Visit [Safaricom Daraja Portal](https://developer.safaricom.co.ke/)
2. Create an account or login
3. Create a new app (Sandbox or Production)
4. Get your credentials:
   - **Consumer Key**
   - **Consumer Secret**
   - **Business Short Code**
   - **Passkey** (Lipa Na M-Pesa Online)

### 2. Test Credentials (Sandbox)

For testing, use Safaricom's test credentials:
- **Consumer Key**: `Your sandbox consumer key`
- **Consumer Secret**: `Your sandbox consumer secret`
- **Business Short Code**: `174379` (Sandbox)
- **Passkey**: `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`
- **Test Phone**: `254708374149` (Use in sandbox)

---

## 🔧 Installation Steps

### Step 1: Install Dependencies

```bash
npm install axios moment
```

### Step 2: Create Database Table

Run the SQL migration to create the `mpesa_transactions` table:

```bash
# If using Supabase
psql -h your-supabase-host -U postgres -d postgres -f mpesa-database-migration.sql

# Or execute via Supabase SQL Editor
# Copy contents of mpesa-database-migration.sql into SQL Editor and run
```

### Step 3: Configure Environment Variables

Add these to your `.env` file:

```env
# M-Pesa Daraja API Configuration
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=your_passkey_here
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback

# For Railway deployment:
# MPESA_CALLBACK_URL=https://your-app.railway.app/api/mpesa/callback
```

### Step 4: Update Environment Variables Example

Add to your `env.example`:

```env
# M-Pesa Payment Gateway (Kenya)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=your_mpesa_passkey
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
```

### Step 5: Enable M-Pesa in System Settings

Update your system settings (Admin Panel or Database):

```javascript
// Via Admin Panel API or Database
{
  "payments": {
    "providers": {
      "mpesa": {
        "enabled": true,
        "environment": "sandbox"
      }
    }
  }
}
```

---

## 🚀 Usage

### Frontend Integration

```javascript
import MpesaPayment from './components/MpesaPayment';

function PaymentPage() {
  return (
    <MpesaPayment
      amount={1000} // Amount in KES
      accountReference="SUBSCRIPTION_123"
      transactionDesc="AlgoSmart Basic Subscription"
      metadata={{
        subscriptionId: 'sub_123',
        userId: 'user_456'
      }}
      onSuccess={(result) => {
        console.log('Payment successful!', result);
        // Handle success - update subscription, grant access, etc.
      }}
      onError={(error) => {
        console.error('Payment failed:', error);
        // Handle error
      }}
      onClose={() => {
        // Handle modal close
      }}
    />
  );
}
```

### Backend API Endpoints

#### 1. Initialize STK Push

```javascript
POST /api/mpesa/stk-push
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100,
  "phoneNumber": "254712345678",
  "accountReference": "USER_123",
  "transactionDesc": "AlgoSmart Payment",
  "metadata": {
    "subscriptionType": "BASIC"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "STK Push sent successfully",
  "data": {
    "checkoutRequestID": "ws_CO_123456789",
    "merchantRequestID": "12345-67890-1",
    "customerMessage": "Success. Request accepted for processing"
  }
}
```

#### 2. Query Transaction Status

```javascript
GET /api/mpesa/query/:checkoutRequestID
Authorization: Bearer <token>
```

#### 3. Get User Transactions

```javascript
GET /api/mpesa/transactions?limit=10&offset=0&status=completed
Authorization: Bearer <token>
```

#### 4. M-Pesa Callback (Webhook)

```javascript
POST /api/mpesa/callback
Content-Type: application/json

// This is called automatically by M-Pesa
// No authorization required
```

---

## 🔒 Security Best Practices

### 1. Secure Your Credentials

- ✅ Never commit credentials to Git
- ✅ Use environment variables
- ✅ Rotate keys regularly
- ✅ Use production keys only in production

### 2. Validate Callback Data

The service automatically validates:
- ✅ Callback structure
- ✅ Transaction amounts
- ✅ Phone number format
- ✅ Result codes

### 3. Callback URL Requirements

Your callback URL must:
- ✅ Be publicly accessible (not localhost)
- ✅ Use HTTPS in production
- ✅ Return success response quickly
- ✅ Process async operations in background

---

## 🧪 Testing

### Test with Sandbox

1. Use sandbox credentials
2. Use test phone number: `254708374149`
3. Test STK Push flow
4. Check callback handling

### Test Flow

```bash
# 1. Test credentials validation
curl -X POST https://your-domain.com/api/mpesa/validate-credentials \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Initiate test payment
curl -X POST https://your-domain.com/api/mpesa/stk-push \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10,
    "phoneNumber": "254708374149",
    "accountReference": "TEST_001"
  }'

# 3. Query status
curl -X GET https://your-domain.com/api/mpesa/query/ws_CO_123456789 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Testing Checklist

- [ ] STK Push sends successfully
- [ ] Customer receives prompt on phone
- [ ] Payment completion triggers callback
- [ ] Database records transaction
- [ ] Status queries work
- [ ] Failed payments handled correctly
- [ ] Timeout scenarios handled

---

## 🌍 Going to Production

### 1. Get Production Credentials

1. Login to [Daraja Portal](https://developer.safaricom.co.ke/)
2. Create Production App
3. Submit for approval (may take 1-2 weeks)
4. Get production credentials

### 2. Update Environment Variables

```env
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=production_consumer_key
MPESA_CONSUMER_SECRET=production_consumer_secret
MPESA_BUSINESS_SHORTCODE=your_business_shortcode
MPESA_PASSKEY=production_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
```

### 3. Production Checklist

- [ ] Production credentials obtained and approved
- [ ] Callback URL is HTTPS
- [ ] Error logging configured
- [ ] Transaction monitoring setup
- [ ] Customer support process defined
- [ ] Refund process documented
- [ ] Compliance requirements met

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Invalid Access Token"
```
Solution: Check consumer key and secret are correct
```

#### 2. "Invalid Phone Number"
```
Solution: Use format 254XXXXXXXXX (254 + 9 digits)
```

#### 3. "Callback Not Received"
```
Solutions:
- Ensure callback URL is publicly accessible
- Check HTTPS is enabled
- Verify no firewall blocking M-Pesa IPs
- Check server logs for errors
```

#### 4. "STK Push Not Received"
```
Solutions:
- Check phone number is correct
- Ensure phone has M-Pesa app/SIM toolkit
- Verify business short code is active
- Check sandbox vs production environment
```

### Error Codes

| Code | Description | Action |
|------|-------------|--------|
| 0 | Success | Payment completed |
| 1 | Insufficient funds | Ask customer to check balance |
| 17 | User cancelled | Retry payment |
| 1032 | Request cancelled | User cancelled on phone |
| 1037 | Timeout | Customer didn't enter PIN in time |

---

## 📊 Monitoring

### Transaction Logs

All M-Pesa transactions are logged in:
- Database: `mpesa_transactions` table
- Server logs: Console output with emojis
- Callback logs: Full webhook data stored

### Dashboard Metrics

Track these metrics in your admin panel:
- Total M-Pesa transactions
- Success rate
- Average transaction value
- Failed payment reasons
- Response times

---

## 🔗 Useful Links

- [Daraja API Documentation](https://developer.safaricom.co.ke/Documentation)
- [STK Push API Docs](https://developer.safaricom.co.ke/lipa-na-m-pesa-online/apis/post/stkpush/v1/processrequest)
- [Test Credentials](https://developer.safaricom.co.ke/test_credentials)
- [Support](https://developer.safaricom.co.ke/support)

---

## 💡 Tips & Best Practices

1. **Phone Number Format**
   - Always use: `254XXXXXXXXX`
   - Never use: `+254`, `0712...`, or `712...`

2. **Amount Handling**
   - M-Pesa accepts integers only
   - Always round: `Math.round(amount)`
   - Minimum: KES 1

3. **Timeout Handling**
   - STK Push expires after 60 seconds
   - Query status after 90 seconds
   - Show clear timeout message to user

4. **User Experience**
   - Clear instructions before initiating
   - Show loading state during processing
   - Display phone number confirmation
   - Provide retry option on failure

5. **Reconciliation**
   - Store `MpesaReceiptNumber` for each transaction
   - Use for customer support queries
   - Cross-reference with M-Pesa statements

---

## ✅ Success! You're Ready!

Your M-Pesa integration is now complete and ready to accept mobile money payments from Kenyan customers! 🎉🇰🇪

For support, check the troubleshooting section or contact Safaricom Daraja support.

---

**Built with ❤️ for AlgoSmart Trading Platform**

