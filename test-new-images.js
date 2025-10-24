/**
 * Test New Images
 */

const databaseService = require('./services/databaseService');

async function testNewImages() {
  console.log('🧪 Testing new images...\n');

  try {
    const eas = await databaseService.getEAs({ limit: 2 });
    
    console.log('📊 EA Data Retrieved:');
    console.log('  Count:', eas.length);
    
    if (eas.length > 0) {
      eas.forEach((ea, index) => {
        console.log(`\n📸 EA ${index + 1}:`);
        console.log('  ID:', ea.id);
        console.log('  Name:', ea.name);
        console.log('  Has Image:', !!ea.image);
        console.log('  Image URL:', ea.image);
        
        if (ea.image) {
          console.log('  ✅ Image field exists');
        } else {
          console.log('  ❌ Image field missing');
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing images:', error);
  }
}

testNewImages();
