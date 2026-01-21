const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

console.log('Creating Test EA with Files for Download Testing');
console.log('================================================\n');

async function createTestEAWithFiles() {
  try {
    // Create test files if they don't exist
    const testFiles = {
      eaFile: 'test-ea-file.ex4',
      setFile: 'test-ea-settings.set',
      manualFile: 'test-ea-manual.pdf'
    };

    // Create test EA file
    if (!fs.existsSync(testFiles.eaFile)) {
      fs.writeFileSync(testFiles.eaFile, '// Test EA File Content\n// This is a test EA file for download testing\n');
      console.log('✅ Created test EA file');
    }

    // Create test settings file
    if (!fs.existsSync(testFiles.setFile)) {
      fs.writeFileSync(testFiles.setFile, '; Test EA Settings\nTestParameter=100\n');
      console.log('✅ Created test settings file');
    }

    // Create test manual file
    if (!fs.existsSync(testFiles.manualFile)) {
      fs.writeFileSync(testFiles.manualFile, 'Test EA Manual\nThis is a test manual for download testing.');
      console.log('✅ Created test manual file');
    }

    // Create form data
    const formData = new FormData();

    // Add EA data
    formData.append('name', 'Test Download EA');
    formData.append('description', 'Test EA for verifying download functionality works correctly');
    formData.append('category', 'scalping');
    formData.append('price_weekly', '6.99');
    formData.append('price_monthly', '18.00');
    formData.append('price_yearly', '97.00');
    formData.append('version', '1.0.0');
    formData.append('strategy_type', 'scalping');
    formData.append('win_rate', '75');
    formData.append('max_drawdown', '5.2');
    formData.append('supported_pairs', JSON.stringify(['EURUSD', 'GBPUSD', 'USDJPY']));
    formData.append('timeframes', JSON.stringify(['M1', 'M5', 'M15']));
    formData.append('is_active', 'true');
    formData.append('status', 'approved');

    // Add files
    formData.append('eaFile', fs.createReadStream(testFiles.eaFile));
    formData.append('setFile', fs.createReadStream(testFiles.setFile));
    formData.append('manualFile', fs.createReadStream(testFiles.manualFile));

    // Create a test screenshot
    const testScreenshot = Buffer.from('Test Screenshot Data');
    formData.append('screenshots', testScreenshot, {
      filename: 'test-screenshot.png',
      contentType: 'image/png'
    });

    console.log('📤 Uploading test EA with files...');

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
      console.log('EA Name:', response.data.data.name);
      console.log('\n📋 Files uploaded:');
      console.log('- EA File:', response.data.data.ea_file ? 'Yes' : 'No');
      console.log('- Settings File:', response.data.data.set_file ? 'Yes' : 'No');
      console.log('- Manual File:', response.data.data.manual_file ? 'Yes' : 'No');
      console.log('- Screenshots:', response.data.data.screenshots ? 'Yes' : 'No');

      console.log('\n🎯 Next steps:');
      console.log('1. Test subscription flow with this EA');
      console.log('2. Verify download functionality works');
      console.log('3. Check that all files are downloadable');

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
createTestEAWithFiles();
