const axios = require('axios');
const { mockDataStore } = require('./services/mockAuthStore');

const BASE_URL = 'http://localhost:5000';

async function fixCompleteFlow() {
  console.log('🔧 Fixing Complete Subscription Download Flow...\n');

  try {
    // Step 1: Add more EAs to mock store with files
    console.log('1. Adding EAs with files to mock store...');
    
    const testEAs = [
      {
        id: 'test-ea-1',
        name: 'Test Download EA 1',
        description: 'Test EA for verifying download functionality',
        category: 'scalping',
        price_weekly: 6.99,
        price_monthly: 18.00,
        price_quarterly: 45.00,
        price_yearly: 97.00,
        win_rate: 75,
        max_drawdown: 5.2,
        supported_pairs: ['EURUSD', 'GBPUSD'],
        timeframes: ['M1', 'M5'],
        is_active: true,
        status: 'approved',
        ea_file: 'https://example.com/test-ea-1.ex4',
        set_file: 'https://example.com/test-ea-1.set',
        manual_file: 'https://example.com/test-ea-1.pdf',
        screenshots: ['https://example.com/test-ea-1-screenshot1.png'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'test-ea-2',
        name: 'Test Download EA 2',
        description: 'Another test EA for verifying download functionality',
        category: 'trend',
        price_weekly: 8.99,
        price_monthly: 25.00,
        price_quarterly: 60.00,
        price_yearly: 120.00,
        win_rate: 80,
        max_drawdown: 4.5,
        supported_pairs: ['EURUSD', 'GBPUSD', 'USDJPY'],
        timeframes: ['M5', 'M15', 'H1'],
        is_active: true,
        status: 'approved',
        ea_file: 'https://example.com/test-ea-2.ex4',
        set_file: 'https://example.com/test-ea-2.set',
        manual_file: 'https://example.com/test-ea-2.pdf',
        screenshots: ['https://example.com/test-ea-2-screenshot1.png', 'https://example.com/test-ea-2-screenshot2.png'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Clear existing EAs and add new ones
    mockDataStore.eas = testEAs;
    mockDataStore._persist();
    
    console.log('✅ Added test EAs with files');

    // Step 2: Test API endpoint
    console.log('\n2. Testing API endpoint...');
    const apiResponse = await axios.get(`${BASE_URL}/api/eas`);
    const apiEAs = apiResponse.data.data || apiResponse.data;
    
    console.log(`✅ API returned ${apiEAs.length} EAs`);
    apiEAs.forEach((ea, index) => {
      console.log(`  EA ${index + 1}: ${ea.name}`);
      console.log(`    - EA File: ${ea.ea_file ? '✅' : '❌'}`);
      console.log(`    - Set File: ${ea.set_file ? '✅' : '❌'}`);
      console.log(`    - Manual File: ${ea.manual_file ? '✅' : '❌'}`);
    });

    // Step 3: Test subscription creation (without auth for now)
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

    console.log('\n✅ Complete flow test completed!');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

fixCompleteFlow();
