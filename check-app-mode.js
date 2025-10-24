/**
 * Check App Mode - Mock vs Real Database
 */

const databaseService = require('./services/databaseService');

console.log('🔍 Checking App Mode...\n');

console.log('Environment Variables:');
console.log('  MOCK_AUTH:', process.env.MOCK_AUTH);
console.log('  SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
console.log('  SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');
console.log('  NODE_ENV:', process.env.NODE_ENV);

console.log('\nDatabase Service:');
console.log('  Mock Mode:', databaseService.mockMode);

console.log('\n🧪 Testing EA Data...');

// Test getting EAs
databaseService.getEAs({ limit: 2 }).then(eas => {
  console.log('\n📊 EA Data Retrieved:');
  console.log('  Count:', eas.length);
  
  if (eas.length > 0) {
    const firstEA = eas[0];
    console.log('  First EA:');
    console.log('    ID:', firstEA.id);
    console.log('    Name:', firstEA.name);
    console.log('    Has Image:', !!firstEA.image);
    console.log('    Image URL:', firstEA.image);
    console.log('    Has Screenshots:', !!firstEA.screenshots);
    console.log('    Screenshots Count:', firstEA.screenshots?.length || 0);
    
    if (firstEA.image) {
      console.log('    ✅ Image field exists');
    } else {
      console.log('    ❌ Image field missing');
    }
  }
  
  console.log('\n🎯 Conclusion:');
  if (databaseService.mockMode) {
    console.log('  App is in MOCK MODE');
    console.log('  Using mock data store');
  } else {
    console.log('  App is in REAL DATABASE MODE');
    console.log('  Using Supabase database');
  }
  
}).catch(error => {
  console.error('❌ Error getting EAs:', error.message);
});
