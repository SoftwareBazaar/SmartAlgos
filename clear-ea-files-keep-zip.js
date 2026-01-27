require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function clearEAFiles() {
  console.log('🧹 Starting EA files cleanup...\n');

  try {
    // 1. Get all EAs from database
    const { data: eas, error: fetchError } = await supabase
      .from('expert_advisors')
      .select('*');

    if (fetchError) {
      console.error('❌ Error fetching EAs:', fetchError);
      return;
    }

    console.log(`📊 Found ${eas.length} EAs in database\n`);

    // 2. For each EA, keep only the zip file
    for (const ea of eas) {
      console.log(`\n🔧 Processing EA: ${ea.name} (ID: ${ea.id})`);
      
      const updates = {
        ea_file: null,
        manual_file: null,
        settings_file: null,
        updated_at: new Date().toISOString()
      };

      // Keep zip_file as is
      if (ea.zip_file) {
        console.log(`  ✅ Keeping zip file: ${ea.zip_file}`);
      } else {
        console.log(`  ⚠️  No zip file found for this EA`);
      }

      // Clear individual files
      if (ea.ea_file) {
        console.log(`  🗑️  Removing EA file: ${ea.ea_file}`);
      }
      if (ea.manual_file) {
        console.log(`  🗑️  Removing manual file: ${ea.manual_file}`);
      }
      if (ea.settings_file) {
        console.log(`  🗑️  Removing settings file: ${ea.settings_file}`);
      }

      // Update database
      const { error: updateError } = await supabase
        .from('expert_advisors')
        .update(updates)
        .eq('id', ea.id);

      if (updateError) {
        console.error(`  ❌ Error updating EA ${ea.id}:`, updateError);
      } else {
        console.log(`  ✅ Successfully updated EA ${ea.id}`);
      }
    }

    // 3. Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ CLEANUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📋 Summary:');
    console.log(`  • Total EAs processed: ${eas.length}`);
    console.log(`  • Individual files cleared (ea_file, manual_file, settings_file)`);
    console.log(`  • ZIP files retained for download system`);
    console.log('\n💡 All users will now download the same ZIP file for each EA');
    console.log('🎯 Perfect for testing with friends!\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the cleanup
clearEAFiles();
