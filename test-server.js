const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Test server connection
async function testServer() {
  console.log('🧪 Testing server components...');
  
  // Test 1: Environment variables
  console.log('1. Testing environment variables...');
  if (!process.env.JWT_SECRET) {
    console.log('❌ JWT_SECRET not found');
    return false;
  }
  if (!process.env.SUPABASE_URL) {
    console.log('❌ SUPABASE_URL not found');
    return false;
  }
  if (!process.env.SUPABASE_ANON_KEY) {
    console.log('❌ SUPABASE_ANON_KEY not found');
    return false;
  }
  console.log('✅ Environment variables loaded');
  
  // Test 2: Supabase connection
  console.log('2. Testing Supabase connection...');
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      return false;
    }
    console.log('✅ Supabase connection successful');
  } catch (error) {
    console.log('❌ Supabase connection error:', error.message);
    return false;
  }
  
  // Test 3: Database service
  console.log('3. Testing database service...');
  try {
    const databaseService = require('./services/databaseService');
    const user = await databaseService.getUserByEmail('admin@smartalgos.com');
    if (user) {
      console.log('✅ Database service working, admin user found');
    } else {
      console.log('⚠️  Database service working, but admin user not found');
    }
  } catch (error) {
    console.log('❌ Database service error:', error.message);
    return false;
  }
  
  // Test 4: Auth routes
  console.log('4. Testing auth routes...');
  try {
    const authRoutes = require('./routes/auth');
    console.log('✅ Auth routes loaded successfully');
  } catch (error) {
    console.log('❌ Auth routes error:', error.message);
    return false;
  }
  
  console.log('\n🎉 All server components are working correctly!');
  console.log('\n📋 Next steps:');
  console.log('1. Start the server: npm run dev');
  console.log('2. Test authentication: node test-auth.js');
  console.log('3. Access the app at: http://localhost:3000');
  
  return true;
}

// Run the test
testServer().catch(console.error);
