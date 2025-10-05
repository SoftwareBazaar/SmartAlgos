const mockAuthStore = require('./services/mockAuthStore');

console.log('🔍 Checking available admin accounts...\n');

// Get instance of mock auth store
const store = mockAuthStore;

// Get all admin users
const adminUsers = store.users.filter(user => user.role === 'admin');

console.log(`Found ${adminUsers.length} admin account(s):\n`);

adminUsers.forEach((user, index) => {
  console.log(`${index + 1}. Admin Account:`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Password: ${user.password}`);
  console.log(`   Name: ${user.first_name} ${user.last_name}`);
  console.log(`   Active: ${user.is_active}`);
  console.log(`   Email Verified: ${user.is_email_verified}`);
  console.log('');
});

// Also check default accounts
console.log('📋 Default accounts from mock store:');
const DEFAULT_ACCOUNTS = [
  {
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@smartalgos.com',
    password: 'Admin123!@#',
    role: 'admin',
    is_active: true,
    is_email_verified: true,
    enforcePassword: true,
    legacyEmails: ['admin@smartalgos.local']
  },
  {
    first_name: 'Software',
    last_name: 'Bazaar',
    email: 'Softwarebazaar.ke@gmail.com',
    password: '28103441Jw@',
    role: 'admin',
    is_active: true,
    is_email_verified: true,
    enforcePassword: true,
    subscription_type: 'institutional',
    subscription_status: 'active',
    subscription_start_date: new Date().toISOString(),
    subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  }
];

DEFAULT_ACCOUNTS.forEach((user, index) => {
  console.log(`${index + 1}. Default Admin Account:`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Password: ${user.password}`);
  console.log(`   Name: ${user.first_name} ${user.last_name}`);
  console.log('');
});

console.log('✅ Use any of these credentials to login as admin');
