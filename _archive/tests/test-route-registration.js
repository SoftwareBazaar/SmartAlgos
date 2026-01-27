#!/usr/bin/env node

/**
 * Test script to verify all critical routes are properly registered
 * This prevents 404 errors before deployment
 */

const express = require('express');
const app = express();

console.log('🧪 Testing Route Registration...\n');

// Track registered routes
const registeredRoutes = [];

// Mock app.use to track route registration
const originalUse = app.use.bind(app);
app.use = function(...args) {
  if (args[0] && typeof args[0] === 'string' && args[0].startsWith('/api')) {
    registeredRoutes.push(args[0]);
    console.log(`✅ Route registered: ${args[0]}`);
  }
  return originalUse(...args);
};

// Test route loading
const testRoutes = {
  'CSRF Routes': () => {
    try {
      const csrfRoutes = require('./routes/csrf');
      app.use('/api', csrfRoutes);
      return true;
    } catch (error) {
      console.error('❌ CSRF routes failed:', error.message);
      return false;
    }
  },
  'Auth Routes': () => {
    try {
      const authRoutes = require('./routes/auth');
      app.use('/api/auth', authRoutes);
      return true;
    } catch (error) {
      console.error('❌ Auth routes failed:', error.message);
      return false;
    }
  },
  'Analysis Routes': () => {
    try {
      const analysisRoutes = require('./routes/analysis');
      app.use('/api/analysis', analysisRoutes);
      return true;
    } catch (error) {
      console.error('❌ Analysis routes failed:', error.message);
      return false;
    }
  }
};

console.log('📦 Testing route modules...\n');

const results = {};
for (const [name, test] of Object.entries(testRoutes)) {
  console.log(`Testing ${name}...`);
  results[name] = test();
  console.log('');
}

// Verify critical routes exist
console.log('\n🔍 Verifying critical endpoints...\n');

const criticalRoutes = [
  '/api/csrf-token',
  '/api/auth/login',
  '/api/analysis/economic-calendar'
];

// Check if routes are registered
const csrfRouter = require('./routes/csrf');
const authRouter = require('./routes/auth');
const analysisRouter = require('./routes/analysis');

const routeChecks = {
  'CSRF Token': () => {
    const routes = csrfRouter.stack || [];
    return routes.some(layer => layer.route && layer.route.path === '/csrf-token');
  },
  'Auth Login': () => {
    const routes = authRouter.stack || [];
    return routes.some(layer => layer.route && layer.route.path === '/login' && layer.route.methods.post);
  },
  'Economic Calendar': () => {
    const routes = analysisRouter.stack || [];
    return routes.some(layer => layer.route && layer.route.path === '/economic-calendar');
  }
};

let allPassed = true;
for (const [name, check] of Object.entries(routeChecks)) {
  const exists = check();
  if (exists) {
    console.log(`✅ ${name} endpoint exists`);
  } else {
    console.error(`❌ ${name} endpoint NOT FOUND`);
    allPassed = false;
  }
}

console.log('\n📊 Test Results:');
console.log('================');
console.log(`Route Loading: ${Object.values(results).every(r => r) ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Endpoint Verification: ${allPassed ? '✅ PASS' : '❌ FAIL'}`);

if (allPassed && Object.values(results).every(r => r)) {
  console.log('\n🎉 All tests passed! Routes are properly configured.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please check the errors above.');
  process.exit(1);
}
