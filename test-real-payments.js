/**
 * Test Real Payment Flow Script
 * Tests M-Pesa and Crypto payment flow with small amounts
 * 
 * Prerequisites:
 * 1. MOCK_AUTH=false in environment
 * 2. Real Supabase credentials configured
 * 3. M-Pesa sandbox/production credentials configured
 * 4. Crypto wallet addresses configured
 * 
 * Usage:
 *   node test-real-payments.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@smartalgos.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'Test123!@#';
const TEST_PHONE = process.env.TEST_PHONE || '254712345678'; // Your actual phone for M-Pesa

console.log('🧪 Real Payment Testing Script');
console.log('=' .repeat(70));
console.log(`\n📍 Testing against: ${BASE_URL}`);
console.log(`📧 Test user: ${TEST_USER_EMAIL}`);
console.log(`📱 Test phone: ${TEST_PHONE}`);

// Check environment setup
function checkEnvironment() {
  console.log('\n🔍 Checking Environment Configuration...\n');
  
  const checks = [
    { 
      name: 'MOCK_AUTH', 
      value: process.env.MOCK_AUTH,
      expected: 'false',
      status: process.env.MOCK_AUTH === 'false' ? '✅' : '❌'
    },
    {
      name: 'SUPABASE_URL',
      value: process.env.SUPABASE_URL ? '✅ Set' : '❌ Not set',
      status: process.env.SUPABASE_URL ? '✅' : '❌'
    },
    {
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      value: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Not set',
      status: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌'
    },
    {
      name: 'MPESA_CONSUMER_KEY',
      value: process.env.MPESA_CONSUMER_KEY ? '✅ Set' : '❌ Not set',
      status: process.env.MPESA_CONSUMER_KEY ? '✅' : '❌'
    },
    {
      name: 'MPESA_ENVIRONMENT',
      value: process.env.MPESA_ENVIRONMENT || 'sandbox',
      status: '✅'
    },
    {
      name: 'BTC_WALLET_ADDRESS',
      value: process.env.BTC_WALLET_ADDRESS ? '✅ Set' : '⚠️  Not set',
      status: process.env.BTC_WALLET_ADDRESS ? '✅' : '⚠️ '
    },
    {
      name: 'ETH_WALLET_ADDRESS',
      value: process.env.ETH_WALLET_ADDRESS ? '✅ Set' : '⚠️  Not set',
      status: process.env.ETH_WALLET_ADDRESS ? '✅' : '⚠️ '
    },
    {
      name: 'USDT_WALLET_ADDRESS',
      value: process.env.USDT_WALLET_ADDRESS ? '✅ Set' : '⚠️  Not set',
      status: process.env.USDT_WALLET_ADDRESS ? '✅' : '⚠️ '
    }
  ];
  
  checks.forEach(check => {
    console.log(`${check.status} ${check.name}: ${check.value}`);
  });
  
  const criticalFails = checks.slice(0, 5).filter(c => c.status === '❌');
  if (criticalFails.length > 0) {
    console.log('\n❌ Critical environment variables missing!');
    console.log('   Please configure them before testing.');
    return false;
  }
  
  console.log('\n✅ Environment check passed!');
  return true;
}

// Test login and get token
async function testLogin() {
  try {
    console.log('\n📝 TEST 1: User Login');
    console.log('-'.repeat(70));
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    });
    
    if (response.data.success && response.data.token) {
      console.log('✅ Login successful');
      console.log(`   User ID: ${response.data.user?.id || response.data.user?.userId}`);
      return response.data.token;
    } else {
      throw new Error('Login failed: ' + JSON.stringify(response.data));
    }
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    console.log('\n💡 TIP: Make sure the test user exists or create one first');
    return null;
  }
}

// Test fetching EAs
async function testFetchEAs(token) {
  try {
    console.log('\n📝 TEST 2: Fetch Available EAs');
    console.log('-'.repeat(70));
    
    const response = await axios.get(`${BASE_URL}/api/eas`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success && response.data.data) {
      const eas = response.data.data;
      console.log(`✅ Found ${eas.length} EAs`);
      
      if (eas.length > 0) {
        console.log('\n   Available EAs:');
        eas.forEach((ea, index) => {
          console.log(`   ${index + 1}. ${ea.name} (ID: ${ea.id})`);
          console.log(`      Weekly: ${ea.price_weekly || 'N/A'} KES`);
          console.log(`      Monthly: ${ea.price_monthly || 'N/A'} KES`);
        });
        return eas[0]; // Return first EA for testing
      } else {
        console.log('⚠️  No EAs found in marketplace');
        return null;
      }
    } else {
      throw new Error('Failed to fetch EAs');
    }
  } catch (error) {
    console.error('❌ Fetch EAs failed:', error.response?.data || error.message);
    return null;
  }
}

// Test M-Pesa payment (5 KES)
async function testMpesaPayment(token, ea) {
  try {
    console.log('\n📝 TEST 3: M-Pesa Payment (5 KES)');
    console.log('-'.repeat(70));
    console.log('⚠️  IMPORTANT: This will send an STK Push to your phone!');
    console.log('   You will need to enter your M-Pesa PIN to complete payment.');
    
    const paymentData = {
      amount: 5, // 5 KES for testing
      phoneNumber: TEST_PHONE,
      accountReference: `EA_${ea.id}`,
      transactionDesc: 'Test EA Subscription',
      metadata: {
        eaId: ea.id,
        ea_id: ea.id,
        subscriptionType: 'weekly', // Use weekly for 5 KES test
        subscription_type: 'weekly'
      }
    };
    
    console.log(`\n   Initiating STK Push to ${TEST_PHONE}...`);
    
    const response = await axios.post(`${BASE_URL}/api/mpesa/stk-push`, paymentData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      console.log('✅ STK Push initiated successfully!');
      console.log(`   Checkout Request ID: ${response.data.data.checkoutRequestID}`);
      console.log(`   Merchant Request ID: ${response.data.data.merchantRequestID}`);
      console.log('\n📱 Please check your phone and enter M-Pesa PIN...');
      console.log('   Waiting 30 seconds for payment confirmation...');
      
      // Wait for callback processing
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      // Query transaction status
      console.log('\n   Querying transaction status...');
      const statusResponse = await axios.get(
        `${BASE_URL}/api/mpesa/query/${response.data.data.checkoutRequestID}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      console.log('   Status:', statusResponse.data);
      
      return response.data.data.checkoutRequestID;
    } else {
      throw new Error('STK Push failed: ' + JSON.stringify(response.data));
    }
  } catch (error) {
    console.error('❌ M-Pesa payment failed:', error.response?.data || error.message);
    return null;
  }
}

// Test crypto payment initialization
async function testCryptoPayment(token, ea) {
  try {
    console.log('\n📝 TEST 4: Crypto Payment Initialization');
    console.log('-'.repeat(70));
    
    const paymentData = {
      eaId: ea.id,
      amount: 1, // 1 USD minimum
      subscriptionType: 'monthly',
      currency: 'USD'
    };
    
    console.log('\n   Initializing crypto payment...');
    
    const response = await axios.post(
      `${BASE_URL}/api/payments/crypto/subscribe`,
      paymentData,
      { headers: { Authorization: `Bearer ${token}` }}
    );
    
    if (response.data.success) {
      console.log('✅ Crypto payment initialized!');
      console.log('\n   Payment Details:');
      console.log(`   Payment ID: ${response.data.data.paymentId || response.data.data.id}`);
      
      if (response.data.data.walletAddresses) {
        console.log('\n   Wallet Addresses:');
        Object.entries(response.data.data.walletAddresses).forEach(([crypto, address]) => {
          console.log(`   ${crypto.toUpperCase()}: ${address}`);
        });
      }
      
      console.log('\n   💡 To complete payment:');
      console.log('      1. Send crypto to one of the addresses above');
      console.log('      2. The system will auto-detect payment (may take a few minutes)');
      console.log('      3. Check payment status with the Payment ID');
      
      return response.data.data;
    } else {
      throw new Error('Crypto payment initialization failed');
    }
  } catch (error) {
    console.error('❌ Crypto payment failed:', error.response?.data || error.message);
    return null;
  }
}

// Check subscriptions
async function checkSubscriptions(token) {
  try {
    console.log('\n📝 TEST 5: Check Active Subscriptions');
    console.log('-'.repeat(70));
    
    const response = await axios.get(`${BASE_URL}/api/subscriptions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      const subscriptions = response.data.data || [];
      console.log(`✅ Found ${subscriptions.length} subscription(s)`);
      
      if (subscriptions.length > 0) {
        subscriptions.forEach((sub, index) => {
          console.log(`\n   Subscription ${index + 1}:`);
          console.log(`   ID: ${sub.id}`);
          console.log(`   EA ID: ${sub.ea_id}`);
          console.log(`   Status: ${sub.status}`);
          console.log(`   Payment Method: ${sub.payment_method}`);
          console.log(`   Amount: ${sub.amount} ${sub.currency || 'KES'}`);
          console.log(`   Valid Until: ${new Date(sub.end_date).toLocaleString()}`);
        });
      } else {
        console.log('   No active subscriptions found');
      }
      
      return subscriptions;
    }
  } catch (error) {
    console.error('❌ Check subscriptions failed:', error.response?.data || error.message);
    return [];
  }
}

// Main test flow
async function runTests() {
  console.log('\n🚀 Starting Real Payment Tests...\n');
  
  // Check environment
  if (!checkEnvironment()) {
    console.log('\n❌ Environment check failed. Please fix configuration first.');
    process.exit(1);
  }
  
  // Login
  const token = await testLogin();
  if (!token) {
    console.log('\n❌ Cannot proceed without valid authentication');
    process.exit(1);
  }
  
  // Fetch EAs
  const ea = await testFetchEAs(token);
  if (!ea) {
    console.log('\n⚠️  No EAs available for testing');
    console.log('   Please add EAs to the marketplace first');
  }
  
  // Test M-Pesa payment
  if (ea && process.env.MPESA_CONSUMER_KEY) {
    console.log('\n\n⚠️  Ready to test M-Pesa payment with 5 KES');
    console.log('   Press Ctrl+C to skip, or wait 10 seconds to continue...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await testMpesaPayment(token, ea);
  } else {
    console.log('\n⏭️  Skipping M-Pesa test (not configured or no EA)');
  }
  
  // Test Crypto payment
  if (ea && (process.env.BTC_WALLET_ADDRESS || process.env.ETH_WALLET_ADDRESS)) {
    await testCryptoPayment(token, ea);
  } else {
    console.log('\n⏭️  Skipping Crypto test (not configured or no EA)');
  }
  
  // Check subscriptions
  await checkSubscriptions(token);
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Testing Complete!');
  console.log('\n📊 Summary:');
  console.log('   - Login: ✅');
  console.log('   - EA Fetch: ' + (ea ? '✅' : '⚠️ '));
  console.log('   - M-Pesa: ' + (process.env.MPESA_CONSUMER_KEY ? '✅ Initiated' : '⏭️  Skipped'));
  console.log('   - Crypto: ' + ((process.env.BTC_WALLET_ADDRESS || process.env.ETH_WALLET_ADDRESS) ? '✅ Initiated' : '⏭️  Skipped'));
  console.log('\n💡 Next Steps:');
  console.log('   1. Complete M-Pesa payment on your phone if prompted');
  console.log('   2. Send crypto to the displayed address if testing crypto');
  console.log('   3. Wait for payment confirmation (check subscriptions)');
  console.log('   4. Try downloading EA files after subscription is active');
  console.log('\n');
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});

