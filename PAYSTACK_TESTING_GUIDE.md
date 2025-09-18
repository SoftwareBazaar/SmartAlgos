# Paystack Integration Testing Guide

This guide will help you test and verify that the Paystack payment integration is working correctly in the Smart Algos platform.

## 🚀 Quick Start

### 1. Run the Test Script
```bash
# Quick test
node run-paystack-test.js

# Full comprehensive test
node test-paystack-integration.js
```

### 2. Test in the Frontend
1. Navigate to the **Payments** page in the app
2. Click the **"Test Paystack"** button
3. Check the browser console for detailed response
4. Look for success/error notifications

## 📊 Sample Transactions Available

The app now includes sample transactions for testing:

| Transaction ID | Description | Amount | Status | Method |
|----------------|-------------|---------|---------|---------|
| TXN_001 | Gold Scalper Pro EA - Monthly | $299 | Success | Card |
| TXN_002 | Multi Indicator EA - Quarterly | $237 | Success | Bank Transfer |
| TXN_003 | Trend Master EA - Yearly | $490 | Pending | Mobile Money |
| TXN_004 | News Trader Bot - Weekly | $25 | Failed | Crypto |
| TXN_005 | HFT Bot Rental - Monthly | $199 | Success | Card |

## 🔧 Configuration

### Environment Variables
Make sure these are set in your `.env` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
PAYSTACK_WEBHOOK_SECRET=whsec_your_webhook_secret

# Client URL for callbacks
CLIENT_URL=http://localhost:3000
```

### Mock Mode
If Paystack keys are not configured, the service runs in **mock mode** for development:
- All API calls return simulated responses
- No real payments are processed
- Perfect for testing the integration flow

## 🧪 Testing Scenarios

### 1. Basic Payment Flow
```javascript
// Test initialization
const response = await axios.post('/api/payments/initialize', {
  amount: 299,
  currency: 'USD',
  email: 'test@example.com',
  description: 'Test EA Subscription'
});
```

### 2. Subscription Payment
```javascript
// Test EA subscription
const subscriptionResponse = await axios.post('/api/payments/initialize', {
  amount: 299,
  currency: 'USD',
  email: 'user@example.com',
  metadata: {
    productType: 'ea',
    productId: 'EA_001',
    subscriptionType: 'monthly'
  }
});
```

### 3. Charge Authorization
```javascript
// Test charging saved payment method
const chargeResponse = await axios.post('/api/payments/charge-authorization', {
  authorization_code: 'AUTH_test123456789',
  email: 'user@example.com',
  amount: 299,
  currency: 'USD'
});
```

## 📱 Frontend Testing

### Payment Modal
1. Go to **EA Marketplace** or **HFT Bots**
2. Click **"Subscribe"** or **"Rent"** on any product
3. Select subscription period and payment method
4. Click **"Subscribe Now"** or **"Rent Now"**

### Payments Page
1. Navigate to **Payments & Billing**
2. View sample transactions in the **Payment History** tab
3. View sample subscriptions in the **Subscriptions** tab
4. Use **"Test Payment"** button to test payment modal
5. Use **"Test Paystack"** button to test API integration

## 🔍 Verification Steps

### 1. Check Console Logs
Look for these in the browser console:
```javascript
// Successful initialization
Paystack Test Response: {
  success: true,
  data: {
    authorization_url: "https://checkout.paystack.com/...",
    access_code: "access_code_...",
    reference: "PAY_..."
  }
}
```

### 2. Check Network Tab
In browser DevTools → Network tab:
- Look for POST requests to `/api/payments/initialize`
- Check response status (200 for success)
- Verify response data structure

### 3. Check Notifications
The app shows notifications for:
- ✅ **Success**: "Paystack integration working!"
- ❌ **Error**: "Paystack test failed: [error message]"
- ℹ️ **Info**: "Testing Paystack integration..."

## 🐛 Troubleshooting

### Common Issues

#### 1. "Paystack keys not configured"
**Solution**: Add Paystack keys to `.env` file or test in mock mode

#### 2. "Failed to initialize payment"
**Solution**: Check server logs and ensure API endpoints are accessible

#### 3. "Authorization required"
**Solution**: Make sure you're logged in or using proper authentication

#### 4. Network errors
**Solution**: Ensure server is running on correct port (5000)

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=paystack:*
```

## 📈 Expected Results

### Mock Mode (No Paystack Keys)
- ✅ All tests should pass
- ✅ Sample transactions display correctly
- ✅ Payment modals work properly
- ✅ API endpoints respond with mock data

### Live Mode (With Paystack Keys)
- ✅ Real Paystack API calls
- ✅ Actual payment URLs generated
- ✅ Webhook handling (if configured)
- ✅ Real transaction verification

## 🎯 Next Steps

1. **Set up Paystack Account**: Get test API keys from [Paystack Dashboard](https://dashboard.paystack.com)
2. **Configure Webhooks**: Set up webhook endpoints for production
3. **Test Real Payments**: Use Paystack test cards for real payment testing
4. **Monitor Logs**: Check server logs for any integration issues

## 📞 Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify environment variables are set correctly
3. Ensure server is running and accessible
4. Test with the provided sample data first

---

**Note**: This integration includes comprehensive error handling, security features, and mock responses for development. The sample transactions provide realistic test data for all payment scenarios.
