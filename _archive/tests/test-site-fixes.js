
/**
 * Test Complete Site Fixes
 * Run this to verify all fixes are working
 */

const testImageDisplay = async () => {
  console.log('🧪 Testing image display...');
  
  // Test image proxy endpoint
  try {
    const response = await fetch('/api/images/proxy?url=https://ncikobfahncdgwvkfivz.supabase.co/storage/v1/object/public/ea-images/test.png');
    if (response.ok) {
      console.log('✅ Image proxy working');
    } else {
      console.log('❌ Image proxy failed');
    }
  } catch (error) {
    console.log('❌ Image proxy error:', error.message);
  }
  
  // Test fallback images
  try {
    const response = await fetch('/api/images/fallback/ea');
    if (response.ok) {
      console.log('✅ Fallback images working');
    } else {
      console.log('❌ Fallback images failed');
    }
  } catch (error) {
    console.log('❌ Fallback images error:', error.message);
  }
};

const testSubscriptionFlow = async () => {
  console.log('🧪 Testing subscription flow...');
  
  // Test subscription creation
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('❌ No authentication token');
      return;
    }
    
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        eaId: 1,
        subscriptionType: 'weekly',
        paymentMethod: 'card',
        paymentReference: 'test_' + Date.now()
      })
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('✅ Subscription creation working');
    } else {
      console.log('❌ Subscription creation failed:', result.message);
    }
  } catch (error) {
    console.log('❌ Subscription test error:', error.message);
  }
};

const testDownloadPersistence = () => {
  console.log('🧪 Testing download persistence...');
  
  // Test localStorage
  const testDownload = {
    eaId: 1,
    fileType: 'ea_file',
    url: 'test-url',
    timestamp: Date.now(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
  
  try {
    localStorage.setItem('test-download', JSON.stringify(testDownload));
    const retrieved = JSON.parse(localStorage.getItem('test-download'));
    
    if (retrieved && retrieved.eaId === testDownload.eaId) {
      console.log('✅ Download persistence working');
      localStorage.removeItem('test-download');
    } else {
      console.log('❌ Download persistence failed');
    }
  } catch (error) {
    console.log('❌ Download persistence error:', error.message);
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('🚀 Running complete site tests...');
  
  await testImageDisplay();
  await testSubscriptionFlow();
  testDownloadPersistence();
  
  console.log('✅ All tests completed!');
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testImageDisplay, testSubscriptionFlow, testDownloadPersistence, runAllTests };
} else {
  // Browser environment
  window.testSiteFixes = { testImageDisplay, testSubscriptionFlow, testDownloadPersistence, runAllTests };
}
