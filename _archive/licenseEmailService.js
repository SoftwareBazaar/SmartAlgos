/**
 * License Email Service
 * Sends license-related emails to customers
 */

const nodemailer = require('nodemailer');
const { LICENSE_TYPES } = require('./licenseService');

// Create email transporter
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️ Email not configured for license emails');
    return null;
  }

  return nodemailer.createTransporter({
    service: 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Send license key email after purchase
 */
async function sendLicenseEmail(licenseData) {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('📧 Email not configured, skipping license email');
      return { success: false, error: 'Email not configured' };
    }

    const {
      customerEmail,
      customerName,
      licenseKey,
      licenseType,
      mt5Account,
      purchaseDate,
      expiryDate,
      eaName,
      downloadLink
    } = licenseData;

    const licenseConfig = LICENSE_TYPES[licenseType];
    const isLifetime = licenseType === 'LT';
    
    // Format dates
    const purchaseDateFormatted = new Date(purchaseDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const expiryDateFormatted = isLifetime 
      ? 'Never (Lifetime)' 
      : new Date(expiryDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px 20px;">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1f2937; margin: 0;">Smart Algos</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">MT5 Expert Advisor Platform</p>
          </div>

          <!-- Success Banner -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="margin: 0; color: white; font-size: 24px;">🎉 Your License Key is Ready!</h2>
            <p style="margin: 10px 0 0 0; color: #d1fae5; font-size: 16px;">Thank you for your purchase</p>
          </div>

          <!-- License Details Box -->
          <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
            <h3 style="margin: 0 0 20px 0; color: #1f2937; text-align: center;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>YOUR LICENSE DETAILS<br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 0; color: #6b7280; font-weight: 600; width: 40%;">License Key:</td>
                <td style="padding: 12px 0;">
                  <div style="background: #fff; border: 2px dashed #3b82f6; padding: 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold; color: #1f2937; text-align: center;">
                    ${licenseKey}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #6b7280; font-weight: 600;">License Type:</td>
                <td style="padding: 12px 0; color: #1f2937; font-weight: bold;">${licenseConfig.label}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #6b7280; font-weight: 600;">MT5 Account:</td>
                <td style="padding: 12px 0; color: #1f2937; font-weight: bold;">${mt5Account}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #6b7280; font-weight: 600;">Purchase Date:</td>
                <td style="padding: 12px 0; color: #1f2937;">${purchaseDateFormatted}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #6b7280; font-weight: 600;">Expiry Date:</td>
                <td style="padding: 12px 0; color: ${isLifetime ? '#10b981' : '#1f2937'}; font-weight: ${isLifetime ? 'bold' : 'normal'};">
                  ${expiryDateFormatted}
                </td>
              </tr>
            </table>
          </div>

          <!-- Installation Instructions -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>INSTALLATION INSTRUCTIONS<br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</h3>
            
            <ol style="color: #4b5563; line-height: 2; padding-left: 20px; margin: 0;">
              <li><strong>Download the EA file</strong> from: <a href="${downloadLink || '#'}" style="color: #3b82f6; text-decoration: none;">[Download Link]</a></li>
              <li><strong>Place the EA</strong> in your MT5 <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px;">Experts</code> folder</li>
              <li><strong>Restart MT5</strong> terminal</li>
              <li><strong>Drag EA</strong> onto any chart</li>
              <li><strong>In EA settings</strong>, paste your license key above</li>
              <li><strong>Click OK</strong> - the EA will activate immediately</li>
            </ol>
          </div>

          <!-- Important Warning -->
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0; color: #92400e;">⚠️ IMPORTANT:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #78350f; line-height: 1.8;">
              <li>This license is <strong>locked to MT5 Account: ${mt5Account}</strong></li>
              <li><strong>Do not share</strong> your license key with anyone</li>
              <li>Key will <strong>not work</strong> on different MT5 accounts</li>
              <li>For support: <a href="mailto:${process.env.EMAIL_USER}" style="color: #92400e; text-decoration: underline;">${process.env.EMAIL_USER}</a></li>
            </ul>
          </div>

          <!-- Support Section -->
          <div style="text-align: center; padding: 25px; background: #f9fafb; border-radius: 8px; margin-bottom: 30px;">
            <h4 style="margin: 0 0 15px 0; color: #1f2937;">Need Help?</h4>
            <p style="margin: 0 0 15px 0; color: #6b7280;">Our support team is here to assist you</p>
            <a href="mailto:${process.env.EMAIL_USER}" 
               style="display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Contact Support
            </a>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0; font-size: 14px;">
              Best regards,<br/>
              <strong>Smart Algos Team</strong>
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0 0;">
              © ${new Date().getFullYear()} Smart Algos. All rights reserved.
            </p>
          </div>

        </div>
      </body>
      </html>
    `;

    const textContent = `
Your ${eaName} License Key

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR LICENSE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

License Key: ${licenseKey}
License Type: ${licenseConfig.label}
MT5 Account: ${mt5Account}
Purchase Date: ${purchaseDateFormatted}
Expiry Date: ${expiryDateFormatted}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTALLATION INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Download the EA file from: ${downloadLink || '[Check your email]'}
2. Place the EA in your MT5 Experts folder
3. Restart MT5
4. Drag EA onto any chart
5. In the EA settings, paste your license key above
6. Click OK - the EA will activate immediately

⚠️ IMPORTANT:
- This license is locked to MT5 Account: ${mt5Account}
- Do not share your license key
- Key will not work on different accounts
- For support: ${process.env.EMAIL_USER}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Best regards,
Smart Algos Team

© ${new Date().getFullYear()} Smart Algos
    `;

    const mailOptions = {
      from: `"Smart Algos" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `✅ Your ${eaName} License Key - Smart Algos`,
      text: textContent,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ License email sent successfully to:', customerEmail);
    console.log('Message ID:', info.messageId);

    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('❌ Failed to send license email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send license expiring soon notification
 */
async function sendExpiringNotification(licenseData) {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      return { success: false, error: 'Email not configured' };
    }

    const {
      customerEmail,
      customerName,
      licenseKey,
      expiryDate,
      daysRemaining,
      eaName,
      renewalLink
    } = licenseData;

    const expiryDateFormatted = new Date(expiryDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px 20px;">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1f2937; margin: 0;">Smart Algos</h1>
          </div>

          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 25px; margin-bottom: 30px; border-radius: 4px;">
            <h2 style="margin: 0 0 10px 0; color: #92400e;">⏰ License Expiring Soon</h2>
            <p style="margin: 0; color: #78350f; font-size: 16px;">
              Your ${eaName} license will expire in <strong>${daysRemaining} days</strong>.
            </p>
          </div>

          <div style="margin-bottom: 30px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">License Key:</td>
                <td style="padding: 10px 0; color: #1f2937; font-family: monospace;">${licenseKey}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Expiry Date:</td>
                <td style="padding: 10px 0; color: #dc2626; font-weight: bold;">${expiryDateFormatted}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Days Remaining:</td>
                <td style="padding: 10px 0; color: #dc2626; font-weight: bold;">${daysRemaining}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 20px 0; color: #4b5563;">To continue using the EA, please renew your license:</p>
            <a href="${renewalLink || '#'}" 
               style="display: inline-block; padding: 15px 40px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Renew License Now
            </a>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Smart Algos
            </p>
          </div>

        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Smart Algos" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `⏰ Your ${eaName} License Expires in ${daysRemaining} Days`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Expiring notification sent to:', customerEmail);

    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('❌ Failed to send expiring notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send license regenerated notification
 */
async function sendRegeneratedNotification(licenseData) {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      return { success: false, error: 'Email not configured' };
    }

    const {
      customerEmail,
      customerName,
      newLicenseKey,
      newMt5Account,
      eaName
    } = licenseData;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px 20px;">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1f2937; margin: 0;">Smart Algos</h1>
          </div>

          <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 25px; margin-bottom: 30px; border-radius: 4px;">
            <h2 style="margin: 0 0 10px 0; color: #1e40af;">🔄 License Updated</h2>
            <p style="margin: 0; color: #1e3a8a;">
              Your license has been regenerated for a new MT5 account.
            </p>
          </div>

          <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">New License Details:</h3>
            
            <div style="margin: 15px 0;">
              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">New License Key:</p>
              <div style="background: #fff; border: 2px dashed #3b82f6; padding: 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 16px; font-weight: bold; color: #1f2937; text-align: center;">
                ${newLicenseKey}
              </div>
            </div>

            <div style="margin: 15px 0;">
              <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">New MT5 Account:</p>
              <div style="background: #fff; border: 1px solid #e5e7eb; padding: 10px; border-radius: 6px; font-weight: bold; color: #1f2937; text-align: center;">
                ${newMt5Account}
              </div>
            </div>
          </div>

          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 30px; border-radius: 4px;">
            <p style="margin: 0; color: #78350f;">
              <strong>Action Required:</strong> Please update the license key in your EA settings with the new key above.
            </p>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Smart Algos
            </p>
          </div>

        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Smart Algos" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `🔄 Your ${eaName} License Has Been Updated`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Regeneration notification sent to:', customerEmail);

    return {
      success: true,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('❌ Failed to send regeneration notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  sendLicenseEmail,
  sendExpiringNotification,
  sendRegeneratedNotification
};
