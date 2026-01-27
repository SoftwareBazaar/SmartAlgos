/**
 * Market APIs Test Script
 * Tests Polygon, Alpha Vantage, and Marketaux APIs
 */

const axios = require('axios');
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testPolygonAPI() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('  🔷 TESTING POLYGON API', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  const apiKey = process.env.POLYGON_API_KEY;
  
  if (!apiKey || apiKey.includes('your_') || apiKey.length < 20) {
    log('❌ Polygon API Key: NOT CONFIGURED', 'red');
    log('   Please add POLYGON_API_KEY to your .env file', 'yellow');
    return { success: false, provider: 'Polygon' };
  }
  
  log(`✅ Polygon API Key: ${apiKey.substring(0, 15)}...`, 'green');
  
  try {
    // Test 1: Market Status
    log('\n📊 Test 1: Market Status');
    const statusUrl = `https://api.polygon.io/v1/marketstatus/now?apiKey=${apiKey}`;
    const statusResponse = await axios.get(statusUrl);
    
    if (statusResponse.data) {
      log(`   ✅ Market Status: ${statusResponse.data.market}`, 'green');
      log(`   ✅ Server Time: ${statusResponse.data.serverTime}`, 'green');
    }
    
    // Test 2: Stock Quote (AAPL)
    log('\n📈 Test 2: Stock Quote (AAPL)');
    const quoteUrl = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/AAPL?apiKey=${apiKey}`;
    const quoteResponse = await axios.get(quoteUrl);
    
    if (quoteResponse.data && quoteResponse.data.ticker) {
      const ticker = quoteResponse.data.ticker;
      log(`   ✅ Symbol: ${ticker.ticker}`, 'green');
      log(`   ✅ Last Price: $${ticker.day?.c || ticker.lastTrade?.p || 'N/A'}`, 'green');
      log(`   ✅ Change: ${ticker.todaysChangePerc?.toFixed(2) || 'N/A'}%`, 'green');
    }
    
    // Test 3: Market Aggregates
    log('\n📊 Test 3: Market Aggregates (Last Trading Day)');
    const date = new Date();
    date.setDate(date.getDate() - 3); // Go back 3 days to ensure we get a trading day
    const dateStr = date.toISOString().split('T')[0];
    const aggUrl = `https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/${dateStr}/${dateStr}?apiKey=${apiKey}`;
    const aggResponse = await axios.get(aggUrl);
    
    if (aggResponse.data && aggResponse.data.results) {
      log(`   ✅ Aggregates data available`, 'green');
      log(`   ✅ Results count: ${aggResponse.data.results.length}`, 'green');
    }
    
    log('\n✅ POLYGON API: WORKING PERFECTLY!', 'green');
    return { success: true, provider: 'Polygon' };
    
  } catch (error) {
    log('\n❌ POLYGON API: FAILED', 'red');
    log(`   Error: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Message: ${error.response.data?.error || error.response.data?.message || 'Unknown'}`, 'red');
    }
    return { success: false, provider: 'Polygon', error: error.message };
  }
}

async function testMarketauxAPI() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('  📰 TESTING MARKETAUX API', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  const apiKey = process.env.MARKETAUX_API_KEY;
  
  if (!apiKey || apiKey.includes('your_') || apiKey.length < 20) {
    log('⚠️  Marketaux API Key: NOT CONFIGURED', 'yellow');
    log('   Marketaux is optional for news data', 'yellow');
    log('   Add MARKETAUX_API_KEY to your .env file if you want news integration', 'yellow');
    return { success: false, provider: 'Marketaux', optional: true };
  }
  
  log(`✅ Marketaux API Key: ${apiKey.substring(0, 15)}...`, 'green');
  
  try {
    // Test: Get latest financial news
    log('\n📰 Test: Latest Financial News');
    const newsUrl = `https://api.marketaux.com/v1/news/all?api_token=${apiKey}&symbols=AAPL,TSLA&limit=5&language=en`;
    const newsResponse = await axios.get(newsUrl);
    
    if (newsResponse.data && newsResponse.data.data) {
      log(`   ✅ News articles found: ${newsResponse.data.data.length}`, 'green');
      if (newsResponse.data.data.length > 0) {
        log(`   ✅ Latest: ${newsResponse.data.data[0].title.substring(0, 50)}...`, 'green');
      }
    }
    
    log('\n✅ MARKETAUX API: WORKING PERFECTLY!', 'green');
    return { success: true, provider: 'Marketaux' };
    
  } catch (error) {
    log('\n❌ MARKETAUX API: FAILED', 'red');
    log(`   Error: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Message: ${error.response.data?.message || 'Unknown'}`, 'red');
    }
    return { success: false, provider: 'Marketaux', error: error.message };
  }
}

