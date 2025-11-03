/**
 * Test Utility Image Upload Flow
 * Run this to verify the complete image upload and display flow works
 */

require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'softwarebazaar.ke@gmail.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Admin123!@#';

async function testUtilityImageFlow() {
  console.log('🧪 Testing Utility Image Upload Flow\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Login as admin
    console.log('\n📝 Step 1: Login as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Create a test image file
    console.log('\n📝 Step 2: Creating test image...');
    const testImagePath = path.join(__dirname, 'test-utility-image.png');
    // Create a simple 1x1 PNG (minimal valid PNG)
    const minimalPNG = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // Color type, etc.
      0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // Image data
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND
    ]);

    fs.writeFileSync(testImagePath, minimalPNG);
    console.log('✅ Test image created');

    // Step 3: Upload image
    console.log('\n📝 Step 3: Uploading image to /api/utilities/upload-image...');
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath), {
      filename: 'test-utility-image.png',
      contentType: 'image/png'
    });

    const uploadResponse = await axios.post(
      `${BASE_URL}/api/utilities/upload-image`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...formData.getHeaders()
        }
      }
    );

    if (!uploadResponse.data.success) {
      throw new Error('Upload failed: ' + uploadResponse.data.message);
    }

    const uploadedImageUrl = uploadResponse.data.data.imageUrl;
    console.log('✅ Image uploaded successfully');
    console.log('   Image URL:', uploadedImageUrl);
    console.log('   URL Type:', uploadedImageUrl.startsWith('http') ? 'Supabase URL' : 'Local path');

    // Step 4: Verify URL is valid
    console.log('\n📝 Step 4: Verifying uploaded image URL...');
    if (!uploadedImageUrl || uploadedImageUrl.includes('undefined')) {
      throw new Error('Invalid image URL returned: ' + uploadedImageUrl);
    }

    if (!uploadedImageUrl.startsWith('http')) {
      console.warn('⚠️  Warning: Image URL is not a Supabase URL (local path):', uploadedImageUrl);
    } else {
      console.log('✅ Image URL is valid Supabase URL');
    }

    // Step 5: Test fetching utilities to see if image appears
    console.log('\n📝 Step 5: Fetching utilities list...');
    const utilitiesResponse = await axios.get(`${BASE_URL}/api/utilities`);

    if (!utilitiesResponse.data.success) {
      throw new Error('Failed to fetch utilities');
    }

    const utilities = utilitiesResponse.data.data || [];
    console.log(`✅ Found ${utilities.length} utilities`);

    utilities.forEach((util, index) => {
      console.log(`\n   Utility ${index + 1}: ${util.name}`);
      console.log(`   - Image URL: ${util.image || 'NULL'}`);
      console.log(`   - Image Valid: ${util.image && !util.image.includes('undefined') ? 'YES' : 'NO'}`);
    });

    // Cleanup
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('\n🧹 Cleaned up test image file');

    console.log('\n✅ TEST COMPLETE - All steps passed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

testUtilityImageFlow();

