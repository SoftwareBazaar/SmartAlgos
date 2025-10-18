const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function debugSubscriptionDownloadFlow() {
  console.log('🔍 Debugging Subscription Download Flow...\n');

  try {
    // Step 1: Check if server is running
    console.log('1. Checking server status...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server is not running. Please start the server first.');
      return;
    }

    // Step 2: Get EAs to see what files are available
    console.log('\n2. Checking available EAs...');
    try {
      const easResponse = await axios.get(`${BASE_URL}/api/eas`);
      const eas = easResponse.data.data || easResponse.data;
      console.log(`✅ Found ${eas.length} EAs`);
      
      eas.forEach((ea, index) => {
        console.log(`\nEA ${index + 1}: ${ea.name}`);
        console.log(`  - ID: ${ea.id}`);
        console.log(`  - EA File: ${ea.ea_file ? '✅' : '❌'}`);
        console.log(`  - Set File: ${ea.set_file ? '✅' : '❌'}`);
        console.log(`  - Manual File: ${ea.manual_file ? '✅' : '❌'}`);
        console.log(`  - Screenshots: ${ea.screenshots ? ea.screenshots.length : 0} files`);
        console.log(`  - Active: ${ea.is_active}`);
        console.log(`  - Status: ${ea.status}`);
      });
    } catch (error) {
      console.log('❌ Failed to fetch EAs:', error.message);
      return;
    }

    // Step 3: Test subscription creation
    console.log('\n3. Testing subscription creation...');
    try {
      const subscriptionData = {
        eaId: 'test-ea-1',
        subscriptionType: 'monthly',
        paymentMethod: 'crypto',
        paymentReference: `test_${Date.now()}`
      };

      console.log('Creating subscription with data:', subscriptionData);
      const subscriptionResponse = await axios.post(`${BASE_URL}/api/subscriptions`, subscriptionData);
      
      if (subscriptionResponse.data.success) {
        console.log('✅ Subscription created successfully');
        console.log('Subscription ID:', subscriptionResponse.data.data.id);
        
        const subscriptionId = subscriptionResponse.data.data.id;
        
        // Step 4: Test getting download files
        console.log('\n4. Testing download files retrieval...');
        try {
          const filesResponse = await axios.get(`${BASE_URL}/api/subscriptions/${subscriptionId}/files`);
          
          if (filesResponse.data.success) {
            console.log('✅ Download files retrieved successfully');
            const files = filesResponse.data.data.files;
            
            console.log('\nAvailable files:');
            console.log(`  - EA File: ${files.ea_file ? '✅' : '❌'}`);
            console.log(`  - Set File: ${files.set_file ? '✅' : '❌'}`);
            console.log(`  - Manual: ${files.manual ? '✅' : '❌'}`);
            console.log(`  - Screenshots: ${files.screenshots ? '✅' : '❌'}`);
            
            // Step 5: Test download token
            if (files.ea_file) {
              console.log('\n5. Testing download token...');
              const downloadUrl = files.ea_file;
              console.log('Download URL:', downloadUrl);
              
              try {
                const downloadResponse = await axios.get(downloadUrl);
                console.log('✅ Download token works');
                console.log('Response:', downloadResponse.data);
              } catch (downloadError) {
                console.log('❌ Download token failed:', downloadError.response?.data || downloadError.message);
              }
            }
          } else {
            console.log('❌ Failed to retrieve download files:', filesResponse.data.message);
          }
        } catch (filesError) {
          console.log('❌ Error fetching download files:', filesError.response?.data || filesError.message);
        }
      } else {
        console.log('❌ Subscription creation failed:', subscriptionResponse.data.message);
      }
    } catch (subscriptionError) {
      console.log('❌ Subscription creation error:', subscriptionError.response?.data || subscriptionError.message);
    }

  } catch (error) {
    console.log('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugSubscriptionDownloadFlow();
