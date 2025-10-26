#!/usr/bin/env node

/**
 * Fix EA File Paths Script
 * This script updates EA file paths in the database to point to actual Supabase storage URLs
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

async function fixEAFilePaths() {
  console.log('🔧 Fixing EA file paths...');
  
  try {
    // Get all EAs
    const { data: eas, error: easError } = await supabase
      .from('expert_advisors')
      .select('id, name, ea_file_path, set_file_path, manual_file_path')
      .order('id');

    if (easError) {
      console.error('❌ Error fetching EAs:', easError);
      return;
    }

    console.log(`📊 Found ${eas.length} EAs`);

    // Check storage buckets for actual files
    console.log('\n📁 Checking storage buckets...');
    
    const { data: eaFiles } = await supabase.storage
      .from('ea-files')
      .list('', { limit: 100 });
    console.log(`📦 ea-files bucket: ${eaFiles?.length || 0} files`);

    const { data: setFiles } = await supabase.storage
      .from('ea-files')
      .list('', { limit: 100 });
    console.log(`⚙️  Settings files: ${setFiles?.length || 0} files`);

    const { data: manualFiles } = await supabase.storage
      .from('ea-files')
      .list('', { limit: 100 });
    console.log(`📖 Manual files: ${manualFiles?.length || 0} files`);

    // Update EAs with proper file paths
    console.log('\n🔄 Updating EA file paths...');
    
    for (const ea of eas) {
      console.log(`\n📋 Processing EA: ${ea.name} (ID: ${ea.id})`);
      
      const updates = {};
      
      // Check if EA has example URLs that need to be updated
      if (ea.ea_file_path && ea.ea_file_path.includes('example.com')) {
        console.log(`   ⚠️  EA file path is example URL: ${ea.ea_file_path}`);
        // For now, set to null - files need to be uploaded
        updates.ea_file_path = null;
      }
      
      if (ea.set_file_path && ea.set_file_path.includes('example.com')) {
        console.log(`   ⚠️  Set file path is example URL: ${ea.set_file_path}`);
        updates.set_file_path = null;
      }
      
      if (ea.manual_file_path && ea.manual_file_path.includes('example.com')) {
        console.log(`   ⚠️  Manual file path is example URL: ${ea.manual_file_path}`);
        updates.manual_file_path = null;
      }
      
      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        try {
          const { error: updateError } = await supabase
            .from('expert_advisors')
            .update(updates)
            .eq('id', ea.id);
            
          if (updateError) {
            console.error(`   ❌ Error updating EA ${ea.id}:`, updateError);
          } else {
            console.log(`   ✅ Updated EA ${ea.id} file paths`);
          }
        } catch (err) {
          console.error(`   ❌ Error updating EA ${ea.id}:`, err);
        }
      } else {
        console.log(`   ✅ EA ${ea.id} file paths are already correct`);
      }
    }

    console.log('\n🎉 EA file paths fix completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Upload actual EA files (.ex4, .mq5, .ex5) to the ea-files bucket');
    console.log('2. Upload settings files (.set) to the ea-files bucket');
    console.log('3. Upload manual files (.pdf) to the ea-files bucket');
    console.log('4. Update the database with the correct Supabase storage URLs');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the fix
fixEAFilePaths()
  .then(() => {
    console.log('\n✨ EA file paths fix completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
