/**
 * Platform Health Check Script
 * Tests critical functionality before launch
 */

const apiClient = require('./lib/apiClient');

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

async function testEndpoint(name, url, method = 'GET', data = null) {
  try {
    log(`\n🧪 Testing: ${name}`, 'cyan');
    log(`   URL: ${url}`, 'blue');
    
    const config = { method, url };
    if (data) config.data = data;
    
    const response = await apiClient(config);
    
    if (response.status >= 200 && response.status < 300) {
      log(`   ✅ PASS - Status: ${response.status}`, 'green');
      return true;
    } else {
      log(`   ❌ FAIL - Status: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`   ❌ ERROR - ${error.message}`, 'red');
    return false;
  }
}

async function runHealthChecks() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🚀 PLATFORM HEALTH CHECK', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Test 1: Health endpoint
  results.total++;
  if (await testEndpoint('Health Check', '/api/health')) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 2: EA Marketplace
  results.total++;
  if (await testEndpoint('EA Marketplace', '/api/eas')) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 3: Utilities
  results.total++;
  if (await testEndpoint('Utilities', '/api/utilities')) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Test 4: Payment plans
  results.total++;
  if (await testEndpoint('Payment Plans', '/api/subscriptions/plans')) {
    results.passed++;
  } else {
    results.failed++;
  }

  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`\nTotal Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%\n`, 
      results.failed === 0 ? 'green' : 'yellow');

  if (results.failed === 0) {
    log('✅ ALL TESTS PASSED - Platform is healthy!', 'green');
  } else {
    log('⚠️  SOME TESTS FAILED - Review errors above', 'yellow');
  }

  log('\n' + '='.repeat(60) + '\n', 'cyan');

  return results.failed === 0;
}

// Run if called directly
if (require.main === module) {
  runHealthChecks()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`\n❌ Fatal error: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { runHealthChecks, testEndpoint };
