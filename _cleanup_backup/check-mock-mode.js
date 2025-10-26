const databaseService = require('./services/databaseService');

console.log('🔍 Checking Mock Mode...\n');

console.log('Database Service Mock Mode:', databaseService.mockMode);
console.log('Environment Variables:');
console.log('  MOCK_AUTH:', process.env.MOCK_AUTH);
console.log('  SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
console.log('  SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');
console.log('  SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set');

// Check if the keys look like placeholders
const isPlaceholderKey = (value = '') => {
  if (!value) return true;
  const normalized = value.toLowerCase();
  return ['your-', 'example', 'changeme', 'replace', 'dummy'].some((token) => normalized.includes(token));
};

console.log('\nPlaceholder Check:');
console.log('  SUPABASE_SERVICE_ROLE_KEY is placeholder:', isPlaceholderKey(process.env.SUPABASE_SERVICE_ROLE_KEY));
console.log('  SUPABASE_ANON_KEY is placeholder:', isPlaceholderKey(process.env.SUPABASE_ANON_KEY));

console.log('\n✅ Check complete');

