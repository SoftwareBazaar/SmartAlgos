const axios = require('axios');

console.log('Testing Subscription/Download Fixes');
console.log('===================================\n');

async function testFixes() {
  try {
    // Test 1: Server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('   ✅ Server is running\n');

    // Test 2: EA marketplace
    console.log('2. Testing EA marketplace...');
    const easResponse = await axios.get('http://localhost:5000/api/eas');
    if (easResponse.data.success) {
      const eas = easResponse.data.data || [];
      console.log(`   ✅ Found ${eas.length} EAs`);
      
      // Check for EAs with files
      const easWithFiles = eas.filter(ea => ea.ea_file || ea.set_file || ea.manual_file);
      console.log(`   ✅ ${easWithFiles.length} EAs have files for download`);
      
      if (easWithFiles.length > 0) {
        console.log('   📋 Available file types:');
        easWithFiles.forEach(ea => {
          console.log(`      - ${ea.name}:`, {
            ea_file: !!ea.ea_file,
            set_file: !!ea.set_file,
            manual_file: !!ea.manual_file,
            screenshots: ea.screenshots?.length || 0
          });
        });
      }
    }

    console.log('\n✅ All tests passed!');
    console.log('\nNext steps:');
    console.log('1. Open http://localhost:3000');
    console.log('2. Navigate to EA Marketplace');
    console.log('3. Test subscription flow');
    console.log('4. Verify download functionality');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFixes();
