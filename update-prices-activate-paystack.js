require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function updatePricesAndActivatePaystack() {
  console.log('🚀 Starting EA Price Update and Paystack Activation...\n');

  try {
    // Define the EAs to update
    const easToUpdate = [
      { name: 'London Breakout', searchTerm: 'london breakout' },
      { name: 'Multi Indicator', searchTerm: 'multi indicator' },
      { name: 'Gold Scalper', searchTerm: 'gold scalper' }
    ];

    const prices = {
      price_weekly: 19.00,
      price_monthly: 55.00,
      price_yearly: 399.00
    };

    console.log('💰 Updating EA Prices:');
    console.log(`   Weekly: $${prices.price_weekly}`);
    console.log(`   Monthly: $${prices.price_monthly}`);
    console.log(`   Yearly (Lifetime): $${prices.price_yearly}\n`);

    // Update each EA
    for (const ea of easToUpdate) {
      console.log(`📝 Updating ${ea.name}...`);
      
      // Find the EA
      const { data: eas, error: findError } = await supabase
        .from('expert_advisors')
        .select('*')
        .ilike('name', `%${ea.searchTerm}%`);

      if (findError) {
        console.error(`   ❌ Error finding ${ea.name}:`, findError.message);
        continue;
      }

      if (!eas || eas.length === 0) {
        console.log(`   ⚠️  ${ea.name} not found in database`);
        continue;
      }

      // Update the EA
      const { error: updateError } = await supabase
        .from('expert_advisors')
        .update({
          ...prices,
          updated_at: new Date().toISOString()
        })
        .eq('id', eas[0].id);

      if (updateError) {
        console.error(`   ❌ Error updating ${ea.name}:`, updateError.message);
      } else {
        console.log(`   ✅ ${ea.name} updated successfully (ID: ${eas[0].id})`);
      }
    }

    // Verify updates
    console.log('\n📊 Verifying Updates:');
    const { data: allEAs, error: verifyError } = await supabase
      .from('expert_advisors')
      .select('id, name, price_weekly, price_monthly, price_yearly')
      .order('name');

    if (verifyError) {
      console.error('❌ Error verifying updates:', verifyError.message);
    } else {
      console.log('\n' + '='.repeat(80));
      console.log('Current EA Prices:');
      console.log('='.repeat(80));
      allEAs.forEach(ea => {
        console.log(`\n${ea.name} (ID: ${ea.id})`);
        console.log(`  Weekly:  $${ea.price_weekly || 'Not set'}`);
        console.log(`  Monthly: $${ea.price_monthly || 'Not set'}`);
        console.log(`  Yearly:  $${ea.price_yearly || 'Not set'}`);
      });
    }

    // Paystack Activation Instructions
    console.log('\n' + '='.repeat(80));
    console.log('🔐 PAYSTACK LIVE MODE ACTIVATION');
    console.log('='.repeat(80));
    console.log('\nTo activate Paystack live payments, update these environment variables:');
    console.log('\n1. In Railway Dashboard:');
    console.log('   - Go to your project → Variables');
    console.log('   - Update PAYSTACK_SECRET_KEY with your LIVE secret key');
    console.log('   - Update PAYSTACK_PUBLIC_KEY with your LIVE public key');
    console.log('   - Set PAYMENT_MODE=live (or remove it, as live is default)');
    console.log('\n2. Get your LIVE keys from:');
    console.log('   https://dashboard.paystack.com/#/settings/developers');
    console.log('\n3. Current keys in .env (if any):');
    console.log(`   PAYSTACK_SECRET_KEY: ${process.env.PAYSTACK_SECRET_KEY ? '***' + process.env.PAYSTACK_SECRET_KEY.slice(-4) : 'Not set'}`);
    console.log(`   PAYSTACK_PUBLIC_KEY: ${process.env.PAYSTACK_PUBLIC_KEY ? '***' + process.env.PAYSTACK_PUBLIC_KEY.slice(-4) : 'Not set'}`);
    console.log(`   PAYMENT_MODE: ${process.env.PAYMENT_MODE || 'live (default)'}`);
    
    console.log('\n⚠️  IMPORTANT:');
    console.log('   - Test keys start with: sk_test_ and pk_test_');
    console.log('   - Live keys start with: sk_live_ and pk_live_');
    console.log('   - Make sure you are using LIVE keys for production!');
    console.log('\n✅ After updating Railway variables, redeploy the app.');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error);
  }
}

// Run the update
updatePricesAndActivatePaystack();
