/**
 * Manually Resend Email for a Subscription
 * Use this to resend download link emails for existing subscriptions
 */

require('dotenv').config();
const databaseService = require('./services/databaseService');
const emailService = require('./services/emailService');
const jwt = require('jsonwebtoken');

async function resendSubscriptionEmail(subscriptionId) {
  console.log('\n📧 ========== RESENDING SUBSCRIPTION EMAIL ==========\n');
  console.log(`Subscription ID: ${subscriptionId}\n`);

  try {
    const supabase = databaseService.getClient();
    
    if (!supabase) {
      console.error('❌ Supabase client not available');
      return;
    }

    // 1. Get subscription
    console.log('1️⃣ Fetching subscription...');
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (subError || !subscription) {
      console.error('❌ Subscription not found:', subError?.message);
      return;
    }

    console.log('✅ Subscription found');
    console.log(`   User ID: ${subscription.user_id}`);
    console.log(`   EA ID: ${subscription.ea_id}`);
    console.log(`   Status: ${subscription.status}`);
    console.log(`   Payment Method: ${subscription.payment_method}`);
    console.log('');

    // 2. Get user details
    console.log('2️⃣ Fetching user details...');
    const { data: user, error: userError } = await supabase
      .from('users_accounts')
      .select('email, first_name, last_name')
      .eq('id', subscription.user_id)
      .single();

    if (userError || !user || !user.email) {
      console.error('❌ User not found or no email:', userError?.message);
      return;
    }

    console.log('✅ User found');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.first_name} ${user.last_name}`);
    console.log('');

    // 3. Get EA details
    console.log('3️⃣ Fetching EA details...');
    const { data: ea, error: eaError } = await supabase
      .from('expert_advisors')
      .select('*')
      .eq('id', subscription.ea_id)
      .single();

    if (eaError || !ea) {
      console.error('❌ EA not found:', eaError?.message);
      return;
    }

    console.log('✅ EA found');
    console.log(`   Name: ${ea.name}`);
    console.log(`   Has ZIP: ${!!ea.zip_file_path}`);
    console.log(`   Has EA file: ${!!ea.ea_file_path}`);
    console.log(`   Has SET file: ${!!ea.set_file_path}`);
    console.log(`   Has Manual: ${!!ea.manual_file_path}`);
    console.log('');

    // 4. Generate download links
    console.log('4️⃣ Generating download links...');
    const downloadToken = jwt.sign(
      {
        subscriptionId: subscription.id,
        userId: subscription.user_id,
        eaId: ea.id,
        timestamp: Date.now()
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    
    const downloadLinks = {
      zip_package: ea.zip_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}/zip?token=${downloadToken}` : null,
      ea_file: ea.ea_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=ea_file` : null,
      set_file: ea.set_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=set_file` : null,
      manual: ea.manual_file_path ? `${baseUrl}/api/downloads/ea/${ea.id}?token=${downloadToken}&type=manual` : null
    };

    console.log('✅ Download links generated');
    console.log(`   ZIP package: ${downloadLinks.zip_package ? 'YES' : 'NO'}`);
    console.log(`   EA file: ${downloadLinks.ea_file ? 'YES' : 'NO'}`);
    console.log(`   SET file: ${downloadLinks.set_file ? 'YES' : 'NO'}`);
    console.log(`   Manual: ${downloadLinks.manual ? 'YES' : 'NO'}`);
    console.log('');

    // 5. Send email
    console.log('5️⃣ Sending email...');
    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Valued Customer';
    
    const emailResult = await emailService.sendDownloadEmail({
      userEmail: user.email,
      userName: userName,
      eaName: ea.name,
      downloadLinks: downloadLinks,
      subscriptionType: subscription.subscription_type || 'monthly',
      subscriptionId: subscription.id
    });

    if (emailResult.success) {
      console.log('✅ Email sent successfully!');
      console.log(`   Message ID: ${emailResult.messageId}`);
      console.log(`   Sent to: ${user.email}`);
      console.log('');
      console.log('📧 ========== EMAIL SENT SUCCESSFULLY ==========\n');
      console.log('✅ User should receive email within 1-2 minutes');
      console.log('✅ Check spam folder if not in inbox');
    } else {
      console.error('❌ Email failed!');
      console.error(`   Error: ${emailResult.error}`);
      console.error(`   Code: ${emailResult.code}`);
      console.log('');
      console.log('📧 ========== EMAIL FAILED ==========\n');
      console.log('❌ Check the error above');
      console.log('❌ Verify EMAIL_USER and EMAIL_PASSWORD are correct');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

// Get subscription ID from command line
const subscriptionId = process.argv[2];

if (!subscriptionId) {
  console.log('Usage: node resend-subscription-email.js <subscription-id>');
  console.log('');
  console.log('Example:');
  console.log('  node resend-subscription-email.js abc-123-def-456');
  console.log('');
  console.log('To find subscription IDs, run:');
  console.log('  node check-recent-payments.js');
  process.exit(1);
}

// Run the resend
resendSubscriptionEmail(subscriptionId)
  .then(() => {
    console.log('Resend completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Resend failed:', error);
    process.exit(1);
  });
