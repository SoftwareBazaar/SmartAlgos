const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

async function checkSubscriptions() {
  try {
    console.log('🔍 Checking subscriptions in database...\n');
    
    // Get all subscriptions
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log(`Found ${subscriptions?.length || 0} subscriptions:\n`);
    
    subscriptions?.forEach((sub, index) => {
      console.log(`${index + 1}. Subscription ID: ${sub.id}`);
      console.log(`   User ID: ${sub.user_id}`);
      console.log(`   EA ID: ${sub.ea_id || sub.product_id}`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   End Date: ${sub.end_date}`);
      console.log(`   All fields:`, JSON.stringify(sub, null, 2));
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSubscriptions();

