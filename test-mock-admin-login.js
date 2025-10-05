const axios = require('axios');

async function testMockAdminLogin() {
  console.log('🧪 Testing Mock Admin Login...\n');
  
  try {
    const response = await axios.post('http://localhost:5000/api/auth/admin/login', {
      email: 'Softwarebazaar.ke@gmail.com',
      password: '28103441Jw@'
    });
    
    if (response.data.success) {
      console.log('✅ Mock admin login successful!');
      console.log('👤 Admin:', response.data.user.first_name, response.data.user.last_name);
      console.log('📧 Email:', response.data.user.email);
      console.log('🔑 Role:', response.data.user.role);
      console.log('🎫 Token:', response.data.token);
      
      // Test protected route
      console.log('\n🧪 Testing protected route...');
      const meResponse = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${response.data.token}`
        }
      });
      
      if (meResponse.data.success) {
        console.log('✅ Protected route access successful!');
        console.log('👤 User verified:', meResponse.data.user.email);
      }
      
    } else {
      console.log('❌ Mock admin login failed:', response.data.message);
    }
    
  } catch (error) {
    console.log('❌ Mock admin login error:', error.response?.data?.message || error.message);
    console.log('Status:', error.response?.status);
  }
}

testMockAdminLogin();
