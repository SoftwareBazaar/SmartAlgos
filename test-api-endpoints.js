/**
 * Test API Endpoints - Verify FMP and GNews Integration
 */

const axios = require('axios');

const BASE_URL = 'https://web-production-fdb58.up.railway.app';

async function testEndpoint(name, url) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    
    const response = await axios.get(url, { timeout: 10000 });
    
    if (response.data.success) {
      console.log(`   ✅ SUCCESS`);
      
      // Show sample data
      if (response.data.data) {
        const dataCount = Array.isArray(response.data.data) 
          ? response.data.data.length 
          : 'N/A';
        console.log(`   📊 Data Count: ${dataCount}`);
        
        if (Array.isArray(response.data.data) && response.data.data.length > 0) {
          const sample = response.data.data[0];
          console.log(`   📄 Sample:`, JSON.stringify(sample, null, 2).substring(0, 200) + '...');
        }
      }
      
      return true;
    } else {
      console.log(`   ❌ FAILED: ${response.data.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, JSON.stringify(error.response.data, null, 2));
    }
    return false;
  }
}

async function runTests() {
  console.log('🚀 API Endpoint Tests - FMP & GNews Integration\n');
  console.log('═══════════════════════════════════════════════\n');
  
  const tests = [
    {
      name: 'Health Check',
      url: `${BASE_URL}/api/health`
    },
    {
      name: 'Economic Calendar - Today',
      url: `${BASE_URL}/api/economic-calendar/today`
    },
    {
      name: 'Economic Calendar - Tomorrow',
      url: `${BASE_URL}/api/economic-calendar/tomorrow`
    },
    {
      name: 'Economic Calendar - This Week',
      url: `${BASE_URL}/api/economic-calendar/week`
    },
    {
      name: 'Economic Calendar - High Impact',
      url: `${BASE_URL}/api/economic-calendar/high-impact`
    },
    {
      name: 'Economic Calendar - Summary',
      url: `${BASE_URL}/api/economic-calendar/summary`
    },
    {
      name: 'Market News (All Sources)',
      url: `${BASE_URL}/api/economic-calendar/news?limit=5`
    },
    {
      name: 'Breaking News (GNews)',
      url: `${BASE_URL}/api/economic-calendar/breaking?limit=3`
    },
    {
      name: 'Stock News - AAPL,TSLA',
      url: `${BASE_URL}/api/economic-calendar/stock-news/AAPL,TSLA?limit=3`
    },
    {
      name: 'Market Data - US Stocks',
      url: `${BASE_URL}/api/markets/stocks`
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await testEndpoint(test.name, test.url);
    if (result) {
      passed++;
    } else {
      failed++;
    }
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n═══════════════════════════════════════════════');
  console.log('\n📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  console.log('\n═══════════════════════════════════════════════\n');
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Your APIs are working perfectly!\n');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.\n');
    console.log('Common issues:');
    console.log('  - Missing API keys in Railway environment variables');
    console.log('  - Railway still deploying (wait 2-3 minutes after git push)');
    console.log('  - API rate limits reached\n');
  }
}

// Run tests
runTests().catch(console.error);

