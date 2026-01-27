# Check Railway Logs - No Node.js Needed

Since Node.js isn't installed locally, we'll check Railway logs directly to see what happened with your payment.

---

## Step-by-Step Guide

### Step 1: Open Railway Dashboard

1. **Go to:** https://railway.app/dashboard
2. **Sign in** if needed
3. **Click** on your Smart Algos project

### Step 2: View Logs

1. **Click** on your backend service (the one running your API)
2. **Click** the **"Deployments"** tab at the top
3. **Click** on the **latest deployment** (top of the list)
4. **Click** the **"View Logs"** button

You should now see a stream of logs.

### Step 3: Search for Payment Verification

**Press `Ctrl + F`** to open the search box in your browser.

**Search for:** `PAYMENT VERIFICATION START`

#### If You Find It:
```
🔍 [Paystack] ========== PAYMENT VERIFICATION START ==========
🔍 [Paystack] Reference: ALGO-xxx
🔍 [Paystack] User ID: abc-123
```

✅ **Good!** Payment verification was called. Continue to Step 4.

#### If You DON'T Find It:
❌ **Problem Found!** The payment verification endpoint was never called.

**This means:**
- User paid on Paystack
- Paystack redirected back to your site
- But your frontend didn't call the verification endpoint
- So no subscription was created
- So no email was sent

**Solution:** The frontend payment callback needs to be fixed. Jump to "Solution A" below.

---

### Step 4: Search for Email Sending

**Search for:** `ATTEMPTING TO SEND EMAIL`

#### If You Find It:
```
📧 [Paystack] ========== ATTEMPTING TO SEND EMAIL ==========
📧 [Paystack] Email Configuration Check:
   - To: user@example.com
   - EMAIL_USER set: true
   - EMAIL_PASSWORD set: true
```

Now look for what happened next:

**If you see:**
```
✅ [Paystack] Email sent successfully!
📬 [Paystack] Message ID: <xxx@gmail.com>
```
✅ **Email was sent!** Check spam folder. Jump to "Solution B" below.

**If you see:**
```
❌ [Paystack] Email failed: [error message]
```
❌ **Email failed!** Note the error message. Jump to "Solution C" below.

#### If You DON'T Find It:
❌ **Problem Found!** Email sending was never attempted.

**This means:**
- Payment was verified (from Step 3)
- But email sending code wasn't reached
- Probably subscription creation failed

**Solution:** Jump to "Solution D" below.

---

### Step 5: Search for Subscription Creation

**Search for:** `Creating subscription`

#### If You Find It:
```
🔄 [Paystack] Creating subscription...
✅ [Paystack] Subscription created: sub-123
```
✅ Subscription was created successfully.

#### If You See an Error:
```
❌ [Paystack] Error creating subscription: [error message]
```
❌ Subscription creation failed. This is why no email was sent.

---

## Solutions Based on What You Found

### Solution A: Payment Verification Not Called

**Problem:** Frontend didn't call the verification endpoint after payment.

**What to check:**
1. After user pays on Paystack, they're redirected to: `/payment-callback?reference=ALGO-xxx`
2. The frontend should then call: `GET /api/payments/paystack/verify/ALGO-xxx`
3. This verification call triggers subscription creation and email sending

**Quick Fix:**
Check the frontend file: `client/src/components/Payments/PaystackPayment.js`

Look for the payment callback handler. It should call the verification endpoint.

**Temporary Workaround:**
You can manually verify pending payments by:
1. Getting the payment reference from Supabase
2. Calling the verification endpoint manually via Postman or browser

---

### Solution B: Email Sent But Not Received

**Problem:** Logs show email sent successfully, but user didn't receive it.

**What to check:**
1. **Spam/Junk folder** - Check user's spam folder first
2. **Email address** - Verify the email address in logs is correct
3. **Gmail sent folder** - Check if email is in your Gmail sent folder

**Quick Fix:**
1. Ask user to check spam folder
2. Mark email as "Not Spam" to improve future deliverability
3. Verify user's email address is correct in database

---

### Solution C: Email Failed with Error

**Problem:** Email sending was attempted but failed.

**Common Errors:**

#### "Invalid login: 535-5.7.8"
- Using wrong password
- **Fix:** Make sure EMAIL_PASSWORD in Railway is the App Password (16 characters), not regular Gmail password

#### "Connection timeout"
- SMTP port blocked
- **Fix:** Verify EMAIL_HOST=smtp.gmail.com and EMAIL_PORT=587 in Railway

#### "No email address found"
- User record missing email
- **Fix:** Check users_accounts table in Supabase, ensure email column is populated

**Quick Fix:**
1. Note the exact error message from logs
2. Check Railway environment variables are correct
3. Verify Gmail App Password is correct

---

### Solution D: Subscription Creation Failed

**Problem:** Payment verified but subscription wasn't created.

**What to check:**
Look in logs for the error message after "Creating subscription..."

**Common Errors:**

#### "EA not found"
- Invalid EA ID
- **Fix:** Verify EA exists in database

#### "User not found"
- Invalid user ID
- **Fix:** Verify user exists in database

#### "Database error"
- Database connection issue
- **Fix:** Check Supabase connection

**Quick Fix:**
1. Note the exact error message
2. Check database for the EA and user
3. Verify database connection is working

---

## Alternative: Check Supabase Database

If Railway logs are too long or hard to search:

### Step 1: Open Supabase Dashboard

1. **Go to:** https://supabase.com/dashboard
2. **Select** your Smart Algos project
3. **Click** "Table Editor" in left sidebar

### Step 2: Check Paystack Payments

1. **Click** on `paystack_payments` table
2. **Look at** the most recent rows
3. **Check** the `status` column:
   - `pending` = Not verified yet
   - `completed` = Verified successfully

### Step 3: Check Subscriptions

1. **Click** on `subscriptions` table
2. **Look at** the most recent rows
3. **Check** if there's a subscription with matching `payment_reference`

### Step 4: Match Them Up

- If payment is `completed` but no matching subscription → Subscription creation failed
- If payment is `pending` → Verification endpoint not called
- If both exist → Email sending failed or succeeded (check logs)

---

## What to Tell Me

After checking Railway logs, tell me:

1. **Did you find "PAYMENT VERIFICATION START"?**
   - [ ] Yes
   - [ ] No

2. **Did you find "ATTEMPTING TO SEND EMAIL"?**
   - [ ] Yes
   - [ ] No

3. **If email was attempted, what was the result?**
   - [ ] "Email sent successfully"
   - [ ] "Email failed" (what error?)
   - [ ] Not attempted

4. **Did you find "Subscription created"?**
   - [ ] Yes (what ID?)
   - [ ] No
   - [ ] Error (what error?)

5. **What's the payment reference?**
   - ALGO-xxxxxxxxx

With this information, I can tell you exactly what went wrong and how to fix it!

---

## Quick Reference

| What You Found | Problem | Solution |
|----------------|---------|----------|
| No "PAYMENT VERIFICATION START" | Verification not called | Fix frontend callback |
| "Email sent successfully" | Email in spam | Check spam folder |
| "Email failed: [error]" | Email service error | Fix based on error |
| No "ATTEMPTING TO SEND EMAIL" | Subscription failed | Check subscription error |
| "Subscription created" + No email | Email not triggered | Check logs for email section |

---

**Next Step:** Follow the steps above and tell me what you find in the Railway logs!

---

**Last Updated:** January 25, 2026
