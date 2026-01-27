const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testDirectRegistration() {
  try {
    // Initialize Supabase
    const supabaseUrl = process.env.SUPABASE_URL || 'https://ncikobfahncdgwvkfivz.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jaWtvYmZhaG5jZGd3dmtmaXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MDY2NDQsImV4cCI6MjA3Mjk4MjY0NH0.TKIwIpXr9c92Xi0AgoioeC2db3tonPtM1wHHMo5-7mk';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('🧪 Testing direct user registration...\n');

    // Test 1: Create a regular user
    console.log('1. Creating a regular user...');
    const passwordHash = await bcrypt.hash('TestUser123!', 12);
    
    const userData = {
      first_name: 'Test',
      last_name: 'User',
      email: 'testuser@example.com',
      password_hash: passwordHash,
      phone: '+1234567890',
      country: 'United States',
      trading_experience: 'beginner',
      is_active: true,
      is_email_verified: false,
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (userError) {
      if (userError.code === '23505') {
        console.log('ℹ️  User already exists, trying to fetch...');
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('email', userData.email)
          .single();
        console.log('✅ Found existing user:', existingUser.email);
      } else {
        console.error('❌ User creation failed:', userError.message);
      }
    } else {
      console.log('✅ User created successfully:', user.email);
    }

    // Test 2: Create an admin user
    console.log('\n2. Creating an admin user...');
    const adminPasswordHash = await bcrypt.hash('AdminTest123!', 12);
    
    const adminData = {
      first_name: 'Admin',
      last_name: 'Test',
      email: 'admintest@example.com',
      password_hash: adminPasswordHash,
      phone: '+1234567891',
      country: 'United States',
      trading_experience: 'expert',
      is_active: true,
      is_email_verified: true,
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: admin, error: adminError } = await supabase
      .from('users')
      .insert([adminData])
      .select()
      .single();

    if (adminError) {
      if (adminError.code === '23505') {
        console.log('ℹ️  Admin already exists, trying to fetch...');
        const { data: existingAdmin } = await supabase
          .from('users')
          .select('*')
          .eq('email', adminData.email)
          .single();
        console.log('✅ Found existing admin:', existingAdmin.email);
      } else {
        console.error('❌ Admin creation failed:', adminError.message);
      }
    } else {
      console.log('✅ Admin created successfully:', admin.email);
    }

    // Test 3: Test login credentials
    console.log('\n3. Testing password verification...');
    
    const { data: testUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'testuser@example.com')
      .single();

    if (testUser) {
      const isValidPassword = await bcrypt.compare('TestUser123!', testUser.password_hash);
      console.log('✅ User password verification:', isValidPassword ? 'PASSED' : 'FAILED');
    }

    const { data: testAdmin } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admintest@example.com')
      .single();

    if (testAdmin) {
      const isValidAdminPassword = await bcrypt.compare('AdminTest123!', testAdmin.password_hash);
      console.log('✅ Admin password verification:', isValidAdminPassword ? 'PASSED' : 'FAILED');
    }

    console.log('\n🎉 Direct registration test completed!');
    console.log('\n📋 Test Accounts Created:');
    console.log('   User: testuser@example.com / TestUser123!');
    console.log('   Admin: admintest@example.com / AdminTest123!');
    console.log('\n💡 You can now try logging in with these credentials!');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDirectRegistration();
