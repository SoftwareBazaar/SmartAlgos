const https = require('https');

console.log('🔍 Checking your EA images...\n');

https.get('https://web-production-fdb58.up.railway.app/api/eas', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Raw API response:', JSON.stringify(response, null, 2));
      
      const eas = Array.isArray(response) ? response : (response.data || []);
      console.log(`Found ${eas.length} EAs in database\n`);
      
      if (!Array.isArray(eas)) {
        console.log('❌ API returned non-array data:', typeof response);
        return;
      }
      
      let hasImages = 0;
      let hasSupabaseUrls = 0;
      let hasLocalUrls = 0;
      let hasNoImages = 0;
      
      eas.forEach((ea, index) => {
        console.log(`${index + 1}. ${ea.name}`);
        
        if (!ea.image) {
          console.log('   ❌ NO IMAGE');
          hasNoImages++;
        } else if (ea.image.includes('supabase.co')) {
          console.log('   ✅ Supabase URL:', ea.image.substring(0, 60) + '...');
          hasSupabaseUrls++;
          hasImages++;
        } else if (ea.image.startsWith('/uploads/')) {
          console.log('   ⚠️  LOCAL URL (broken):', ea.image);
          hasLocalUrls++;
          hasImages++;
        } else {
          console.log('   ❓ UNKNOWN URL:', ea.image);
          hasImages++;
        }
        console.log('');
      });
      
      console.log('📊 SUMMARY:');
      console.log(`   Total EAs: ${eas.length}`);
      console.log(`   With images: ${hasImages}`);
      console.log(`   Supabase URLs: ${hasSupabaseUrls}`);
      console.log(`   Local URLs (broken): ${hasLocalUrls}`);
      console.log(`   No images: ${hasNoImages}\n`);
      
      if (hasLocalUrls > 0) {
        console.log('🚨 PROBLEM FOUND:');
        console.log('   Your EAs have LOCAL image URLs that are broken!');
        console.log('   These were uploaded before we switched to Supabase.');
        console.log('   SOLUTION: Re-upload images through admin panel.\n');
      }
      
      if (hasNoImages > 0) {
        console.log('⚠️  WARNING:');
        console.log('   Some EAs have no images at all.');
        console.log('   Upload images for these EAs.\n');
      }
      
      if (hasSupabaseUrls > 0) {
        console.log('✅ GOOD NEWS:');
        console.log('   Some EAs have Supabase URLs - these should work!');
        console.log('   If they still don\'t show, the issue is elsewhere.\n');
      }
      
      console.log('🎯 NEXT STEPS:');
      if (hasLocalUrls > 0) {
        console.log('   1. Go to admin panel: https://web-production-fdb58.up.railway.app/admin');
        console.log('   2. Edit each EA with broken local URLs');
        console.log('   3. Re-upload the images');
        console.log('   4. Save - images will now use Supabase URLs');
      } else if (hasSupabaseUrls > 0) {
        console.log('   1. Check if Supabase buckets are public (you did this)');
        console.log('   2. Check browser console for errors');
        console.log('   3. Try hard refresh: Ctrl+Shift+R');
      } else {
        console.log('   1. Upload images for your EAs');
        console.log('   2. Use the admin panel to add images');
      }
      
    } catch (error) {
      console.log('❌ Error parsing API response:', error.message);
    }
  });
}).on('error', (err) => {
  console.log('❌ Error fetching EA data:', err.message);
});
