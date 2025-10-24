const https = require('https');

console.log('🔍 Testing if Supabase image URLs are accessible...\n');

const imageUrls = [
  'https://ncikobfahncdgwvkfivz.supabase.co/storage/v1/object/public/ea-images/image-1761323942458-135532022.png',
  'https://ncikobfahncdgwvkfivz.supabase.co/storage/v1/object/public/ea-images/image-1761323318605-897798338.png'
];

let completed = 0;

imageUrls.forEach((url, index) => {
  console.log(`Testing image ${index + 1}:`);
  console.log(`URL: ${url.substring(0, 80)}...`);
  
  https.get(url, (res) => {
    console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
    console.log(`   Content-Type: ${res.headers['content-type']}`);
    console.log(`   Content-Length: ${res.headers['content-length']} bytes`);
    
    if (res.statusCode === 200) {
      console.log('   ✅ IMAGE IS ACCESSIBLE!\n');
    } else {
      console.log('   ❌ IMAGE NOT ACCESSIBLE\n');
    }
    
    completed++;
    if (completed === imageUrls.length) {
      console.log('🎯 DIAGNOSIS COMPLETE');
      console.log('If images are accessible but not showing in browser:');
      console.log('1. Check browser console for CSP errors');
      console.log('2. Try hard refresh: Ctrl+Shift+R');
      console.log('3. Check if images are being blocked by browser');
    }
  }).on('error', (err) => {
    console.log(`   ❌ ERROR: ${err.message}\n`);
    completed++;
  });
});