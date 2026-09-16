/**
 * Test email sending functionality
 * Run: node test-email.js
 */

require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmail() {
  console.log('🧪 Testing Email Service...\n');

  // Check environment variables
  console.log('📋 Environment Check:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ SET (hidden)' : '❌ NOT SET');
  console.log('');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Email credentials not configured!');
    console.log('\n💡 Add to .env file:');
    console.log('EMAIL_USER=softwarebazaar.ke@gmail.com');
    console.log('EMAIL_PASSWORD=<gmail-app-password-from-env>');
    process.exit(1);
  }

  // Test email data
  const testData = {
    userEmail: 'softwarebazaar.ke@gmail.com', // Send to yourself for testing
    userName: 'Test User',
    eaName: 'Gold Scalper Pro',
    downloadLinks: {
      zip_package: 'https://example.com/download/zip?token=test123',
      ea_file: 'https://example.com/download/ea?token=test123',
      set_file: 'https://example.com/download/set?token=test123',
      manual: 'https://example.com/download/manual?token=test123'
    },
    subscriptionType: 'monthly',
    subscriptionId: 'test-sub-123'
  };

  console.log('📧 Sending test email to:', testData.userEmail);
  console.log('');

  try {
    const result = await emailService.sendDownloadEmail(testData);

    if (result.success) {
      console.log('✅ Email sent successfully!');
      console.log('📬 Message ID:', result.messageId);
      console.log('');
      console.log('🎉 Check your inbox:', testData.userEmail);
      console.log('📁 Also check spam/junk folder');
    } else {
      console.error('❌ Email failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('');
    console.error('🔍 Common issues:');
    console.error('1. Gmail App Password incorrect');
    console.error('2. 2-Step Verification not enabled');
    console.error('3. "Less secure app access" needed');
    console.error('4. Network/firewall blocking SMTP');
  }

  process.exit(0);
}

testEmail();
