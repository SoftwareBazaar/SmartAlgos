const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testCompleteFlow() {
  console.log('🎯 Testing Complete Subscription & Auto-Download Flow\n');
  console.log('=' .repeat(60));

  try {
    // Test 1: Check EAs have files in database
    console.log('\n📋 TEST 1: Verify EAs have files in database');
    console.log('-'.repeat(60));
    
    const easResponse = await axios.get(`${BASE_URL}/api/eas`);
    const eas = easResponse.data.data || easResponse.data;
    
    console.log(`✅ Found ${eas.length} EAs`);
    eas.forEach((ea, index) => {
      console.log(`\n  EA ${index + 1}: ${ea.name} (ID: ${ea.id})`);
      console.log(`    - EA File: ${ea.ea_file_path ? '✅ ' + ea.ea_file_path : '❌ Missing'}`);
      console.log(`    - Set File: ${ea.set_file_path ? '✅ ' + ea.set_file_path : '❌ Missing'}`);
      console.log(`    - Manual File: ${ea.manual_file_path ? '✅ ' + ea.manual_file_path : '❌ Missing'}`);
      console.log(`    - Screenshots: ${ea.screenshots ? ea.screenshots.length + ' files' : '❌ Missing'}`);
    });

    // Test 2: Test subscription creation (with mock auth)
    console.log('\n\n📋 TEST 2: Test Subscription Creation');
    console.log('-'.repeat(60));
    
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
    
    try {
      const subscriptionResponse = await axios.post(
        `${BASE_URL}/api/subscriptions`,
        subscriptionData,
        {
          headers: {
            'Authorization': `Bearer ${mockToken}`
          }
        }
      );
      
      if (subscriptionResponse.data.success) {
        console.log('✅ Subscription created successfully');
        console.log('   Subscription ID:', subscriptionResponse.data.data.id);
        
        const subscriptionId = subscriptionResponse.data.data.id;
        
        // Test 3: Test getting download files
        console.log('\n\n📋 TEST 3: Test Download Files Retrieval');
        console.log('-'.repeat(60));
        
        try {
          const filesResponse = await axios.get(
            `${BASE_URL}/api/subscriptions/${subscriptionId}/files`,
            {
              headers: {
                'Authorization': `Bearer ${mockToken}`
              }
            }
          );
          
          if (filesResponse.data.success) {
            console.log('✅ Download files retrieved successfully');
            const files = filesResponse.data.data.files;
            
            console.log('\n  Available download links:');
            console.log(`    - EA File: ${files.ea_file ? '✅ Available' : '❌ Missing'}`);
            console.log(`    - Set File: ${files.set_file ? '✅ Available' : '❌ Missing'}`);
            console.log(`    - Manual: ${files.manual ? '✅ Available' : '❌ Missing'}`);
            console.log(`    - Screenshots: ${files.screenshots ? '✅ Available' : '❌ Missing'}`);
            
            // Test 4: Verify download tokens
            console.log('\n\n📋 TEST 4: Verify Download Tokens');
            console.log('-'.repeat(60));
            
            if (files.ea_file) {
              const tokenMatch = files.ea_file.match(/token=([^&]+)/);
              if (tokenMatch) {
                console.log('✅ Download token found in URL');
                console.log('   Token preview:', tokenMatch[1].substring(0, 20) + '...');
              } else {
                console.log('❌ Download token not found in URL');
              }
            }
            
            // Test 5: Test download recording
            console.log('\n\n📋 TEST 5: Test Download Recording');
            console.log('-'.repeat(60));
            
            try {
              const recordResponse = await axios.post(
                `${BASE_URL}/api/subscriptions/${subscriptionId}/download`,
                { fileType: 'ea_file' },
                {
                  headers: {
                    'Authorization': `Bearer ${mockToken}`
                  }
                }
              );
              
              if (recordResponse.data.success) {
                console.log('✅ Download recording successful');
              } else {
                console.log('❌ Download recording failed:', recordResponse.data.message);
              }
            } catch (recordError) {
              console.log('❌ Download recording error:', recordError.response?.data?.message || recordError.message);
            }
            
          } else {
            console.log('❌ Failed to retrieve download files:', filesResponse.data.message);
          }
        } catch (filesError) {
          console.log('❌ Error fetching download files:', filesError.response?.data?.message || filesError.message);
        }
      } else {
        console.log('❌ Subscription creation failed:', subscriptionResponse.data.message);
      }
    } catch (subscriptionError) {
      console.log('❌ Subscription creation error:', subscriptionError.response?.data?.message || subscriptionError.message);
    }

    // Summary
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('\n✅ All backend tests completed!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Open http://localhost:3000/ea-marketplace in your browser');
    console.log('   2. Click "Download" button on any EA');
    console.log('   3. Complete the subscription form');
    console.log('   4. Verify auto-download modal appears');
    console.log('   5. Verify all file types are available');
    console.log('   6. Click download buttons to test download');
    console.log('\n🎉 The subscription to auto-download flow is ready for testing!');

  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
  }
}

testCompleteFlow();
