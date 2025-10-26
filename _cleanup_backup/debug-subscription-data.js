#!/usr/bin/env node

/**
 * Debug Subscription Data Script
 * This script checks the subscription data structure and identifies issues
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

async function debugSubscriptionData() {
  console.log('🔍 Debugging subscription data...');
  
  try {
    // Get all subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (subError) {
      console.error('❌ Error fetching subscriptions:', subError);
      return;
    }

    console.log(`📊 Found ${subscriptions.length} subscriptions`);
    
    if (subscriptions.length > 0) {
      console.log('\n📋 Subscription data structure:');
      const sampleSub = subscriptions[0];
      console.log('Sample subscription:', JSON.stringify(sampleSub, null, 2));
      
      console.log('\n🔑 Key fields:');
      console.log(`   - id: ${sampleSub.id} (type: ${typeof sampleSub.id})`);
      console.log(`   - user_id: ${sampleSub.user_id} (type: ${typeof sampleSub.user_id})`);
      console.log(`   - ea_id: ${sampleSub.ea_id} (type: ${typeof sampleSub.ea_id})`);
      console.log(`   - status: ${sampleSub.status}`);
      console.log(`   - start_date: ${sampleSub.start_date}`);
      console.log(`   - end_date: ${sampleSub.end_date}`);
      
      // Check if subscription has associated EA
      if (sampleSub.ea_id) {
        const { data: ea, error: eaError } = await supabase
          .from('expert_advisors')
          .select('id, name, ea_file_path, set_file_path, manual_file_path, screenshots')
          .eq('id', sampleSub.ea_id)
          .single();
          
        if (eaError) {
          console.error('❌ Error fetching EA:', eaError);
        } else {
          console.log('\n📦 Associated EA:');
          console.log(`   - id: ${ea.id}`);
          console.log(`   - name: ${ea.name}`);
          console.log(`   - ea_file_path: ${ea.ea_file_path || 'None'}`);
          console.log(`   - set_file_path: ${ea.set_file_path || 'None'}`);
          console.log(`   - manual_file_path: ${ea.manual_file_path || 'None'}`);
          console.log(`   - screenshots: ${ea.screenshots ? ea.screenshots.length : 0} items`);
        }
      }
    } else {
      console.log('📋 No subscriptions found in database');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugSubscriptionData()
  .then(() => {
    console.log('\n✨ Subscription data debug completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
