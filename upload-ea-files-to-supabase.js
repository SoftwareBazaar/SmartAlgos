const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

async function uploadEAFiles() {
  try {
    console.log('📤 Uploading EA files to Supabase Storage...\n');
    
    const files = [
      { local: './uploads/ea-files/sample-ea.ex4', remote: 'sample-ea.ex4', type: 'application/octet-stream' },
      { local: './uploads/ea-files/sample-ea.set', remote: 'sample-ea.set', type: 'text/plain' },
      { local: './uploads/ea-files/sample-ea-manual.pdf', remote: 'sample-ea-manual.pdf', type: 'application/pdf' }
    ];
    
    const uploadedPaths = {};
    
    for (const file of files) {
      const filePath = path.join(__dirname, file.local);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${file.local} not found, skipping...`);
        continue;
      }
      
      console.log(`📁 Uploading ${file.local}...`);
      
      // Read file
      const fileBuffer = fs.readFileSync(filePath);
      
      // Upload to Supabase Storage in 'ea-files' bucket
      // First, try to remove if exists
      await supabase.storage
        .from('ea-files')
        .remove([file.remote]);
      
      // Then upload
      const { data, error } = await supabase.storage
        .from('ea-files')
        .upload(file.remote, fileBuffer, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error(`   ❌ Error uploading ${file.local}:`, error.message);
        continue;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('ea-files')
        .getPublicUrl(file.remote);
      
      console.log(`   ✅ Uploaded: ${publicUrl}`);
      
      // Store the path for later
      if (file.local.includes('.ex4')) {
        uploadedPaths.ea_file_path = publicUrl;
      } else if (file.local.includes('.set')) {
        uploadedPaths.set_file_path = publicUrl;
      } else if (file.local.includes('.pdf')) {
        uploadedPaths.manual_file_path = publicUrl;
      }
    }
    
    console.log('\n🔧 Updating EA record with new file paths...');
    
    // Update EA record with Supabase URLs
    const { error: updateError } = await supabase
      .from('expert_advisors')
      .update({
        ...uploadedPaths,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);
    
    if (updateError) {
      console.error('❌ Error updating EA record:', updateError.message);
    } else {
      console.log('✅ EA record updated with Supabase storage URLs!');
      console.log('\nNew file paths:');
      console.log('  ea_file_path:', uploadedPaths.ea_file_path);
      console.log('  set_file_path:', uploadedPaths.set_file_path);
      console.log('  manual_file_path:', uploadedPaths.manual_file_path);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

uploadEAFiles();

