const axios = require('axios');

async function testSimpleAuth() {
  const baseURL = 'http://localhost:5000';
  
  console.log('Testing simple authentication...');
  
  // Test with existing admin user
  try {
    console.log('Testing login with existing admin...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/admin/login`, {
      email: 'admin@smartalgos.com',
      password: 'AdminPass123!'
    });
    console.log('✅ Admin login successful:', loginResponse.data.success);
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
    
    // Try regular login
    try {
      console.log('Trying regular login...');
      const regularLogin = await axios.post(`${baseURL}/api/auth/login`, {
        email: 'admin@smartalgos.com',
        password: 'AdminPass123!'
      });
      console.log('✅ Regular login successful:', regularLogin.data.success);
    } catch (err) {
      console.log('❌ Regular login failed:', err.response?.data?.message || err.message);
    }
  }
  
  // Test user registration
  try {
    console.log('\nTesting user registration...');
    const regResponse = await axios.post(`${baseURL}/api/auth/register`, {
      firstName: 'New',
      lastName: 'User',
      email: 'newuser@test.com',
      password: 'NewUserPass123!',
      confirmPassword: 'NewUserPass123!',
      tradingExperience: 'beginner'
    });
    console.log('✅ User registration successful:', regResponse.data.success);
  } catch (error) {
    console.log('❌ User registration failed:', error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.log('Validation errors:', error.response.data.errors);
    }
  }
}

testSimpleAuth().catch(console.error);
