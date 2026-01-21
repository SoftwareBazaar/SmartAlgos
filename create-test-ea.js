const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// Test EA data
const testEA = {
  name: "Test Subscription Flow EA",
  description: "Test EA for verifying subscription and download flow works correctly",
  category: "scalping",
  price_weekly: 6.99,
  price_monthly: 18.00,
  price_yearly: 97.00,
  win_rate: 75,
  max_drawdown: 5.2,
  supported_pairs: ["EURUSD", "GBPUSD", "USDJPY"],
  timeframes: ["M1", "M5", "M15"],
  version: "1.0.0",
  is_active: true,
  status: "approved"
};

async function createTestEA() {
  try {
    console.log('Creating test EA for subscription flow testing...');

    // Create form data
    const formData = new FormData();

    // Add EA data
    formData.append('name', testEA.name);
    formData.append('description', testEA.description);
    formData.append('category', testEA.category);
    formData.append('price_weekly', testEA.price_weekly);
    formData.append('price_monthly', testEA.price_monthly);
    formData.append('price_yearly', testEA.price_yearly);
    formData.append('version', testEA.version);
    formData.append('win_rate', testEA.win_rate);
    formData.append('max_drawdown', testEA.max_drawdown);
    formData.append('supported_pairs', JSON.stringify(testEA.supported_pairs));
    formData.append('timeframes', JSON.stringify(testEA.timeframes));
    formData.append('is_active', testEA.is_active);
    formData.append('status', testEA.status);

    // Add files
    if (fs.existsSync('test-ea-file.ex4')) {
      formData.append('eaFile', fs.createReadStream('test-ea-file.ex4'));
    }

    if (fs.existsSync('test-ea-settings.set')) {
      formData.append('setFile', fs.createReadStream('test-ea-settings.set'));
    }

    if (fs.existsSync('test-ea-manual.pdf')) {
      formData.append('manualFile', fs.createReadStream('test-ea-manual.pdf'));
    }

    // Create a test screenshot (simple text file for testing)
    const testScreenshot = Buffer.from('Test Screenshot Data');
    formData.append('screenshots', testScreenshot, {
      filename: 'test-screenshot.png',
      contentType: 'image/png'
    });

    // Make API call
    const response = await axios.post('http://localhost:5000/api/eas', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer test-token' // You'll need to get a real token
      }
    });

    if (response.data.success) {
      console.log('✅ Test EA created successfully!');
      console.log('EA ID:', response.data.data.id);
      console.log('You can now test the subscription flow with this EA.');
    } else {
      console.error('❌ Failed to create test EA:', response.data.message);
    }

  } catch (error) {
    console.error('❌ Error creating test EA:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the script
createTestEA();
