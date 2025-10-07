/**
 * Environment Variables Checker
 * Tests what API keys are available
 */

const gnewsService = require('./services/gnewsService');
const fmpService = require('./services/fmpService');

console.log('\n🔐 API Keys Status Check\n');
console.log('═══════════════════════════════════════════════\n');

// Check environment variables
const envVars = {
  'FMP_API_KEY': process.env.FMP_API_KEY,
  'GNEWS_API_KEY': process.env.GNEWS_API_KEY,
  'ALPHA_VANTAGE_API_KEY': process.env.ALPHA_VANTAGE_API_KEY,
  'POLYGON_API_KEY': process.env.POLYGON_API_KEY
};

console.log('📋 Environment Variables:\n');
Object.entries(envVars).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  const display = value 
    ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}` 
    : 'NOT SET';
  console.log(`${status} ${key}: ${display}`);
});

console.log('\n═══════════════════════════════════════════════\n');

// Test GNews API
async function testGNewsAPI() {
  console.log('🧪 Testing GNews API...\n');
  
  try {
    const health = await gnewsService.healthCheck();
    if (health.status === 'ok') {
      console.log('✅ GNews API: Working');
      console.log(`   API Key Valid: ${health.apiKeyValid}`);
      
      // Try to fetch breaking news
      try {
        const news = await gnewsService.getBreakingNews({ limit: 2 });
        console.log(`   Breaking News: ${news.length} articles fetched`);
        if (news.length > 0) {
          console.log(`   Latest: "${news[0].title}"`);
        }
      } catch (newsError) {
        console.log(`   ⚠️  Error fetching news: ${newsError.message}`);
      }
    } else {
      console.log('❌ GNews API: Failed');
      console.log(`   Error: ${health.message}`);
    }
  } catch (error) {
    console.log('❌ GNews API: Error');
    console.log(`   ${error.message}`);
  }
}

// Test FMP API
async function testFMPAPI() {
  console.log('\n🧪 Testing FMP API...\n');
  
  try {
    const quote = await fmpService.getStockQuote('AAPL');
    if (quote) {
      console.log('✅ FMP API: Working');
      console.log(`   Stock: ${quote.symbol}`);
      console.log(`   Price: $${quote.price}`);
      console.log(`   Change: ${quote.changesPercentage}%`);
    } else {
      console.log('❌ FMP API: No data returned');
    }
  } catch (error) {
    console.log('❌ FMP API: Error');
    console.log(`   ${error.message}`);
  }
}

// Run all tests
async function runAllTests() {
  await testGNewsAPI();
  await testFMPAPI();
  
  console.log('\n═══════════════════════════════════════════════\n');
  console.log('💡 If you see ❌ NOT SET:');
  console.log('   1. Go to Railway Dashboard');
  console.log('   2. Click your service → Variables tab');
  console.log('   3. Add missing keys exactly as shown above');
  console.log('   4. Wait 2-3 minutes for redeploy\n');
  console.log('💡 If you see keys but ❌ API Failed:');
  console.log('   1. Check if the API key is valid');
  console.log('   2. Verify you copied the complete key');
  console.log('   3. Make sure there are no extra spaces\n');
}

runAllTests().catch(console.error);

