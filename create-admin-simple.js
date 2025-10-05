const bcrypt = require('bcrypt');

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...\n');
    
    // Standardized admin credentials
    const adminEmail = 'admin@smartalgos.com';
    const adminPassword = 'AdminPass123!';
    
    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
    
    console.log('✅ Admin credentials prepared:');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('🔐 Password Hash:', passwordHash);
    
    console.log('\n📋 Next steps:');
    console.log('1. Add this user to your Supabase database manually');
    console.log('2. Or run the setup script on Railway with proper environment variables');
    console.log('3. Test admin login with these credentials');
    
    return { email: adminEmail, password: adminPassword, hash: passwordHash };
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

createAdminUser();
