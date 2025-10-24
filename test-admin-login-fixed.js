/**
 * Test Admin Login After Rate Limiting Fix
 * Run this in browser console after deployment
 */

const testAdminLogin = async () => {
  console.log('🧪 Testing admin login...');
  
  try {
    const response = await fetch('/api/auth/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@smartalgos.com',
        password: 'Admin123!@#'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (response.status === 429) {
      console.error('❌ STILL RATE LIMITED! Status: 429');
      const text = await response.text();
      console.error('Response text:', text);
      return false;
    }
    
    if (!contentType || !contentType.includes('application/json')) {
      console.error('❌ Wrong content type! Expected JSON, got:', contentType);
      const text = await response.text();
      console.error('Response text:', text);
      return false;
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok && data.success) {
      console.log('✅ Admin login successful!');
      console.log('Token:', data.token);
      console.log('User:', data.user);
      return true;
    } else {
      console.log('⚠️  Login failed:', data.message);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
    return false;
  }
};

// Run test
testAdminLogin();
