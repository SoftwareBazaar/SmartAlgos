/**
 * Test Market API Endpoints
 * Quick test to see what's being returned
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';
const ALPHA_VANTAGE_KEY = 'GQ1EY8POB5M1TG20';
const POLYGON_KEY = 'zMxIZDCoMru2y18q4ER9QH1NVPb4Dupj';

async function testMarketAPIs() {
  console.log('\n🧪 Testing Market API Endpoints\n');
  console.log('='.repeat(60));

  // Test 1: Alpha Vantage Direct
  console.log('\n1️⃣ Testing Alpha Vantage API directly...');
  try {
    const avResponse = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: 'AAPL',
        apikey: ALPHA_VANTAGE_KEY
      },
      timeout: 10000
    });
    console.log('✅ Alpha Vantage Response:', JSON.stringify(avResponse.data, null, 2));
  } catch (error) {
    console.error('❌ Alpha Vantage Error:', error.message);
  }

  // Test 2: Polygon Direct
  console.log('\n2️⃣ Testing Polygon API directly...');
  try {
    const polygonResponse = await axios.get(`https://api.polygon.io/v2/aggs/ticker/AAPL/prev`, {
      params: {
        apiKey: POLYGON_KEY
      },
      timeout: 10000
    });
    console.log('✅ Polygon Response:', JSON.stringify(polygonResponse.data, null, 2));
  } catch (error) {
    console.error('❌ Polygon Error:', error.message);
  }

  // Test 3: Your Markets Overview Endpoint
  console.log('\n3️⃣ Testing /api/markets/overview endpoint...');
  try {
    const response = await axios.get(`${API_URL}/api/markets/overview`, {
      timeout: 15000
    });
    console.log('✅ Markets Overview Response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Markets Overview Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }

  // Test 4: Check if services are returning data
  console.log('\n4️⃣ Testing market data service directly...');
  try {
    const marketDataService = require('./services/marketDataService');
    
    console.log('Testing US Market Overview...');
    const usData = await marketDataService.getUSMarketOverview();
    console.log('US Data:', JSON.stringify(usData, null, 2));
    
    console.log('\nTesting Crypto Overview...');
    const cryptoData = await marketDataService.getCryptoOverview();
    console.log('Crypto Data:', JSON.stringify(cryptoData, null, 2));
  } catch (error) {
    console.error('❌ Service Error:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Test completed!\n');
}

// Run tests
testMarketAPIs().catch(console.error);
