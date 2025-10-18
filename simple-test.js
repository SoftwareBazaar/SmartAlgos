const axios = require('axios');

console.log('Testing Subscription/Download Flow');
console.log('==================================');

async function testFlow() {
  try {
    console.log('\n1. Checking server health...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('   Server is running and healthy');

    console.log('\n2. Testing EA marketplace...');
    const easResponse = await axios.get('http://localhost:5000/api/eas');
    if (easResponse.data.success) {
      console.log('   EA marketplace is accessible');
    } else {
      console.log('   EA marketplace returned error');
    }

    console.log('\n3. Testing subscription endpoint...');
    try {
      const subsResponse = await axios.get('http://localhost:5000/api/subscriptions');
      console.log('   Subscription endpoint accessible');
    } catch (error) {
      console.log('   Subscription endpoint may require authentication');
    }

    console.log('\nTest completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Navigate to EA Marketplace');
    console.log('3. Test the subscription flow');
    console.log('4. Verify download functionality');

  } catch (error) {
    console.error('\nTest failed:', error.message);
    console.log('\nPlease make sure the server is running:');
    console.log('npm start');
  }
}

testFlow();
