const axios = require('axios');

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';

async function checkEAs() {
  console.log('🔍 Checking EAs in database...\n');
  
  try {
    // Get all EAs (public endpoint)
    const response = await axios.get(`${BASE_URL}/api/eas`);
    
    const eas = response.data.eas || [];
    
    console.log(`📊 Found ${eas.length} EAs in database:`);
    console.log('=' .repeat(60));
    
    eas.forEach((ea, index) => {
      console.log(`${index + 1}. ${ea.name}`);
      console.log(`   ID: ${ea.id}`);
      console.log(`   Price: $${ea.price || 'Free'}`);
      console.log(`   Status: ${ea.status}`);
      console.log(`   Creator: ${ea.creator_name || 'Unknown'}`);
      console.log(`   Created: ${new Date(ea.created_at).toLocaleDateString()}`);
      console.log(`   Has EA File: ${ea.ea_file_path ? 'Yes' : 'No'}`);
      console.log(`   Has Image: ${ea.image ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    if (eas.length === 0) {
      console.log('📭 No EAs found in database');
      console.log('💡 Run the upload test to add a demo EA');
    }
    
  } catch (error) {
    console.error('❌ Error checking EAs:', error.response?.data || error.message);
  }
}

checkEAs();
