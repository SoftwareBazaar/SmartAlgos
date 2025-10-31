#!/usr/bin/env node

/**
 * Auto-create mt5_connections table using Supabase Management API
 * This script attempts to create the table programmatically
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

async function createTableViaAPI() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Check if table exists
  try {
    const { error } = await supabase.from('mt5_connections').select('id').limit(1);
    if (!error) {
      console.log('✅ Table mt5_connections already exists!');
      return true;
    }
  } catch (e) {
    // Table doesn't exist, continue
  }

  // Read SQL
  const sqlPath = path.join(__dirname, '..', 'database', 'mt5_connections_table.sql');
  const fullSQL = fs.readFileSync(sqlPath, 'utf8');

  // Create a simplified version that we can execute step by step
  // Since Supabase doesn't allow direct SQL execution via client,
  // we'll create the table structure using the client's schema builder equivalent

  console.log('📝 Creating table via Supabase client...\n');

  try {
    // Try to create via direct insert which will fail but trigger table creation check
    // Actually, we need to use the Supabase dashboard or SQL editor
    
    // Extract just the CREATE TABLE statement
    const createTableMatch = fullSQL.match(/CREATE TABLE[^;]+;/i);
    if (!createTableMatch) {
      throw new Error('Could not parse CREATE TABLE statement');
    }

    console.log('⚠️  Supabase JavaScript client cannot execute raw SQL.');
    console.log('⚠️  You need to create the table using Supabase SQL Editor.\n');
    
    console.log('📋 Quick Steps:');
    console.log('   1. Open: https://app.supabase.com/project/' + SUPABASE_URL.split('//')[1].split('.')[0]);
    console.log('   2. Click "SQL Editor" → "New query"');
    console.log('   3. Copy SQL from: database/mt5_connections_table.sql');
    console.log('   4. Paste and Run\n');

    // Output the SQL for easy copying
    console.log('📄 SQL to copy:\n');
    console.log('─'.repeat(70));
    console.log(fullSQL);
    console.log('─'.repeat(70));

    return false;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Alternative: Create via HTTP request to Supabase Management API
async function createTableViaManagementAPI() {
  // Extract project ref from URL
  const projectRef = SUPABASE_URL.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  if (!projectRef) {
    console.log('⚠️  Could not extract project reference from SUPABASE_URL');
    return false;
  }

  // Read SQL
  const sqlPath = path.join(__dirname, '..', 'database', 'mt5_connections_table.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Supabase Management API endpoint for SQL execution
  const managementAPIUrl = `https://api.supabase.com/v1/projects/${projectRef}/sql`;
  
  // Try using access token (requires SUPABASE_ACCESS_TOKEN)
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.log('⚠️  SUPABASE_ACCESS_TOKEN not found. Cannot use Management API.\n');
    return await createTableViaAPI();
  }

  try {
    console.log('📝 Attempting to create table via Management API...\n');
    
    const response = await fetch(managementAPIUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: sql
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Table created successfully via Management API!');
    return true;
  } catch (error) {
    console.error('❌ Management API failed:', error.message);
    return await createTableViaAPI();
  }
}

// Main execution
(async () => {
  const success = await createTableViaManagementAPI();
  process.exit(success ? 0 : 1);
})();

