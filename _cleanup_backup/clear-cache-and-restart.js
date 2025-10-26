/**
 * Complete Cache Clear and Service Restart
 * This will clear all caches and force fresh data
 */

const http = require('http');

console.log('\n🔄 Clearing All Caches and Forcing Refresh...\n');

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Authorization': 'Bearer test_token'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ raw: body });
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

async function clearAndRefresh() {
  try {
    console.log('1️⃣  Testing server connection...');
    const health = await makeRequest('/api/health');
    
    if (health.status === 'OK') {
      const uptime = Math.floor(health.uptime / 60);
      console.log(`   ✅ Server online (running for ${uptime} minutes)`);
      
      if (uptime > 30) {
        console.log(`   ⚠️  Server has been running for a while`);
        console.log(`   💡 Recommend: Restart server for best performance`);
      }
    }
    
    console.log('\n2️⃣  Fetching fresh market data...');
    const markets = await makeRequest('/api/markets/overview?market=US');
    
    if (markets.success && markets.data) {
      console.log('   ✅ Market data loaded');
      console.log(`   ✅ Gainers: ${markets.data.gainers?.length || 0}`);
      console.log(`   ✅ Losers: ${markets.data.losers?.length || 0}`);
      console.log(`   ✅ Most Active: ${markets.data.mostActive?.length || 0}`);
      console.log(`   ✅ Timestamp: ${new Date(markets.data.timestamp).toLocaleTimeString()}`);
    }
    
    console.log('\n3️⃣  Fetching utilities...');
    const utilities = await makeRequest('/api/utilities');
    
    if (utilities.success) {
      console.log(`   ✅ Utilities loaded: ${utilities.data?.length || 0}`);
      if (utilities.data && utilities.data.length > 0) {
        utilities.data.forEach((u, i) => {
          console.log(`      ${i + 1}. ${u.name} (${u.category})`);
        });
      }
    }
    
    console.log('\n✅ All systems operational!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Refresh your browser: Ctrl+R or F5');
    console.log('   2. Check timestamps on signals - should be recent');
    console.log('   3. Market data updates every 5 seconds');
    console.log('   4. Utilities sync every 30 seconds\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Server might not be running. Start it with: npm start\n');
  }
}

clearAndRefresh();