async function testAlphaVantageAPI() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('  📊 TESTING ALPHA VANTAGE API', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  
  if (!apiKey || apiKey.includes('your_') || apiKey.length < 10) {
    log('❌ Alpha Vantage API Key: NOT CONFIGURED', 'red');
    log('   Please add ALPHA_VANTAGE_API_KEY to your .env file', 'yellow');
    return { success: false, provider: 'Alpha Vantage' };
  }
  
  log(`✅ Alpha Vantage API Key: ${apiKey}`, 'green');
  
  try {
    // Test: Get stock quote
    log('\n📈 Test: Stock Quote (IBM)');
    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=${apiKey}`;
    const quoteResponse = await axios.get(quoteUrl);
    
    if (quoteResponse.data && quoteResponse.data['Global Quote']) {
      const quote = quoteResponse.data['Global Quote'];
      log(`   ✅ Symbol: ${quote['01. symbol']}`, 'green');
      log(`   ✅ Price: $${quote['05. price']}`, 'green');
      log(`   ✅ Change: ${quote['10. change percent']}`, 'green');
    } else if (quoteResponse.data?.Note) {
      log(`   ⚠️  API Limit: ${quoteResponse.data.Note}`, 'yellow');
      log('   Free tier has 5 requests/minute limit', 'yellow');
    }
    
    log('\n✅ ALPHA VANTAGE API: WORKING!', 'green');
    return { success: true, provider: 'Alpha Vantage' };
    
  } catch (error) {
    log('\n❌ ALPHA VANTAGE API: FAILED', 'red');
    log(`   Error: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
    }
    return { success: false, provider: 'Alpha Vantage', error: error.message };
  }
}

async function runTests() {
  console.clear();
  log('\n╔══════════════════════════════════════════╗', 'cyan');
  log('║   MARKET DATA APIs TESTING SUITE        ║', 'cyan');
  log('╚══════════════════════════════════════════╝', 'cyan');
  
  const results = [];
  
  // Test all APIs
  results.push(await testPolygonAPI());
  results.push(await testAlphaVantageAPI());
  results.push(await testMarketauxAPI());
  
  // Summary
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('  📊 TEST SUMMARY', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  const working = results.filter(r => r.success);
  const failed = results.filter(r => !r.success && !r.optional);
  const optional = results.filter(r => !r.success && r.optional);
  
  log(`\n✅ Working: ${working.length}/${results.length}`, 'green');
  working.forEach(r => log(`   - ${r.provider}`, 'green'));
  
  if (failed.length > 0) {
    log(`\n❌ Failed: ${failed.length}`, 'red');
    failed.forEach(r => log(`   - ${r.provider}: ${r.error || 'Configuration missing'}`, 'red'));
  }
  
  if (optional.length > 0) {
    log(`\n⚠️  Optional (Not Configured): ${optional.length}`, 'yellow');
    optional.forEach(r => log(`   - ${r.provider}`, 'yellow'));
  }
  
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  if (working.length > 0) {
    log('\n🎉 Your market data APIs are configured!', 'green');
    log('You can now fetch real-time market data.', 'green');
  } else {
    log('\n⚠️  No market APIs are working.', 'yellow');
    log('Please check your API keys in the .env file.', 'yellow');
  }
  
  log('\n📝 API Configuration:');
  log('   - POLYGON_API_KEY: Primary market data provider');
  log('   - ALPHA_VANTAGE_API_KEY: Backup provider (free tier)');
  log('   - MARKETAUX_API_KEY: News provider (optional)');
  log('');
}

runTests();
