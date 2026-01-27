/**
 * Check M-Pesa and Database Environment Variables
 * Quick diagnostic to see what's configured
 */

require('dotenv').config();

console.log('═══════════════════════════════════════════');
console.log('   ENVIRONMENT CONFIGURATION CHECK');
console.log('═══════════════════════════════════════════\n');

// Check Database Configuration
console.log('📊 DATABASE CONFIGURATION:');
console.log('─────────────────────────────────────────');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const mockAuth = process.env.MOCK_AUTH;

console.log('SUPABASE_URL:', supabaseUrl ? '✅ SET' : '❌ MISSING');
if (supabaseUrl) {
  console.log('  Value:', supabaseUrl);
}

console.log('\nSUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ SET' : '❌ MISSING');
if (supabaseAnonKey) {
  const masked = supabaseAnonKey.substring(0, 20) + '...' + supabaseAnonKey.substring(supabaseAnonKey.length - 10);
  console.log('  Value:', masked);
  console.log('  Length:', supabaseAnonKey.length, 'characters');
}

console.log('\nSUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ SET' : '❌ MISSING');
if (supabaseServiceKey) {
  const masked = supabaseServiceKey.substring(0, 20) + '...' + supabaseServiceKey.substring(supabaseServiceKey.length - 10);
  console.log('  Value:', masked);
  console.log('  Length:', supabaseServiceKey.length, 'characters');
  
  // Check if it's a placeholder
  const placeholderWords = ['your-', 'example', 'changeme', 'replace', 'dummy'];
  const isPlaceholder = placeholderWords.some(word => supabaseServiceKey.toLowerCase().includes(word));
  
  if (isPlaceholder) {
    console.log('  ⚠️  WARNING: Looks like a placeholder! Contains:', placeholderWords.find(word => supabaseServiceKey.toLowerCase().includes(word)));
  } else {
    console.log('  ✅ Looks valid (no placeholder text detected)');
  }
}

console.log('\nMOCK_AUTH:', mockAuth ? `⚠️  SET TO: "${mockAuth}"` : '✅ Not set (good!)');
if (mockAuth && mockAuth.toLowerCase() === 'true') {
  console.log('  ❌ PROBLEM: MOCK_AUTH is set to true!');
  console.log('  FIX: Remove or set MOCK_AUTH=false in .env');
}

console.log('\n');
console.log('🟢 M-PESA CONFIGURATION:');
console.log('─────────────────────────────────────────');

const mpesaConsumerKey = process.env.MPESA_CONSUMER_KEY;
const mpesaConsumerSecret = process.env.MPESA_CONSUMER_SECRET;
const mpesaShortCode = process.env.MPESA_BUSINESS_SHORTCODE;
const mpesaPasskey = process.env.MPESA_PASSKEY;
const mpesaEnv = process.env.MPESA_ENVIRONMENT;
const mpesaCallback = process.env.MPESA_CALLBACK_URL;

console.log('MPESA_CONSUMER_KEY:', mpesaConsumerKey ? '✅ SET' : '❌ MISSING');
if (mpesaConsumerKey) {
  console.log('  Value:', mpesaConsumerKey.substring(0, 10) + '...');
}

console.log('\nMPESA_CONSUMER_SECRET:', mpesaConsumerSecret ? '✅ SET' : '❌ MISSING');
if (mpesaConsumerSecret) {
  console.log('  Value:', mpesaConsumerSecret.substring(0, 10) + '...');
}

console.log('\nMPESA_BUSINESS_SHORTCODE:', mpesaShortCode ? '✅ SET' : '❌ MISSING');
if (mpesaShortCode) {
  console.log('  Value:', mpesaShortCode);
}

console.log('\nMPESA_PASSKEY:', mpesaPasskey ? '✅ SET' : '❌ MISSING');
if (mpesaPasskey) {
  console.log('  Length:', mpesaPasskey.length, 'characters');
}

console.log('\nMPESA_ENVIRONMENT:', mpesaEnv ? `✅ ${mpesaEnv}` : '❌ MISSING');
console.log('MPESA_CALLBACK_URL:', mpesaCallback ? '✅ SET' : '❌ MISSING');
if (mpesaCallback) {
  console.log('  Value:', mpesaCallback);
}

console.log('\n');
console.log('═══════════════════════════════════════════');
console.log('   DIAGNOSIS');
console.log('═══════════════════════════════════════════\n');

let hasIssues = false;

// Check for mock mode triggers
if (mockAuth && mockAuth.toLowerCase() === 'true') {
  console.log('❌ ISSUE: MOCK_AUTH is explicitly set to true');
  console.log('   FIX: Remove or set to false in .env file\n');
  hasIssues = true;
}

if (!supabaseServiceKey) {
  console.log('❌ ISSUE: SUPABASE_SERVICE_ROLE_KEY is missing');
  console.log('   FIX: Add your service_role key to .env file\n');
  hasIssues = true;
} else if (supabaseServiceKey.length < 40) {
  console.log('❌ ISSUE: SUPABASE_SERVICE_ROLE_KEY is too short');
  console.log('   Current length:', supabaseServiceKey.length);
  console.log('   Expected: 150+ characters');
  console.log('   FIX: Copy the full service_role key from Supabase\n');
  hasIssues = true;
} else {
  const placeholderWords = ['your-', 'example', 'changeme', 'replace', 'dummy'];
  const foundPlaceholder = placeholderWords.find(word => supabaseServiceKey.toLowerCase().includes(word));
  
  if (foundPlaceholder) {
    console.log('❌ ISSUE: SUPABASE_SERVICE_ROLE_KEY contains placeholder text');
    console.log('   Found:', foundPlaceholder);
    console.log('   FIX: Replace with real service_role key from Supabase\n');
    hasIssues = true;
  }
}

if (!hasIssues) {
  console.log('✅ ALL CHECKS PASSED!');
  console.log('   Database should connect properly');
  console.log('   M-Pesa should work correctly\n');
  console.log('   If still seeing "Mock mode enabled", try:');
  console.log('   1. Stop the server (Ctrl+C)');
  console.log('   2. Run: npm start');
  console.log('   3. Check logs for "Connected to Supabase"\n');
} else {
  console.log('⚠️  ISSUES FOUND - Fix the above problems and restart server\n');
}

console.log('═══════════════════════════════════════════\n');

