const axios = require('axios');

async function debugServerError() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🔍 Debugging server error...\n');
  
  // Test health endpoint first
  try {
    const health = await axios.get(`${baseURL}/api/health`);
    console.log('✅ Health check passed:', health.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return;
  }
  
  // Test with minimal request
  try {
    console.log('\n📤 Sending login request...');
    const response = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'testuser@smartalgos.com',
      password: 'TestUser123!'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Login successful:', response.data);
  } catch (error) {
    console.log('❌ Login failed');
    console.log('   Status:', error.response?.status);
    console.log('   Status Text:', error.response?.statusText);
    console.log('   Data:', error.response?.data);
    console.log('   Headers:', error.response?.headers);
    
    if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
      console.log('   Connection issue detected');
    }
    
    if (error.message.includes('timeout')) {
      console.log('   Request timed out');
    }
  }
  
  // Test database connection endpoint if it exists
  try {
    const dbTest = await axios.get(`${baseURL}/api/test-db`);
    console.log('✅ Database test:', dbTest.data);
  } catch (error) {
    console.log('ℹ️  Database test endpoint not available');
  }
}

debugServerError();
