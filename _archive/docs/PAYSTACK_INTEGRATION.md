# Paystack Payment Integration

This document describes the Paystack payment integration implemented in the Smart Algos trading platform.

## Overview

The integration provides three main payment methods:
1. **Initialize Payment** - Standard payment initialization
2. **Charge Authorization** - Charge a previously authorized payment method
3. **Initialize with Pause** - Initialize payment with paused state for later completion

## API Endpoints

### 1. Initialize Payment
**POST** `/api/payments/initialize`

Initialize a new payment transaction.

**Request Body:**
```json
{
  "amount": 1000,
  "currency": "NGN",
  "email": "user@example.com",
  "callback_url": "https://yourapp.com/callback",
  "metadata": {
    "userId": "user123",
    "subscriptionType": "BASIC"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "authorization_url": "https://checkout.paystack.com/ref123",
    "access_code": "access_code_123",
    "reference": "PAY_1234567890_abc123"
  },
  "message": "Authorization URL created"
}
```

### 2. Charge Authorization
**POST** `/api/payments/charge-authorization`

Charge a previously authorized payment method.

**Request Body:**
```json
{
  "authorization_code": "AUTH_8dfhjjdt",
  "email": "user@example.com",
  "amount": 3000,
  "currency": "NGN",
  "reference": "CHG_1234567890_abc123",
  "callback_url": "https://yourapp.com/callback",
  "metadata": {
    "userId": "user123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1234567,
    "status": "success",
    "reference": "CHG_1234567890_abc123",
    "amount": 300000,
    "message": "Charge successful",
    "authorization": {
      "authorization_code": "AUTH_8dfhjjdt",
      "card_type": "visa",
      "last4": "1381",
      "exp_month": "08",
      "exp_year": "2018",
      "bin": "412345",
      "bank": "TEST BANK",
      "channel": "card",
      "signature": "SIG_idyuhgd87dUYSHO92D",
      "reusable": true,
      "country_code": "NG",
      "account_name": "BoJack Horseman"
    }
  },
  "message": "Charge successful"
}
```

### 3. Initialize with Pause
**POST** `/api/payments/initialize-paused`

Initialize a payment with paused state for later completion.

**Request Body:**
```json
{
  "amount": 1000,
  "currency": "NGN",
  "email": "user@example.com",
  "callback_url": "https://yourapp.com/callback",
  "metadata": {
    "userId": "user123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "authorization_url": "https://checkout.paystack.com/resume/0744ub5o065nwyz",
    "reference": "PAY_PAUSED_1234567890_abc123",
    "access_code": "0744ub5o065nwyz",
    "paused": true
  },
  "message": "Please, redirect your customer to the authorization url provided"
}
```

### 4. Verify Payment
**POST** `/api/payments/verify`

Verify a payment transaction.

**Request Body:**
```json
{
  "reference": "PAY_1234567890_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "id": 1234567,
    "status": "success",
    "reference": "PAY_1234567890_abc123",
    "amount": 100000,
    "currency": "NGN",
    "authorization": {
      "authorization_code": "AUTH_8dfhjjdt",
      "card_type": "visa",
      "last4": "1381",
      "exp_month": "08",
      "exp_year": "2018",
      "bin": "412345",
      "bank": "TEST BANK",
      "channel": "card",
      "signature": "SIG_idyuhgd87dUYSHO92D",
      "reusable": true,
      "country_code": "NG",
      "account_name": "BoJack Horseman"
    }
  }
}
```

## Frontend Integration

The frontend provides a payment modal with three payment method options:

1. **Initialize Payment** - Standard payment flow
2. **Charge Authorization** - For charging saved payment methods
3. **Initialize with Pause** - For paused payment flows

### Usage Example

```javascript
// Initialize payment
const response = await axios.post('/api/payments/initialize', {
  amount: 1000,
  currency: 'NGN',
  email: 'user@example.com',
  metadata: {
    userId: user._id,
    subscriptionType: 'BASIC'
  }
});

if (response.data.success) {
  // Redirect to Paystack payment page
  window.location.href = response.data.data.authorization_url;
}

// Charge authorization
const chargeResponse = await axios.post('/api/payments/charge-authorization', {
  authorization_code: 'AUTH_8dfhjjdt',
  email: 'user@example.com',
  amount: 3000,
  currency: 'NGN'
});

if (chargeResponse.data.success) {
  console.log('Payment charged successfully!');
}
```

## Environment Variables

Make sure to set the following environment variables:

```env
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Testing

Run the test script to verify the integration:

```bash
node test-paystack-integration.js
```

## Webhook Handling

The integration includes webhook handling for the following events:

- `charge.success` - Successful payment
- `charge.failed` - Failed payment
- `subscription.create` - Subscription created
- `subscription.disable` - Subscription disabled
- `invoice.create` - Invoice created
- `invoice.payment_failed` - Invoice payment failed

Webhook endpoint: `POST /api/payments/webhook/paystack`

## Security Features

- Webhook signature verification
- Request validation and sanitization
- Audit logging for all payment operations
- Rate limiting on payment endpoints
- User authentication required for all payment operations

## Error Handling

The integration includes comprehensive error handling:

- Validation errors for invalid input
- Network errors for API failures
- Authentication errors for invalid credentials
- Webhook verification errors for invalid signatures

## Mock Mode

When Paystack keys are not configured, the service runs in mock mode for development and testing purposes.

## Support

For issues or questions regarding the Paystack integration, please refer to:
- [Paystack API Documentation](https://paystack.com/docs/api/)
- [Paystack Webhook Documentation](https://paystack.com/docs/payments/webhooks/)
