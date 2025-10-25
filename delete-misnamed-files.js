#!/usr/bin/env node

/**
 * Delete Misnamed Files Script
 * This script deletes files in ea-files bucket that have misleading "image-" names
 * but are actually EA files with wrong naming
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

async function deleteMisnamedFiles() {
  console.log('🗑️  Deleting misnamed files from ea-files bucket...');
  
  try {
    // Get all files in ea-files bucket
    const { data: files, error: listError } = await supabase.storage
      .from('ea-files')
      .list('', { limit: 1000 });

    if (listError) {
      console.error('❌ Error listing files:', listError);
      return;
    }

    console.log(`📁 Found ${files.length} files in ea-files bucket`);

    // Find files with misleading "image-" names
    const misnamedFiles = files.filter(file => 
      file.name.startsWith('image-') && file.name.match(/\.(ex4|mq4|mq5|ex5)$/)
    );

    console.log(`🗑️  Found ${misnamedFiles.length} misnamed files`);
    
    if (misnamedFiles.length === 0) {
      console.log('✅ No misnamed files found');
      return;
    }

    console.log('📋 Files to delete:');
    misnamedFiles.forEach(file => {
      console.log(`   - ${file.name}`);
    });

    // Delete misnamed files
    console.log('\n🗑️  Deleting misnamed files...');
    let deletedCount = 0;
    let errorCount = 0;

    for (const file of misnamedFiles) {
      try {
        const { error } = await supabase.storage
          .from('ea-files')
          .remove([file.name]);

        if (error) {
          console.error(`❌ Error deleting ${file.name}:`, error.message);
          errorCount++;
        } else {
          deletedCount++;
          console.log(`✅ Deleted: ${file.name}`);
        }
      } catch (err) {
        console.error(`❌ Error processing ${file.name}:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n🎉 Cleanup completed!`);
    console.log(`✅ Successfully deleted: ${deletedCount} files`);
    if (errorCount > 0) {
      console.log(`❌ Failed to delete: ${errorCount} files`);
    }

    // Show remaining files
    const { data: remainingFiles } = await supabase.storage
      .from('ea-files')
      .list('', { limit: 1000 });

    console.log(`\n📁 Remaining files in ea-files bucket: ${remainingFiles.length}`);
    if (remainingFiles.length > 0) {
      console.log('📋 Remaining files:');
      remainingFiles.forEach(file => {
        console.log(`   - ${file.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the cleanup
deleteMisnamedFiles()
  .then(() => {
    console.log('\n✨ Misnamed files cleanup completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
