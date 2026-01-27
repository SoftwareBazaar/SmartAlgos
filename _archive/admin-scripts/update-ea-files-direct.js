const { mockDataStore } = require('./services/mockAuthStore');

async function updateEAFiles() {
  console.log('🔧 Updating EA files directly in mock data store...\n');

  try {
    // Get all EAs
    const eas = mockDataStore.eas;
    console.log(`Found ${eas.length} EAs to update`);

    for (const ea of eas) {
      console.log(`\nUpdating EA: ${ea.name} (ID: ${ea.id})`);
      
      // Create update data with file URLs
      const updateData = {
        ea_file: `https://example.com/${ea.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ex4`,
        set_file: `https://example.com/${ea.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.set`,
        manual_file: `https://example.com/${ea.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-manual.pdf`
      };

      console.log('Adding files:', updateData);

      // Update EA directly
      const updatedEA = await mockDataStore.updateEA(ea.id, updateData);
      
      if (updatedEA) {
        console.log('✅ EA updated successfully');
      } else {
        console.log('❌ EA update failed');
      }
    }

    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const updatedEAs = mockDataStore.eas;
    
    updatedEAs.forEach((ea, index) => {
      console.log(`\nEA ${index + 1}: ${ea.name}`);
      console.log(`  - EA File: ${ea.ea_file ? '✅' : '❌'}`);
      console.log(`  - Set File: ${ea.set_file ? '✅' : '❌'}`);
      console.log(`  - Manual File: ${ea.manual_file ? '✅' : '❌'}`);
    });

    console.log('\n✅ All EAs updated successfully!');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

updateEAFiles();
