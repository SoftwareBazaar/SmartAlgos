/**
 * Complete Fix for Image Display Issues
 * This script:
 * 1. Verifies Supabase Storage bucket setup
 * 2. Checks existing image URLs in database
 * 3. Tests image accessibility
 * 4. Provides diagnostic information
 */

const databaseService = require('./services/databaseService');
const https = require('https');
const http = require('http');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, { 
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    }, (res) => {
      resolve({
        accessible: res.statusCode === 200,
        statusCode: res.statusCode,
        contentType: res.headers['content-type']
      });
    });
    
    req.on('error', () => {
      resolve({ accessible: false, error: true });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ accessible: false, timeout: true });
    });
  });
}

async function main() {
  try {
    log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║   IMAGE DISPLAY FIX - Diagnostic & Repair Tool            ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

    // Initialize database
    log('🔧 Initializing database connection...', 'blue');
    await databaseService.initialize();
    
    if (databaseService.mockMode) {
      log('\n❌ ERROR: Database is in MOCK MODE', 'red');
      log('   Please set proper SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY', 'yellow');
      log('   in your environment variables or .env file', 'yellow');
      return;
    }
    
    log('✅ Database connected', 'green');

    // Step 1: Check Supabase Storage buckets
    log('\n' + '═'.repeat(60), 'cyan');
    log('STEP 1: Checking Supabase Storage Buckets', 'bright');
    log('═'.repeat(60), 'cyan');
    
    const { data: buckets, error: bucketsError } = await databaseService.supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      log('❌ Error fetching buckets: ' + bucketsError.message, 'red');
    } else {
      log(`\nFound ${buckets.length} storage buckets:\n`, 'green');
      
      const requiredBuckets = ['ea-images', 'ea-screenshots', 'ea-files'];
      const foundBuckets = {};
      
      buckets.forEach(bucket => {
        const icon = bucket.public ? '✅' : '❌';
        const status = bucket.public ? 'PUBLIC' : 'PRIVATE (PROBLEM!)';
        log(`${icon} ${bucket.name.padEnd(20)} - ${status}`, bucket.public ? 'green' : 'red');
        foundBuckets[bucket.name] = bucket;
      });
      
      // Check for missing buckets
      log('\n📋 Required Buckets Status:', 'blue');
      requiredBuckets.forEach(bucketName => {
        if (!foundBuckets[bucketName]) {
          log(`❌ ${bucketName} - MISSING (needs to be created)`, 'red');
        } else if (!foundBuckets[bucketName].public) {
          log(`⚠️  ${bucketName} - EXISTS but PRIVATE (needs to be made public)`, 'yellow');
        } else {
          log(`✅ ${bucketName} - Configured correctly`, 'green');
        }
      });
    }

    // Step 2: Check image URLs in database
    log('\n' + '═'.repeat(60), 'cyan');
    log('STEP 2: Checking Image URLs in Database', 'bright');
    log('═'.repeat(60), 'cyan');
    
    const { data: eas, error: easError } = await databaseService.supabase
      .from('expert_advisors')
      .select('id, name, image, image_url')
      .order('id', { ascending: false })
      .limit(10);
    
    if (easError) {
      log('❌ Error fetching EAs: ' + easError.message, 'red');
    } else {
      log(`\nFound ${eas.length} recent EAs:\n`, 'green');
      
      let supabaseCount = 0;
      let localPathCount = 0;
      let noImageCount = 0;
      let otherUrlCount = 0;
      
      for (const ea of eas) {
        const imageUrl = ea.image || ea.image_url;
        log(`\n📦 EA #${ea.id}: ${ea.name}`, 'blue');
        
        if (!imageUrl) {
          log('   ❌ No image URL', 'red');
          noImageCount++;
        } else {
          log(`   URL: ${imageUrl.substring(0, 80)}${imageUrl.length > 80 ? '...' : ''}`, 'cyan');
          
          if (imageUrl.includes('supabase.co/storage')) {
            log('   ✅ Supabase Storage URL', 'green');
            supabaseCount++;
            
            // Test accessibility
            log('   🔍 Testing accessibility...', 'yellow');
            const result = await testUrl(imageUrl);
            if (result.accessible) {
              log(`   ✅ Image is accessible (${result.contentType})`, 'green');
            } else if (result.timeout) {
              log('   ⚠️  Request timeout - check network/CORS', 'yellow');
            } else if (result.error) {
              log('   ❌ Network error - image not accessible', 'red');
            } else {
              log(`   ❌ HTTP ${result.statusCode} - image not accessible`, 'red');
            }
          } else if (imageUrl.startsWith('/uploads/')) {
            log('   ⚠️  Local filesystem path (will fail on Railway/deployment)', 'yellow');
            localPathCount++;
          } else if (imageUrl.startsWith('http')) {
            log('   ✅ External URL', 'green');
            otherUrlCount++;
          } else {
            log('   ❓ Unknown URL format', 'yellow');
            otherUrlCount++;
          }
        }
      }
      
      // Summary
      log('\n' + '─'.repeat(60), 'cyan');
      log('📊 Summary:', 'bright');
      log(`   ✅ Supabase Storage URLs: ${supabaseCount}`, supabaseCount > 0 ? 'green' : 'yellow');
      log(`   ⚠️  Local filesystem paths: ${localPathCount}`, localPathCount > 0 ? 'yellow' : 'green');
      log(`   📄 Other URLs: ${otherUrlCount}`, 'cyan');
      log(`   ❌ No images: ${noImageCount}`, noImageCount > 0 ? 'yellow' : 'green');
    }

    // Step 3: Recommendations
    log('\n' + '═'.repeat(60), 'cyan');
    log('STEP 3: Recommendations', 'bright');
    log('═'.repeat(60), 'cyan');
    
    log('\n📝 To fix image display issues:', 'blue');
    log('\n1. Run the SQL script to configure Supabase Storage:', 'yellow');
    log('   - Go to your Supabase Dashboard', 'cyan');
    log('   - Navigate to SQL Editor', 'cyan');
    log('   - Run: fix-supabase-storage-buckets.sql', 'cyan');
    
    log('\n2. If buckets are PRIVATE, make them PUBLIC:', 'yellow');
    log('   - Go to Storage in Supabase Dashboard', 'cyan');
    log('   - For each bucket (ea-images, ea-screenshots, ea-files):', 'cyan');
    log('     * Click the bucket', 'cyan');
    log('     * Go to Settings', 'cyan');
    log('     * Enable "Public bucket"', 'cyan');
    log('     * Save changes', 'cyan');
    
    log('\n3. Verify the frontend is using correct URLs:', 'yellow');
    log('   - Check browser console for image load errors', 'cyan');
    log('   - Look for CORS errors', 'cyan');
    log('   - Verify image URLs in network tab', 'cyan');
    
    log('\n4. If using Railway/Render, ensure environment variables are set:', 'yellow');
    log('   - SUPABASE_URL', 'cyan');
    log('   - SUPABASE_SERVICE_ROLE_KEY', 'cyan');
    log('   - SUPABASE_ANON_KEY', 'cyan');
    
    log('\n✅ Diagnostic complete!', 'green');
    log('\nIf you see "Supabase Storage URLs" and they are accessible,', 'cyan');
    log('the backend is working correctly. Check the frontend console', 'cyan');
    log('for any errors when trying to display images.\n', 'cyan');

  } catch (error) {
    log('\n❌ Error: ' + error.message, 'red');
    console.error(error);
  }
}

main();

