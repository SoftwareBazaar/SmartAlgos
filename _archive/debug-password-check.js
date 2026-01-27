const bcrypt = require('bcryptjs');
const databaseService = require('./services/databaseService');

async function debugPasswordCheck() {
  try {
    console.log('🔐 Debugging password check...\n');
    
    const user = await databaseService.getUserByEmail('softwarebazaar.ke@gmail.com');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('Role:', user.role);
    console.log('Password hash:', user.password_hash);
    
    const testPassword = 'AdminPass123!';
    console.log('\nTesting password:', testPassword);
    
    const isMatch = await bcrypt.compare(testPassword, user.password_hash);
    console.log('Password match:', isMatch);
    
    if (isMatch) {
      console.log('✅ Password is correct!');
      console.log('✅ User role is:', user.role);
      console.log('✅ User is active:', user.is_active);
      
      if (user.role === 'admin') {
        console.log('✅ User has admin privileges');
      } else {
        console.log('❌ User does not have admin privileges');
      }
    } else {
      console.log('❌ Password is incorrect');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugPasswordCheck();

