const databaseService = require('./services/databaseService');

async function debugUserFetch() {
  try {
    console.log('🔍 Debugging user fetch...\n');
    
    const user = await databaseService.getUserByEmail('softwarebazaar.ke@gmail.com');
    
    console.log('User found:', !!user);
    if (user) {
      console.log('User data:');
      console.log('- Email:', user.email);
      console.log('- Role:', user.role);
      console.log('- Is Active:', user.is_active);
      console.log('- Password Hash Length:', user.password_hash?.length);
      console.log('- Full user object keys:', Object.keys(user));
    } else {
      console.log('No user found');
    }
    
  } catch (error) {
    console.error('Error fetching user:', error.message);
  }
}

debugUserFetch();

