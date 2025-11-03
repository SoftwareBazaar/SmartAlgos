const nodemailer = require('nodemailer');
const axios = require('axios');

// Send email via SendGrid API (HTTP-based, works on Railway free tier)
const sendEmailViaSendGrid = async ({ to, subject, html, text }) => {
  const sendGridApiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.ADMIN_EMAIL || process.env.SENDGRID_FROM_EMAIL || 'noreply@smartalgos.com';

  if (!sendGridApiKey) {
    return null; // SendGrid not configured
  }

  try {
    const response = await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      {
        personalizations: [{
          to: [{ email: to }],
          subject: subject
        }],
        from: {
          email: fromEmail,
          name: 'Smart Algos'
        },
        content: [
          {
            type: 'text/plain',
            value: text
          },
          {
            type: 'text/html',
            value: html
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${sendGridApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );

    console.log('✅ Email sent via SendGrid:', response.status);
    return { success: true, messageId: response.headers['x-message-id'] || 'sendgrid-sent' };
  } catch (error) {
    console.error('❌ SendGrid API error:', error.response?.data || error.message);
    throw error;
  }
};

// Get email configuration from environment variables
const getEmailConfig = () => {
  // Check for SMTP configuration
  if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      requireTLS: !process.env.SMTP_SECURE || process.env.SMTP_SECURE !== 'true', // Use TLS for port 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      // Add timeout configurations to prevent hanging
      // Note: Nodemailer handles timeouts internally, but we'll also wrap with Promise.race
      pool: true, // Use connection pooling for better performance
      maxConnections: 1, // Limit concurrent connections
      maxMessages: 3 // Max messages per connection
    };
  }

  // Fallback: Gmail configuration
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    return {
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      },
      // Gmail-specific settings
      pool: true,
      maxConnections: 1,
      maxMessages: 3
    };
  }

  // No email configuration found
  return null;
};

// Create transporter
const createTransporter = () => {
  const config = getEmailConfig();
  if (!config) {
    console.warn('⚠️  No email configuration found. Emails will be logged only.');
    return null;
  }

  try {
    const transporter = nodemailer.createTransport(config);
    
    // Verify transporter connection with timeout
    transporter.verify((error, success) => {
      if (error) {
        console.warn('⚠️  Email transporter verification failed (will attempt to send anyway):', error.message);
      } else {
        console.log('✅ Email transporter created and verified successfully');
      }
    });
    
    return transporter;
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error);
    return null;
  }
};

const transporter = createTransporter();

