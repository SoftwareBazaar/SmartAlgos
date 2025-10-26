/**
 * One-Click Utilities Sync Setup
 * Run this script to set up utilities synchronization
 */

const http = require('http');

console.log('\n🚀 Setting up Utilities Synchronization...\n');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function setupUtilities() {
  try {
    console.log('📡 Checking server connection...');
    
    // Test server connection
    const healthCheck = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    
    if (healthCheck.status === 'OK') {
      console.log('✅ Server is running!\n');
    }
    
    console.log('🌱 Seeding utilities database...');
    
    // Seed the database
    const seedResult = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/utilities/seed',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (seedResult.success) {
      console.log(`✅ ${seedResult.message}`);
      console.log(`   Utilities created: ${seedResult.count}\n`);
      
      if (seedResult.data && seedResult.data.length > 0) {
        console.log('📝 Created utilities:');
        seedResult.data.forEach((utility, index) => {
          console.log(`   ${index + 1}. ${utility.name} (${utility.category})`);
        });
      }
    } else {
      console.log(`ℹ️  ${seedResult.message}`);
    }
    
    console.log('\n🎉 Setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Refresh your browser (Ctrl+R or F5)');
    console.log('   2. Images should now appear on both web and desktop');
    console.log('   3. Any changes you make will sync automatically\n');
    
    console.log('🔄 Synchronization:');
    console.log('   - Changes sync every 30 seconds');
    console.log('   - Works across web, desktop, and mobile');
    console.log('   - Offline fallback enabled\n');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure the server is running: npm start');
    console.log('   2. Check that port 5000 is not blocked');
    console.log('   3. Restart the server and try again\n');
    process.exit(1);
  }
}

// Run setup
setupUtilities();
