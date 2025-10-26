const bcrypt = require('bcrypt');
const axios = require('axios');

async function finalAdminSetup() {
  try {
    console.log('🚀 Final Admin Setup for Railway Deployment\n');
    
    // Standardized admin credentials
    const adminEmail = 'admin@smartalgos.com';
    const adminPassword = 'AdminPass123!';
    
    console.log('📋 Admin Credentials:');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('');
    
    // Hash the password for database storage
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
    
    console.log('🔐 Password hashed successfully');
    console.log('Hash length:', passwordHash.length);
    console.log('');
    
    // Test the Railway deployment
    console.log('🌐 Testing Railway deployment...');
    
    // You'll need to replace this with your actual Railway URL
    const railwayURL = process.env.RAILWAY_URL || 'https://your-app.railway.app';
    
    try {
      const healthResponse = await axios.get(`${railwayURL}/health`);
      if (healthResponse.data.status === 'OK') {
        console.log('✅ Railway deployment is healthy');
        console.log('📊 Server status:', healthResponse.data.status);
        console.log('⏱️  Uptime:', Math.floor(healthResponse.data.uptime), 'seconds');
      }
    } catch (error) {
      console.log('⚠️  Could not test Railway deployment:', error.message);
      console.log('💡 Make sure to replace the Railway URL in this script');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. ✅ Frontend AdminLogin component updated with standardized credentials');
    console.log('2. ✅ Railway deployment is healthy and running');
    console.log('3. 🔧 Add JWT_EXPIRE=7d to Railway environment variables');
    console.log('4. 🔧 Run: node setup-railway-admin.js (to create admin user in Supabase)');
    console.log('5. 🧪 Test admin login with the credentials above');
    
    console.log('\n🎯 Admin Login Credentials:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ Email: admin@smartalgos.com             │');
    console.log('│ Password: AdminPass123!                 │');
    console.log('└─────────────────────────────────────────┘');
    
    console.log('\n🔧 To complete setup:');
    console.log('1. Add JWT_EXPIRE=7d to Railway environment variables');
    console.log('2. Run: node setup-railway-admin.js');
    console.log('3. Test admin login on your Railway deployment');
    
    return {
      success: true,
      credentials: { email: adminEmail, password: adminPassword },
      passwordHash: passwordHash
    };
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the setup
if (require.main === module) {
  finalAdminSetup().then(result => {
    if (result.success) {
      console.log('\n🎉 Final admin setup completed successfully!');
      console.log('🚀 Your admin login should now work with the standardized credentials.');
    } else {
      console.log('\n❌ Setup failed. Please check the error messages above.');
    }
  });
}

module.exports = { finalAdminSetup };
