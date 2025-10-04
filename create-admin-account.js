const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminAccount() {
  try {
    console.log('🔧 Creating admin account...');
    
    const email = 'admin@smartalgos.com';
    const password = 'Admin123!';
    
    // Step 1: Create user in Supabase Auth
    console.log('1️⃣ Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin'
        }
      }
    });
    
    if (authError) {
      console.error('❌ Auth signup failed:', authError.message);
      
      // If user already exists, try to sign in
      if (authError.message.includes('already registered')) {
        console.log('👤 User already exists, testing login...');
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });
        
        if (loginError) {
          console.error('❌ Login failed:', loginError.message);
          return;
        }
        
        console.log('✅ Login successful with existing account');
        console.log('User ID:', loginData.user.id);
        return;
      }
      return;
    }
    
    if (!authData.user) {
      console.error('❌ No user data returned from signup');
      return;
    }
    
    console.log('✅ User created in Supabase Auth');
    console.log('User ID:', authData.user.id);
    console.log('Email confirmed:', authData.user.email_confirmed_at ? 'Yes' : 'No');
    
    // Step 2: Create user profile in users_accounts table
    console.log('2️⃣ Creating user profile in users_accounts...');
    
    // Hash password for our database
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const { data: profileData, error: profileError } = await supabase
      .from('users_accounts')
      .insert({
        id: authData.user.id,
        email: email,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        password_hash: passwordHash,
        is_active: true,
        is_email_verified: true, // Auto-verify for admin
        subscription_type: 'institutional',
        subscription_status: 'active',
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        preferences: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message);
      return;
    }
    
    console.log('✅ User profile created successfully');
    console.log('Profile ID:', profileData.id);
    console.log('Role:', profileData.role);
    
    // Step 3: Test login
    console.log('3️⃣ Testing admin login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (loginError) {
      console.error('❌ Login test failed:', loginError.message);
    } else {
      console.log('✅ Login test successful!');
      console.log('Session token available:', !!loginData.session?.access_token);
    }
    
    console.log('\n🎉 Admin account created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👑 Role: admin');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdminAccount();
