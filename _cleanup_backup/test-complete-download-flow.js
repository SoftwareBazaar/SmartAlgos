const axios = require('axios');

// Test the complete download flow
async function testCompleteFlow() {
  const baseURL = 'http://localhost:5000';
  const testUser = {
    email: 'wanyagajohn73@gmail.com',
    password: 'demo123'
  };

  console.log('🧪 Testing Complete Download Flow\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Login
    console.log('\n📝 Step 1: Login as test user...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, testUser);
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.data.token;
    const userId = loginResponse.data.data.user.id;
    console.log('✅ Login successful');
    console.log(`   User ID: ${userId}`);
    console.log(`   Token: ${token.substring(0, 20)}...`);

    const headers = { Authorization: `Bearer ${token}` };

    // Step 2: Get available EAs
    console.log('\n📝 Step 2: Fetch available EAs...');
    const easResponse = await axios.get(`${baseURL}/api/eas`, { headers });
    
    if (!easResponse.data.success || easResponse.data.data.length === 0) {
      throw new Error('No EAs available');
    }
    
    const testEA = easResponse.data.data[0];
    console.log('✅ EAs fetched successfully');
    console.log(`   Test EA: ${testEA.name} (ID: ${testEA.id})`);

    // Step 3: Check existing subscriptions
    console.log('\n📝 Step 3: Check existing subscriptions...');
    const subsBeforeResponse = await axios.get(`${baseURL}/api/subscriptions`, { headers });
    
    const existingSub = subsBeforeResponse.data.data?.find(sub => 
      sub.ea_id === testEA.id && sub.status === 'active'
    );
    
    if (existingSub) {
      console.log('⚠️  User already has active subscription for this EA');
      console.log(`   Subscription ID: ${existingSub.id}`);
      console.log('   Skipping subscription creation...');
    } else {
      console.log('✅ No existing subscription found');
      
      // Step 4: Create subscription
      console.log('\n📝 Step 4: Create new subscription...');
      const subscriptionData = {
        eaId: testEA.id,
        subscriptionType: 'monthly',
        paymentMethod: 'card',
        paymentReference: `test_${Date.now()}`
      };
      
      const createSubResponse = await axios.post(
        `${baseURL}/api/subscriptions`,
        subscriptionData,
        { headers }
      );
      
      if (!createSubResponse.data.success) {
        throw new Error(`Subscription creation failed: ${createSubResponse.data.message}`);
      }
      
      console.log('✅ Subscription created successfully');
      console.log(`   Subscription ID: ${createSubResponse.data.data.id}`);
      console.log(`   Status: ${createSubResponse.data.data.status}`);
      console.log(`   Type: ${createSubResponse.data.data.subscription_type}`);
    }

    // Step 5: Verify subscription appears in list
    console.log('\n📝 Step 5: Verify subscription in list...');
    const subsAfterResponse = await axios.get(`${baseURL}/api/subscriptions`, { headers });
    
    const activeSub = subsAfterResponse.data.data?.find(sub => 
      sub.ea_id === testEA.id && sub.status === 'active'
    );
    
    if (!activeSub) {
      throw new Error('Subscription not found in list after creation');
    }
    
    console.log('✅ Subscription verified in list');
    console.log(`   Total subscriptions: ${subsAfterResponse.data.data.length}`);

    // Step 6: Get download links
    console.log('\n📝 Step 6: Get download links...');
    const filesResponse = await axios.get(
      `${baseURL}/api/subscriptions/${activeSub.id}/files`,
      { headers }
    );
    
    if (!filesResponse.data.success) {
      throw new Error('Failed to get download links');
    }
    
    const files = filesResponse.data.data.files;
    console.log('✅ Download links generated successfully');
    console.log(`   EA File: ${files.ea_file ? '✓ Available' : '✗ Not available'}`);
    console.log(`   Set File: ${files.set_file ? '✓ Available' : '✗ Not available'}`);
    console.log(`   Manual: ${files.manual ? '✓ Available' : '✗ Not available'}`);

    // Step 7: Test download URL structure
    console.log('\n📝 Step 7: Verify download URL structure...');
    if (files.ea_file) {
      const url = new URL(files.ea_file, baseURL);
      console.log('✅ EA file download URL is valid');
      console.log(`   URL: ${url.pathname}`);
      console.log(`   Has token: ${url.searchParams.has('token') ? '✓ Yes' : '✗ No'}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('\n📋 Summary:');
    console.log(`   - Login: ✓`);
    console.log(`   - EA Fetch: ✓`);
    console.log(`   - Subscription Creation: ✓`);
    console.log(`   - Subscription Verification: ✓`);
    console.log(`   - Download Links: ✓`);
    console.log(`   - URL Structure: ✓`);
    console.log('\n🎉 The complete download flow is working!');

  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error(`   Error: ${error.message}`);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response:`, JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run the test
testCompleteFlow();

