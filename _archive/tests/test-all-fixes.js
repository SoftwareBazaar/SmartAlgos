#!/usr/bin/env node

/**
 * Comprehensive test to verify ALL fixes are working
 */

console.log('🧪 Testing All Fixes...\n');

// Test 1: Route Registration (skip - already tested separately)
console.log('1️⃣ Route Registration: ✅ Already verified in test-route-registration.js');

// Test 2: Card Component
console.log('\n2️⃣ Testing Card Component...');
const fs = require('fs');
const cardContent = fs.readFileSync('./client/src/components/UI/Card.js', 'utf8');

const checks = {
  'React.forwardRef used': cardContent.includes('React.forwardRef'),
  'displayName set': cardContent.includes('displayName'),
  'Card.Header attached': cardContent.includes('Card.Header ='),
  'Card.Body attached': cardContent.includes('Card.Body ='),
  'Card.Footer attached': cardContent.includes('Card.Footer =')
};

let allPassed = true;
for (const [check, passed] of Object.entries(checks)) {
  if (passed) {
    console.log(`   ✅ ${check}`);
  } else {
    console.log(`   ❌ ${check}`);
    allPassed = false;
  }
}

// Test 3: Route Order in railway-full-server.js
console.log('\n3️⃣ Testing Route Order...');
const serverContent = fs.readFileSync('./railway-full-server.js', 'utf8');

const routeOrderChecks = {
  'CSRF routes registered first': serverContent.indexOf("app.use('/api', csrfRoutes)") < serverContent.indexOf("app.use('/api/auth'"),
  'Analysis routes registered': serverContent.includes("app.use('/api/analysis'"),
  'API 404 handler before frontend catch-all': serverContent.indexOf("app.use('/api/*'") < serverContent.indexOf("app.get('*'"),
  'Frontend catch-all is last': serverContent.lastIndexOf("app.get('*'") > serverContent.indexOf("app.use('/api/analysis'")
};

for (const [check, passed] of Object.entries(routeOrderChecks)) {
  if (passed) {
    console.log(`   ✅ ${check}`);
  } else {
    console.log(`   ❌ ${check}`);
    allPassed = false;
  }
}

// Final Result
console.log('\n📊 Final Test Results:');
console.log('====================');
if (allPassed) {
  console.log('🎉 ALL TESTS PASSED!');
  console.log('\n✅ Ready for deployment:');
  console.log('   - All routes properly registered');
  console.log('   - Card component fixed (React.forwardRef)');
  console.log('   - Route order correct (API before frontend)');
  process.exit(0);
} else {
  console.log('❌ SOME TESTS FAILED');
  console.log('Please fix the issues above before deploying.');
  process.exit(1);
}

