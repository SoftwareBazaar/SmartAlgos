/**
 * Reset Utilities to Only Lot Size Calculator and News Pro
 * Run this script to clean up utilities database
 */

require('dotenv').config();
const databaseService = require('./services/databaseService');

async function resetUtilities() {
  try {
    console.log('🔄 Resetting utilities database...');
    
    const supabase = databaseService.getClient();
    if (!supabase) {
      console.error('❌ Supabase client not available');
      process.exit(1);
    }

    // Get all utilities
    const { data: allUtilities, error: fetchError } = await supabase
      .from('utilities')
      .select('*');

    if (fetchError) {
      console.error('❌ Error fetching utilities:', fetchError);
      process.exit(1);
    }

    console.log(`📊 Found ${allUtilities.length} utilities`);

    // Define the two utilities we want to keep
    const keepUtilities = [
      {
        name: 'Lot Size Calculator',
        category: 'Risk Management',
        description: 'Advanced lot size calculator for precise position sizing based on risk management principles. Calculate optimal lot sizes for different account balances, risk percentages, and trading strategies.',
        version: '1.0',
        size: '2.5 MB',
        is_active: true,
        features: [
          'Account Balance Input',
          'Risk Percentage Calculator',
          'Stop Loss Distance Calculation'
        ]
      },
      {
        name: 'News Pro',
        category: 'Market Analysis',
        description: 'Track important economic events and news releases that impact forex markets. Get real-time economic calendar updates with impact level indicators and currency pair filtering.',
        version: '1.8.5',
        size: '1.8 MB',
        is_active: true,
        features: [
          'Real-time economic events',
          'Impact level indicators',
          'Currency pair filtering'
        ]
      }
    ];

    // Check which utilities to keep/update
    const toKeep = [];
    const toDelete = [];

    for (const utility of allUtilities) {
      const match = keepUtilities.find(u => u.name === utility.name);
      if (match) {
        toKeep.push({ ...utility, ...match });
      } else {
        toDelete.push(utility);
      }
    }

    // Check if we need to create missing utilities
    const existingNames = toKeep.map(u => u.name);
    const missing = keepUtilities.filter(u => !existingNames.includes(u.name));

    console.log(`\n📝 Actions to perform:`);
    console.log(`   ✅ Keep: ${toKeep.length} utilities`);
    console.log(`   ❌ Delete: ${toDelete.length} utilities`);
    console.log(`   ➕ Create: ${missing.length} utilities`);

    // Delete utilities we don't want
    if (toDelete.length > 0) {
      const deleteIds = toDelete.map(u => u.id);
      const { error: deleteError } = await supabase
        .from('utilities')
        .delete()
        .in('id', deleteIds);

      if (deleteError) {
        console.error('❌ Error deleting utilities:', deleteError);
      } else {
        console.log(`✅ Deleted ${toDelete.length} utilities`);
      }
    }

    // Update existing utilities
    for (const utility of toKeep) {
      const { error: updateError } = await supabase
        .from('utilities')
        .update({
          name: utility.name,
          category: utility.category,
          description: utility.description,
          version: utility.version,
          size: utility.size,
          is_active: true,
          features: utility.features,
          updated_at: new Date().toISOString()
        })
        .eq('id', utility.id);

      if (updateError) {
        console.error(`❌ Error updating ${utility.name}:`, updateError);
      } else {
        console.log(`✅ Updated: ${utility.name}`);
      }
    }

    // Create missing utilities
    for (const utility of missing) {
      const { error: insertError } = await supabase
        .from('utilities')
        .insert({
          name: utility.name,
          category: utility.category,
          description: utility.description,
          version: utility.version,
          size: utility.size,
          is_active: true,
          features: utility.features,
          downloads: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error(`❌ Error creating ${utility.name}:`, insertError);
      } else {
        console.log(`✅ Created: ${utility.name}`);
      }
    }

    console.log('\n✅ Utilities reset complete!');
    console.log('\n📋 Final utilities:');
    console.log('   1. Lot Size Calculator (Risk Management)');
    console.log('   2. News Pro (Market Analysis)');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the reset
resetUtilities()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