// Send email function with timeout protection
const sendEmail = async ({ to, subject, html, text }, timeout = 15000) => {
  // Get admin email from environment or use default
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || process.env.GMAIL_USER;
  
  if (!adminEmail) {
    console.warn('⚠️  No admin email configured. Cannot send emails.');
    return { success: false, message: 'No email configuration' };
  }

  // Priority 1: Try SendGrid API first (works on Railway free tier)
  if (process.env.SENDGRID_API_KEY) {
    try {
      console.log('📧 Attempting to send email via SendGrid API...');
      const result = await sendEmailViaSendGrid({ to, subject, html, text });
      if (result && result.success) {
        return result;
      }
    } catch (error) {
      console.warn('⚠️  SendGrid failed, falling back to SMTP:', error.message);
      // Fall through to SMTP
    }
  }

  // Priority 2: Try SMTP (may be blocked on Railway free tier)
  if (!transporter) {
    // Log email to console instead
    console.log('📧 EMAIL WOULD BE SENT (no transporter):');
    console.log('   To:', to);
    console.log('   From:', adminEmail);
    console.log('   Subject:', subject);
    console.log('   Text:', text);
    console.log('   HTML:', html);
    return { success: true, message: 'Email logged (no transporter)' };
  }

  try {
    // Create a promise that will timeout if email sending takes too long
    const sendPromise = transporter.sendMail({
      from: `"Smart Algos" <${adminEmail}>`,
      to: to,
      subject: subject,
      text: text,
      html: html
    });

    // Add timeout wrapper
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Email sending timed out after ${timeout}ms`));
      }, timeout);
    });

    // Race between sending and timeout
    const info = await Promise.race([sendPromise, timeoutPromise]);

    console.log('✅ Email sent successfully via SMTP:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send email:', error.message || error);
    // Log email to console as fallback
    console.log('📧 EMAIL FALLBACK LOG:');
    console.log('   To:', to);
    console.log('   Subject:', subject);
    console.log('   Text:', text);
    return { success: false, message: error.message || 'Email sending failed' };
  }
};

// Send custom EA request notification to admin
const sendCustomEARequestNotification = async (requestData) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || process.env.GMAIL_USER;
  
  if (!adminEmail) {
    console.warn('⚠️  No admin email configured for notifications');
    return { success: false, message: 'No admin email configured' };
  }

  const serviceTypeMap = {
    'new_ea': 'New EA Development',
    'modify_ea': 'EA Modification',
    'custom_indicator': 'Custom Indicator'
  };

  const tradingStyleMap = {
    'scalping': 'Scalping',
    'swing': 'Swing Trading',
    'hedging': 'Hedging',
    'arbitrage': 'Arbitrage',
    'grid': 'Grid Trading',
    'martingale': 'Martingale'
  };

  const platformMap = {
    'mt4': 'MetaTrader 4',
    'mt5': 'MetaTrader 5',
    'tradingview': 'TradingView'
  };

  const statusColorMap = {
    'pending': '#ff9800',
    'reviewing': '#2196f3',
    'in_progress': '#9c27b0',
    'completed': '#4caf50',
    'cancelled': '#9e9e9e',
    'rejected': '#f44336'
  };

  const statusColor = statusColorMap[requestData.status] || '#ff9800';
  const serviceType = serviceTypeMap[requestData.serviceType] || requestData.serviceType;
  const tradingStyle = tradingStyleMap[requestData.tradingStyle] || requestData.tradingStyle;
  const platform = platformMap[requestData.platform] || requestData.platform;

  const subject = `🎯 New Custom EA Request - ${requestData.eaName || 'Unnamed'}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border: 1px solid #e0e0e0;
          border-top: none;
        }
        .info-box {
          background: white;
          padding: 20px;
          margin-bottom: 15px;
          border-radius: 5px;
          border-left: 4px solid #667eea;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: bold;
          color: #666;
        }
        .value {
          color: #333;
        }
        .status-badge {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          background: ${statusColor};
          color: white;
          text-transform: uppercase;
        }
        .highlight {
          background: #fff3cd;
          padding: 15px;
          border-radius: 5px;
          border-left: 4px solid #ffc107;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #999;
          font-size: 12px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎯 New Custom EA Request</h1>
      </div>
      <div class="content">
        <div class="info-box">
          <div class="info-row">
            <span class="label">Request ID:</span>
            <span class="value">${requestData.id}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="status-badge">${requestData.status}</span>
          </div>
          <div class="info-row">
            <span class="label">User Email:</span>
            <span class="value">${requestData.userEmail}</span>
          </div>
          <div class="info-row">
            <span class="label">Service Type:</span>
            <span class="value">${serviceType}</span>
          </div>
        </div>

        <div class="info-box">
          <h3 style="margin-top: 0;">EA Details</h3>
          <div class="info-row">
            <span class="label">EA Name:</span>
            <span class="value">${requestData.eaName || 'Not specified'}</span>
          </div>
          <div class="info-row">
            <span class="label">Description:</span>
            <span class="value">${requestData.eaDescription || 'Not provided'}</span>
          </div>
          <div class="info-row">
            <span class="label">Trading Style:</span>
            <span class="value">${tradingStyle || 'Not specified'}</span>
          </div>
          <div class="info-row">
            <span class="label">Platform:</span>
            <span class="value">${platform || 'Not specified'}</span>
          </div>
          ${requestData.timeframe ? `
          <div class="info-row">
            <span class="label">Timeframe:</span>
            <span class="value">${requestData.timeframe}</span>
          </div>
          ` : ''}
        </div>

        ${requestData.indicators && requestData.indicators.length > 0 ? `
        <div class="info-box">
          <h3 style="margin-top: 0;">Indicators</h3>
          <span class="value">${requestData.indicators.join(', ')}</span>
        </div>
        ` : ''}

        ${requestData.riskManagement && requestData.riskManagement.length > 0 ? `
        <div class="info-box">
          <h3 style="margin-top: 0;">Risk Management</h3>
          <span class="value">${requestData.riskManagement.join(', ')}</span>
        </div>
        ` : ''}

        ${requestData.customFeatures && requestData.customFeatures.length > 0 ? `
        <div class="info-box">
          <h3 style="margin-top: 0;">Custom Features</h3>
          <span class="value">${requestData.customFeatures.join(', ')}</span>
        </div>
        ` : ''}

        <div class="info-box">
          <h3 style="margin-top: 0;">Timeline & Budget</h3>
          <div class="info-row">
            <span class="label">Timeline:</span>
            <span class="value">${requestData.timeline || 'Not specified'}</span>
          </div>
          <div class="info-row">
            <span class="label">Budget:</span>
            <span class="value">${requestData.budget || 'Not specified'}</span>
          </div>
          ${requestData.customBudget ? `
          <div class="info-row">
            <span class="label">Custom Budget:</span>
            <span class="value">$${requestData.customBudget}</span>
          </div>
          ` : ''}
          <div class="info-row">
            <span class="label">Estimated Price:</span>
            <span class="value" style="font-size: 18px; font-weight: bold; color: #4caf50;">$${requestData.estimatedPrice || 'TBD'}</span>
          </div>
        </div>

        ${requestData.requirements ? `
        <div class="highlight">
          <strong>Additional Requirements:</strong><br>
          ${requestData.requirements}
        </div>
        ` : ''}

        <div style="text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'https://web-production-fdb58.up.railway.app'}/admin/custom-ea-requests" class="button">
            View in Admin Panel
          </a>
        </div>
      </div>
      <div class="footer">
        <p>This is an automated notification from Smart Algos Trading Platform</p>
        <p>Request created on ${new Date(requestData.createdAt).toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;

  const text = `
New Custom EA Request

Request ID: ${requestData.id}
Status: ${requestData.status}
User Email: ${requestData.userEmail}

Service Type: ${serviceType}
EA Name: ${requestData.eaName || 'Not specified'}
Description: ${requestData.eaDescription || 'Not provided'}
Trading Style: ${tradingStyle || 'Not specified'}
Platform: ${platform || 'Not specified'}
${requestData.timeframe ? `Timeframe: ${requestData.timeframe}` : ''}

${requestData.indicators && requestData.indicators.length > 0 ? `Indicators: ${requestData.indicators.join(', ')}\n` : ''}
${requestData.riskManagement && requestData.riskManagement.length > 0 ? `Risk Management: ${requestData.riskManagement.join(', ')}\n` : ''}
${requestData.customFeatures && requestData.customFeatures.length > 0 ? `Custom Features: ${requestData.customFeatures.join(', ')}\n` : ''}

Timeline: ${requestData.timeline || 'Not specified'}
Budget: ${requestData.budget || 'Not specified'}
${requestData.customBudget ? `Custom Budget: $${requestData.customBudget}\n` : ''}
Estimated Price: $${requestData.estimatedPrice || 'TBD'}

${requestData.requirements ? `Additional Requirements:\n${requestData.requirements}\n` : ''}

View in Admin Panel: ${process.env.FRONTEND_URL || 'https://web-production-fdb58.up.railway.app'}/admin/custom-ea-requests

Request created on ${new Date(requestData.createdAt).toLocaleString()}
  `;

  return await sendEmail({
    to: adminEmail,
    subject: subject,
    html: html,
    text: text
  });
};

module.exports = {
  sendEmail,
  sendCustomEARequestNotification
};

