require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

async function createLotCalculatorUtility() {
  console.log('🔧 Creating Lot Size Calculator utility...\n');
  
  const utilityData = {
    name: 'Lot Size Calculator',
    description: 'Advanced lot size calculator for precise position sizing based on risk management principles. Calculate optimal lot sizes for different account balances, risk percentages, and trading strategies.',
    category: 'Risk Management',
    features: [
      'Account Balance Input',
      'Risk Percentage Calculator',
      'Stop Loss Distance Calculation',
      'Currency Pair Support',
      'Multiple Account Types',
      'Risk/Reward Ratio Analysis',
      'Position Size Optimization',
      'Real-time Calculations'
    ],
    download_url: 'https://ncikobfahncdgwvkfivz.supabase.co/storage/v1/object/public/utilities/lot-calculator-v1.0.exe',
    version: '1.0',
    size: '2.5 MB',
    image: '/uploads/utilities/lot-calculator-preview.jpg',
    previews: [
      '/uploads/utilities/lot-calculator-screenshot-1.jpg',
      '/uploads/utilities/lot-calculator-screenshot-2.jpg',
      '/uploads/utilities/lot-calculator-screenshot-3.jpg'
    ],
    guide: {
      title: 'How to Use the Lot Size Calculator',
      steps: [
        '1. Enter your account balance in your base currency',
        '2. Set your desired risk percentage (recommended: 1-2%)',
        '3. Input the stop loss distance in pips',
        '4. Select your trading currency pair',
        '5. Choose your account type (Standard, Mini, Micro)',
        '6. Click Calculate to get your optimal lot size',
        '7. Review the risk/reward analysis',
        '8. Adjust parameters as needed for your strategy'
      ]
    },
    is_active: true,
    downloads: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('utilities')
    .insert([utilityData])
    .select();
  
  if (error) {
    console.error('❌ Error creating utility:', error);
    return;
  }
  
  console.log('✅ Lot Size Calculator utility created successfully!');
  console.log('   - Name:', utilityData.name);
  console.log('   - Category:', utilityData.category);
  console.log('   - Version:', utilityData.version);
  console.log('   - Features:', utilityData.features.length, 'features');
  console.log('   - Guide steps:', utilityData.guide.steps.length, 'steps');
  console.log('   - Download URL:', utilityData.download_url);
}

createLotCalculatorUtility().then(() => process.exit(0)).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
