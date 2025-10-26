const axios = require('axios');
const { mockDataStore } = require('./services/mockAuthStore');

const BASE_URL = 'http://localhost:5000';

async function completeFix() {
  console.log('🔧 Complete Subscription Download Fix...\n');

  try {
    // Step 1: Force update mock store with proper EAs
    console.log('1. Updating mock store with proper EAs...');
    
    const properEAs = [
      {
        id: '1',
        name: 'Gold Scalper Pro v2.0',
        description: 'Advanced gold scalping EA with high win rate',
        category: 'scalping',
        price_weekly: 6.99,
        price_monthly: 18.00,
        price_quarterly: 45.00,
        price_yearly: 97.00,
        win_rate: 72,
        max_drawdown: 4.8,
        supported_pairs: ['XAUUSD', 'GOLD'],
        timeframes: ['M1', 'M5'],
        is_active: true,
        status: 'approved',
        ea_file: 'https://example.com/gold-scalper-pro-v2.ex4',
        set_file: 'https://example.com/gold-scalper-pro-v2.set',
        manual_file: 'https://example.com/gold-scalper-pro-v2.pdf',
        screenshots: ['https://example.com/gold-scalper-screenshot1.png'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '5',
        name: 'Multi Indicator Scalping Arrows EA v6.0 - Enhanced Profit Maximization',
        description: 'Advanced scalping EA with visual arrow indicator integration',
        category: 'scalping',
        price_weekly: 8.99,
        price_monthly: 25.00,
        price_quarterly: 60.00,
        price_yearly: 120.00,
        win_rate: 75,
        max_drawdown: 5.2,
        supported_pairs: ['EURUSD', 'GBPUSD', 'USDJPY'],
        timeframes: ['M1', 'M5', 'M15'],
        is_active: true,
        status: 'approved',
        ea_file: 'https://example.com/multi-indicator-scalping.ex4',
        set_file: 'https://example.com/multi-indicator-scalping.set',
        manual_file: 'https://example.com/multi-indicator-scalping.pdf',
        screenshots: [
          'https://example.com/multi-indicator-screenshot1.png',
          'https://example.com/multi-indicator-screenshot2.png',
          'https://example.com/multi-indicator-screenshot3.png',
          'https://example.com/multi-indicator-screenshot4.png',
          'https://example.com/multi-indicator-screenshot5.png'
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Force update mock store
    mockDataStore.eas = properEAs;
    mockDataStore._persist();
    
    console.log('✅ Updated mock store with proper EAs');

    // Step 2: Test direct database service
    console.log('\n2. Testing database service directly...');
    const databaseService = require('./services/databaseService');
    const dbEAs = await databaseService.getEAs();
    
    console.log(`✅ Database service returned ${dbEAs.length} EAs`);
    dbEAs.forEach((ea, index) => {
      console.log(`  EA ${index + 1}: ${ea.name} (ID: ${ea.id})`);
      console.log(`    - EA File: ${ea.ea_file ? '✅' : '❌'}`);
      console.log(`    - Set File: ${ea.set_file ? '✅' : '❌'}`);
      console.log(`    - Manual File: ${ea.manual_file ? '✅' : '❌'}`);
    });

    // Step 3: Test API endpoint
    console.log('\n3. Testing API endpoint...');
    const apiResponse = await axios.get(`${BASE_URL}/api/eas`);
    const apiEAs = apiResponse.data.data || apiResponse.data;
    
    console.log(`✅ API returned ${apiEAs.length} EAs`);
    apiEAs.forEach((ea, index) => {
      console.log(`  EA ${index + 1}: ${ea.name} (ID: ${ea.id})`);
      console.log(`    - EA File: ${ea.ea_file ? '✅' : '❌'}`);
      console.log(`    - Set File: ${ea.set_file ? '✅' : '❌'}`);
      console.log(`    - Manual File: ${ea.manual_file ? '✅' : '❌'}`);
    });

    // Step 4: Test subscription creation with proper EA ID
    console.log('\n4. Testing subscription creation...');
    try {
      const subscriptionData = {
        eaId: '1', // Use actual EA ID
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
        
        // Step 5: Test getting download files
        console.log('\n5. Testing download files retrieval...');
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
            
            // Step 6: Test download token
            if (files.ea_file) {
              console.log('\n6. Testing download token...');
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

    console.log('\n✅ Complete fix test completed!');

  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

completeFix();
