#!/usr/bin/env node
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function makeUserAdmin(email) {
  console.log(`🔧 Making user ${email} an admin...\n`);

  try {
    // Find the user by email
    const { data: users, error: fetchError } = await supabase
      .from('users_accounts')
      .select('*')
      .eq('email', email);

    if (fetchError) {
      console.error('❌ Error fetching user:', fetchError.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log(`⚠️  User with email ${email} not found`);
      console.log('\nAvailable users:');
      
      const { data: allUsers } = await supabase
        .from('users_accounts')
        .select('email, first_name, last_name, role');
      
      allUsers?.forEach(u => {
        console.log(`   - ${u.email} (${u.first_name} ${u.last_name}) [${u.role || 'no role'}]`);
      });
      return;
    }

    const user = users[0];
    console.log('📋 Current user details:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.first_name} ${user.last_name}`);
    console.log(`   Current Role: ${user.role || 'NOT SET'}`);
    console.log(`   ID: ${user.id}\n`);

    if (user.role === 'admin') {
      console.log('✅ User is already an admin!');
      return;
    }

    // Update user role to admin
    const { data, error: updateError } = await supabase
      .from('users_accounts')
      .update({ 
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select();

    if (updateError) {
      console.error('❌ Error updating user role:', updateError.message);
      return;
    }

    console.log('✅ Successfully made user an admin!');
    console.log('\n📋 Updated user details:');
    console.log(`   Email: ${data[0].email}`);
    console.log(`   Name: ${data[0].first_name} ${data[0].last_name}`);
    console.log(`   New Role: ${data[0].role} ✅`);
    console.log(`   Updated: ${new Date(data[0].updated_at).toLocaleString()}`);
    
    console.log('\n🎉 User is now an admin!');
    console.log('💡 They can now:');
    console.log('   - Create and edit EAs');
    console.log('   - Access admin dashboard');
    console.log('   - Manage users');
    console.log('   - View all subscriptions');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('❌ Usage: node make-user-admin.js <user_email>');
  console.log('\nExample: node make-user-admin.js admin@smartalgos.com');
  process.exit(1);
}

makeUserAdmin(email);

