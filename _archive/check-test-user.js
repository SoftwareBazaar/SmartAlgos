const mockAuthStore = require('./services/mockAuthStore');
const { mockDataStore } = require('./services/mockAuthStore');

async function checkTestUser() {
  console.log('🔍 Checking test user in mock store...\n');

  try {
    // Check if test user exists
    const testUser = await mockAuthStore.getUserByEmail('test@smartalgos.com');
    const demoUser = await mockAuthStore.getUserByEmail('demo@smartalgos.local');
    
    console.log('Test users found:');
    console.log('  test@smartalgos.com:', testUser ? '✅' : '❌');
    console.log('  demo@smartalgos.local:', demoUser ? '✅' : '❌');
    
    if (testUser) {
      console.log('\nTest user details:');
      console.log('  ID:', testUser.id);
      console.log('  Email:', testUser.email);
      console.log('  Role:', testUser.role);
      console.log('  Active:', testUser.is_active);
    }
    
    if (demoUser) {
      console.log('\nDemo user details:');
      console.log('  ID:', demoUser.id);
      console.log('  Email:', demoUser.email);
      console.log('  Role:', demoUser.role);
      console.log('  Active:', demoUser.is_active);
    }

    // List all users
    console.log('\nAll users in mock store:');
    mockAuthStore.users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (ID: ${user.id}, Role: ${user.role})`);
    });

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkTestUser();
