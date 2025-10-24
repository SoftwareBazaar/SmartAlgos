/**
 * Test Script: Create subscription without authentication
 * This simulates the subscription flow for testing purposes
 */

const databaseService = require('./services/databaseService');

async function createTestSubscription(eaId) {
  try {
    console.log(`\n🧪 Creating test subscription for EA #${eaId}...`);
    
    await databaseService.initialize();
    
    // Get EA details
    const ea = await databaseService.getEAById(eaId);
    if (!ea) {
      throw new Error(`EA #${eaId} not found`);
    }
    
    console.log(`✅ EA Found: ${ea.name}`);
    console.log(`   EA File: ${ea.ea_file_path || 'Not set'}`);
    console.log(`   Set File: ${ea.set_file_path || 'Not set'}`);
    console.log(`   Manual: ${ea.manual_file_path || 'Not set'}`);
    
    // Create subscription data
    const subscriptionData = {
      ea_id: parseInt(eaId),
      subscription_type: 'monthly',
      payment_method: 'paystack',
      payment_reference: `test_${Date.now()}_${eaId}`,
      status: 'active',
      has_access: true,
      payment_status: 'completed',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      price: ea.price_monthly || 18,
      currency: 'USD'
    };
    
    // If in mock mode, use mock user
    if (databaseService.mockMode) {
      console.log('📝 Using mock mode - creating subscription with mock user');
      const mockDataStore = require('./services/mockAuthStore').mockDataStore;
      
      // Get or create mock user
      let users = await mockDataStore.getUsers();
      if (users.length === 0) {
        // Create a test user
        await mockDataStore.createUser({
          email: 'test@example.com',
          password: 'hashedpassword',
          firstName: 'Test',
          lastName: 'User',
          role: 'user'
        });
        users = await mockDataStore.getUsers();
      }
      
      subscriptionData.user_id = users[0].id;
      
      const subscription = await mockDataStore.createSubscription(subscriptionData);
      
      console.log(`\n✅ Subscription Created!`);
      console.log(`   ID: ${subscription.id}`);
      console.log(`   Status: ${subscription.status}`);
      console.log(`   Has Access: ${subscription.has_access}`);
      console.log(`   End Date: ${subscription.end_date}`);
      
      // Generate download links
      console.log(`\n📥 Download Links:`);
      
      const files = {};
      
      if (ea.ea_file_path) {
        files.ea_file = ea.ea_file_path;
        console.log(`   ✅ EA File: ${ea.ea_file_path}`);
      }
      
      if (ea.set_file_path) {
        files.set_file = ea.set_file_path;
        console.log(`   ✅ Set File: ${ea.set_file_path}`);
      }
      
      if (ea.manual_file_path) {
        files.manual = ea.manual_file_path;
        console.log(`   ✅ Manual: ${ea.manual_file_path}`);
      }
      
      if (ea.screenshots && ea.screenshots.length > 0) {
        files.screenshots = ea.screenshots;
        console.log(`   ✅ Screenshots: ${ea.screenshots.length} files`);
      }
      
      if (Object.keys(files).length === 0) {
        console.log(`   ⚠️  No files available for download`);
      }
      
      console.log(`\n🎉 Test subscription created successfully!`);
      console.log(`\nYou can now test downloads with subscription ID: ${subscription.id}`);
      
      return {
        subscription,
        files,
        ea
      };
      
    } else {
      throw new Error('This script only works in mock mode. Set SUPABASE_URL to a placeholder to enable mock mode.');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const eaId = process.argv[2] || '5';
  
  createTestSubscription(eaId)
    .then(() => {
      console.log('\n✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Failed:', error.message);
      process.exit(1);
    });
} else {
  module.exports = createTestSubscription;
}

