/**
 * Email Service for sending download links after payment
 * Uses Nodemailer with Gmail or any SMTP service
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create email transporter
const createTransporter = () => {
  // Check if email is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️ Email not configured. Set EMAIL_USER and EMAIL_PASSWORD in environment variables');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET (hidden)' : 'NOT SET');
    return null;
  }

  console.log('📧 Creating email transporter...');
  console.log('Email User:', process.env.EMAIL_USER);
  console.log('Email Host:', process.env.EMAIL_HOST || 'smtp.gmail.com');
  console.log('Email Port:', process.env.EMAIL_PORT || 587);

  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      },
      debug: true, // Enable debug output
      logger: true // Log to console
    });

    console.log('✅ Email transporter created successfully');
    return transporter;
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error.message);
    return null;
  }
};

/**
 * Send download links email after successful payment
 */
const sendDownloadEmail = async ({ 
  userEmail, 
  userName, 
  eaName, 
  downloadLinks, 
  subscriptionType,
  subscriptionId 
}) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('📧 Email not configured, skipping email send');
      return { success: false, error: 'Email not configured' };
    }

    // Verify transporter connection
    try {
      console.log('🔍 Verifying email connection...');
      await transporter.verify();
      console.log('✅ Email server connection verified');
    } catch (verifyError) {
      console.error('❌ Email server connection failed:', verifyError.message);
      console.error('Full error:', verifyError);
      return { 
        success: false, 
        error: `Email server connection failed: ${verifyError.message}` 
      };
    }

    // Build download links HTML
    let downloadLinksHtml = '';
    
    if (downloadLinks.zip_package) {
      downloadLinksHtml += `
        <div style="margin: 20px 0; padding: 15px; background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0; color: #059669;">📦 Complete Package (Recommended)</h3>
          <p style="margin: 0 0 10px 0; color: #065f46;">Download everything in one ZIP file:</p>
          <a href="${downloadLinks.zip_package}" 
             style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Download ZIP Package
          </a>
        </div>
      `;
    }

    // Individual files as backup
    if (downloadLinks.ea_file || downloadLinks.set_file || downloadLinks.manual) {
      downloadLinksHtml += `
        <div style="margin: 20px 0;">
          <h3 style="color: #1f2937;">Individual Files:</h3>
      `;

      if (downloadLinks.ea_file) {
        downloadLinksHtml += `
          <p style="margin: 10px 0;">
            <a href="${downloadLinks.ea_file}" 
               style="color: #3b82f6; text-decoration: none; font-weight: 500;">
              📄 Download EA File (.ex4/.ex5)
            </a>
          </p>
        `;
      }

      if (downloadLinks.set_file) {
        downloadLinksHtml += `
          <p style="margin: 10px 0;">
            <a href="${downloadLinks.set_file}" 
               style="color: #3b82f6; text-decoration: none; font-weight: 500;">
              ⚙️ Download Settings File (.set)
            </a>
          </p>
        `;
      }

      if (downloadLinks.manual) {
        downloadLinksHtml += `
          <p style="margin: 10px 0;">
            <a href="${downloadLinks.manual}" 
               style="color: #3b82f6; text-decoration: none; font-weight: 500;">
              📖 Download Manual (PDF)
            </a>
          </p>
        `;
      }

      downloadLinksHtml += `</div>`;
    }

    // Email HTML template
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
            <p style="color: #6b7280; margin: 5px 0 0 0;">Algorithmic Trading Platform</p>
          </div>

          <!-- Success Message -->
          <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
            <h2 style="margin: 0 0 10px 0; color: #1e40af;">✅ Payment Successful!</h2>
            <p style="margin: 0; color: #1e3a8a;">Thank you for your subscription. Your EA files are ready to download.</p>
          </div>

          <!-- Subscription Details -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Subscription Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">EA Name:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${eaName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Subscription Type:</td>
                <td style="padding: 8px 0; color: #1f2937; font-weight: bold; text-transform: capitalize;">${subscriptionType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Subscription ID:</td>
                <td style="padding: 8px 0; color: #1f2937; font-family: monospace; font-size: 12px;">${subscriptionId}</td>
              </tr>
            </table>
          </div>

          <!-- Download Links -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Download Your Files:</h3>
            ${downloadLinksHtml}
          </div>

          <!-- Important Notes -->
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 30px; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0; color: #92400e;">📌 Important Notes:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #78350f;">
              <li style="margin: 5px 0;">Download links are valid for 24 hours</li>
              <li style="margin: 5px 0;">You can re-download from your account dashboard anytime</li>
              <li style="margin: 5px 0;">For support, reply to this email or contact us</li>
            </ul>
          </div>

          <!-- Installation Guide -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Quick Installation Guide:</h3>
            <ol style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
              <li>Download the ZIP package or individual files</li>
              <li>Extract the ZIP file (if downloaded)</li>
              <li>Copy the .ex4/.ex5 file to your MT4/MT5 Experts folder</li>
              <li>Copy the .set file to your MT4/MT5 Presets folder (optional)</li>
              <li>Restart MT4/MT5</li>
              <li>Attach the EA to your chart</li>
            </ol>
          </div>

          <!-- Support -->
          <div style="text-align: center; padding: 20px; background: #f9fafb; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; color: #6b7280;">Need help? We're here for you!</p>
            <p style="margin: 0;">
              <a href="mailto:${process.env.EMAIL_USER}" style="color: #3b82f6; text-decoration: none; font-weight: 500;">
                Contact Support
              </a>
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Smart Algos. All rights reserved.
            </p>
          </div>

        </div>
      </body>
      </html>
    `;

    // Plain text version
    const textContent = `
Payment Successful!

Thank you for subscribing to ${eaName}.

Subscription Details:
- EA Name: ${eaName}
- Subscription Type: ${subscriptionType}
- Subscription ID: ${subscriptionId}

Download Your Files:
${downloadLinks.zip_package ? `\nComplete Package (ZIP): ${downloadLinks.zip_package}\n` : ''}
${downloadLinks.ea_file ? `EA File: ${downloadLinks.ea_file}\n` : ''}
${downloadLinks.set_file ? `Settings File: ${downloadLinks.set_file}\n` : ''}
${downloadLinks.manual ? `Manual: ${downloadLinks.manual}\n` : ''}

Important Notes:
- Download links are valid for 24 hours
- You can re-download from your account dashboard anytime
- For support, reply to this email

Quick Installation:
1. Download the files
2. Extract ZIP (if downloaded)
3. Copy .ex4/.ex5 to MT4/MT5 Experts folder
4. Copy .set to MT4/MT5 Presets folder
5. Restart MT4/MT5
6. Attach EA to chart

Need help? Contact us at ${process.env.EMAIL_USER}

© ${new Date().getFullYear()} Smart Algos
    `;

    // Send email
    const mailOptions = {
      from: `"Smart Algos" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `✅ Your ${eaName} Files Are Ready - Smart Algos`,
      text: textContent,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info('Download email sent successfully', {
      messageId: info.messageId,
      userEmail,
      eaName,
      subscriptionId
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

    return { 
      success: true, 
      messageId: info.messageId 
    };

  } catch (error) {
    console.error('❌ Failed to send download email');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error command:', error.command);
    console.error('Full error:', error);

    logger.error('Failed to send download email', {
      error: error.message,
      code: error.code,
      command: error.command,
      userEmail,
      eaName
    });

    return { 
      success: false, 
      error: error.message,
      code: error.code
    };
  }
};

module.exports = {
  sendDownloadEmail
};
