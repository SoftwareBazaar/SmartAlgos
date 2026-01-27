const axios = require('axios');

// Unified test with standardized credentials
async function testUnifiedAdminLogin() {
  console.log('🧪 Testing unified admin login...\n');
  
  const credentials = {
    email: 'admin@smartalgos.com',
    password: 'AdminPass123!'
  };
  
  try {
    console.log('Testing admin login with standardized credentials...');
    const response = await axios.post('http://localhost:5000/api/auth/admin/login', credentials);
    
    if (response.data.success) {
      console.log('✅ Admin login successful!');
      console.log('👤 Admin:', response.data.user.first_name, response.data.user.last_name);
      console.log('📧 Email:', response.data.user.email);
      console.log('🔑 Role:', response.data.user.role);
      console.log('🎫 Token:', response.data.token ? 'Received' : 'Not received');
      
      // Test protected route access
      console.log('\n🧪 Testing protected route access...');
      await testProtectedRoute(response.data.token);
      
    } else {
      console.log('❌ Admin login failed:', response.data.message);
    }
    
  } catch (error) {
    console.log('❌ Admin login error:', error.response?.data?.message || error.message);
    console.log('Status:', error.response?.status);
  }
}

async function testProtectedRoute(token) {
  try {
    const response = await axios.get('http://localhost:5000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      console.log('✅ Protected route access successful!');
      console.log('👤 User verified:', response.data.user.email);
    } else {
      console.log('❌ Protected route access failed:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Protected route error:', error.response?.data?.message || error.message);
  }
}

testUnifiedAdminLogin();
