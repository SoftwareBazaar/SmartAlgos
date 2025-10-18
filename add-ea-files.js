const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function addEAFiles() {
  console.log('🔧 Adding EA files to existing EAs...\n');

  try {
    // Get existing EAs
    const easResponse = await axios.get(`${BASE_URL}/api/eas`);
    const eas = easResponse.data.data || easResponse.data;
    
    console.log(`Found ${eas.length} EAs to update`);

    for (const ea of eas) {
      console.log(`\nUpdating EA: ${ea.name} (ID: ${ea.id})`);
      
      // Create update data with file URLs
      const updateData = {
        ea_file: `https://example.com/${ea.name.toLowerCase().replace(/\s+/g, '-')}.ex4`,
        set_file: `https://example.com/${ea.name.toLowerCase().replace(/\s+/g, '-')}.set`,
        manual_file: `https://example.com/${ea.name.toLowerCase().replace(/\s+/g, '-')}-manual.pdf`
      };

      console.log('Adding files:', updateData);

      try {
        // Update EA with files
        const updateResponse = await axios.put(`${BASE_URL}/api/eas/${ea.id}`, updateData);
        
        if (updateResponse.data.success) {
          console.log('✅ EA updated successfully');
        } else {
          console.log('❌ EA update failed:', updateResponse.data.message);
        }
      } catch (updateError) {
        console.log('❌ Error updating EA:', updateError.response?.data || updateError.message);
      }
    }

    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const verifyResponse = await axios.get(`${BASE_URL}/api/eas`);
    const updatedEAs = verifyResponse.data.data || verifyResponse.data;
    
    updatedEAs.forEach((ea, index) => {
      console.log(`\nEA ${index + 1}: ${ea.name}`);
      console.log(`  - EA File: ${ea.ea_file ? '✅' : '❌'}`);
      console.log(`  - Set File: ${ea.set_file ? '✅' : '❌'}`);
      console.log(`  - Manual File: ${ea.manual_file ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

addEAFiles();
