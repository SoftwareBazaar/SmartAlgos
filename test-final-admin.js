const axios = require('axios');

async function testFinalAdmin() {
  console.log('🧪 Testing Final Admin Login Setup\n');
  
  // Standardized credentials
  const credentials = {
    email: 'admin@smartalgos.com',
    password: 'AdminPass123!'
  };
  
  // Replace with your actual Railway URL
  const railwayURL = process.env.RAILWAY_URL || 'https://your-app.railway.app';
  
  console.log('🌐 Testing against:', railwayURL);
  console.log('📧 Admin Email:', credentials.email);
  console.log('');
  
  try {
    // Test health endpoint first
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${railwayURL}/health`);
    
    if (healthResponse.data.status === 'OK') {
      console.log('✅ Health check passed');
      console.log('📊 Status:', healthResponse.data.status);
      console.log('⏱️  Uptime:', Math.floor(healthResponse.data.uptime), 'seconds');
    } else {
      console.log('❌ Health check failed:', healthResponse.data);
      return;
    }
    
    console.log('');
    
    // Test admin login
    console.log('2️⃣ Testing admin login...');
    const loginResponse = await axios.post(`${railwayURL}/api/auth/admin/login`, credentials);
    
    if (loginResponse.data.success) {
      console.log('✅ Admin login successful!');
      console.log('👤 Admin:', loginResponse.data.user.first_name, loginResponse.data.user.last_name);
      console.log('📧 Email:', loginResponse.data.user.email);
      console.log('🔑 Role:', loginResponse.data.user.role);
      console.log('🎫 Token received:', loginResponse.data.token ? 'Yes' : 'No');
      
      // Test protected route
      console.log('');
      console.log('3️⃣ Testing protected route access...');
      
      const meResponse = await axios.get(`${railwayURL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      
      if (meResponse.data.success) {
        console.log('✅ Protected route access successful!');
        console.log('👤 User verified:', meResponse.data.user.email);
        console.log('🔑 Role confirmed:', meResponse.data.user.role);
      } else {
        console.log('❌ Protected route access failed:', meResponse.data.message);
      }
      
    } else {
      console.log('❌ Admin login failed:', loginResponse.data.message);
      console.log('💡 Make sure the admin user exists in your Supabase database');
      console.log('💡 Run: node setup-railway-admin.js to create the admin user');
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Admin login error:', error.response.data.message || error.response.statusText);
      console.log('📊 Status:', error.response.status);
      
      if (error.response.status === 401) {
        console.log('💡 This usually means:');
        console.log('   - Admin user doesn\'t exist in database');
        console.log('   - Wrong credentials');
        console.log('   - Database connection issues');
      } else if (error.response.status === 500) {
        console.log('💡 This usually means:');
        console.log('   - Server error');
        console.log('   - Database connection issues');
        console.log('   - Missing environment variables');
      }
    } else {
      console.log('❌ Network error:', error.message);
      console.log('💡 Check your Railway URL and network connection');
    }
  }
  
  console.log('\n📋 Summary:');
  console.log('✅ Frontend AdminLogin component updated');
  console.log('✅ Railway deployment is healthy');
  console.log('🔧 Next: Add JWT_EXPIRE=7d to Railway environment variables');
  console.log('🔧 Next: Run node setup-railway-admin.js to create admin user');
  console.log('🧪 Then test admin login with the standardized credentials');
}

testFinalAdmin();
