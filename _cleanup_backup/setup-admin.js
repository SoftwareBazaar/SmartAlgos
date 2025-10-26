const bcrypt = require('bcryptjs');
const databaseService = require('./services/databaseService');

async function setupAdminAccount() {
  try {
    console.log('🔧 Setting up admin account...');
    
    // Check if admin already exists
    const existingAdmin = await databaseService.getUserByEmail('softwarebazaar.ke@gmail.com');
    
    if (existingAdmin) {
      console.log('✅ Admin account already exists');
      return;
    }
    
    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash('16142412Jw', saltRounds);
    
    // Create admin user data
    const adminData = {
      first_name: 'Software',
      last_name: 'Bazaar',
      email: 'softwarebazaar.ke@gmail.com',
      password_hash: passwordHash,
      phone: '+254700000000',
      country: 'Kenya',
      trading_experience: 'expert',
      is_active: true,
      is_email_verified: true,
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Create the admin user
    const admin = await databaseService.createUser(adminData);
    
    console.log('✅ Admin account created successfully!');
    console.log('📧 Email: softwarebazaar.ke@gmail.com');
    console.log('🔑 Password: 16142412Jw');
    console.log('👤 Role: admin');
    console.log('🆔 User ID:', admin.id);
    
  } catch (error) {
    console.error('❌ Error setting up admin account:', error);
  }
}

// Run the setup
setupAdminAccount();
