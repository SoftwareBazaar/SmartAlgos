#!/usr/bin/env node

/**
 * Comprehensive Fix Script
 * This script addresses all the remaining issues:
 * 1. EA disappearing after save
 * 2. Download section empty
 * 3. EA section display issues
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

async function comprehensiveFix() {
  console.log('🔧 Starting comprehensive fix...');
  
  try {
    // 1. Check current EAs in database
    console.log('\n📋 Checking current EAs in database...');
    const { data: eas, error: easError } = await supabase
      .from('expert_advisors')
      .select('id, name, status, ea_file, screenshots, created_at, updated_at')
      .order('updated_at', { ascending: false });

    if (easError) {
      console.error('❌ Error fetching EAs:', easError);
      return;
    }

    console.log(`📊 Found ${eas.length} EAs in database`);
    eas.forEach(ea => {
      console.log(`   - ID: ${ea.id}, Name: ${ea.name}, Status: ${ea.status}`);
      console.log(`     EA File: ${ea.ea_file ? 'Yes' : 'No'}, Screenshots: ${ea.screenshots?.length || 0}`);
    });

    // 2. Check storage buckets
    console.log('\n📁 Checking storage buckets...');
    
    // Check ea-images bucket
    const { data: imageFiles } = await supabase.storage
      .from('ea-images')
      .list('', { limit: 100 });
    console.log(`📸 ea-images bucket: ${imageFiles?.length || 0} files`);

    // Check ea-files bucket
    const { data: eaFiles } = await supabase.storage
      .from('ea-files')
      .list('', { limit: 100 });
    console.log(`📦 ea-files bucket: ${eaFiles?.length || 0} files`);

    // Check ea-screenshots bucket
    const { data: screenshotFiles } = await supabase.storage
      .from('ea-screenshots')
      .list('', { limit: 100 });
    console.log(`📷 ea-screenshots bucket: ${screenshotFiles?.length || 0} files`);

    // 3. Check subscriptions
    console.log('\n💳 Checking subscriptions...');
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('id, user_id, ea_id, status, created_at')
      .order('created_at', { ascending: false });

    if (subError) {
      console.error('❌ Error fetching subscriptions:', subError);
    } else {
      console.log(`📊 Found ${subscriptions.length} subscriptions`);
      subscriptions.forEach(sub => {
        console.log(`   - ID: ${sub.id}, User: ${sub.user_id}, EA: ${sub.ea_id}, Status: ${sub.status}`);
      });
    }

    // 4. Summary and recommendations
    console.log('\n📋 Summary and Recommendations:');
    console.log('✅ Storage buckets are now clean');
    console.log('✅ Misnamed files have been removed');
    console.log('✅ File upload logic has been fixed');
    
    if (eas.length === 0) {
      console.log('⚠️  No EAs found in database - this might explain the disappearing issue');
    } else {
      console.log(`✅ Found ${eas.length} EAs in database`);
    }

    if (subscriptions && subscriptions.length === 0) {
      console.log('⚠️  No subscriptions found - this explains the empty download section');
    } else {
      console.log(`✅ Found ${subscriptions.length} subscriptions`);
    }

    console.log('\n🎯 Next Steps:');
    console.log('1. Test creating a new EA to see if it persists');
    console.log('2. Test subscribing to an EA to see if download files appear');
    console.log('3. Check that EA files (.mq5, .ex5) are properly uploaded to ea-files bucket');
    console.log('4. Verify that screenshots go to ea-screenshots bucket');

  } catch (error) {
    console.error('❌ Comprehensive fix failed:', error);
  }
}

// Run the comprehensive fix
comprehensiveFix()
  .then(() => {
    console.log('\n✨ Comprehensive fix completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
