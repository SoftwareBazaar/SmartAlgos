#!/usr/bin/env node

/**
 * Database Screenshot Cleanup Script
 * This script removes broken screenshot URLs from the database
 * that point to files that no longer exist in Supabase storage
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

async function fixDatabaseScreenshots() {
  console.log('🔧 Fixing database screenshot references...');
  
  try {
    // Get all EAs with screenshots
    const { data: eas, error: fetchError } = await supabase
      .from('expert_advisors')
      .select('id, name, screenshots');

    if (fetchError) {
      console.error('❌ Error fetching EAs:', fetchError);
      return;
    }

    console.log(`📋 Found ${eas.length} EAs to check`);

    let updatedCount = 0;
    let brokenUrlsFound = 0;

    for (const ea of eas) {
      if (!ea.screenshots || !Array.isArray(ea.screenshots) || ea.screenshots.length === 0) {
        continue;
      }

      console.log(`\n🔍 Checking EA: ${ea.name} (ID: ${ea.id})`);
      console.log(`   Current screenshots: ${ea.screenshots.length}`);

      // Check each screenshot URL
      const validScreenshots = [];
      const brokenScreenshots = [];

      for (const screenshotUrl of ea.screenshots) {
        try {
          // Extract filename from URL
          const filename = screenshotUrl.split('/').pop();
          
          // Check if file exists in storage
          const { data: fileData, error: fileError } = await supabase.storage
            .from('ea-screenshots')
            .list('', {
              search: filename
            });

          if (fileError || !fileData || fileData.length === 0) {
            console.log(`   ❌ Broken URL: ${filename}`);
            brokenScreenshots.push(screenshotUrl);
            brokenUrlsFound++;
          } else {
            console.log(`   ✅ Valid URL: ${filename}`);
            validScreenshots.push(screenshotUrl);
          }
        } catch (err) {
          console.log(`   ❌ Error checking ${screenshotUrl}: ${err.message}`);
          brokenScreenshots.push(screenshotUrl);
          brokenUrlsFound++;
        }
      }

      // Update EA if there are broken URLs
      if (brokenScreenshots.length > 0) {
        console.log(`   🗑️  Removing ${brokenScreenshots.length} broken screenshot URLs`);
        
        const { error: updateError } = await supabase
          .from('expert_advisors')
          .update({ screenshots: validScreenshots })
          .eq('id', ea.id);

        if (updateError) {
          console.error(`   ❌ Error updating EA ${ea.id}:`, updateError);
        } else {
          console.log(`   ✅ Updated EA ${ea.id} - removed broken URLs`);
          updatedCount++;
        }
      } else {
        console.log(`   ✅ All screenshots are valid`);
      }
    }

    console.log(`\n🎉 Database cleanup completed!`);
    console.log(`✅ Updated ${updatedCount} EAs`);
    console.log(`🗑️  Removed ${brokenUrlsFound} broken screenshot URLs`);

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the fix
fixDatabaseScreenshots()
  .then(() => {
    console.log('\n✨ Database screenshot cleanup completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
