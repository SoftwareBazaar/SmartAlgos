const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

async function checkUserSubscriptions() {
  try {
    // Get user ID from subscription 6
    const { data: sub6 } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('id', 6)
      .single();
    
    const userId = sub6.user_id;
    console.log(`🔍 Checking subscriptions for user: ${userId}\n`);
    
    // Get all subscriptions for this user
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('id, ea_id, status, subscription_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log(`Found ${subscriptions?.length || 0} subscriptions:\n`);
    
    subscriptions?.forEach((sub, index) => {
      console.log(`${index + 1}. Subscription ID: ${sub.id}`);
      console.log(`   EA ID: ${sub.ea_id}`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Type: ${sub.subscription_type}`);
      console.log(`   Created: ${new Date(sub.created_at).toLocaleString()}`);
      console.log('');
    });
    
    // Check specifically for EA ID 5
    const ea5Subs = subscriptions?.filter(s => s.ea_id === 5 || s.ea_id === '5');
    console.log(`\n📊 EA ID 5 (Multi Indicator) subscriptions: ${ea5Subs?.length || 0}`);
    ea5Subs?.forEach(sub => {
      console.log(`   - ID ${sub.id}: ${sub.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUserSubscriptions();

