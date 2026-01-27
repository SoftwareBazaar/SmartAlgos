const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

async function fixEAFilePaths() {
  try {
    console.log('🔧 Fixing EA file paths in production...');
    
    // Get all EAs
    const { data: eas, error } = await supabase
      .from('expert_advisors')
      .select('*');
    
    if (error) {
      console.error('❌ Error fetching EAs:', error);
      return;
    }
    
    console.log(`📋 Found ${eas?.length || 0} EAs`);
    
    if (!eas || eas.length === 0) {
      console.log('No EAs to fix');
      return;
    }
    
    // Update each EA with proper file paths
    for (const ea of eas) {
      console.log(`\n📝 Updating EA ${ea.id}: ${ea.name}`);
      
      const updates = {};
      let hasUpdates = false;
      
      // Check and fix ea_file_path
      if (!ea.ea_file_path || ea.ea_file_path.includes('example.com')) {
        updates.ea_file_path = '/uploads/ea-files/sample-ea.ex4';
        hasUpdates = true;
        console.log(`   ✏️  ea_file_path: ${ea.ea_file_path || 'null'} → ${updates.ea_file_path}`);
      }
      
      // Check and fix set_file_path
      if (!ea.set_file_path || ea.set_file_path.includes('example.com')) {
        updates.set_file_path = '/uploads/ea-files/sample-ea.set';
        hasUpdates = true;
        console.log(`   ✏️  set_file_path: ${ea.set_file_path || 'null'} → ${updates.set_file_path}`);
      }
      
      // Check and fix manual_file_path
      if (!ea.manual_file_path || ea.manual_file_path.includes('example.com')) {
        updates.manual_file_path = '/uploads/ea-files/sample-ea-manual.pdf';
        hasUpdates = true;
        console.log(`   ✏️  manual_file_path: ${ea.manual_file_path || 'null'} → ${updates.manual_file_path}`);
      }
      
      if (hasUpdates) {
        updates.updated_at = new Date().toISOString();
        
        const { error: updateError } = await supabase
          .from('expert_advisors')
          .update(updates)
          .eq('id', ea.id);
        
        if (updateError) {
          console.error(`   ❌ Failed to update: ${updateError.message}`);
        } else {
          console.log(`   ✅ Updated successfully`);
        }
      } else {
        console.log(`   ⏭️  No updates needed`);
      }
    }
    
    console.log('\n✅ All EAs processed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixEAFilePaths();

