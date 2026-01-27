/**
 * Check Recent Payments and Email Sending
 * This script checks if payments were processed and if emails were sent
 */

require('dotenv').config();
const databaseService = require('./services/databaseService');

async function checkRecentPayments() {
  console.log('\n🔍 ========== CHECKING RECENT PAYMENTS ==========\n');

  try {
    const supabase = databaseService.getClient();
    
    if (!supabase) {
      console.error('❌ Supabase client not available');
      return;
    }

    // Check Paystack payments
    console.log('1️⃣ Checking Paystack Payments...\n');
    const { data: paystackPayments, error: paystackError } = await supabase
      .from('paystack_payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (paystackError) {
      console.error('❌ Error fetching Paystack payments:', paystackError.message);
    } else {
      console.log(`Found ${paystackPayments.length} recent Paystack payments:\n`);
      paystackPayments.forEach((payment, i) => {
        console.log(`Payment ${i + 1}:`);
        console.log(`  ID: ${payment.id}`);
        console.log(`  Reference: ${payment.paystack_reference}`);
        console.log(`  Email: ${payment.email}`);
        console.log(`  Amount: $${payment.amount_usd} USD`);
        console.log(`  Status: ${payment.status}`);
        console.log(`  Created: ${payment.created_at}`);
        console.log(`  Updated: ${payment.updated_at}`);
        console.log('');
      });
    }

    // Check Crypto payments
    console.log('\n2️⃣ Checking Crypto Payments...\n');
    const { data: cryptoPayments, error: cryptoError } = await supabase
      .from('crypto_payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (cryptoError) {
      console.error('❌ Error fetching Crypto payments:', cryptoError.message);
    } else {
      console.log(`Found ${cryptoPayments.length} recent Crypto payments:\n`);
      cryptoPayments.forEach((payment, i) => {
        console.log(`Payment ${i + 1}:`);
        console.log(`  ID: ${payment.id}`);
        console.log(`  User ID: ${payment.user_id}`);
        console.log(`  Amount: $${payment.amount_usd} USD`);
        console.log(`  Crypto: ${payment.crypto_currency}`);
        console.log(`  Status: ${payment.status}`);
        console.log(`  Created: ${payment.created_at}`);
        console.log(`  Confirmed: ${payment.confirmed_at || 'Not confirmed'}`);
        console.log('');
      });
    }

    // Check subscriptions
    console.log('\n3️⃣ Checking Recent Subscriptions...\n');
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (subError) {
      console.error('❌ Error fetching subscriptions:', subError.message);
    } else {
      console.log(`Found ${subscriptions.length} recent subscriptions:\n`);
      subscriptions.forEach((sub, i) => {
        console.log(`Subscription ${i + 1}:`);
        console.log(`  ID: ${sub.id}`);
        console.log(`  User ID: ${sub.user_id}`);
        console.log(`  EA ID: ${sub.ea_id}`);
        console.log(`  Status: ${sub.status}`);
        console.log(`  Payment Method: ${sub.payment_method}`);
        console.log(`  Payment Reference: ${sub.payment_reference}`);
        console.log(`  Created: ${sub.created_at}`);
        console.log('');
      });
    }

    // Check for the most recent payment that should have triggered an email
    console.log('\n4️⃣ Analyzing Most Recent Payment...\n');
    
    const mostRecentPaystack = paystackPayments && paystackPayments.length > 0 ? paystackPayments[0] : null;
    const mostRecentCrypto = cryptoPayments && cryptoPayments.length > 0 ? cryptoPayments[0] : null;
    const mostRecentSub = subscriptions && subscriptions.length > 0 ? subscriptions[0] : null;

    if (mostRecentPaystack && mostRecentPaystack.status === 'completed') {
      console.log('📧 Most recent Paystack payment is COMPLETED');
      console.log(`   Reference: ${mostRecentPaystack.paystack_reference}`);
      console.log(`   Email should have been sent to: ${mostRecentPaystack.email}`);
      
      // Check if subscription was created
      const matchingSub = subscriptions?.find(s => s.payment_reference === mostRecentPaystack.paystack_reference);
      if (matchingSub) {
        console.log(`   ✅ Subscription created: ${matchingSub.id}`);
        console.log(`   📧 Email should have been sent during subscription creation`);
      } else {
        console.log(`   ❌ No subscription found for this payment!`);
        console.log(`   This is why email wasn't sent - subscription creation failed`);
      }
    }

    if (mostRecentCrypto && mostRecentCrypto.status === 'confirmed') {
      console.log('📧 Most recent Crypto payment is CONFIRMED');
      console.log(`   Transaction ID: ${mostRecentCrypto.id}`);
      
      // Check if subscription was created
      const matchingSub = subscriptions?.find(s => s.payment_reference === mostRecentCrypto.id);
      if (matchingSub) {
        console.log(`   ✅ Subscription created: ${matchingSub.id}`);
        console.log(`   📧 Email should have been sent during subscription creation`);
      } else {
        console.log(`   ❌ No subscription found for this payment!`);
        console.log(`   This is why email wasn't sent - subscription creation failed`);
      }
    }

    // Check for pending payments
    console.log('\n5️⃣ Checking for Pending Payments...\n');
    
    const pendingPaystack = paystackPayments?.filter(p => p.status === 'pending') || [];
    const pendingCrypto = cryptoPayments?.filter(p => p.status === 'pending') || [];
    
    if (pendingPaystack.length > 0) {
      console.log(`⚠️  Found ${pendingPaystack.length} pending Paystack payment(s)`);
      console.log('   These need to be verified by calling:');
      pendingPaystack.forEach(p => {
        console.log(`   GET /api/payments/paystack/verify/${p.paystack_reference}`);
      });
    }
    
    if (pendingCrypto.length > 0) {
      console.log(`⚠️  Found ${pendingCrypto.length} pending Crypto payment(s)`);
      console.log('   These need to be confirmed by calling:');
      pendingCrypto.forEach(p => {
        console.log(`   POST /api/payments/crypto/${p.id}/confirm`);
      });
    }

    console.log('\n✅ ========== CHECK COMPLETE ==========\n');
    
    // Provide recommendations
    console.log('📋 RECOMMENDATIONS:\n');
    
    if (pendingPaystack.length > 0 || pendingCrypto.length > 0) {
      console.log('1. You have pending payments that need verification');
      console.log('   - Check if the payment verification endpoint is being called');
      console.log('   - Check Railway logs for verification attempts');
      console.log('');
    }
    
    console.log('2. Check Railway logs for these patterns:');
    console.log('   - "🔍 [Paystack] ========== PAYMENT VERIFICATION START =========="');
    console.log('   - "📧 [Paystack] ========== ATTEMPTING TO SEND EMAIL =========="');
    console.log('   - "✅ [Paystack] Email sent successfully!"');
    console.log('');
    
    console.log('3. If payment was verified but no email sent:');
    console.log('   - Check Railway logs for email errors');
    console.log('   - Verify EMAIL_USER and EMAIL_PASSWORD are set in Railway');
    console.log('   - Check if subscription was created successfully');
    console.log('');
    
    console.log('4. To manually trigger email for a subscription:');
    console.log('   - You can create a manual email trigger endpoint');
    console.log('   - Or check the subscription in database and resend email');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

// Run the check
checkRecentPayments()
  .then(() => {
    console.log('Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  });
