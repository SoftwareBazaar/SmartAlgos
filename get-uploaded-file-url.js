const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

async function getUploadedFiles() {
  try {
    console.log('📂 Getting files from ea-files bucket...\n');
    
    // List all files in the bucket
    const { data, error } = await supabase.storage
      .from('ea-files')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log(`Found ${data?.length || 0} files:\n`);
    
    data?.forEach((file, index) => {
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ea-files')
        .getPublicUrl(file.name);
      
      console.log(`${index + 1}. ${file.name}`);
      console.log(`   Size: ${(file.metadata?.size / 1024).toFixed(2)} KB`);
      console.log(`   URL: ${publicUrl}`);
      console.log('');
    });
    
    // Check specifically for the .ex4 file
    const ex4File = data?.find(f => f.name.endsWith('.ex4'));
    if (ex4File) {
      const { data: { publicUrl } } = supabase.storage
        .from('ea-files')
        .getPublicUrl(ex4File.name);
      
      console.log('✅ Found .ex4 file to use for EA downloads:');
      console.log(`   File: ${ex4File.name}`);
      console.log(`   URL: ${publicUrl}`);
      
      // Update EA record
      console.log('\n🔧 Updating EA record...');
      const { error: updateError } = await supabase
        .from('expert_advisors')
        .update({
          ea_file_path: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);
      
      if (updateError) {
        console.error('❌ Error updating EA:', updateError.message);
      } else {
        console.log('✅ EA record updated with actual uploaded file!');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getUploadedFiles();

