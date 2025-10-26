const axios = require('axios');
const { mockDataStore } = require('./services/mockAuthStore');

const BASE_URL = 'http://localhost:5000';

async function stepByStepFix() {
  console.log('🔧 Step-by-Step Fix...\n');

  try {
    // Step 1: Check current state
    console.log('1. Checking current state...');
    
    // Check mock store
    console.log('Mock store EAs:', mockDataStore.eas.length);
    mockDataStore.eas.forEach((ea, index) => {
      console.log(`  EA ${index + 1}: ${ea.name} (ID: ${ea.id})`);
      console.log(`    - EA File: ${ea.ea_file ? '✅' : '❌'}`);
      console.log(`    - Set File: ${ea.set_file ? '✅' : '❌'}`);
      console.log(`    - Manual File: ${ea.manual_file ? '✅' : '❌'}`);
    });

    // Check API
    console.log('\n2. Checking API...');
    try {
      const apiResponse = await axios.get(`${BASE_URL}/api/eas`);
      const apiEAs = apiResponse.data.data || apiResponse.data;
      
      console.log(`API returned ${apiEAs.length} EAs`);
      apiEAs.forEach((ea, index) => {
        console.log(`  EA ${index + 1}: ${ea.name} (ID: ${ea.id})`);
        console.log(`    - EA File: ${ea.ea_file ? '✅' : '❌'}`);
        console.log(`    - Set File: ${ea.set_file ? '✅' : '❌'}`);
        console.log(`    - Manual File: ${ea.manual_file ? '✅' : '❌'}`);
      });
    } catch (error) {
      console.log('❌ API error:', error.message);
    }

    // Step 3: Test database service directly
    console.log('\n3. Testing database service directly...');
    const databaseService = require('./services/databaseService');
    const dbEAs = await databaseService.getEAs();
    
    console.log(`Database service returned ${dbEAs.length} EAs`);
    dbEAs.forEach((ea, index) => {
      console.log(`  EA ${index + 1}: ${ea.name} (ID: ${ea.id})`);
      console.log(`    - EA File: ${ea.ea_file ? '✅' : '❌'}`);
      console.log(`    - Set File: ${ea.set_file ? '✅' : '❌'}`);
      console.log(`    - Manual File: ${ea.manual_file ? '✅' : '❌'}`);
    });

    console.log('\n✅ Step-by-step fix completed!');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

stepByStepFix();
