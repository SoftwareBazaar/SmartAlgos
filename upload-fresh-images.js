/**
 * Upload Fresh Images for EAs
 */

const fs = require('fs');
const path = require('path');
const supabaseStorage = require('./services/supabaseStorage');

async function uploadFreshImages() {
  console.log('🖼️  Uploading fresh images for EAs...\n');

  try {
    // EA 1: Gold Scalper Pro v2.0
    console.log('📸 Uploading image for EA 1: Gold Scalper Pro v2.0');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x0F, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
      0x42, 0x60, 0x82
    ]);

    const imageUrl1 = await supabaseStorage.uploadImage(testImageBuffer, 'ea-images', 'gold-scalper-fresh.png');
    console.log('✅ EA 1 Image URL:', imageUrl1);

    // EA 5: Multi Indicator Scalping Arrows EA v6.0
    console.log('\n📸 Uploading image for EA 5: Multi Indicator Scalping Arrows EA v6.0');
    
    const imageUrl5 = await supabaseStorage.uploadImage(testImageBuffer, 'ea-images', 'multi-indicator-fresh.png');
    console.log('✅ EA 5 Image URL:', imageUrl5);

    // Update database with new image URLs
    console.log('\n💾 Updating database with new image URLs...');
    
    const databaseService = require('./services/databaseService');
    
    // Update EA 1
    await databaseService.updateEA(1, { 
      image: imageUrl1,
      screenshots: [imageUrl1] // Use same image as screenshot for now
    });
    console.log('✅ Updated EA 1 in database');

    // Update EA 5  
    await databaseService.updateEA(5, { 
      image: imageUrl5,
      screenshots: [imageUrl5] // Use same image as screenshot for now
    });
    console.log('✅ Updated EA 5 in database');

    console.log('\n🎉 Fresh images uploaded successfully!');
    console.log('🖼️  EA 1 Image:', imageUrl1);
    console.log('🖼️  EA 5 Image:', imageUrl5);

  } catch (error) {
    console.error('❌ Error uploading fresh images:', error);
  }
}

uploadFreshImages();
