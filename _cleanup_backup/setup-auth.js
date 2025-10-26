const bcrypt = require('bcrypt');
const databaseService = require('./services/databaseService');

// Create admin user function
async function createAdminUser() {
  try {
    console.log('🔧 Setting up admin user...');
    
    // Check if admin already exists
    const existingAdmin = await databaseService.getUserByEmail('admin@smartalgos.com');
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return existingAdmin;
    }

    // Create admin user
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash('Admin123!@#', saltRounds);
    
    const adminData = {
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@smartalgos.com',
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

    const admin = await databaseService.createUser(adminData);
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@smartalgos.com');
    console.log('🔑 Password: Admin123!@#');
    console.log('⚠️  Please change the password after first login!');
    
    return admin;
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  }
}

// Create test user function
async function createTestUser() {
  try {
    console.log('🔧 Setting up test user...');
    
    // Check if test user already exists
    const existingUser = await databaseService.getUserByEmail('test@smartalgos.com');
    if (existingUser) {
      console.log('✅ Test user already exists');
      return existingUser;
    }

    // Create test user
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash('Test123!@#', saltRounds);
    
    const userData = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@smartalgos.com',
      password_hash: passwordHash,
      phone: '+254700000001',
      country: 'Kenya',
      trading_experience: 'beginner',
      is_active: true,
      is_email_verified: true,
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const user = await databaseService.createUser(userData);
    console.log('✅ Test user created successfully');
    console.log('📧 Email: test@smartalgos.com');
    console.log('🔑 Password: Test123!@#');
    
    return user;
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    throw error;
  }
}

// Main setup function
async function setupAuth() {
  try {
    console.log('🚀 Starting authentication setup...');
    
    // Test database connection
    console.log('🔍 Testing database connection...');
    await databaseService.getUserByEmail('test@example.com');
    console.log('✅ Database connection successful');
    
    // Create admin user
    await createAdminUser();
    
    // Create test user
    await createTestUser();
    
    console.log('\n🎉 Authentication setup completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ Admin Login:                            │');
    console.log('│ Email: admin@smartalgos.com             │');
    console.log('│ Password: Admin123!@#                   │');
    console.log('├─────────────────────────────────────────┤');
    console.log('│ User Login:                             │');
    console.log('│ Email: test@smartalgos.com              │');
    console.log('│ Password: Test123!@#                    │');
    console.log('└─────────────────────────────────────────┘');
    console.log('\n⚠️  Remember to change these passwords in production!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure your .env file is properly configured');
    console.log('2. Check your Supabase connection settings');
    console.log('3. Ensure the database tables exist');
    console.log('4. Run: npm install to install dependencies');
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupAuth();
}

module.exports = { setupAuth, createAdminUser, createTestUser };
