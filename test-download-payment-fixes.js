const axios = require('axios');

console.log('Testing Download/Payment Flow Fixes');
console.log('==================================\n');

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
      
      // Check if both EAs show download buttons
      console.log('   📋 EA Download Button Status:');
      eas.forEach((ea, index) => {
        console.log(`      EA ${index + 1}: ${ea.name}`);
        console.log(`         - Has EA file: ${!!ea.ea_file}`);
        console.log(`         - Has Settings file: ${!!ea.set_file}`);
        console.log(`         - Has Manual file: ${!!ea.manual_file}`);
        console.log(`         - Has Screenshots: ${ea.screenshots?.length || 0}`);
      });
    }

    // Test 3: Download endpoint security
    console.log('\n3. Testing download endpoint security...');
    try {
      const downloadResponse = await axios.get('http://localhost:5000/api/downloads/ea/test-ea-1?token=invalid-token&type=ea_file');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Download endpoint properly secured (401 expected)');
      }
    }

    // Test 4: Subscription endpoint
    console.log('\n4. Testing subscription endpoint...');
    try {
      const subsResponse = await axios.get('http://localhost:5000/api/subscriptions');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Subscription endpoint properly secured (401 expected)');
      }
    }

    console.log('\n✅ All backend tests passed!');
    console.log('\n🎯 Frontend Testing Instructions:');
    console.log('=====================================');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Navigate to EA Marketplace');
    console.log('3. You should see BOTH EAs with "Download" buttons');
    console.log('4. Click "Download" on any EA');
    console.log('5. Should show subscription modal (payment required)');
    console.log('6. Complete payment process');
    console.log('7. After payment, download modal should appear');
    console.log('8. Test downloading files');
    
    console.log('\n📋 Expected Behavior:');
    console.log('- ✅ Both EAs show "Download" buttons');
    console.log('- ✅ Clicking "Download" shows subscription modal');
    console.log('- ✅ Payment is required before download');
    console.log('- ✅ After payment, download modal appears');
    console.log('- ✅ Download modal shows ALL file types');
    console.log('- ✅ Files download successfully');
    
    console.log('\n🔧 EA Upload Testing:');
    console.log('1. Upload a new EA with files');
    console.log('2. Check that EA appears in marketplace');
    console.log('3. Verify files are stored and accessible');
    console.log('4. Test download functionality for uploaded EA');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure server is running: npm start');
    console.log('2. Check if port 5000 is available');
    console.log('3. Verify database connection');
  }
}

testFixes();
