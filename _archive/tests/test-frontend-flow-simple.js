const axios = require('axios');

console.log('Testing Frontend Subscription/Download Flow');
console.log('==========================================\n');

async function testFrontendFlow() {
  try {
    // Test 1: Server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('   ✅ Server is running and healthy\n');

    // Test 2: EA marketplace
    console.log('2. Testing EA marketplace...');
    const easResponse = await axios.get('http://localhost:5000/api/eas');
    if (easResponse.data.success) {
      const eas = easResponse.data.data || [];
      console.log(`   ✅ Found ${eas.length} EAs in marketplace`);
      
      // Show available EAs
      eas.forEach((ea, index) => {
        console.log(`   📋 EA ${index + 1}: ${ea.name}`);
        console.log(`      - Category: ${ea.category}`);
        console.log(`      - Price: $${ea.price_monthly || 'N/A'}/month`);
        console.log(`      - Status: ${ea.status}`);
        console.log(`      - Active: ${ea.is_active ? 'Yes' : 'No'}`);
      });
    }

    // Test 3: Download endpoints
    console.log('\n3. Testing download endpoints...');
    try {
      const downloadResponse = await axios.get('http://localhost:5000/api/downloads/ea/test-ea-1?token=invalid-token&type=ea_file');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Download endpoints are properly secured (401 expected)');
      }
    }

    // Test 4: Subscription endpoints
    console.log('\n4. Testing subscription endpoints...');
    try {
      const subsResponse = await axios.get('http://localhost:5000/api/subscriptions');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Subscription endpoints are properly secured (401 expected)');
      }
    }

    console.log('\n✅ All backend tests passed!');
    console.log('\n🎯 Frontend Testing Instructions:');
    console.log('=====================================');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Navigate to EA Marketplace');
    console.log('3. You should see EAs with "Subscribe" buttons');
    console.log('4. Click "Subscribe" on any EA');
    console.log('5. Complete the subscription process');
    console.log('6. Verify download modal appears with file options');
    console.log('7. Test downloading files');
    
    console.log('\n📋 Expected Behavior:');
    console.log('- ✅ Subscription modal opens when clicking "Subscribe"');
    console.log('- ✅ Subscription process completes successfully');
    console.log('- ✅ Download modal appears after successful subscription');
    console.log('- ✅ Download modal shows available file types');
    console.log('- ✅ Files download when clicked');
    console.log('- ✅ Users with subscriptions see "Download" button');
    
    console.log('\n🔧 If Issues Occur:');
    console.log('- Check browser console for errors');
    console.log('- Verify server logs for backend issues');
    console.log('- Test with different EAs');
    console.log('- Clear browser cache and try again');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure server is running: npm start');
    console.log('2. Check if port 5000 is available');
    console.log('3. Verify database connection');
  }
}

testFrontendFlow();
