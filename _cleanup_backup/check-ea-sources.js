const axios = require('axios');
const { mockDataStore } = require('./services/mockAuthStore');

const BASE_URL = 'http://localhost:5000';

async function checkEASources() {
  console.log('🔍 Checking EA sources...\n');

  try {
    // Check database EAs
    console.log('1. Database EAs:');
    const dbResponse = await axios.get(`${BASE_URL}/api/eas`);
    const dbEAs = dbResponse.data.data || dbResponse.data;
    
    dbEAs.forEach((ea, index) => {
      console.log(`  EA ${index + 1}: ${ea.name} (ID: ${ea.id})`);
      console.log(`    - EA File: ${ea.ea_file ? '✅' : '❌'}`);
      console.log(`    - Set File: ${ea.set_file ? '✅' : '❌'}`);
      console.log(`    - Manual File: ${ea.manual_file ? '✅' : '❌'}`);
    });

    // Check mock store EAs
    console.log('\n2. Mock Store EAs:');
    const mockEAs = mockDataStore.eas;
    
    mockEAs.forEach((ea, index) => {
      console.log(`  EA ${index + 1}: ${ea.name} (ID: ${ea.id})`);
      console.log(`    - EA File: ${ea.ea_file ? '✅' : '❌'}`);
      console.log(`    - Set File: ${ea.set_file ? '✅' : '❌'}`);
      console.log(`    - Manual File: ${ea.manual_file ? '✅' : '❌'}`);
    });

    // Check if we're in mock mode
    console.log('\n3. Database Service Mode:');
    const databaseService = require('./services/databaseService');
    console.log(`  Mock Mode: ${databaseService.mockMode}`);

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkEASources();
