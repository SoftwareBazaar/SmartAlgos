/**
 * Test Image URLs Directly
 * Check if Supabase Storage images are accessible
 */

const https = require('https');

const testUrls = [
  'https://ncikobfahncdgwvkfivz.supabase.co/storage/v1/object/public/ea-images/image-1759784880962-4551087.png',
  'https://ncikobfahncdgwvkfivz.supabase.co/storage/v1/object/public/ea-images/image-1759785590771-59259230.png',
  'https://ncikobfahncdgwvkfivz.supabase.co/storage/v1/object/public/ea-screenshots/image-1759871730248-24446785.jpg'
];

console.log('🧪 Testing Supabase Storage URLs...\n');

const testUrl = (url, index) => {
  return new Promise((resolve) => {
    console.log(`Testing ${index + 1}: ${url}`);
    
    const req = https.get(url, (res) => {
      console.log(`✅ URL ${index + 1}: Status ${res.statusCode}`);
      console.log(`   Content-Type: ${res.headers['content-type']}`);
      console.log(`   Content-Length: ${res.headers['content-length']}`);
      
      if (res.statusCode === 200) {
        console.log(`   ✅ Image ${index + 1} is accessible!\n`);
        resolve({ url, status: 'success', statusCode: res.statusCode });
      } else {
        console.log(`   ❌ Image ${index + 1} returned status ${res.statusCode}\n`);
        resolve({ url, status: 'error', statusCode: res.statusCode });
      }
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Image ${index + 1} failed: ${error.message}\n`);
      resolve({ url, status: 'error', error: error.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`   ❌ Image ${index + 1} timed out\n`);
      req.destroy();
      resolve({ url, status: 'timeout' });
    });
  });
};

const testAllUrls = async () => {
  console.log('Starting URL tests...\n');
  
  const results = [];
  for (let i = 0; i < testUrls.length; i++) {
    const result = await testUrl(testUrls[i], i);
    results.push(result);
  }
  
  console.log('\n📊 TEST RESULTS SUMMARY:');
  console.log('========================');
  
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const timeoutCount = results.filter(r => r.status === 'timeout').length;
  
  console.log(`✅ Successful: ${successCount}/${testUrls.length}`);
  console.log(`❌ Errors: ${errorCount}/${testUrls.length}`);
  console.log(`⏱️  Timeouts: ${timeoutCount}/${testUrls.length}`);
  
  if (successCount === testUrls.length) {
    console.log('\n🎉 ALL IMAGES ARE ACCESSIBLE!');
    console.log('The issue is in the frontend display, not the URLs.');
  } else {
    console.log('\n🚨 SOME IMAGES ARE NOT ACCESSIBLE!');
    console.log('We need to check Supabase Storage permissions or re-upload images.');
  }
  
  return results;
};

// Run the tests
testAllUrls().then(results => {
  console.log('\n🔍 DETAILED RESULTS:');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.url}`);
    console.log(`   Status: ${result.status}`);
    if (result.statusCode) console.log(`   HTTP Code: ${result.statusCode}`);
    if (result.error) console.log(`   Error: ${result.error}`);
    console.log('');
  });
}).catch(error => {
  console.error('Test failed:', error);
});
