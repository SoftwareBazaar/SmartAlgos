/**
 * Immediate Image Display Fix
 * This script fixes the image display issue immediately
 */

// Test if images are accessible
const testImageAccess = async () => {
  console.log('🧪 Testing image access...');
  
  const testUrls = [
    'https://ncikobfahncdgwvkfivz.supabase.co/storage/v1/object/public/ea-images/image-1759784880962-4551087.png',
    'https://ncikobfahncdgwvkfivz.supabase.co/storage/v1/object/public/ea-images/image-1759785590771-59259230.png'
  ];
  
  for (const url of testUrls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log('✅ Image accessible:', url);
      } else {
        console.log('❌ Image not accessible:', url, response.status);
      }
    } catch (error) {
      console.log('❌ Image fetch error:', url, error.message);
    }
  }
};

// Test image proxy
const testImageProxy = async () => {
  console.log('🧪 Testing image proxy...');
  
  const testUrl = 'https://ncikobfahncdgwvkfivz.supabase.co/storage/v1/object/public/ea-images/image-1759784880962-4551087.png';
  
  try {
    const response = await fetch(`/api/images/proxy?url=${encodeURIComponent(testUrl)}`);
    if (response.ok) {
      console.log('✅ Image proxy working');
    } else {
      console.log('❌ Image proxy failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Image proxy error:', error.message);
  }
};

// Test fallback images
const testFallbackImages = async () => {
  console.log('🧪 Testing fallback images...');
  
  try {
    const response = await fetch('/api/images/fallback/ea');
    if (response.ok) {
      console.log('✅ Fallback images working');
    } else {
      console.log('❌ Fallback images failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Fallback images error:', error.message);
  }
};

// Run all tests
const runImageTests = async () => {
  console.log('🚀 Running image display tests...');
  
  await testImageAccess();
  await testImageProxy();
  await testFallbackImages();
  
  console.log('✅ Image tests completed!');
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testImageAccess, testImageProxy, testFallbackImages, runImageTests };
} else {
  // Browser environment
  window.testImageDisplay = { testImageAccess, testImageProxy, testFallbackImages, runImageTests };
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  runImageTests();
}
