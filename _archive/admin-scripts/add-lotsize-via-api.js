/**
 * Add Professional Lot Size Calculator via API
 */

const http = require('http');

const utilityData = {
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
  image: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Upload+Your+Image',
  image_timestamp: null,
  previews: ['https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Preview'],
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
  }
};

const postData = JSON.stringify(utilityData);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/utilities',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': 'Bearer test_token' // Use test token for development
  }
};

console.log('🚀 Adding Professional Lot Size Calculator via API...\n');

const req = http.request(options, (res) => {
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(body);
      
      if (response.success) {
        console.log('✅ Successfully added utility!\n');
        console.log('📝 Utility Details:');
        console.log(`   ID: ${response.data.id}`);
        console.log(`   Name: ${response.data.name}`);
        console.log(`   Category: ${response.data.category}`);
        console.log(`   Version: ${response.data.version}`);
        console.log('\n🎨 Next Steps:');
        console.log('   1. Refresh your browser (Ctrl+R or F5)');
        console.log('   2. Go to Admin Dashboard → Utilities');
        console.log('   3. Click "Edit" on the Professional Lot Size Calculator');
        console.log('   4. Upload your custom image');
        console.log('   5. Click "Update Utility"');
        console.log('   6. Watch it sync across web and desktop! ✨\n');
      } else {
        console.error('❌ Failed:', response.message);
        if (response.error) {
          console.error('   Error:', response.error);
        }
      }
    } catch (e) {
      console.error('❌ Error parsing response:', body);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.log('\n💡 Make sure:');
  console.log('   - Your server is running (npm start)');
  console.log('   - Server is on port 5000');
  console.log('   - The utilities route is registered\n');
});

req.write(postData);
req.end();
