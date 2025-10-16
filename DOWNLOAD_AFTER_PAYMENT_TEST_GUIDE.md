# Download After Payment - Testing Guide

## Overview
This guide will help you test the complete "Download after Payment" flow for EA (Expert Advisor) purchases.

## What We've Implemented

### 1. **Downloads Route** (`routes/downloads.js`)
   - Handles EA file downloads with token-based authentication
   - Supports multiple file types: EA files, SET files, manuals, and screenshots
   - Verifies subscription status before allowing downloads
   - Records download activity in logs

### 2. **Enhanced Subscriptions Route**
   - Updated `/api/subscriptions/:id/files` endpoint to generate secure download tokens
   - Returns download links with JWT tokens (valid for 24 hours)
   - Verifies subscription ownership and active status

### 3. **Supabase Storage Integration**
   - Added `downloadFile()` method to handle file downloads from Supabase Storage
   - Supports both Supabase Storage URLs and local file paths
   - Converts file data to downloadable Buffer format

## Testing Flow

### Prerequisites
1. Server must be running (`npm start`)
2. User must be registered/logged in
3. At least one EA must be available in the marketplace

### Manual Testing Steps

#### Step 1: User Registration/Login
```bash
# Register a new user
POST /api/auth/register
{
  "email": "testuser@example.com",
  "password": "TestPassword123!@",
  "confirmPassword": "TestPassword123!@",
  "firstName": "Test",
  "lastName": "User"
}

# Or login with existing user
POST /api/auth/login
{
  "email": "testuser@example.com",
  "password": "TestPassword123!@"
}
```

Response includes:
- `token`: JWT authentication token
- `user`: User information

#### Step 2: Browse EAs
```bash
GET /api/eas?status=active&limit=10
Authorization: Bearer <your_token>
```

Select an EA from the response. Note the `id` and pricing information.

#### Step 3: Initialize Payment
```bash
POST /api/payments/initialize
Authorization: Bearer <your_token>
{
  "amount": 699,
  "currency": "USD",
  "email": "testuser@example.com",
  "metadata": {
    "ea_id": "<ea_id>",
    "subscription_type": "weekly"
  }
}
```

Response includes:
- `reference`: Payment reference
- `authorization_url`: Paystack payment URL

#### Step 4: Complete Payment
In a real scenario:
1. User is redirected to `authorization_url`
2. User completes payment on Paystack
3. Paystack redirects back with payment status

For testing, you can simulate verification:

```bash
POST /api/payments/verify
Authorization: Bearer <your_token>
{
  "reference": "<payment_reference>"
}
```

#### Step 5: Create Subscription
```bash
POST /api/subscriptions
Authorization: Bearer <your_token>
{
  "eaId": "<ea_id>",
  "subscriptionType": "weekly",
  "paymentMethod": "card",
  "paymentReference": "<payment_reference>"
}
```

Response includes:
- `id`: Subscription ID
- `status`: Should be "active"
- `hasAccess`: Should be true

#### Step 6: Get Download Links
```bash
GET /api/subscriptions/<subscription_id>/files
Authorization: Bearer <your_token>
```

Response:
```json
{
  "success": true,
  "data": {
    "files": {
      "ea_file": "http://localhost:5000/api/downloads/ea/<ea_id>?token=<jwt_token>&type=ea_file",
      "set_file": "http://localhost:5000/api/downloads/ea/<ea_id>?token=<jwt_token>&type=set_file",
      "manual": "http://localhost:5000/api/downloads/ea/<ea_id>?token=<jwt_token>&type=manual",
      "screenshots": "http://localhost:5000/api/downloads/ea/<ea_id>?token=<jwt_token>&type=screenshots"
    },
    "tokenExpiresAt": "2025-10-17T05:47:00.000Z"
  }
}
```

#### Step 7: Download File
Use the download link from Step 6:

```bash
GET /api/downloads/ea/<ea_id>?token=<jwt_token>&type=ea_file
```

The file will be downloaded directly to your browser/client.

