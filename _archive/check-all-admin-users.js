const mockAuthStore = require('./services/mockAuthStore');

async function checkAllAdminUsers() {
  console.log('🔍 Checking all admin users...\n');

  try {
    // Find all users with admin role
    const adminUsers = mockAuthStore.users.filter(user => user.role === 'admin');
    
    console.log(`Found ${adminUsers.length} admin users:`);
    adminUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (ID: ${user.id})`);
      console.log(`     - Role: ${user.role}`);
      console.log(`     - Active: ${user.is_active}`);
      console.log(`     - Verified: ${user.is_email_verified}`);
    });

    // Check if wanyagajohn73@gmail.com should be admin
    const targetUser = await mockAuthStore.getUserByEmail('wanyagajohn73@gmail.com');
    console.log('\nTarget user (wanyagajohn73@gmail.com):');
    console.log('  Email:', targetUser?.email);
    console.log('  Role:', targetUser?.role);
    console.log('  Should be admin?', targetUser?.email === 'wanyagajohn73@gmail.com' && targetUser?.role === 'admin');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkAllAdminUsers();
