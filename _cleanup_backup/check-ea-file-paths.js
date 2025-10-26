require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

async function checkFilePaths() {
  console.log('🔍 Checking EA file paths in database...\n');
  
  const { data: eas, error } = await supabase
    .from('expert_advisors')
    .select('id, name, ea_file_path, set_file_path, manual_file_path')
    .order('id');
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  eas.forEach(ea => {
    console.log(`EA ${ea.id}: ${ea.name}`);
    console.log(`  EA File: ${ea.ea_file_path}`);
    console.log(`  Set File: ${ea.set_file_path}`);
    console.log(`  Manual: ${ea.manual_file_path}`);
    console.log('');
  });
}

checkFilePaths().then(() => process.exit(0)).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});