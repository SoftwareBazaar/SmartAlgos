/**
 * Migrate Utilities from localStorage to Supabase
 * Run this once to move existing utilities to the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Default utilities data (in case localStorage is empty)
const defaultUtilities = [
  {
    name: 'Lot Size Calculator',
    description: 'Calculate optimal position sizes based on risk management rules and account balance',
    category: 'Risk Management',
    features: [
      'Account balance-based calculations',
      'Risk percentage settings',
      'Multiple currency pair support',
      'Real-time market data integration'
    ],
    download_url: '/downloads/lot-size-calculator.exe',
    version: '2.1.0',
    size: '2.3 MB',
    downloads: 15420,
    image: '/api/placeholder/400/300',
    previews: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
    guide: {
      title: 'Lot Size Calculator Guide',
      steps: [
        'Download and install the calculator',
        'Enter your account balance',
        'Set your risk percentage (1-5% recommended)',
        'Select your currency pair',
        'The calculator will show optimal lot size',
        'Adjust based on market conditions'
      ]
    }
  },
  {
    name: 'Economic Calendar Tool',
    description: 'Track important economic events and news releases that impact forex markets',
    category: 'Market Analysis',
    features: [
      'Real-time economic events',
      'Impact level indicators',
      'Currency pair filtering',
      'Custom event alerts'
    ],
    download_url: '/downloads/economic-calendar.exe',
    version: '1.8.5',
    size: '1.8 MB',
    downloads: 12350,
    image: '/api/placeholder/400/300',
    previews: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
    guide: {
      title: 'Economic Calendar Guide',
      steps: [
        'Install the calendar tool',
        'Configure your timezone',
        'Select countries to monitor',
        'Set up custom alerts',
        'Review daily economic events',
        'Plan your trading strategy'
      ]
    }
  },
  {
    name: 'Profit Calculator',
    description: 'Calculate potential profits and losses for different trading scenarios',
    category: 'Trading Tools',
    features: [
      'Pip value calculations',
      'Profit/loss scenarios',
      'Multiple timeframe analysis',
      'Risk-reward ratios'
    ],
    download_url: '/downloads/profit-calculator.exe',
    version: '1.5.2',
    size: '1.2 MB',
    downloads: 8750,
    image: '/api/placeholder/400/300',
    previews: ['/api/placeholder/400/300'],
    guide: {
      title: 'Profit Calculator Guide',
      steps: [
        'Download the calculator',
        'Enter trade parameters',
        'Set entry and exit prices',
        'Calculate potential profit/loss',
        'Analyze risk-reward ratio'
      ]
    }
  },
  {
    name: 'Market Hours Tracker',
    description: 'Monitor trading session times and market overlaps for optimal trading opportunities',
    category: 'Market Analysis',
    features: [
      'All major trading sessions',
      'Market overlap indicators',
      'Timezone conversions',
      'Session strength analysis'
    ],
    download_url: '/downloads/market-hours.exe',
    version: '2.0.1',
    size: '1.5 MB',
    downloads: 6890,
    image: '/api/placeholder/400/300',
    previews: ['/api/placeholder/400/300'],
    guide: {
      title: 'Market Hours Guide',
      steps: [
        'Install the tracker',
        'Set your timezone',
        'Monitor session overlaps',
        'Plan trading times',
        'Track session strength'
      ]
    }
  }
];

async function migrateUtilities() {
  try {
    console.log('🚀 Starting utilities migration to Supabase...\n');

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials. Check your .env file.');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if utilities already exist
    const { data: existingUtilities, error: checkError } = await supabase
      .from('utilities')
      .select('id');

    if (checkError) {
      throw new Error(`Error checking existing utilities: ${checkError.message}`);
    }

    if (existingUtilities && existingUtilities.length > 0) {
      console.log(`⚠️  Found ${existingUtilities.length} existing utilities in database.`);
      console.log('   Skipping migration to avoid duplicates.');
      console.log('   Delete existing utilities first if you want to re-import.\n');
      return;
    }

    console.log('📊 Preparing utilities for migration...');
    console.log(`   Total utilities to migrate: ${defaultUtilities.length}\n`);

    // Insert utilities
    const { data, error } = await supabase
      .from('utilities')
      .insert(defaultUtilities.map(utility => ({
        ...utility,
        image_timestamp: Date.now()
      })))
      .select();

    if (error) {
      throw new Error(`Error inserting utilities: ${error.message}`);
    }

    console.log('✅ Migration completed successfully!');
    console.log(`   Migrated ${data.length} utilities to Supabase\n`);

    // Display migrated utilities
    console.log('📝 Migrated utilities:');
    data.forEach((utility, index) => {
      console.log(`   ${index + 1}. ${utility.name} (${utility.category})`);
    });

    console.log('\n🎉 All done! Utilities are now synced across web and desktop.');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('   Please check your Supabase configuration and try again.');
    process.exit(1);
  }
}

// Run migration
migrateUtilities();
