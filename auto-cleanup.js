#!/usr/bin/env node

/**
 * Automatic Screenshot Cleanup Script
 * This script automatically deletes unused screenshots without asking for confirmation
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

async function autoCleanup() {
  console.log('🧹 Automatic screenshot cleanup starting...');
  
  try {
    // Get all files in ea-screenshots bucket
    const { data: files, error: listError } = await supabase.storage
      .from('ea-screenshots')
      .list('', { limit: 1000 });

    if (listError) {
      console.error('❌ Error listing files:', listError);
      return;
    }

    console.log(`📁 Found ${files.length} files in storage`);

    // Get all EAs from database
    const { data: eas, error: easError } = await supabase
      .from('expert_advisors')
      .select('id, name, screenshots');

    if (easError) {
      console.error('❌ Error fetching EAs:', easError);
      return;
    }

    console.log(`📋 Found ${eas.length} EAs in database`);

    // Collect all screenshot URLs that are still in use
    const usedScreenshots = new Set();
    eas.forEach(ea => {
      if (ea.screenshots && Array.isArray(ea.screenshots)) {
        ea.screenshots.forEach(url => {
          const filename = url.split('/').pop();
          if (filename) {
            usedScreenshots.add(filename);
          }
        });
      }
    });

    console.log(`✅ Found ${usedScreenshots.size} screenshots still in use`);

    // Find unused files
    const unusedFiles = files.filter(file => !usedScreenshots.has(file.name));

    console.log(`🗑️  Found ${unusedFiles.length} unused screenshots`);

    if (unusedFiles.length === 0) {
      console.log('✨ No unused screenshots found. Storage is clean!');
      return;
    }

    // Calculate total size to be freed
    const totalSize = unusedFiles.reduce((sum, file) => {
      return sum + (file.metadata?.size || 0);
    }, 0);

    console.log(`💾 Total size to be freed: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log('🗑️  Deleting unused screenshots...');

    // Delete unused files
    let deletedCount = 0;
    let errorCount = 0;

    for (const file of unusedFiles) {
      try {
        const { error } = await supabase.storage
          .from('ea-screenshots')
          .remove([file.name]);

        if (error) {
          console.error(`❌ Error deleting ${file.name}:`, error.message);
          errorCount++;
        } else {
          deletedCount++;
          console.log(`✅ Deleted: ${file.name}`);
        }
      } catch (err) {
        console.error(`❌ Error deleting ${file.name}:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n🎉 Cleanup completed!`);
    console.log(`✅ Successfully deleted: ${deletedCount} files`);
    if (errorCount > 0) {
      console.log(`❌ Failed to delete: ${errorCount} files`);
    }
    console.log(`💾 Space freed: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Run the cleanup
autoCleanup()
  .then(() => {
    console.log('\n✨ Automatic cleanup completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
