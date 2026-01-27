const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

// Create admin user directly in the users_accounts table
async function createAdminInDatabase() {
  try {
    console.log('🔧 Creating admin user in users_accounts table...\n');
    
    // Check environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Missing Supabase credentials');
      console.log('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
      return;
    }
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Admin credentials
    const adminEmail = 'admin@smartalgos.com';
    const adminPassword = 'Admin123!@#';
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('🔐 Password Hash:', passwordHash);
    
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users_accounts')
      .select('*')
      .eq('email', adminEmail)
      .single();
    
    if (existingUser && !checkError) {
      console.log('⚠️  User already exists, updating password...');
      
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('users_accounts')
        .update({
          password_hash: passwordHash,
          role: 'admin',
          is_active: true,
          is_email_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('email', adminEmail)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Error updating user:', updateError.message);
        return;
      }
      
      console.log('✅ User updated successfully!');
      console.log('🆔 User ID:', updatedUser.id);
      
    } else {
      console.log('➕ Creating new admin user...');
      
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users_accounts')
        .insert({
          email: adminEmail,
          password_hash: passwordHash,
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          is_active: true,
          is_email_verified: true,
          subscription_type: 'institutional',
          subscription_status: 'active',
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creating user:', createError.message);
        return;
      }
      
      console.log('✅ User created successfully!');
      console.log('🆔 User ID:', newUser.id);
    }
    
    console.log('\n🎉 Admin user setup complete!');
    console.log('🔗 You can now login at: /auth/admin/login');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the setup
createAdminInDatabase();
