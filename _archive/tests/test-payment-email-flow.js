/**
 * Test Payment Email Flow
 * Tests both Paystack and Crypto payment email sending
 */

require('dotenv').config();
const databaseService = require('./services/databaseService');

async function testPaymentEmailFlow() {
  console.log('\n🧪 ========== PAYMENT EMAIL FLOW TEST ==========\n');

  // 1. Check environment variables
  console.log('1️⃣ Checking Environment Variables...');
  console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '✅ SET' : '❌ NOT SET');
  console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ SET' : '❌ NOT SET');
  console.log('   EMAIL_HOST:', process.env.EMAIL_HOST || 'smtp.gmail.com (default)');
  console.log('   EMAIL_PORT:', process.env.EMAIL_PORT || '587 (default)');
  console.log('   PAYSTACK_SECRET_KEY:', process.env.PAYSTACK_SECRET_KEY ? '✅ SET' : '❌ NOT SET');
  console.log('   BACKEND_URL:', process.env.BACKEND_URL || '❌ NOT SET');
  console.log('   CLIENT_URL:', process.env.CLIENT_URL || '❌ NOT SET');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('\n❌ EMAIL NOT CONFIGURED!');
    console.error('   Please set the following environment variables:');
    console.error('   - EMAIL_USER (your Gmail address)');
    console.error('   - EMAIL_PASSWORD (your Gmail App Password)');
    console.error('\n   To get a Gmail App Password:');
    console.error('   1. Go to https://myaccount.google.com/security');
    console.error('   2. Enable 2-Step Verification');
    console.error('   3. Go to App Passwords');
    console.error('   4. Generate a new app password for "Mail"');
    console.error('   5. Copy the 16-character password');
    console.error('   6. Set EMAIL_PASSWORD to that password\n');
    return;
  }

  // 2. Test email service
  console.log('\n2️⃣ Testing Email Service...');
  try {
    const emailService = require('./services/emailService');
    
    const testEmail = {
      userEmail: process.env.EMAIL_USER, // Send to yourself for testing
      userName: 'Test User',
      eaName: 'Test EA',
      downloadLinks: {
        zip_package: 'https://example.com/download/test.zip',
        ea_file: 'https://example.com/download/test.ex4',
        set_file: 'https://example.com/download/test.set',
        manual: 'https://example.com/download/manual.pdf'
      },
      subscriptionType: 'monthly',
      subscriptionId: 'test-123'
    };

    console.log('   Sending test email to:', testEmail.userEmail);
    const result = await emailService.sendDownloadEmail(testEmail);

    if (result.success) {
      console.log('   ✅ Email sent successfully!');
      console.log('   Message ID:', result.messageId);
      console.log('   Check your inbox:', testEmail.userEmail);
    } else {
      console.error('   ❌ Email failed:', result.error);
      console.error('   Error code:', result.code);
    }
  } catch (error) {
    console.error('   ❌ Email service error:', error.message);
    console.error('   Stack:', error.stack);
  }

  // 3. Check database connection
  console.log('\n3️⃣ Checking Database Connection...');
  try {
    const supabase = databaseService.getClient();
    if (!supabase) {
      console.error('   ❌ Supabase client not available');
      return;
    }

    const { data, error } = await supabase
      .from('users_accounts')
      .select('id, email')
      .limit(1);

    if (error) {
      console.error('   ❌ Database error:', error.message);
    } else {
      console.log('   ✅ Database connected');
      console.log('   Sample user:', data[0] ? data[0].email : 'No users found');
    }
  } catch (error) {
    console.error('   ❌ Database connection error:', error.message);
  }

  // 4. Check recent payments
  console.log('\n4️⃣ Checking Recent Payments...');
  try {
    const supabase = databaseService.getClient();

    // Check Paystack payments
    const { data: paystackPayments, error: paystackError } = await supabase
      .from('paystack_payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (paystackError) {
      console.log('   ⚠️ Paystack payments table error:', paystackError.message);
    } else {
      console.log(`   Paystack Payments: ${paystackPayments.length} recent payments`);
      paystackPayments.forEach((payment, i) => {
        console.log(`   ${i + 1}. ${payment.email} - ${payment.status} - ${payment.amount_usd} USD - ${payment.created_at}`);
      });
    }

    // Check Crypto payments
    const { data: cryptoPayments, error: cryptoError } = await supabase
      .from('crypto_payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (cryptoError) {
      console.log('   ⚠️ Crypto payments table error:', cryptoError.message);
    } else {
      console.log(`   Crypto Payments: ${cryptoPayments.length} recent payments`);
      cryptoPayments.forEach((payment, i) => {
        console.log(`   ${i + 1}. User ${payment.user_id} - ${payment.status} - ${payment.amount_usd} USD - ${payment.created_at}`);
      });
    }

    // Check subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (subError) {
      console.log('   ⚠️ Subscriptions table error:', subError.message);
    } else {
      console.log(`   Subscriptions: ${subscriptions.length} recent subscriptions`);
      subscriptions.forEach((sub, i) => {
        console.log(`   ${i + 1}. User ${sub.user_id} - ${sub.status} - ${sub.payment_method} - ${sub.created_at}`);
      });
    }
  } catch (error) {
    console.error('   ❌ Error checking payments:', error.message);
  }

  // 5. Test payment verification endpoints
  console.log('\n5️⃣ Payment Verification Endpoints...');
  console.log('   Paystack verify: POST /api/payments/paystack/verify/:reference');
  console.log('   Crypto confirm: POST /api/payments/crypto/:transactionId/confirm');
  console.log('   Make sure these endpoints are being called after payment!');

  console.log('\n✅ ========== TEST COMPLETE ==========\n');
  console.log('📋 Next Steps:');
  console.log('   1. If email test passed, emails should work in production');
  console.log('   2. Check that payment verification endpoints are being called');
  console.log('   3. Monitor server logs during actual payments');
  console.log('   4. Verify EMAIL_USER and EMAIL_PASSWORD are set in Railway');
  console.log('   5. Check spam folder if emails not received\n');
}

// Run the test
testPaymentEmailFlow()
  .then(() => {
    console.log('Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
