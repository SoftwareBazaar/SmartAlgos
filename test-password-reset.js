/**
 * Test Password Reset Functionality
 * 
 * This script tests the complete password reset flow:
 * 1. Request password reset
 * 2. Verify email is sent
 * 3. Test reset endpoint
 */

const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://smartalgosts.com'
  : 'http://localhost:8080';

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

async function testForgotPassword(email) {
  log('\n=== Testing Forgot Password ===', 'cyan');
  log(`Email: ${email}`, 'blue');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
      email
    });
    
    if (response.data.success) {
      log('✓ Password reset email sent successfully', 'green');
      log(`Message: ${response.data.message}`, 'blue');
      return true;
    } else {
      log('✗ Failed to send password reset email', 'red');
      log(`Error: ${response.data.message}`, 'red');
      return false;
    }
  } catch (error) {
    log('✗ Request failed', 'red');
    if (error.response) {
      log(`Status: ${error.response.status}`, 'red');
      log(`Error: ${error.response.data.message || error.message}`, 'red');
    } else {
      log(`Error: ${error.message}`, 'red');
    }
    return false;
  }
}

async function testResetPassword(accessToken, newPassword) {
  log('\n=== Testing Reset Password ===', 'cyan');
  log('Access Token: [REDACTED]', 'blue');
  log(`New Password: ${newPassword.replace(/./g, '*')}`, 'blue');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/reset-password`, {
      accessToken,
      password: newPassword
    });
    
    if (response.data.success) {
      log('✓ Password reset successfully', 'green');
      log(`Message: ${response.data.message}`, 'blue');
      return true;
    } else {
      log('✗ Failed to reset password', 'red');
      log(`Error: ${response.data.message}`, 'red');
      return false;
    }
  } catch (error) {
    log('✗ Request failed', 'red');
    if (error.response) {
      log(`Status: ${error.response.status}`, 'red');
      log(`Error: ${error.response.data.message || error.message}`, 'red');
      if (error.response.data.errors) {
        error.response.data.errors.forEach(err => {
          log(`  - ${err.msg}`, 'red');
        });
      }
    } else {
      log(`Error: ${error.message}`, 'red');
    }
    return false;
  }
}

async function testInvalidEmail() {
  log('\n=== Testing Invalid Email ===', 'cyan');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
      email: 'not-an-email'
    });
    
    log('✗ Should have rejected invalid email', 'red');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('✓ Correctly rejected invalid email', 'green');
      return true;
    } else {
      log('✗ Unexpected error', 'red');
      return false;
    }
  }
}

async function testWeakPassword(accessToken) {
  log('\n=== Testing Weak Password ===', 'cyan');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/reset-password`, {
      accessToken,
      password: 'weak'
    });
    
    log('✗ Should have rejected weak password', 'red');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('✓ Correctly rejected weak password', 'green');
      log('Validation errors:', 'blue');
      if (error.response.data.errors) {
        error.response.data.errors.forEach(err => {
          log(`  - ${err.msg}`, 'yellow');
        });
      }
      return true;
    } else {
      log('✗ Unexpected error', 'red');
      return false;
    }
  }
}

async function runTests() {
  log('\n╔════════════════════════════════════════╗', 'cyan');
  log('║   Password Reset System Test Suite    ║', 'cyan');
  log('╚════════════════════════════════════════╝', 'cyan');
  log(`\nTesting against: ${BASE_URL}`, 'blue');
  
  const results = {
    passed: 0,
    failed: 0
  };
  
  // Test 1: Invalid email format
  log('\n' + '─'.repeat(50), 'cyan');
  const test1 = await testInvalidEmail();
  test1 ? results.passed++ : results.failed++;
  
  // Test 2: Valid forgot password request
  log('\n' + '─'.repeat(50), 'cyan');
  const testEmail = process.argv[2] || 'test@example.com';
  const test2 = await testForgotPassword(testEmail);
  test2 ? results.passed++ : results.failed++;
  
  // Test 3: Weak password validation
  log('\n' + '─'.repeat(50), 'cyan');
  const dummyToken = 'dummy-token-for-validation-test';
  const test3 = await testWeakPassword(dummyToken);
  test3 ? results.passed++ : results.failed++;
  
  // Summary
  log('\n' + '═'.repeat(50), 'cyan');
  log('Test Summary:', 'cyan');
  log(`✓ Passed: ${results.passed}`, 'green');
  log(`✗ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log('═'.repeat(50) + '\n', 'cyan');
  
  if (test2) {
    log('\n📧 Next Steps:', 'yellow');
    log('1. Check your email inbox for the password reset link', 'blue');
    log('2. Click the link to open the reset password page', 'blue');
    log('3. Enter a new password and submit', 'blue');
    log('4. Try logging in with the new password', 'blue');
    log('\nOr test the reset endpoint directly:', 'yellow');
    log(`node test-password-reset.js reset <access_token> <new_password>`, 'blue');
  }
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// Allow testing reset password directly
if (process.argv[2] === 'reset') {
  const accessToken = process.argv[3];
  const newPassword = process.argv[4];
  
  if (!accessToken || !newPassword) {
    log('Usage: node test-password-reset.js reset <access_token> <new_password>', 'yellow');
    log('Example: node test-password-reset.js reset eyJhbGc... MyNewPass123!', 'blue');
    process.exit(1);
  }
  
  testResetPassword(accessToken, newPassword).then(success => {
    process.exit(success ? 0 : 1);
  });
} else {
  runTests();
}
