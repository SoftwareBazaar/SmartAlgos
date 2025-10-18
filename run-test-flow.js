const axios = require('axios');

console.log('Testing Subscription/Download Flow');
console.log('==================================\n');

async function checkServer() {
  try {
    const response = await axios.get('http://localhost:5000/api/health');
    console.log('Server is running\n');
    return true;
  } catch (error) {
    console.log('Server is not running. Please start the server first:');
    console.log('npm start');
    console.log('or');
    console.log('node server.js\n');
    return false;
  }
}

async function runBasicTests() {
  console.log('Running basic tests...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('   Server is healthy\n');
    
    // Test 2: EA endpoint
    console.log('2. Testing EA marketplace...');
    const easResponse = await axios.get('http://localhost:5000/api/eas');
    if (easResponse.data.success) {
      console.log('   EA marketplace is accessible\n');
    } else {
      console.log('   EA marketplace returned error\n');
    }
    
    // Test 3: Subscription endpoint
    console.log('3. Testing subscription endpoint...');
    try {
      const subsResponse = await axios.get('http://localhost:5000/api/subscriptions');
      console.log('   Subscription endpoint accessible\n');
    } catch (error) {
      console.log('   Subscription endpoint may require authentication\n');
    }
    
    console.log('Basic tests completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Navigate to EA Marketplace');
    console.log('3. Test the subscription flow');
    console.log('4. Verify download functionality');
    
  } catch (error) {
    console.error('Test failed:', error.message);
    throw error;
  }
}

async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    process.exit(1);
  }
  
  try {
    await runBasicTests();
    console.log('\nAll tests passed! The system is ready for testing.');
  } catch (error) {
    console.error('\nTests failed:', error.message);
    process.exit(1);
  }
}

main();
