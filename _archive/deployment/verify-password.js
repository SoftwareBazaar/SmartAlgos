const bcrypt = require('bcryptjs');
const mockUsers = require('./uploads/mock-users.json');

// Find the wanya user
const user = mockUsers.find(u => u.email === 'wanyagajohn73@gmail.com');

if (!user) {
  console.log('❌ User not found');
  process.exit(1);
}

console.log('Testing passwords for:', user.email);
console.log('Stored hash:', user.password_hash);

const passwordsToTest = ['demo123', 'test123', 'password', 'Test@123', 'Wanya@123'];

async function testPasswords() {
  for (const pwd of passwordsToTest) {
    const isValid = await bcrypt.compare(pwd, user.password_hash);
    console.log(`  ${pwd}: ${isValid ? '✅ VALID' : '❌ Invalid'}`);
    if (isValid) {
      console.log(`\n✅ FOUND! The correct password is: "${pwd}"`);
      return;
    }
  }
  console.log('\n❌ None of the tested passwords match');
  console.log('\n💡 Generating new hash for "demo123":');
  const newHash = await bcrypt.hash('demo123', 10);
  console.log('New hash:', newHash);
}

testPasswords();

