const axios = require('axios');

async function testExistingAdminLogin() {
  console.log('🧪 Testing login with existing admin account...\n');
  
  // Configure axios like the frontend does
  axios.defaults.baseURL = 'http://localhost:5000';
  
  try {
    // Test admin login
    console.log('Testing admin login...');
    const adminLogin = await axios.post('/api/auth/admin/login', {
      email: 'softwarebazaar.ke@gmail.com',
      password: 'AdminPass123!'
    });
    
    console.log('✅ Admin login successful!');
    console.log('Admin:', adminLogin.data.user.first_name, adminLogin.data.user.last_name);
    console.log('Role:', adminLogin.data.user.role);
    console.log('Email:', adminLogin.data.user.email);
    
    // Also test regular login endpoint
    console.log('\nTesting regular login endpoint...');
    const regularLogin = await axios.post('/api/auth/login', {
      email: 'softwarebazaar.ke@gmail.com',
      password: 'AdminPass123!'
    });
    
    console.log('✅ Regular login also works!');
    console.log('User role:', regularLogin.data.user.role);
    
  } catch (error) {
    console.log('❌ Login failed');
    console.log('Error:', error.response?.data?.message || error.message);
    console.log('Status:', error.response?.status);
  }
}

testExistingAdminLogin();

