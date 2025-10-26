require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkSubscriptions() {
  console.log('🔍 Checking ALL subscriptions for user: dabfa248-7964-4841-81e7-d833c7f88dc3\n');
  
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', 'dabfa248-7964-4841-81e7-d833c7f88dc3')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`Found ${subscriptions.length} subscriptions:\n`);
  
  subscriptions.forEach((sub, index) => {
    console.log(`${index + 1}. Subscription ID: ${sub.id}`);
    console.log(`   EA ID: ${sub.ea_id}`);
    console.log(`   Status: ${sub.status}`);
    console.log(`   Type: ${sub.subscription_type}`);
    console.log(`   Start: ${new Date(sub.start_date).toLocaleString()}`);
    console.log(`   End: ${new Date(sub.end_date).toLocaleString()}`);
    console.log(`   Created: ${new Date(sub.created_at).toLocaleString()}`);
    console.log('');
  });
  
  // Check specifically for EA 5
  const ea5Subs = subscriptions.filter(s => s.ea_id === 5);
  console.log(`\n📊 EA ID 5 (Multi Indicator) subscriptions: ${ea5Subs.length}`);
  if (ea5Subs.length > 0) {
    ea5Subs.forEach(sub => {
      console.log(`   - ID ${sub.id}: ${sub.status} (ends ${new Date(sub.end_date).toLocaleString()})`);
    });
  }
}

checkSubscriptions().then(() => process.exit(0)).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

