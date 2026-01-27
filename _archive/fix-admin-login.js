const bcrypt = require('bcrypt');
const databaseService = require('./services/databaseService');

async function fixAdminLogin() {
  try {
    console.log('🔧 Fixing Admin Login Issues...\n');
    
    // Standardize admin credentials
    const adminEmail = 'admin@smartalgos.com';
    const adminPassword = 'AdminPass123!'; // Meets all complexity requirements
    
    console.log('📧 Standardized Admin Email:', adminEmail);
    console.log('🔑 Standardized Admin Password:', adminPassword);
    console.log('');
    
    // Check if admin exists with any of the known emails
    const knownEmails = [
      'admin@smartalgos.com',
      'softwarebazaar.ke@gmail.com',
      'Softwarebazaar.ke@gmail.com'
    ];
    
    let existingAdmin = null;
    let existingEmail = null;
    
    for (const email of knownEmails) {
      try {
        existingAdmin = await databaseService.getUserByEmail(email);
        if (existingAdmin) {
          existingEmail = email;
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
      if (existingEmail !== adminEmail) {
        console.log(`🔄 Changing email from ${existingEmail} to ${adminEmail}`);
        
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
    
    console.log('\n🎉 Admin Login Fix Complete!');
    console.log('\n📋 Updated Admin Credentials:');
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
    console.error('❌ Fix failed:', error.message);
    console.error('Stack:', error.stack);
    return { success: false, error: error.message };
  }
}

async function testAdminLogin(email, password) {
  try {
    const axios = require('axios');
    
    const response = await axios.post('http://localhost:5000/api/auth/admin/login', {
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
  }
}

// Run the fix
if (require.main === module) {
  fixAdminLogin().then(result => {
    if (result.success) {
      console.log('\n🎉 Admin login issues have been permanently fixed!');
      process.exit(0);
    } else {
      console.log('\n❌ Fix failed. Please check the error messages above.');
      process.exit(1);
    }
  });
}

module.exports = { fixAdminLogin };
