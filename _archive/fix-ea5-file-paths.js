require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

async function fixFilePaths() {
  console.log('🔧 Updating EA 5 file paths...\n');
  
  // Update EA 5 file paths to use the same uploaded file as EA 1
  const { error } = await supabase
    .from('expert_advisors')
    .update({
      ea_file_path: 'https://ncikobfahncdgwvkfivz.supabase.co/storage/v1/object/public/ea-files/image-1761385703616-159605751.ex5',
      set_file_path: 'https://ncikobfahncdgwvkfivz.supabase.co/storage/v1/object/public/ea-files/sample-ea.set',
      manual_file_path: 'https://ncikobfahncdgwvkfivz.supabase.co/storage/v1/object/public/ea-files/sample-ea-manual.pdf',
      updated_at: new Date().toISOString()
    })
    .eq('id', 5);
  
  if (error) {
    console.error('❌ Error updating EA 5:', error);
    return;
  }
  
  console.log('✅ EA 5 file paths updated successfully!');
  console.log('   - EA File: Now points to Supabase Storage');
  console.log('   - Set File: Now points to Supabase Storage');
  console.log('   - Manual: Now points to Supabase Storage');
}

fixFilePaths().then(() => process.exit(0)).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
