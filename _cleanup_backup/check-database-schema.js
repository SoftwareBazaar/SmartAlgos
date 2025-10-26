#!/usr/bin/env node

/**
 * Check Database Schema Script
 * This script checks the actual database schema to understand the column names
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://ncikobfahncdgwvkfivz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseSchema() {
  console.log('🔍 Checking database schema...');
  
  try {
    // Get all EAs with all columns
    const { data: eas, error: easError } = await supabase
      .from('expert_advisors')
      .select('*')
      .limit(1);

    if (easError) {
      console.error('❌ Error fetching EAs:', easError);
      return;
    }

    if (eas && eas.length > 0) {
      console.log('📋 Available columns in expert_advisors table:');
      Object.keys(eas[0]).forEach(column => {
        console.log(`   - ${column}: ${typeof eas[0][column]}`);
      });
    } else {
      console.log('📋 No EAs found in database');
    }

    // Check subscriptions table
    const { data: subs, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(1);

    if (subError) {
      console.error('❌ Error fetching subscriptions:', subError);
    } else if (subs && subs.length > 0) {
      console.log('\n📋 Available columns in subscriptions table:');
      Object.keys(subs[0]).forEach(column => {
        console.log(`   - ${column}: ${typeof subs[0][column]}`);
      });
    } else {
      console.log('\n📋 No subscriptions found in database');
    }

  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

// Run the schema check
checkDatabaseSchema()
  .then(() => {
    console.log('\n✨ Database schema check completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
