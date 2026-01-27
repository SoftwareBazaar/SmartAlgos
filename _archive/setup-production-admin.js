const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

// Production admin setup script for Railway deployment
async function setupProductionAdmin() {
  try {
    console.log('🚀 Setting up production admin for Railway...\n');
    
    // Check if we have Supabase credentials
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('⚠️  Supabase credentials not found in environment variables');
      console.log('📋 Manual setup required:');
      console.log('1. Go to your Railway dashboard');
      console.log('2. Add environment variables:');
      console.log('   - SUPABASE_URL: your-supabase-project-url');
      console.log('   - SUPABASE_SERVICE_ROLE_KEY: your-service-role-key');
      console.log('3. Redeploy the application');
      console.log('4. Run this script again\n');
      
      // Show admin credentials to create manually
      const adminEmail = 'admin@smartalgos.com';
      const adminPassword = 'Admin123!@#';
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      
      console.log('🔐 Admin credentials to create manually:');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
      console.log('🔐 Password Hash:', passwordHash);
      console.log('👤 Role: admin');
      console.log('✅ Active: true');
      console.log('📧 Email Verified: true\n');
      
      console.log('📝 SQL to run in Supabase SQL Editor:');
      console.log(`
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '${adminEmail}',
  '${passwordHash}',
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"first_name": "Admin", "last_name": "User", "role": "admin"}',
  false,
  'admin'
);

-- Also insert into your custom users table if you have one
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  is_email_verified,
  password_hash,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '${adminEmail}',
  'Admin',
  'User',
  'admin',
  true,
  true,
  '${passwordHash}',
  NOW(),
  NOW()
);
      `);
      
      return;
    }
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Admin credentials
    const adminEmail = 'admin@smartalgos.com';
    const adminPassword = 'Admin123!@#';
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    
    console.log('✅ Supabase credentials found');
    console.log('🔐 Creating admin user...');
    
    // Create admin user in Supabase
    const { data: user, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
      }
    });
    
    if (error) {
      console.error('❌ Error creating admin user:', error.message);
      return;
    }
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('🆔 User ID:', user.user.id);
    
    // Update user role to admin in your custom users table
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        role: 'admin',
        is_active: true,
        is_email_verified: true
      })
      .eq('id', user.user.id);
    
    if (updateError) {
      console.log('⚠️  Note: Could not update user role in custom table:', updateError.message);
      console.log('📝 You may need to manually update the user role in your database');
    } else {
      console.log('✅ User role updated to admin');
    }
    
    console.log('\n🎉 Production admin setup complete!');
    console.log('🔗 You can now login at: /auth/admin/login');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the setup
setupProductionAdmin();
