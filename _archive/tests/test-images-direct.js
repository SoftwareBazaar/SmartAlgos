/**
 * Test Images Direct Access
 * Check if Supabase Storage images are accessible
 */

const testImageUrls = [
  'https://ncikobfahncdgwvkfivz.supabase.co/storage/v1/object/public/ea-images/image-1759784880962-4551087.png',
  'https://ncikobfahncdgwvkfivz.supabase.co/storage/v1/object/public/ea-images/image-1759785590771-59259230.png'
];

console.log('🧪 Testing image URLs...');

testImageUrls.forEach((url, index) => {
  console.log(`Testing image ${index + 1}: ${url}`);
  
  // Create image element to test
  const img = new Image();
  
  img.onload = () => {
    console.log(`✅ Image ${index + 1} loaded successfully`);
  };
  
  img.onerror = () => {
    console.log(`❌ Image ${index + 1} failed to load`);
  };
  
  img.src = url;
});

// Test with fetch
testImageUrls.forEach(async (url, index) => {
  try {
    const response = await fetch(url, { mode: 'no-cors' });
    console.log(`Fetch test ${index + 1}: ${response.status}`);
  } catch (error) {
    console.log(`Fetch test ${index + 1} error:`, error.message);
  }
});

console.log('✅ Image tests initiated');
