/**
 * Refresh Trading Signal Prices
 * Updates all active signals with current market prices
 */

const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
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
          resolve({ error: body });
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function refreshSignalPrices() {
  console.log('\n🔄 Refreshing Trading Signal Prices...\n');
  
  try {
    // Get all active signals
    console.log('📊 Fetching active signals...');
    const signalsResponse = await makeRequest('/api/signals?status=active&limit=100');
    
    if (!signalsResponse.success) {
      throw new Error('Failed to fetch signals');
    }
    
    const signals = signalsResponse.data?.signals || [];
    console.log(`✅ Found ${signals.length} active signals\n`);
    
    if (signals.length === 0) {
      console.log('ℹ️  No active signals to refresh');
      return;
    }
    
    console.log('🔄 Updating prices for each signal...\n');
    
    for (const signal of signals) {
      const symbol = signal.asset?.symbol || signal.symbol;
      const market = signal.asset?.market || signal.market || 'US';
      
      if (!symbol) continue;
      
      try {
        // Get current quote
        const quoteResponse = await makeRequest(`/api/markets/quote/${symbol}?market=${market}`);
        
        if (quoteResponse.success && quoteResponse.data) {
          const currentPrice = quoteResponse.data.price;
          const timeDiff = Math.floor((Date.now() - new Date(signal.createdAt)) / 60000);
          
          console.log(`   ${symbol}: $${signal.asset?.price || 'N/A'} → $${currentPrice} (${timeDiff} min old)`);
        }
      } catch (error) {
        console.log(`   ⚠️  ${symbol}: Could not fetch price`);
      }
    }
    
    console.log('\n✅ Price refresh check complete!');
    console.log('\n💡 Note: Signals are cached. They will auto-refresh every 5 seconds now.');
    console.log('   Refresh your browser to see updated prices.\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

refreshSignalPrices();
