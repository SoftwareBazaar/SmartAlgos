#!/usr/bin/env node

/**
 * Simple script to create mt5_connections table
 * Uses Supabase REST API to execute SQL
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  console.error('\nRequired in .env or Railway variables:');
  console.error('  - SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function createMT5Table() {
  console.log('🚀 Creating mt5_connections table...\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Read SQL file
  const sqlPath = path.join(__dirname, '..', 'database', 'mt5_connections_table.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Split into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

  try {
    // Try to execute via PostgREST REST API
    // Note: Supabase doesn't expose direct SQL execution, so we need to use the management API
    
    // First, check if table exists
    const { error: checkError } = await supabase
      .from('mt5_connections')
      .select('id')
      .limit(1);

    if (!checkError) {
      console.log('✅ Table mt5_connections already exists!');
      return;
    }

    console.log('📝 Table does not exist. Attempting to create...\n');

    // Use Supabase Management API if available
    // This requires the project's access token, not just service role key
    const managementUrl = `${SUPABASE_URL.replace('/rest/v1', '')}/platform/projects/${SUPABASE_URL.split('//')[1].split('.')[0]}/database/sql`;

    console.log('⚠️  Automatic table creation requires Supabase Management API access.');
    console.log('⚠️  This is not available via standard Supabase client.\n');
    console.log('📋 Please create the table manually:\n');
    console.log('   1. Go to: https://app.supabase.com');
    console.log('   2. Select your project');
    console.log('   3. Click "SQL Editor"');
    console.log('   4. Click "New query"');
    console.log('   5. Copy the SQL from: database/mt5_connections_table.sql');
    console.log('   6. Paste and click "Run"\n');
    console.log('📄 Or copy this SQL:\n');
    console.log('─'.repeat(60));
    console.log(sql.substring(0, 500) + '...');
    console.log('─'.repeat(60));
    console.log('\n💡 Tip: The complete SQL is in database/mt5_connections_table.sql\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createMT5Table()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error.message);
    process.exit(1);
  });

