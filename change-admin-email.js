#!/usr/bin/env node
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function changeAdminEmail(oldEmail, newEmail) {
  console.log(`🔧 Changing admin from ${oldEmail} to ${newEmail}...\n`);

  try {
    // Step 1: Remove admin role from old email
    console.log(`1️⃣ Removing admin role from ${oldEmail}...`);
    const { data: oldUser, error: fetchOldError } = await supabase
      .from('users_accounts')
      .select('*')
      .eq('email', oldEmail)
      .single();

    if (fetchOldError || !oldUser) {
      console.log(`⚠️  Old admin user ${oldEmail} not found (might already be changed)`);
    } else {
      const { error: updateOldError } = await supabase
        .from('users_accounts')
        .update({ 
          role: 'user', // Change to regular user
          updated_at: new Date().toISOString()
        })
        .eq('id', oldUser.id);

      if (updateOldError) {
        console.error('❌ Error removing admin role:', updateOldError.message);
      } else {
        console.log(`✅ Removed admin role from ${oldEmail}`);
      }
    }

    // Step 2: Make new email an admin
    console.log(`\n2️⃣ Making ${newEmail} an admin...`);
    const { data: newUser, error: fetchNewError } = await supabase
      .from('users_accounts')
      .select('*')
      .eq('email', newEmail);

    if (fetchNewError) {
      console.error('❌ Error fetching user:', fetchNewError.message);
      console.log('\n💡 Use the SQL script below to run directly in Supabase SQL Editor');
      return;
    }

    if (!newUser || newUser.length === 0) {
      console.log(`⚠️  User ${newEmail} not found.`);
      console.log('\n💡 You need to create this user first or use SQL script');
      console.log('\n📝 SQL to run in Supabase SQL Editor:');
      console.log(`
-- First, remove admin from old email
UPDATE users_accounts 
SET role = 'user', updated_at = NOW()
WHERE email = '${oldEmail}';

-- Make new email admin (if user exists)
UPDATE users_accounts 
SET role = 'admin', is_active = true, is_email_verified = true, updated_at = NOW()
WHERE email = '${newEmail}';

-- OR create new admin user if doesn't exist
INSERT INTO users_accounts (
  email, first_name, last_name, role, is_active, is_email_verified,
  subscription_type, subscription_status, subscription_start_date,
  created_at, updated_at
) VALUES (
  '${newEmail}', 'Admin', 'User', 'admin', true, true,
  'institutional', 'active', NOW(),
  NOW(), NOW()
) ON CONFLICT (email) DO UPDATE
SET role = 'admin', is_active = true, is_email_verified = true, updated_at = NOW();
      `);
      return;
    } else {
      const user = newUser[0];
      // Update existing user to admin
      const { data: updatedUser, error: updateNewError } = await supabase
        .from('users_accounts')
        .update({ 
          role: 'admin',
          is_active: true,
          is_email_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', newUser.id)
        .select()
        .single();

      if (updateNewError) {
        console.error('❌ Error updating user role:', updateNewError.message);
        return;
      }

      console.log(`✅ Made ${newEmail} an admin!`);
      console.log(`🆔 User ID: ${updatedUser.id}`);
    }

    // Step 3: Verify the change
    console.log(`\n3️⃣ Verifying admin change...`);
    const { data: verifyAdmin, error: verifyError } = await supabase
      .from('users_accounts')
      .select('email, role, is_active')
      .eq('role', 'admin');

    if (verifyError) {
      console.error('❌ Error verifying:', verifyError.message);
    } else {
      console.log('\n📋 Current admins:');
      verifyAdmin.forEach(admin => {
        console.log(`   ✅ ${admin.email} - ${admin.role} (Active: ${admin.is_active})`);
      });
    }

    console.log('\n🎉 Admin email change complete!');
    console.log(`\n📧 New admin email: ${newEmail}`);
    console.log(`\n💡 Don't forget to update Railway variables:`);
    console.log(`   ADMIN_EMAIL=${newEmail}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
const oldEmail = 'johnwanyaga37@gmail.com';
const newEmail = 'softwarebazaar.ke@gmail.com';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

changeAdminEmail(oldEmail, newEmail);

