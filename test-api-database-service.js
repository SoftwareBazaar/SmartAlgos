const axios = require('axios');
const databaseService = require('./services/databaseService');

const BASE_URL = 'http://localhost:5000';

async function testAPIDatabaseService() {
  console.log('🔍 Testing API Database Service...\n');

  try {
    // Step 1: Test database service directly
    console.log('1. Testing database service directly...');
    const dbEAs = await databaseService.getEAs();
    console.log(`Database service returned ${dbEAs.length} EAs`);
    dbEAs.forEach((ea, index) => {
      console.log(`  EA ${index + 1}: ${ea.name} (ID: ${ea.id})`);
      console.log(`    - EA File: ${ea.ea_file ? '✅' : '❌'}`);
      console.log(`    - Set File: ${ea.set_file ? '✅' : '❌'}`);
      console.log(`    - Manual File: ${ea.manual_file ? '✅' : '❌'}`);
    });

    // Step 2: Test API endpoint
    console.log('\n2. Testing API endpoint...');
    const apiResponse = await axios.get(`${BASE_URL}/api/eas`);
    const apiEAs = apiResponse.data.data || apiResponse.data;
    
    console.log(`API returned ${apiEAs.length} EAs`);
    apiEAs.forEach((ea, index) => {
      console.log(`  EA ${index + 1}: ${ea.name} (ID: ${ea.id})`);
      console.log(`    - EA File: ${ea.ea_file ? '✅' : '❌'}`);
      console.log(`    - Set File: ${ea.set_file ? '✅' : '❌'}`);
      console.log(`    - Manual File: ${ea.manual_file ? '✅' : '❌'}`);
    });

    // Step 3: Compare results
    console.log('\n3. Comparing results...');
    if (dbEAs.length === apiEAs.length) {
      console.log('✅ Same number of EAs returned');
    } else {
      console.log('❌ Different number of EAs returned');
    }

    if (dbEAs[0] && apiEAs[0]) {
      const dbHasFiles = !!(dbEAs[0].ea_file || dbEAs[0].set_file || dbEAs[0].manual_file);
      const apiHasFiles = !!(apiEAs[0].ea_file || apiEAs[0].set_file || apiEAs[0].manual_file);
      
      if (dbHasFiles === apiHasFiles) {
        console.log('✅ Same file status');
      } else {
        console.log('❌ Different file status');
        console.log(`  Database service: ${dbHasFiles ? 'Has files' : 'No files'}`);
        console.log(`  API: ${apiHasFiles ? 'Has files' : 'No files'}`);
      }
    }

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testAPIDatabaseService();
