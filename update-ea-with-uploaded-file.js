const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

async function updateEAWithUploadedFile() {
  try {
    console.log('🔧 Updating EA with uploaded file URL...\n');
    
    // Use the most recent .ex5 file
    const fileUrl = 'https://ncikobfahncdgwvkfivz.supabase.co/storage/v1/object/public/ea-files/image-1761385703616-159605751.ex5';
    
    // Update EA ID 1
    const { data, error } = await supabase
      .from('expert_advisors')
      .update({
        ea_file_path: fileUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)
      .select();
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('✅ EA updated successfully!');
    console.log('New ea_file_path:', data[0].ea_file_path);
    console.log('\n📥 Now when you download, you will get the uploaded .ex5 file!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateEAWithUploadedFile();

