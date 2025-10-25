#!/usr/bin/env node

/**
 * Automatic EA Files Bucket Cleanup Script
 * This script automatically moves misclassified image files from ea-files bucket to ea-images bucket
 * without asking for permission
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

async function autoFixEAFilesBucket() {
  console.log('🔧 Automatically fixing EA Files bucket...');
  
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

    // Categorize files
    const imageFiles = [];
    const eaFiles = [];
    const otherFiles = [];

    for (const file of files) {
      const fileName = file.name.toLowerCase();
      
      if (fileName.startsWith('image-') || fileName.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        imageFiles.push(file);
      } else if (fileName.match(/\.(ex4|mq4|mq5|ex5)$/)) {
        eaFiles.push(file);
      } else {
        otherFiles.push(file);
      }
    }

    console.log(`📊 File categorization:`);
    console.log(`   - Image files: ${imageFiles.length}`);
    console.log(`   - EA files: ${eaFiles.length}`);
    console.log(`   - Other files: ${otherFiles.length}`);

    if (imageFiles.length === 0) {
      console.log('✅ No misclassified image files found in ea-files bucket');
      return;
    }

    console.log(`\n🗑️  Found ${imageFiles.length} misclassified image files in ea-files bucket`);
    console.log('📋 Examples of misclassified files:');
    imageFiles.slice(0, 5).forEach(file => {
      console.log(`   - ${file.name} (${(file.metadata?.size / 1024 / 1024).toFixed(2)} MB)`);
    });

    if (imageFiles.length > 5) {
      console.log(`   ... and ${imageFiles.length - 5} more files`);
    }

    // Calculate total size to be moved
    const totalSize = imageFiles.reduce((sum, file) => {
      return sum + (file.metadata?.size || 0);
    }, 0);

    console.log(`\n💾 Total size of misclassified files: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log('🔄 Automatically moving image files to ea-images bucket...');

    // Move image files to ea-images bucket
    let movedCount = 0;
    let errorCount = 0;

    for (const file of imageFiles) {
      try {
        // Download file from ea-files bucket
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('ea-files')
          .download(file.name);

        if (downloadError) {
          console.error(`❌ Error downloading ${file.name}:`, downloadError.message);
          errorCount++;
          continue;
        }

        // Upload to ea-images bucket
        const { error: uploadError } = await supabase.storage
          .from('ea-images')
          .upload(file.name, fileData, {
            contentType: file.metadata?.mimetype || 'image/jpeg',
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error(`❌ Error uploading ${file.name} to ea-images:`, uploadError.message);
          errorCount++;
          continue;
        }

        // Delete from ea-files bucket
        const { error: deleteError } = await supabase.storage
          .from('ea-files')
          .remove([file.name]);

        if (deleteError) {
          console.error(`❌ Error deleting ${file.name} from ea-files:`, deleteError.message);
          errorCount++;
          continue;
        }

        movedCount++;
        console.log(`✅ Moved: ${file.name}`);

      } catch (err) {
        console.error(`❌ Error processing ${file.name}:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n🎉 EA Files bucket cleanup completed!`);
    console.log(`✅ Successfully moved: ${movedCount} files`);
    if (errorCount > 0) {
      console.log(`❌ Failed to move: ${errorCount} files`);
    }
    console.log(`💾 Space freed in ea-files bucket: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    // Show remaining files in ea-files bucket
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

// Run the fix
autoFixEAFilesBucket()
  .then(() => {
    console.log('\n✨ Automatic EA Files bucket cleanup completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
