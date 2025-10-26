const https = require('https');

console.log('🔍 Checking current image URLs in database...\n');

https.get('https://web-production-fdb58.up.railway.app/api/eas', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      const eas = response.data || response;
      
      console.log('📊 CURRENT IMAGE URLS:');
      console.log('====================\n');
      
      eas.forEach((ea, index) => {
        console.log(`${index + 1}. ${ea.name}`);
        if (ea.image) {
          console.log(`   Image URL: ${ea.image}`);
          
          // Check URL type
          if (ea.image.includes('supabase.co')) {
            console.log('   ✅ CORRECT: Supabase URL');
          } else if (ea.image.startsWith('/uploads/')) {
            console.log('   ❌ BROKEN: Local URL (will not work)');
          } else if (ea.image.startsWith('http')) {
            console.log('   ❓ UNKNOWN: External URL');
          } else {
            console.log('   ❓ UNKNOWN: Other format');
          }
        } else {
          console.log('   ❌ NO IMAGE');
        }
        console.log('');
      });
      
      // Summary
      const easWithImages = eas.filter(ea => ea.image);
      const supabaseUrls = easWithImages.filter(ea => ea.image.includes('supabase.co'));
      const localUrls = easWithImages.filter(ea => ea.image.startsWith('/uploads/'));
      
      console.log('📈 SUMMARY:');
      console.log(`   Total EAs: ${eas.length}`);
      console.log(`   EAs with images: ${easWithImages.length}`);
      console.log(`   Supabase URLs: ${supabaseUrls.length} ✅`);
      console.log(`   Local URLs: ${localUrls.length} ❌`);
      console.log(`   No images: ${eas.length - easWithImages.length}`);
      
      if (localUrls.length > 0) {
        console.log('\n🚨 ISSUE FOUND:');
        console.log('   Some EAs have OLD local URLs that are broken!');
        console.log('   These need to be re-uploaded through admin panel.');
        console.log('\n📝 SOLUTION:');
        console.log('   1. Go to admin panel');
        console.log('   2. Edit each EA with broken local URL');
        console.log('   3. Re-upload the image');
        console.log('   4. Save - will get new Supabase URL');
      } else if (supabaseUrls.length > 0) {
        console.log('\n✅ GOOD NEWS:');
        console.log('   All EAs have correct Supabase URLs!');
        console.log('   Images should work with the CSP fix.');
      } else {
        console.log('\n⚠️  WARNING:');
        console.log('   No EAs have images at all.');
        console.log('   Upload images for your EAs.');
      }
      
    } catch (error) {
      console.log('❌ Error parsing API response:', error.message);
    }
  });
}).on('error', (err) => {
  console.log('❌ Error fetching EA data:', err.message);
});
