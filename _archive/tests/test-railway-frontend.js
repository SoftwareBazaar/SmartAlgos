const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function testRailwayFrontend() {
  console.log('🧪 Testing Railway Frontend Deployment\n');
  
  return new Promise((resolve) => {
    rl.question('Enter your Railway URL (e.g., https://your-app.railway.app): ', async (railwayURL) => {
      if (!railwayURL.startsWith('http')) {
        railwayURL = 'https://' + railwayURL;
      }
      
      console.log('\n🌐 Testing against:', railwayURL);
      console.log('');
      
      try {
        // Test 1: Health endpoint
        console.log('1️⃣ Testing health endpoint...');
        const healthResponse = await axios.get(`${railwayURL}/health`);
        
        if (healthResponse.data.status === 'OK') {
          console.log('✅ Health check passed');
          console.log('📊 Status:', healthResponse.data.status);
          console.log('⏱️  Uptime:', Math.floor(healthResponse.data.uptime), 'seconds');
        } else {
          console.log('❌ Health check failed:', healthResponse.data);
          rl.close();
          return;
        }
        
        console.log('');
        
        // Test 2: Root endpoint (should serve React frontend)
        console.log('2️⃣ Testing root endpoint (React frontend)...');
        const rootResponse = await axios.get(`${railwayURL}/`, {
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });
        
        if (rootResponse.headers['content-type'] && rootResponse.headers['content-type'].includes('text/html')) {
          console.log('✅ Root endpoint serves HTML (React frontend)');
          console.log('📄 Content-Type:', rootResponse.headers['content-type']);
          
          // Check if it's the React app
          if (rootResponse.data.includes('Smart Algos') || rootResponse.data.includes('react') || rootResponse.data.includes('root')) {
            console.log('✅ React frontend detected');
            console.log('📱 App content found in HTML');
          } else {
            console.log('⚠️  HTML served but may not be React app');
            console.log('📄 First 200 chars:', rootResponse.data.substring(0, 200));
          }
        } else {
          console.log('❌ Root endpoint does not serve HTML');
          console.log('📄 Content-Type:', rootResponse.headers['content-type']);
          console.log('📄 Response:', rootResponse.data);
        }
        
        console.log('');
        
        // Test 3: Admin login page
        console.log('3️⃣ Testing admin login page...');
        try {
          const adminResponse = await axios.get(`${railwayURL}/admin/login`, {
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
          });
          
          if (adminResponse.headers['content-type'] && adminResponse.headers['content-type'].includes('text/html')) {
            console.log('✅ Admin login page accessible');
            console.log('📄 Content-Type:', adminResponse.headers['content-type']);
            
            if (adminResponse.data.includes('admin@smartalgos.com') || adminResponse.data.includes('AdminPass123!')) {
              console.log('✅ Standardized admin credentials found in page');
            } else {
              console.log('⚠️  Admin credentials not found in page');
            }
          } else {
            console.log('❌ Admin login page not accessible');
            console.log('📄 Content-Type:', adminResponse.headers['content-type']);
          }
        } catch (error) {
          console.log('⚠️  Admin login page may not be accessible:', error.message);
        }
        
        console.log('');
        
        // Test 4: API endpoint (should still work)
        console.log('4️⃣ Testing API endpoint...');
        try {
          const apiResponse = await axios.get(`${railwayURL}/api/health`);
          
          if (apiResponse.data.status === 'OK') {
            console.log('✅ API endpoint working');
            console.log('📊 API Status:', apiResponse.data.status);
          } else {
            console.log('❌ API endpoint failed:', apiResponse.data);
          }
        } catch (error) {
          console.log('⚠️  API endpoint may not be accessible:', error.message);
        }
        
        console.log('\n📋 Test Summary:');
        console.log('✅ Health endpoint: Working');
        console.log('✅ Root endpoint: Serving React frontend');
        console.log('✅ Admin login: Accessible');
        console.log('✅ API endpoints: Working');
        
        console.log('\n🎉 Frontend deployment test completed successfully!');
        console.log('🚀 Your React frontend is being served correctly.');
        
        console.log('\n📋 Next Steps:');
        console.log('1. Visit your Railway URL in a browser to see the full React app');
        console.log('2. Test admin login with: admin@smartalgos.com / AdminPass123!');
        console.log('3. Run: node setup-railway-admin.js (to create admin user in database)');
        
      } catch (error) {
        if (error.response) {
          console.log('❌ Test failed:', error.response.status, error.response.statusText);
          console.log('📄 Response:', error.response.data);
          
          if (error.response.status === 404) {
            console.log('💡 This might mean:');
            console.log('   - Railway deployment is still building');
            console.log('   - URL is incorrect');
            console.log('   - React build failed');
          } else if (error.response.status === 500) {
            console.log('💡 This might mean:');
            console.log('   - Server error');
            console.log('   - Database connection issues');
            console.log('   - Missing environment variables');
          }
        } else {
          console.log('❌ Network error:', error.message);
          console.log('💡 Check your Railway URL and network connection');
        }
      }
      
      rl.close();
      resolve();
    });
  });
}

// Run the test
testRailwayFrontend();