#### Step 8: Record Download (Optional)
```bash
POST /api/subscriptions/<subscription_id>/download
Authorization: Bearer <your_token>
{
  "fileType": "ea_file"
}
```

## Testing with the Automated Script

We've created an automated test script: `test-download-after-payment.js`

### Requirements
```bash
npm install axios
```

### Configuration
Edit the script or set environment variables:
```bash
export BACKEND_URL=http://localhost:5000
export TEST_USER_EMAIL=testuser@example.com
export TEST_USER_PASSWORD=TestPassword123!@
```

### Run the Test
```bash
node test-download-after-payment.js
```

The script will:
1. ✅ Authenticate user (register if needed)
2. ✅ Browse and select an EA
3. ✅ Initialize payment
4. ⚠️ Simulate payment verification
5. ✅ Create subscription
6. ✅ Get download links
7. ✅ Download EA file
8. ✅ Record download activity

## Current Limitations

### Mock Mode
If Supabase credentials are not configured, the server runs in mock mode:
- User registration is disabled
- You need to use pre-existing mock users
- Some features may not work as expected

**Solution**: Configure Supabase credentials in `.env`:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

### Paystack Integration
Payment verification requires:
- Valid Paystack API keys
- Actual payment transaction

**For Testing**: Use Paystack test mode:
```
PAYSTACK_SECRET_KEY=sk_test_...
```

## Security Features

1. **JWT Token Authentication**: Download links include JWT tokens that expire after 24 hours
2. **Subscription Verification**: Every download request verifies:
   - User owns the subscription
   - Subscription is active
   - Subscription hasn't expired
3. **Download Logging**: All downloads are logged in the database
4. **Token-based Downloads**: No direct file URLs exposed

## Download Token Structure

The download token includes:
```javascript
{
  subscriptionId: "uuid",
  userId: "uuid",
  eaId: "uuid",
  exp: timestamp  // Expires in 24 hours
}
```

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/eas` | GET | List available EAs |
| `/api/payments/initialize` | POST | Initialize payment |
| `/api/payments/verify` | POST | Verify payment |
| `/api/subscriptions` | POST | Create subscription |
| `/api/subscriptions/:id/files` | GET | Get download links |
| `/api/downloads/ea/:eaId` | GET | Download EA file |
| `/api/subscriptions/:id/download` | POST | Record download |

## Troubleshooting

### Error: "Subscription not found"
- Ensure you're using the correct subscription ID
- Verify the subscription was created successfully
- Check that you're using the correct authentication token

### Error: "Subscription is not active"
- Payment may not have been processed
- Subscription may have expired
- Check subscription status with `GET /api/subscriptions`

### Error: "Invalid download token"
- Token may have expired (24 hour limit)
- Request new download links from `/api/subscriptions/:id/files`

### Error: "File not found"
- EA may not have uploaded files
- Check the EA details to verify file availability
- Verify file type is available (ea_file, set_file, manual, screenshots)

## Next Steps for Production

1. **Configure Supabase**: Set up proper Supabase credentials for user management
2. **Configure Paystack**: Add production Paystack keys
3. **Upload Test EAs**: Create sample EAs with actual files
4. **Test Payment Flow**: Complete end-to-end payment testing
5. **Enable Webhooks**: Configure Paystack webhooks for automated payment processing

## Files Modified/Created

- ✅ `routes/downloads.js` - New download routes with token verification
- ✅ `routes/subscriptions.js` - Enhanced to generate download tokens
- ✅ `services/supabaseStorage.js` - Added downloadFile() method
- ✅ `server.js` - Registered downloads routes
- ✅ `test-download-after-payment.js` - Automated test script
- ✅ `DOWNLOAD_AFTER_PAYMENT_TEST_GUIDE.md` - This guide

## Support

For issues or questions, check:
1. Server logs for detailed error messages
2. Browser console for frontend errors
3. Supabase dashboard for database/storage issues
4. Paystack dashboard for payment issues

