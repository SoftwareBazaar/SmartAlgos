#!/usr/bin/env node

/**
 * Screenshot Cleanup Script
 * This script helps clean up old, unused screenshots from Supabase storage
 * to reduce storage usage and costs.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://ncikobfahncdgwvkfivz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupScreenshots() {
  console.log('🧹 Starting screenshot cleanup...');
  console.log('📊 Checking storage usage...');
  
  try {
    // Get all files in ea-screenshots bucket
    const { data: files, error: listError } = await supabase.storage
      .from('ea-screenshots')
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' }
      });

    if (listError) {
      console.error('❌ Error listing files:', listError);
      return;
    }

    console.log(`📁 Found ${files.length} files in ea-screenshots bucket`);

    // Get all EAs from database to find which screenshots are still in use
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
          // Extract filename from URL
          const filename = url.split('/').pop();
          if (filename) {
            usedScreenshots.add(filename);
          }
        });
      }
    });

    console.log(`✅ Found ${usedScreenshots.size} screenshots still in use`);

    // Find unused files
    const unusedFiles = files.filter(file => {
      // Check if this file is referenced in any EA
      return !usedScreenshots.has(file.name);
    });

    console.log(`🗑️  Found ${unusedFiles.length} unused screenshots`);

    if (unusedFiles.length === 0) {
      console.log('✨ No unused screenshots found. Storage is clean!');
      return;
    }

    // Show some examples of files to be deleted
    console.log('\n📋 Examples of files to be deleted:');
    unusedFiles.slice(0, 5).forEach(file => {
      console.log(`   - ${file.name} (${(file.metadata?.size / 1024 / 1024).toFixed(2)} MB)`);
    });

    if (unusedFiles.length > 5) {
      console.log(`   ... and ${unusedFiles.length - 5} more files`);
    }

    // Calculate total size to be freed
    const totalSize = unusedFiles.reduce((sum, file) => {
      return sum + (file.metadata?.size || 0);
    }, 0);

    console.log(`\n💾 Total size to be freed: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    // Ask for confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      rl.question(`\n❓ Do you want to delete ${unusedFiles.length} unused screenshots? (y/N): `, resolve);
    });

    rl.close();

    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('❌ Cleanup cancelled by user');
      return;
    }

    // Delete unused files
    console.log('\n🗑️  Deleting unused screenshots...');
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
          if (deletedCount % 10 === 0) {
            console.log(`✅ Deleted ${deletedCount}/${unusedFiles.length} files...`);
          }
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
cleanupScreenshots()
  .then(() => {
    console.log('\n✨ Screenshot cleanup script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
