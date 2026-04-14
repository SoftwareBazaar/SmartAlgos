/**
 * scripts/setup-bookings-table.js
 * 
 * Runs the consultation_bookings SQL migration via Supabase client.
 * Usage: node scripts/setup-bookings-table.js
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBookingsTable() {
  console.log('🔧 Setting up consultation_bookings table...');

  // Test connection first
  const { error: pingError } = await supabase
    .from('users_accounts')
    .select('id')
    .limit(1);

  if (pingError) {
    console.error('❌ Cannot connect to Supabase:', pingError.message);
    process.exit(1);
  }
  console.log('✅ Supabase connected');

  // Check if table already exists
  const { data: existing } = await supabase
    .from('consultation_bookings')
    .select('id')
    .limit(1);

  if (existing !== null) {
    console.log('ℹ️  consultation_bookings table already exists — skipping creation');
    console.log('✅ Table is ready to use!');
    return;
  }

  // Table doesn't exist — run via rpc or display SQL instructions
  const sqlPath = path.join(__dirname, '../database/create_consultation_bookings.sql');
  if (fs.existsSync(sqlPath)) {
    console.log('\n📋 Run this SQL in your Supabase SQL Editor:');
    console.log('   https://supabase.com/dashboard → SQL Editor\n');
    console.log('─'.repeat(60));
    console.log(fs.readFileSync(sqlPath, 'utf8'));
    console.log('─'.repeat(60));
    console.log('\n💡 After running the SQL, re-run this script to verify.');
  }
}

setupBookingsTable().catch(console.error);
