const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

async function updateEAFilePaths() {
  try {
    console.log('🔧 Updating EA file paths to point to uploaded files...\n');
    
    // Update EA ID 1 to use the sample files
    const { data, error } = await supabase
      .from('expert_advisors')
      .update({
        ea_file_path: '/uploads/ea-files/sample-ea.ex4',
        set_file_path: '/uploads/ea-files/sample-ea.set',
        manual_file_path: '/uploads/ea-files/sample-ea-manual.pdf',
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .select();
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('✅ EA ID 1 updated successfully!');
    console.log('New paths:');
    console.log('  ea_file_path:', data[0].ea_file_path);
    console.log('  set_file_path:', data[0].set_file_path);
    console.log('  manual_file_path:', data[0].manual_file_path);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateEAFilePaths();

