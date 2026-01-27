#!/usr/bin/env node
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdminRole() {
  console.log('🔍 Checking Admin Role in Database...\n');

  try {
    // Get all users from users_accounts
    const { data: users, error } = await supabase
      .from('users_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching users:', error.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('⚠️  No users found in database');
      return;
    }

    console.log(`Found ${users.length} users:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. User Details:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Role: ${user.role || 'NOT SET'} ${user.role === 'admin' ? '✅ ADMIN' : '⚠️ NOT ADMIN'}`);
      console.log(`   Active: ${user.is_active ? '✅' : '❌'}`);
      console.log(`   Email Verified: ${user.is_email_verified ? '✅' : '❌'}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log('');
    });

    // Check if any admin exists
    const admins = users.filter(u => u.role === 'admin');
    
    if (admins.length === 0) {
      console.log('\n⚠️  WARNING: No admin users found!');
      console.log('\n📝 To make a user an admin, run:');
      console.log('   node make-user-admin.js <user_email>');
    } else {
      console.log(`\n✅ Found ${admins.length} admin user(s):`);
      admins.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.first_name} ${admin.last_name})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAdminRole();

