/**
 * Test M-Pesa STK Push
 * Quick script to test M-Pesa payment with your phone number
 */

const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:5000';
const PHONE_NUMBER = '254746054224'; // Your phone number (without +)
const AMOUNT = 10; // Test with 10 KES

async function testMpesaSTKPush() {
  console.log('🧪 Testing M-Pesa STK Push...\n');
  
  try {
    // Step 1: Login first to get auth token
    console.log('📱 Step 1: Logging in to get auth token...');
    
    // You need to replace these with your actual credentials
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'your-email@example.com', // Replace with your email
      password: 'your-password' // Replace with your password
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Logged in successfully\n');
    
    // Step 2: Initiate STK Push
    console.log('📱 Step 2: Initiating M-Pesa STK Push...');
    console.log(`   Phone: ${PHONE_NUMBER}`);
    console.log(`   Amount: KES ${AMOUNT}\n`);
    
    const stkPushResponse = await axios.post(
      `${API_URL}/api/mpesa/stk-push`,
      {
        amount: AMOUNT,
        phoneNumber: PHONE_NUMBER,
        accountReference: 'TEST_' + Date.now(),
        transactionDesc: 'AlgoSmart Test Payment'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ STK Push Response:');
    console.log(JSON.stringify(stkPushResponse.data, null, 2));
    console.log('\n📱 Check your phone for M-Pesa prompt!');
    console.log('💡 Enter your M-Pesa PIN to complete payment\n');
    
    // Step 3: Query status after 10 seconds
    if (stkPushResponse.data.success) {
      const checkoutRequestID = stkPushResponse.data.data.checkoutRequestID;
      
      console.log('⏳ Waiting 10 seconds before checking status...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      console.log('\n🔍 Step 3: Checking payment status...');
      const statusResponse = await axios.get(
        `${API_URL}/api/mpesa/query/${checkoutRequestID}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('✅ Status Response:');
      console.log(JSON.stringify(statusResponse.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 TIP: Update your email and password in this script (lines 17-18)');
    }
  }
}

// Run the test
console.log('═══════════════════════════════════════════');
console.log('   M-PESA STK PUSH TEST');
console.log('═══════════════════════════════════════════\n');

testMpesaSTKPush().then(() => {
  console.log('\n═══════════════════════════════════════════');
  console.log('   TEST COMPLETE');
  console.log('═══════════════════════════════════════════\n');
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

