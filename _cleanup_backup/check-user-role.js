const mockAuthStore = require('./services/mockAuthStore');

async function checkUserRole() {
  console.log('🔍 Checking user role...\n');

  try {
    // Check the specific user from the console logs
    const user = await mockAuthStore.getUserByEmail('wanyagajohn73@gmail.com');
    
    if (user) {
      console.log('User found:');
      console.log('  Email:', user.email);
      console.log('  Role:', user.role);
      console.log('  Active:', user.is_active);
      console.log('  Verified:', user.is_email_verified);
    } else {
      console.log('❌ User not found in mock store');
    }

    // Check if this user should be admin or member
    console.log('\nAll users with their roles:');
    mockAuthStore.users.forEach((u, index) => {
      console.log(`  ${index + 1}. ${u.email} - Role: ${u.role}`);
    });

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkUserRole();
