const axios = require('axios');
const { mockDataStore } = require('./services/mockAuthStore');

const BASE_URL = 'http://localhost:5000';

async function finalFix() {
  console.log('🔧 Final Subscription Download Fix...\n');

  try {
    // Step 1: Force restart server to ensure changes take effect
    console.log('1. Restarting server to ensure changes take effect...');
    
    // Kill any existing node processes
    const { exec } = require('child_process');
    exec('taskkill /f /im node.exe', (error, stdout, stderr) => {
      if (error) {
        console.log('No existing node processes to kill');
      }
    });

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Start server in background
    const serverProcess = require('child_process').spawn('npm', ['start'], {
      detached: true,
      stdio: 'ignore'
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('✅ Server restarted');

    // Step 2: Test API endpoint
    console.log('\n2. Testing API endpoint...');
    const apiResponse = await axios.get(`${BASE_URL}/api/eas`);
    const apiEAs = apiResponse.data.data || apiResponse.data;
    
    console.log(`✅ API returned ${apiEAs.length} EAs`);
    apiEAs.forEach((ea, index) => {
      console.log(`  EA ${index + 1}: ${ea.name} (ID: ${ea.id})`);
      console.log(`    - EA File: ${ea.ea_file ? '✅' : '❌'}`);
      console.log(`    - Set File: ${ea.set_file ? '✅' : '❌'}`);
      console.log(`    - Manual File: ${ea.manual_file ? '✅' : '❌'}`);
    });

    // Step 3: Test subscription creation with mock authentication
    console.log('\n3. Testing subscription creation with mock authentication...');
    try {
      // Create a mock user token for testing
      const jwt = require('jsonwebtoken');
      const mockToken = jwt.sign(
        { id: 'test-user-1', email: 'test@example.com' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      const subscriptionData = {
        eaId: '1',
        subscriptionType: 'monthly',
        paymentMethod: 'crypto',
        paymentReference: `test_${Date.now()}`
      };

      console.log('Creating subscription with data:', subscriptionData);
      const subscriptionResponse = await axios.post(`${BASE_URL}/api/subscriptions`, subscriptionData, {
        headers: {
          'Authorization': `Bearer ${mockToken}`
        }
      });
      
      if (subscriptionResponse.data.success) {
        console.log('✅ Subscription created successfully');
        console.log('Subscription ID:', subscriptionResponse.data.data.id);
        
        const subscriptionId = subscriptionResponse.data.data.id;
        
        // Step 4: Test getting download files
        console.log('\n4. Testing download files retrieval...');
        try {
          const filesResponse = await axios.get(`${BASE_URL}/api/subscriptions/${subscriptionId}/files`, {
            headers: {
              'Authorization': `Bearer ${mockToken}`
            }
          });
          
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

    console.log('\n✅ Final fix test completed!');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

finalFix();
