# Payment Email Flow Diagram

## Current Flow (After Fix)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAYSTACK PAYMENT FLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. User clicks "Subscribe" on EA
   │
   ├─→ Frontend: POST /api/payments/paystack/initialize
   │   └─→ Backend creates payment record
   │       └─→ Returns Paystack authorization URL
   │
2. User redirected to Paystack
   │
   ├─→ User completes payment on Paystack
   │
3. Paystack redirects back
   │
   ├─→ Frontend: /payment-callback?reference=ALGO-xxx
   │   └─→ Frontend: GET /api/payments/paystack/verify/:reference
   │
4. Backend verifies payment
   │
   ├─→ ✅ Verify with Paystack API
   ├─→ ✅ Create subscription in database
   ├─→ ✅ Generate download links (JWT tokens)
   ├─→ ✅ Send email with download links ← NEW!
   │   │
   │   ├─→ Check EMAIL_USER and EMAIL_PASSWORD
   │   ├─→ Get user details from database
   │   ├─→ Build email with download links
   │   ├─→ Send via Gmail SMTP
   │   └─→ Log success/failure
   │
   └─→ ✅ Return success to frontend

5. User receives email
   │
   ├─→ 📧 Email arrives in inbox (1-2 minutes)
   ├─→ Contains download links
   ├─→ Contains installation instructions
   └─→ User clicks links to download EA files


┌─────────────────────────────────────────────────────────────────┐
│                    CRYPTO PAYMENT FLOW                           │
└─────────────────────────────────────────────────────────────────┘

1. User clicks "Pay with Crypto"
   │
   ├─→ Frontend: POST /api/payments/crypto/generate
   │   └─→ Backend creates payment record
   │       └─→ Returns wallet address + QR code
   │
2. User sends crypto to wallet
   │
   ├─→ User clicks "I've sent the payment"
   │   └─→ Frontend: POST /api/payments/crypto/:id/confirm
   │
3. Backend confirms payment
   │
   ├─→ ✅ Update payment status to confirmed
   ├─→ ✅ Create subscription in database
   ├─→ ✅ Generate download links (JWT tokens)
   ├─→ ✅ Send email with download links ← NEW!
   │   │
   │   ├─→ Check EMAIL_USER and EMAIL_PASSWORD
   │   ├─→ Get user details from database
   │   ├─→ Build email with download links
   │   ├─→ Send via Gmail SMTP
   │   └─→ Log success/failure
   │
   └─→ ✅ Return success to frontend

4. User receives email
   │
   ├─→ 📧 Email arrives in inbox (1-2 minutes)
   ├─→ Contains download links
   ├─→ Contains installation instructions
   └─→ User clicks links to download EA files
```

---

## Email Sending Process (Detailed)

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMAIL SENDING PROCESS                         │
└─────────────────────────────────────────────────────────────────┘

1. Payment Verified
   │
   ├─→ Check if EMAIL_USER and EMAIL_PASSWORD are set
   │   │
   │   ├─→ ❌ NOT SET
   │   │   └─→ Log error: "EMAIL NOT CONFIGURED"
   │   │       └─→ Continue (subscription still created)
   │   │
   │   └─→ ✅ SET
   │       └─→ Continue to Step 2
   │
2. Get User Details
   │
   ├─→ Query database: users_accounts table
   │   └─→ Get: email, first_name, last_name
   │
3. Get EA Details
   │
   ├─→ Query database: expert_advisors table
   │   └─→ Get: name, zip_file_path, ea_file_path, etc.
   │
4. Generate Download Links
   │
   ├─→ Create JWT token (valid 24 hours)
   │   └─→ Contains: subscriptionId, userId, eaId
   │
   ├─→ Build download URLs:
   │   ├─→ ZIP package: /api/downloads/ea/:id/zip?token=xxx
   │   ├─→ EA file: /api/downloads/ea/:id?token=xxx&type=ea_file
   │   ├─→ Settings: /api/downloads/ea/:id?token=xxx&type=set_file
   │   └─→ Manual: /api/downloads/ea/:id?token=xxx&type=manual
   │
5. Build Email
   │
   ├─→ Subject: "✅ Your [EA Name] Files Are Ready"
   ├─→ HTML template with:
   │   ├─→ Payment confirmation
   │   ├─→ Subscription details
   │   ├─→ Download links (buttons)
   │   ├─→ Installation instructions
   │   └─→ Support contact
   │
6. Send Email
   │
   ├─→ Connect to Gmail SMTP
   │   ├─→ Host: smtp.gmail.com
   │   ├─→ Port: 587
   │   ├─→ User: EMAIL_USER
   │   └─→ Pass: EMAIL_PASSWORD (App Password)
   │
   ├─→ Send email via nodemailer
   │
   ├─→ ✅ SUCCESS
   │   ├─→ Log: "Email sent successfully"
   │   ├─→ Log: Message ID
   │   └─→ Continue
   │
   └─→ ❌ FAILURE
       ├─→ Log: "Email failed: [error]"
       ├─→ Log: Error code
       └─→ Continue (subscription still active)
```

---

## Logging Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOGGING FLOW                                  │
└─────────────────────────────────────────────────────────────────┘

Payment Verification Started
│
├─→ 🔍 [Paystack] ========== PAYMENT VERIFICATION START ==========
├─→ 🔍 [Paystack] Reference: ALGO-xxx
├─→ 🔍 [Paystack] User ID: abc-123
└─→ 🔍 [Paystack] User Email: user@example.com

Payment Verified
│
├─→ ✅ [Paystack] Payment successful!
├─→ 💰 [Paystack] Amount: 50 USD
└─→ 📧 [Paystack] Customer Email: user@example.com

Subscription Created
│
├─→ 🔄 [Paystack] Creating subscription...
├─→ ✅ [Paystack] Subscription created: sub-123
└─→ 🔄 [Paystack] Generating download links...

Email Sending
│
├─→ 📧 [Paystack] ========== ATTEMPTING TO SEND EMAIL ==========
├─→ 📧 [Paystack] Email Configuration Check:
│   ├─→    - To: user@example.com
│   ├─→    - User Name: John Doe
│   ├─→    - EA Name: Scalping Pro EA
│   ├─→    - Subscription Type: monthly
│   ├─→    - Subscription ID: sub-123
│   ├─→    - EMAIL_USER set: true
│   └─→    - EMAIL_PASSWORD set: true
│
├─→ ✅ [Paystack] Email sent successfully!
├─→ 📬 [Paystack] Message ID: <xxx@gmail.com>
└─→ 📧 [Paystack] ========== EMAIL PROCESS COMPLETE ==========

Verification Complete
│
└─→ 🔍 [Paystack] ========== PAYMENT VERIFICATION COMPLETE ==========
```

---

## Error Scenarios

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                               │
└─────────────────────────────────────────────────────────────────┘

Scenario 1: Email Not Configured
│
├─→ ❌ [Paystack] EMAIL NOT CONFIGURED!
├─→    Please set EMAIL_USER and EMAIL_PASSWORD
├─→    Email will NOT be sent, but subscription is still active
└─→ ✅ Subscription created (user can still download from dashboard)

Scenario 2: Invalid Gmail Credentials
│
├─→ ❌ [Paystack] Email failed: Invalid login: 535-5.7.8
├─→    Error code: EAUTH
└─→ ✅ Subscription created (user can still download from dashboard)

Scenario 3: Connection Timeout
│
├─→ ❌ [Paystack] Email failed: Connection timeout
├─→    Error code: ETIMEDOUT
└─→ ✅ Subscription created (user can still download from dashboard)

Scenario 4: User Email Not Found
│
├─→ ⚠️ [Paystack] Could not fetch user details
├─→    Using Paystack email as fallback
└─→ ✅ Email sent to Paystack email address

Scenario 5: Email Service Down
│
├─→ ❌ [Paystack] Email error: Service unavailable
├─→    Stack trace: [error details]
└─→ ✅ Subscription created (user can still download from dashboard)
```

---

## Success Indicators

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUCCESS INDICATORS                            │
└─────────────────────────────────────────────────────────────────┘

In Railway Logs:
│
├─→ ✅ Email transporter created successfully
├─→ ✅ [Paystack] Email Configuration Check: EMAIL_USER set: true
├─→ ✅ [Paystack] Email sent successfully!
└─→ ✅ [Paystack] Message ID: <xxx@gmail.com>

In User's Inbox:
│
├─→ 📧 Email received within 1-2 minutes
├─→ Subject: "✅ Your [EA Name] Files Are Ready - Smart Algos"
├─→ From: Smart Algos <your-email@gmail.com>
├─→ Contains working download links
└─→ Professional HTML formatting

In Database:
│
├─→ subscriptions table: status = 'active'
├─→ subscriptions table: payment_status = 'completed'
├─→ paystack_payments table: status = 'completed'
└─→ users_accounts table: email populated
```

---

## Configuration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONFIGURATION FLOW                            │
└─────────────────────────────────────────────────────────────────┘

1. Gmail Setup
   │
   ├─→ Enable 2-Step Verification
   ├─→ Generate App Password
   └─→ Copy 16-character password

2. Local Environment (.env)
   │
   ├─→ EMAIL_USER=your-email@gmail.com
   ├─→ EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ├─→ EMAIL_HOST=smtp.gmail.com
   └─→ EMAIL_PORT=587

3. Railway Environment
   │
   ├─→ Add EMAIL_USER variable
   ├─→ Add EMAIL_PASSWORD variable
   ├─→ Add EMAIL_HOST variable
   ├─→ Add EMAIL_PORT variable
   └─→ Deploy (auto or manual)

4. Server Startup
   │
   ├─→ Load environment variables
   ├─→ Create email transporter
   │   ├─→ ✅ SUCCESS: "Email transporter created"
   │   └─→ ❌ FAILURE: "Email not configured"
   │
   └─→ Server ready to send emails
```

---

## Download Link Security

```
┌─────────────────────────────────────────────────────────────────┐
│                    DOWNLOAD LINK SECURITY                        │
└─────────────────────────────────────────────────────────────────┘

JWT Token Generation:
│
├─→ Payload:
│   ├─→ subscriptionId: "sub-123"
│   ├─→ userId: "user-456"
│   ├─→ eaId: "ea-789"
│   └─→ timestamp: 1234567890
│
├─→ Secret: process.env.JWT_SECRET
├─→ Expiry: 24 hours
└─→ Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Download Request:
│
├─→ User clicks link: /api/downloads/ea/789/zip?token=xxx
│
├─→ Backend validates:
│   ├─→ ✅ Token signature valid
│   ├─→ ✅ Token not expired
│   ├─→ ✅ Subscription active
│   ├─→ ✅ User owns subscription
│   └─→ ✅ EA exists
│
├─→ ✅ VALID: Stream file to user
└─→ ❌ INVALID: Return 403 Forbidden
```

---

**Last Updated:** January 25, 2026
