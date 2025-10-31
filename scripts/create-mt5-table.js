#!/usr/bin/env node

/**
 * Automatically create mt5_connections table in Supabase
 * This script uses Supabase's REST API to execute SQL
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Required environment variables:');
  console.error('  - SUPABASE_URL or VITE_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

async function createMT5Table() {
  console.log('🚀 Creating mt5_connections table in Supabase...\n');

  // Read SQL file
  const sqlPath = path.join(__dirname, '..', 'database', 'mt5_connections_table.sql');
  let sql;
  
  try {
    sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('✅ SQL file loaded:', sqlPath);
  } catch (error) {
    console.error('❌ Failed to read SQL file:', error.message);
    process.exit(1);
  }

  // Create Supabase client with service role key (has admin privileges)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('\n📝 Executing SQL...\n');

    // Split SQL by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (!statement || statement.startsWith('--')) {
        continue;
      }

      try {
        // Use Supabase's RPC to execute SQL (if available) or use REST API
        // Note: Supabase client doesn't have direct SQL execution, so we use the REST API
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          },
          body: JSON.stringify({ sql: statement })
        });

        if (!response.ok) {
          // Try alternative: Execute via PostgREST directly
          console.log(`⚠️  Attempt ${i + 1}: Using alternative method...`);
          
          // Since Supabase doesn't expose exec_sql by default, we'll use a workaround
          // Create the table using the management API or SQL editor API
          console.log('ℹ️  Note: Supabase REST API doesn\'t support direct SQL execution.');
          console.log('ℹ️  You need to run the SQL manually in Supabase SQL Editor.');
          console.log('\n📋 Quick Steps:');
          console.log('1. Go to: https://app.supabase.com');
          console.log('2. Select your project');
          console.log('3. Click "SQL Editor"');
          console.log('4. Click "New query"');
          console.log('5. Copy the SQL from: database/mt5_connections_table.sql');
          console.log('6. Paste and click "Run"\n');
          break;
        }

        successCount++;
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Statement ${i + 1} failed:`, error.message);
      }
    }

    // Alternative: Try using Supabase client's direct query
    console.log('\n🔄 Trying alternative method using Supabase client...\n');
    
    try {
      // Try to create table using raw SQL through Supabase
      // This might work if we have the right permissions
      const { data, error } = await supabase.rpc('exec_sql', { sql: sql });

      if (error) {
        // Check if table already exists
        const { data: checkData, error: checkError } = await supabase
          .from('mt5_connections')
          .select('id')
          .limit(1);

        if (!checkError) {
          console.log('✅ Table mt5_connections already exists!');
          return;
        }

        throw error;
      }

      console.log('✅ Table created successfully via RPC!');
      return;
    } catch (rpcError) {
      console.log('⚠️  RPC method not available. Using manual approach...\n');
    }

    // Final check: Try to query the table
    console.log('🔍 Checking if table exists...\n');
    const { data: testData, error: testError } = await supabase
      .from('mt5_connections')
      .select('id')
      .limit(1);

    if (!testError) {
      console.log('✅ Table mt5_connections exists and is accessible!');
      console.log('\n🎉 Setup complete! You can now use MT5 connections.');
      return;
    }

    // If we get here, table doesn't exist and we couldn't create it automatically
    console.log('\n❌ Could not create table automatically.');
    console.log('\n📋 Manual Setup Required:');
    console.log('─────────────────────────────────────────────');
    console.log('1. Go to: https://app.supabase.com');
    console.log('2. Select your project');
    console.log('3. Click "SQL Editor" in the sidebar');
    console.log('4. Click "New query"');
    console.log('5. Copy contents of: database/mt5_connections_table.sql');
    console.log('6. Paste into the editor');
    console.log('7. Click "Run" (or press Ctrl+Enter)');
    console.log('─────────────────────────────────────────────\n');

    // Show the SQL so they can copy it
    console.log('📄 SQL to run:\n');
    console.log('─────────────────────────────────────────────');
    console.log(sql);
    console.log('─────────────────────────────────────────────\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n📋 Manual Setup Required:');
    console.log('Copy the SQL from database/mt5_connections_table.sql and run it in Supabase SQL Editor.');
    process.exit(1);
  }
}

// Run the script
createMT5Table()
  .then(() => {
    console.log('\n✅ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

