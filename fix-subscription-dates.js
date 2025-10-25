const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

async function fixSubscriptionDates() {
  try {
    console.log('🔧 Fixing subscription dates...');
    
    // Get all active subscriptions
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active');
    
    if (error) {
      console.error('❌ Error fetching subscriptions:', error);
      return;
    }
    
    console.log(`📋 Found ${subscriptions?.length || 0} active subscriptions`);
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log('No subscriptions to fix');
      return;
    }
    
    // Update each subscription with new end date (30 days from now)
    for (const sub of subscriptions) {
      const newEndDate = new Date();
      newEndDate.setDate(newEndDate.getDate() + 30); // Add 30 days
      
      console.log(`\n📝 Updating subscription ${sub.id}:`);
      console.log(`   Old end date: ${sub.end_date}`);
      console.log(`   New end date: ${newEndDate.toISOString()}`);
      
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          end_date: newEndDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sub.id);
      
      if (updateError) {
        console.error(`   ❌ Failed to update: ${updateError.message}`);
      } else {
        console.log(`   ✅ Updated successfully`);
      }
    }
    
    console.log('\n✅ All subscriptions updated!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixSubscriptionDates();

