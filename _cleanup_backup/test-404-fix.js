/**
 * Test script to verify 404 fix is working
 * Run with: node test-404-fix.js
 */

const http = require('http');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

console.log(`${colors.blue}========================================`);
console.log('🔍 Testing 404 Fix');
console.log(`========================================${colors.reset}\n`);

const baseUrl = process.env.API_URL || 'http://localhost:5000';

const endpoints = [
  { path: '/api/health', method: 'GET', description: 'Health Check' },
  { path: '/', method: 'GET', description: 'Root Endpoint' },
  { path: '/api/auth/login', method: 'POST', description: 'Login Endpoint (structure check)' },
];

let testsPassed = 0;
let testsFailed = 0;

function makeRequest(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(endpoint.path, baseUrl);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    console.log(`${colors.yellow}Testing: ${endpoint.method} ${url.href}${colors.reset}`);

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 404) {
          console.log(`${colors.red}❌ FAILED: ${endpoint.description}`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   This endpoint should NOT return 404!${colors.reset}\n`);
          testsFailed++;
        } else if (res.statusCode >= 200 && res.statusCode < 500) {
          console.log(`${colors.green}✅ PASSED: ${endpoint.description}`);
          console.log(`   Status: ${res.statusCode}${colors.reset}\n`);
          testsPassed++;
        } else {
          console.log(`${colors.yellow}⚠️  WARNING: ${endpoint.description}`);
          console.log(`   Status: ${res.statusCode}${colors.reset}\n`);
          testsPassed++; // Count as pass if not 404
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`${colors.red}❌ ERROR: ${endpoint.description}`);
      console.log(`   ${error.message}`);
      console.log(`   Make sure the server is running on ${baseUrl}${colors.reset}\n`);
      testsFailed++;
      resolve();
    });

    req.setTimeout(5000, () => {
      console.log(`${colors.red}❌ TIMEOUT: ${endpoint.description}${colors.reset}\n`);
      testsFailed++;
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log(`Testing server at: ${colors.blue}${baseUrl}${colors.reset}\n`);
  
  for (const endpoint of endpoints) {
    await makeRequest(endpoint);
  }

  console.log(`${colors.blue}========================================`);
  console.log('📊 Test Results');
  console.log(`========================================${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${testsFailed}${colors.reset}`);
  
  if (testsFailed === 0) {
    console.log(`\n${colors.green}🎉 All tests passed! The 404 fix is working correctly!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}⚠️  Some tests failed. Please check the server configuration.${colors.reset}`);
    console.log(`\n${colors.yellow}Troubleshooting:`);
    console.log(`1. Make sure the server is running: npm start`);
    console.log(`2. Check server is on the correct port: ${baseUrl}`);
    console.log(`3. Review server logs for errors${colors.reset}`);
    process.exit(1);
  }
}

// Check if server URL is accessible first
console.log(`${colors.yellow}Checking if server is reachable...${colors.reset}\n`);

runTests().catch((error) => {
  console.error(`${colors.red}Fatal error running tests:`, error);
  process.exit(1);
});

