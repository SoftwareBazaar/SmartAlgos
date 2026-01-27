/**
 * Test Custom EA Request Email Notification
 * Run this to test if email notifications work for custom EA requests
 */

const emailService = require('./services/emailService');

async function testCustomEAEmail() {
  console.log('\n🧪 Testing Custom EA Request Email Notification\n');
  console.log('='.repeat(60));

  // Sample request data
  const sampleRequest = {
    id: 'req_test_' + Date.now(),
    userId: 'user_test_123',
    userEmail: 'customer@example.com',
    serviceType: 'new_ea',
    eaName: 'Test Scalping EA Pro',
    eaDescription: 'A professional scalping EA for testing email notifications',
    tradingStyle: 'scalping',
    platform: 'mt5',
    timeframe: 'M1',
    indicators: ['RSI', 'Moving Averages', 'MACD', 'Bollinger Bands'],
    riskManagement: ['Stop Loss', 'Take Profit', 'Trailing Stop', 'Position Sizing'],
    customFeatures: ['Multi-Currency', 'News Trading', 'Mobile Alerts'],
    timeline: '1 week',
    budget: '$500 - $1,000',
    urgency: 'medium',
    experience: 'intermediate',
    requirements: 'Need fast execution and low latency. Should work on multiple currency pairs.',
    status: 'pending',
    estimatedPrice: 750,
    createdAt: new Date().toISOString()
  };

  console.log('\n📋 Sample Request Data:');
  console.log('   EA Name:', sampleRequest.eaName);
  console.log('   Service Type:', sampleRequest.serviceType);
  console.log('   Customer Email:', sampleRequest.userEmail);
  console.log('   Estimated Price: $' + sampleRequest.estimatedPrice);

  console.log('\n📧 Sending test email...');
  
  try {
    const result = await emailService.sendCustomEARequestNotification(sampleRequest);
    
    if (result.success) {
      console.log('\n✅ SUCCESS! Email sent successfully');
      console.log('   Message ID:', result.messageId);
      console.log('\n📬 Check your admin email inbox!');
      console.log('   Admin Email:', process.env.ADMIN_EMAIL || process.env.EMAIL_USER);
    } else {
      console.log('\n❌ FAILED to send email');
      console.log('   Error:', result.error);
      
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('\n⚠️  Email not configured!');
        console.log('   Set these environment variables:');
        console.log('   - EMAIL_USER (your email address)');
        console.log('   - EMAIL_PASSWORD (your email password or app password)');
        console.log('   - ADMIN_EMAIL (optional, defaults to EMAIL_USER)');
      }
    }
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    console.error(error);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// Run the test
testCustomEAEmail()
  .then(() => {
    console.log('Test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
