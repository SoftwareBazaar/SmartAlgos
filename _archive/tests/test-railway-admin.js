const axios = require('axios');

async function testRailwayAdminLogin() {
  console.log('🧪 Testing Railway Admin Login...\n');
  
  // Replace with your actual Railway URL
  const railwayURL = 'https://your-app-name.railway.app';
  
  try {
    const response = await axios.post(`${railwayURL}/api/auth/admin/login`, {
      email: 'admin@smartalgos.com',
      password: 'AdminPass123!'
    });
    
    if (response.data.success) {
      console.log('✅ Railway admin login successful!');
      console.log('👤 Admin:', response.data.user.first_name, response.data.user.last_name);
      console.log('📧 Email:', response.data.user.email);
      console.log('🔑 Role:', response.data.user.role);
      console.log('🎫 Token:', response.data.token);
      
      // Test protected route
      console.log('\n🧪 Testing protected route...');
      const meResponse = await axios.get(`${railwayURL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${response.data.token}`
        }
      });
      
      if (meResponse.data.success) {
        console.log('✅ Protected route access successful!');
        console.log('👤 User verified:', meResponse.data.user.email);
      }
      
    } else {
      console.log('❌ Railway admin login failed:', response.data.message);
    }
    
  } catch (error) {
    console.log('❌ Railway admin login error:', error.response?.data?.message || error.message);
    console.log('Status:', error.response?.status);
  }
}

testRailwayAdminLogin();
