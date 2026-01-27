/**
 * Delete All EAs Script
 * Use this to clean up test EAs from the database
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAllEAs() {
  try {
    console.log('\n🗑️  DELETE ALL EAs\n');
    console.log('⚠️  WARNING: This will DELETE ALL expert advisors from the database!');
    console.log('⚠️  This action CANNOT be undone!\n');

    // Get count of EAs
    const { count, error: countError } = await supabase
      .from('expert_advisors')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting EAs:', countError);
      process.exit(1);
    }

    console.log(`📊 Found ${count} EAs in database\n`);

    if (count === 0) {
      console.log('✅ No EAs to delete. Database is already clean.');
      process.exit(0);
    }

    // List the EAs
    const { data: eas } = await supabase
      .from('expert_advisors')
      .select('id, name, status')
      .order('id', { ascending: true });

    console.log('📋 EAs to be deleted:');
    eas.forEach(ea => {
      console.log(`   - ID ${ea.id}: ${ea.name} (${ea.status})`);
    });

    console.log('\n⏳ Deleting all EAs...\n');

    // Delete all EAs
    const { error: deleteError } = await supabase
      .from('expert_advisors')
      .delete()
      .neq('id', 0); // Delete all (id != 0 is always true)

    if (deleteError) {
      console.error('❌ Error deleting EAs:', deleteError);
      process.exit(1);
    }

    console.log('✅ All EAs deleted successfully!');

    // Reset the sequence to start from 1
    console.log('\n⏳ Resetting ID sequence...\n');

    const { error: seqError } = await supabase.rpc('reset_ea_sequence');

    if (seqError) {
      console.log('⚠️  Could not reset sequence automatically');
      console.log('💡 Run this SQL manually in Supabase to reset:');
      console.log('   ALTER SEQUENCE expert_advisors_id_seq RESTART WITH 1;');
    } else {
      console.log('✅ ID sequence reset to 1');
    }

    console.log('\n✨ Database is clean! Next EA will have ID = 1\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
deleteAllEAs();

