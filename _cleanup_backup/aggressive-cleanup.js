#!/usr/bin/env node

/**
 * Aggressive Screenshot Cleanup Script
 * This script removes ALL screenshots older than a specified date
 * Use with caution - this will delete screenshots even if they're still referenced
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

async function aggressiveCleanup() {
  console.log('⚠️  AGGRESSIVE CLEANUP MODE');
  console.log('⚠️  This will delete screenshots based on age, not usage');
  console.log('⚠️  Use with caution!\n');

  // Get cutoff date (30 days ago by default)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);
  
  console.log(`🗓️  Deleting screenshots older than: ${cutoffDate.toISOString()}`);

  try {
    // Get all files
    const { data: files, error } = await supabase.storage
      .from('ea-screenshots')
      .list('', { limit: 1000 });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    // Filter files older than cutoff date
    const oldFiles = files.filter(file => {
      const fileDate = new Date(file.created_at);
      return fileDate < cutoffDate;
    });

    console.log(`📁 Found ${files.length} total files`);
    console.log(`🗑️  Found ${oldFiles.length} old files to delete`);

    if (oldFiles.length === 0) {
      console.log('✨ No old files found');
      return;
    }

    // Calculate total size
    const totalSize = oldFiles.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
    console.log(`💾 Total size to be freed: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    // Show examples
    console.log('\n📋 Examples of files to be deleted:');
    oldFiles.slice(0, 5).forEach(file => {
      console.log(`   - ${file.name} (${new Date(file.created_at).toISOString()})`);
    });

    // Confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      rl.question(`\n⚠️  Delete ${oldFiles.length} old screenshots? (y/N): `, resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'y') {
      console.log('❌ Cancelled');
      return;
    }

    // Delete files
    console.log('\n🗑️  Deleting old screenshots...');
    let deletedCount = 0;

    for (const file of oldFiles) {
      try {
        await supabase.storage
          .from('ea-screenshots')
          .remove([file.name]);
        
        deletedCount++;
        if (deletedCount % 10 === 0) {
          console.log(`✅ Deleted ${deletedCount}/${oldFiles.length} files...`);
        }
      } catch (err) {
        console.error(`❌ Error deleting ${file.name}:`, err.message);
      }
    }

    console.log(`\n🎉 Deleted ${deletedCount} old screenshots`);
    console.log(`💾 Freed ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

aggressiveCleanup()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
