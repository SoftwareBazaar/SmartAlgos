/**
 * Payment & License Integration Service
 * Automatically generates licenses after successful payments
 */

const licenseService = require('./licenseService');
const licenseEmailService = require('./licenseEmailService');
const databaseService = require('./databaseService');

/**
 * Map subscription type to license type
 */
function mapSubscriptionToLicenseType(subscriptionType) {
  const mapping = {
    'weekly': 'W1',
    'monthly': 'M1',
    'quarterly': 'M3',
    'yearly': 'Y1',
    'lifetime': 'LT'
  };
  
  return mapping[subscriptionType] || 'M1';
}

/**
 * Generate license after successful payment
 * Call this function after payment is confirmed
 */
async function generateLicenseAfterPayment(paymentData) {
  try {
    const {
      userId,
      userEmail,
      userName,
      mt5Account,
      eaId,
      subscriptionType,
      paymentId,
      paymentAmount,
      subscriptionId
    } = paymentData;

    console.log('🔑 Generating license after payment:', {
      userId,
      userEmail,
      eaId,
      subscriptionType,
      paymentId
    });

    // Validate MT5 account
    if (!mt5Account) {
      console.warn('⚠️ No MT5 account provided, license generation skipped');
      return {
        success: false,
        reason: 'MT5 account required for license generation'
      };
    }

    if (!/^\d{6,10}$/.test(mt5Account)) {
      console.error('❌ Invalid MT5 account format:', mt5Account);
      return {
        success: false,
        reason: 'Invalid MT5 account format (must be 6-10 digits)'
      };
    }

    // Get EA details
    let eaName = 'Expert Advisor';
    let downloadLink = null;
    
    if (eaId) {
      const ea = await databaseService.getEAById(eaId);
      if (ea) {
        eaName = ea.name;
        downloadLink = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/downloads/ea/${eaId}`;
      }
    }

    // Map subscription type to license type
    const licenseType = mapSubscriptionToLicenseType(subscriptionType);

    // Create license
    const license = await licenseService.createLicense({
      customerEmail: userEmail,
      customerName: userName,
      mt5Account,
      licenseType,
      purchaseDate: new Date(),
      paymentId,
      paymentAmount,
      eaId,
      userId
    });

    console.log('✅ License created:', license.license_key);

    // Update subscription with license key
    if (subscriptionId) {
      try {
        await databaseService.updateSubscription(subscriptionId, {
          license_key: license.license_key,
          mt5_account: mt5Account
        });
        console.log('✅ Subscription updated with license key');
      } catch (error) {
        console.error('⚠️ Failed to update subscription with license:', error.message);
        // Don't fail the whole process if subscription update fails
      }
    }

    // Send license email
    const emailResult = await licenseEmailService.sendLicenseEmail({
      customerEmail: userEmail,
      customerName: userName,
      licenseKey: license.license_key,
      licenseType,
      mt5Account,
      purchaseDate: license.purchase_date,
      expiryDate: license.expiry_date,
      eaName,
      downloadLink
    });

    if (emailResult.success) {
      console.log('✅ License email sent successfully');
    } else {
      console.warn('⚠️ License email failed:', emailResult.error);
    }

    return {
      success: true,
      license: {
        id: license.id,
        licenseKey: license.license_key,
        licenseType: license.license_type,
        mt5Account: license.mt5_account,
        expiryDate: license.expiry_date,
        isLifetime: license.is_lifetime
      },
      emailSent: emailResult.success
    };

  } catch (error) {
    console.error('❌ License generation after payment failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check and send expiring license notifications
 * Run this as a cron job daily
 */
async function sendExpiringLicenseNotifications() {
  try {
    console.log('📧 Checking for expiring licenses...');
    
    const expiringLicenses = await licenseService.getExpiringLicenses(7);
    
    console.log(`Found ${expiringLicenses.length} licenses expiring in 7 days`);

    for (const license of expiringLicenses) {
      const daysRemaining = Math.ceil(
        (new Date(license.expiry_date) - new Date()) / (1000 * 60 * 60 * 24)
      );

      // Get EA name
      let eaName = 'Expert Advisor';
      if (license.ea_id) {
        const ea = await databaseService.getEAById(license.ea_id);
        if (ea) eaName = ea.name;
      }

      // Build renewal link
      const renewalLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/marketplace/${license.ea_id}`;

      // Send notification
      await licenseEmailService.sendExpiringNotification({
        customerEmail: license.customer_email,
        customerName: license.customer_name,
        licenseKey: license.license_key,
        expiryDate: license.expiry_date,
        daysRemaining,
        eaName,
        renewalLink
      });

      console.log(`✅ Expiring notification sent to ${license.customer_email}`);
    }

    return {
      success: true,
      notificationsSent: expiringLicenses.length
    };

  } catch (error) {
    console.error('❌ Failed to send expiring notifications:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Deactivate expired licenses
 * Run this as a cron job daily
 */
async function deactivateExpiredLicenses() {
  try {
    console.log('🔒 Checking for expired licenses...');
    
    const allLicenses = await databaseService.query('ea_licenses', {
      filter: {
        is_active: true,
        is_lifetime: false
      }
    });

    const now = new Date();
    let deactivatedCount = 0;

    for (const license of allLicenses) {
      if (license.expiry_date) {
        const expiryDate = new Date(license.expiry_date);
        
        if (expiryDate < now) {
          await databaseService.update('ea_licenses', license.id, {
            is_active: false
          });
          
          console.log(`🔒 Deactivated expired license: ${license.license_key}`);
          deactivatedCount++;
        }
      }
    }

    console.log(`✅ Deactivated ${deactivatedCount} expired licenses`);

    return {
      success: true,
      deactivatedCount
    };

  } catch (error) {
    console.error('❌ Failed to deactivate expired licenses:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  generateLicenseAfterPayment,
  sendExpiringLicenseNotifications,
  deactivateExpiredLicenses,
  mapSubscriptionToLicenseType
};
