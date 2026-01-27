const fetch = require('node-fetch');

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function testCryptoPayment() {
  console.log('🧪 Testing Crypto Payment Endpoint...\n');

  try {
    // Test 1: Generate payment address
    console.log('1️⃣ Testing payment generation...');
    const generateResponse = await fetch(`${API_URL}/api/payments/crypto/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test_token'
      },
      body: JSON.stringify({
        amount: 99.99,
        currency: 'USD',
        cryptoCurrency: 'usdt',
        productType: 'ea_subscription',
        productId: '1'
      })
    });

    console.log(`Response status: ${generateResponse.status}`);
    
    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      throw new Error(`Payment generation failed: ${generateResponse.status} - ${errorText}`);
    }

    const generateData = await generateResponse.json();
    console.log('✅ Payment generated successfully!');
    console.log('📝 Response:', JSON.stringify(generateData, null, 2));

    if (generateData.success && generateData.data) {
      const { transactionId, address, amount, currency, network, qrCode } = generateData.data;
      
      console.log('\n📊 Payment Details:');
      console.log(`  Transaction ID: ${transactionId}`);
      console.log(`  Address: ${address}`);
      console.log(`  Amount: ${amount} ${currency.toUpperCase()}`);
      console.log(`  Network: ${network}`);
      console.log(`  QR Code: ${qrCode ? 'Generated ✓' : 'Not generated ✗'}`);

      // Test 2: Check payment status
      console.log('\n2️⃣ Testing status check...');
      const statusResponse = await fetch(`${API_URL}/api/payments/crypto/status/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test_token'
        }
      });

      console.log(`Response status: ${statusResponse.status}`);
      
      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        throw new Error(`Status check failed: ${statusResponse.status} - ${errorText}`);
      }

      const statusData = await statusResponse.json();
      console.log('✅ Status check successful!');
      console.log('📝 Response:', JSON.stringify(statusData, null, 2));

      console.log('\n✅ All tests passed! Crypto payment is working correctly.');
      console.log('\n📌 Next steps:');
      console.log('  1. Open your application in the browser');
      console.log('  2. Navigate to the EA marketplace');
      console.log('  3. Try to purchase an EA with crypto payment');
      console.log('  4. You should see the crypto payment options');
      
      return true;
    } else {
      throw new Error('Payment generation returned unexpected format');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Full error:', error);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('  1. Make sure the server is running (npm start)');
    console.log('  2. Check that the database tables exist');
    console.log('  3. Verify the route is properly registered in server.js');
    
    return false;
  }
}

// Run the test
testCryptoPayment()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

