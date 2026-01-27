/**
 * Add Professional Lot Size Calculator Utility
 * Run this to add the utility to your database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function addUtility() {
  try {
    console.log('🚀 Adding Professional Lot Size Calculator...\n');

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const utility = {
      name: 'Professional Lot Size Calculator',
      description: 'Advanced position sizing calculator with risk management features. Calculate optimal lot sizes based on your account balance, risk percentage, and stop loss distance. Supports multiple currency pairs and includes real-time pip value calculations.',
      category: 'Risk Management',
      features: [
        'Multi-currency support (30+ pairs)',
        'Real-time pip value calculator',
        'Risk percentage customization (0.5% - 5%)',
        'Stop loss distance calculator',
        'Account balance tracker',
        'Position size recommendations',
        'Risk-reward ratio analysis',
        'Margin requirement calculator'
      ],
      download_url: '/downloads/professional-lotsize-calculator.exe',
      version: '3.2.1',
      size: '4.5 MB',
      downloads: 0,
      image: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Add+Your+Image+Here',
      image_timestamp: null,
      previews: ['https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Preview+1'],
      guide: {
        title: 'Professional Lot Size Calculator - Quick Start Guide',
        steps: [
          'Download and extract the calculator to your preferred location',
          'Run the executable file (no installation required)',
          'Enter your account balance in your base currency',
          'Select your currency pair from the dropdown menu',
          'Set your desired risk percentage (recommended: 1-2%)',
          'Enter your stop loss distance in pips',
          'Click "Calculate" to see optimal lot size',
          'Review the risk amount and margin requirements',
          'Use the suggested lot size for your trade',
          'Save your settings for future quick calculations'
        ]
      },
      is_active: true
    };

    const { data, error } = await supabase
      .from('utilities')
      .insert([utility])
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('✅ Successfully added utility!\n');
    console.log('📝 Utility Details:');
    console.log(`   ID: ${data.id}`);
    console.log(`   Name: ${data.name}`);
    console.log(`   Category: ${data.category}`);
    console.log(`   Version: ${data.version}`);
    console.log(`   Features: ${data.features.length} features`);
    console.log('\n🎨 Next Steps:');
    console.log('   1. Go to Admin Dashboard → Utilities');
    console.log('   2. Click "Edit" on the Professional Lot Size Calculator');
    console.log('   3. Upload your custom image');
    console.log('   4. Click "Update Utility"');
    console.log('   5. Watch it sync across web and desktop! ✨\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   - Your .env file has valid Supabase credentials');
    console.log('   - The utilities table exists in your database');
    console.log('   - You ran the migration script\n');
    process.exit(1);
  }
}

addUtility();
