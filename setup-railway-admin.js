const bcrypt = require('bcrypt');
const databaseService = require('./services/databaseService');

async function setupRailwayAdmin() {
  try {
    console.log('🚀 Setting up Admin for Railway deployment...\n');
    
    // Check if we're using real database or mock
    const isMockAuth = process.env.MOCK_AUTH === 'true';
    console.log('🔍 Auth Mode:', isMockAuth ? 'MOCK' : 'DATABASE');
    
    if (isMockAuth) {
      console.log('⚠️  Warning: Server is running in MOCK_AUTH mode');
      console.log('💡 To use real database auth, set MOCK_AUTH=false in Railway');
      console.log('📧 Mock Admin Email: Softwarebazaar.ke@gmail.com');
      console.log('🔑 Mock Admin Password: 28103441Jw@');
      return;
    }
    
    // Standardized admin credentials
    const adminEmail = 'admin@smartalgos.com';
    const adminPassword = 'AdminPass123!';
    
    console.log('📧 Admin Email:', adminEmail);
    console.log('🔑 Admin Password:', adminPassword);
    console.log('');
    
    // Test database connection
    console.log('🔍 Testing database connection...');
    try {
      await databaseService.getUserByEmail('test@example.com');
      console.log('✅ Database connection successful');
    } catch (error) {
      console.log('⚠️  Database connection test failed (this is normal for non-existent users)');
    }
    
    // Check if admin already exists
    console.log('🔍 Checking for existing admin...');
    let existingAdmin = null;
    
    // Check multiple possible admin emails
    const possibleEmails = [
      'admin@smartalgos.com',
      'softwarebazaar.ke@gmail.com',
      'Softwarebazaar.ke@gmail.com'
    ];
    
    for (const email of possibleEmails) {
      try {
        existingAdmin = await databaseService.getUserByEmail(email);
        if (existingAdmin) {
          console.log(`✅ Found existing admin with email: ${email}`);
          break;
        }
      } catch (error) {
        // Email doesn't exist, continue
      }
    }
    
    if (existingAdmin) {
      console.log('🔄 Updating existing admin account...');
      
      // Update to standardized credentials
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
      
      const updates = {
        email: adminEmail,
        password_hash: passwordHash,
        role: 'admin',
        is_active: true,
        is_email_verified: true,
        updated_at: new Date().toISOString()
      };
      
      // If the email changed, we need to delete the old record and create new one
      if (existingAdmin.email !== adminEmail) {
        console.log(`🔄 Changing email from ${existingAdmin.email} to ${adminEmail}`);
        
        // Delete old record
        await databaseService.deleteUser(existingAdmin.id);
        
        // Create new record with standardized email
        const adminData = {
          ...existingAdmin,
          email: adminEmail,
          password_hash: passwordHash,
          role: 'admin',
          is_active: true,
          is_email_verified: true,
          updated_at: new Date().toISOString()
        };
        delete adminData.id; // Remove old ID so new one is generated
        
        existingAdmin = await databaseService.createUser(adminData);
      } else {
        // Just update the existing record
        existingAdmin = await databaseService.updateUser(existingAdmin.id, updates);
      }
      
      console.log('✅ Admin account updated successfully');
    } else {
      console.log('🆕 Creating new admin account...');
      
      // Create new admin user
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
      
      const adminData = {
        first_name: 'Admin',
        last_name: 'User',
        email: adminEmail,
        password_hash: passwordHash,
        phone: '+254700000000',
        country: 'Kenya',
        trading_experience: 'expert',
        is_active: true,
        is_email_verified: true,
        role: 'admin',
        subscription_type: 'premium',
        subscription_status: 'active',
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        preferences: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      existingAdmin = await databaseService.createUser(adminData);
      console.log('✅ Admin account created successfully');
    }
    
    console.log('\n🎉 Railway Admin Setup Complete!');
    console.log('\n📋 Admin Credentials:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ Email: admin@smartalgos.com             │');
    console.log('│ Password: AdminPass123!                 │');
    console.log('│ Role: admin                             │');
    console.log('│ Status: Active                          │');
    console.log('└─────────────────────────────────────────┘');
    
    // Test the login
    console.log('\n🧪 Testing admin login...');
    await testAdminLogin(adminEmail, adminPassword);
    
    return { success: true, admin: existingAdmin };
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('Stack:', error.stack);
    return { success: false, error: error.message };
  }
}

async function testAdminLogin(email, password) {
  try {
    const axios = require('axios');
    
    // Use the Railway URL or localhost
    const baseURL = process.env.RAILWAY_PUBLIC_DOMAIN 
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : 'http://localhost:5000';
    
    console.log('🌐 Testing against:', baseURL);
    
    const response = await axios.post(`${baseURL}/api/auth/admin/login`, {
      email,
      password
    });
    
    if (response.data.success) {
      console.log('✅ Admin login test successful!');
      console.log('👤 User:', response.data.user.first_name, response.data.user.last_name);
      console.log('🔑 Token received:', response.data.token ? 'Yes' : 'No');
    } else {
      console.log('❌ Admin login test failed:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Admin login test error:', error.response?.data?.message || error.message);
    console.log('💡 This is normal if the server is not running locally');
  }
}

// Run the setup
if (require.main === module) {
  setupRailwayAdmin().then(result => {
    if (result.success) {
      console.log('\n🎉 Railway admin setup completed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Setup failed. Please check the error messages above.');
      process.exit(1);
    }
  });
}

module.exports = { setupRailwayAdmin };
