const databaseService = require('./services/databaseService');

async function testDatabaseService() {
  console.log('🔍 Testing Database Service...\n');

  try {
    console.log('Database Service Mock Mode:', databaseService.mockMode);
    
    console.log('\n1. Testing getEAs...');
    const eas = await databaseService.getEAs();
    console.log(`Found ${eas.length} EAs`);
    
    eas.forEach((ea, index) => {
      console.log(`  EA ${index + 1}: ${ea.name} (ID: ${ea.id})`);
      console.log(`    - EA File: ${ea.ea_file ? '✅' : '❌'}`);
      console.log(`    - Set File: ${ea.set_file ? '✅' : '❌'}`);
      console.log(`    - Manual File: ${ea.manual_file ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testDatabaseService();
