// This script creates accounts directly using Supabase MCP
// We'll create both user and admin accounts that can be used for login

const bcrypt = require('bcryptjs');

async function createTestAccounts() {
  console.log('🚀 Creating test accounts using Supabase...\n');

  try {
    // Generate password hashes
    const userPassword = 'TestUser123!';
    const adminPassword = 'AdminTest123!';
    
    const userHash = await bcrypt.hash(userPassword, 12);
    const adminHash = await bcrypt.hash(adminPassword, 12);
    
    console.log('Generated password hashes:');
    console.log('User hash:', userHash);
    console.log('Admin hash:', adminHash);
    console.log('');
    
    // Test password verification
    const userTest = await bcrypt.compare(userPassword, userHash);
    const adminTest = await bcrypt.compare(adminPassword, adminHash);
    
    console.log('Password verification tests:');
    console.log('User password valid:', userTest);
    console.log('Admin password valid:', adminTest);
    console.log('');
    
    console.log('✅ Test accounts ready to be created!');
    console.log('');
    console.log('📋 Account Details:');
    console.log('👤 User Account:');
    console.log('   Email: testuser@smartalgos.com');
    console.log('   Password: TestUser123!');
    console.log('   Role: user');
    console.log('');
    console.log('👨‍💼 Admin Account:');
    console.log('   Email: admintest@smartalgos.com');
    console.log('   Password: AdminTest123!');
    console.log('   Role: admin');
    console.log('   Admin Code: ADMIN_SMART_ALGOS_2024');
    console.log('');
    console.log('🔧 Use these SQL commands to create the accounts:');
    console.log('');
    console.log('-- User Account');
    console.log(`INSERT INTO users (first_name, last_name, email, password_hash, phone, country, trading_experience, is_active, is_email_verified, role, created_at, updated_at) VALUES ('Test', 'User', 'testuser@smartalgos.com', '${userHash}', '+1234567890', 'United States', 'beginner', true, false, 'user', NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;`);
    console.log('');
    console.log('-- Admin Account');
    console.log(`INSERT INTO users (first_name, last_name, email, password_hash, phone, country, trading_experience, is_active, is_email_verified, role, created_at, updated_at) VALUES ('Admin', 'Test', 'admintest@smartalgos.com', '${adminHash}', '+1234567891', 'United States', 'expert', true, true, 'admin', NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;`);
    
  } catch (error) {
    console.error('❌ Error creating accounts:', error.message);
  }
}

createTestAccounts();
