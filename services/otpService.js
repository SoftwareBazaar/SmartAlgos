const crypto = require('crypto');
const emailService = require('./emailService');

// In-memory OTP store (in production, use Redis or database)
const otpStore = new Map();

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of otpStore.entries()) {
    if (now > data.expires) {
      otpStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Generate a 6-digit OTP
 */
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Store OTP with expiry (10 minutes default)
 */
function storeOTP(email, purpose = 'email_verification', expiryMinutes = 10) {
  const otp = generateOTP();
  const expires = Date.now() + (expiryMinutes * 60 * 1000);
  const key = `${email}_${purpose}`;
  
  otpStore.set(key, {
    otp,
    email,
    purpose,
    expires,
    attempts: 0,
    maxAttempts: 5,
    createdAt: Date.now()
  });
  
  return otp;
}

/**
 * Verify OTP
 */
function verifyOTP(email, otp, purpose = 'email_verification') {
  const key = `${email}_${purpose}`;
  const data = otpStore.get(key);
  
  if (!data) {
    return { valid: false, message: 'OTP not found or expired' };
  }
  
  // Check if expired
  if (Date.now() > data.expires) {
    otpStore.delete(key);
    return { valid: false, message: 'OTP has expired' };
  }
  
  // Check if too many attempts
  if (data.attempts >= data.maxAttempts) {
    otpStore.delete(key);
    return { valid: false, message: 'Too many failed attempts. Please request a new OTP.' };
  }
  
  // Increment attempts
  data.attempts++;
  
  // Verify OTP
  if (data.otp !== otp) {
    return { valid: false, message: `Invalid OTP. ${data.maxAttempts - data.attempts} attempt(s) remaining.` };
  }
  
  // OTP is valid - remove it
  otpStore.delete(key);
  return { valid: true, message: 'OTP verified successfully' };
}

/**
 * Send OTP via email
 */
async function sendOTPEmail(email, purpose = 'email_verification') {
  const otp = storeOTP(email, purpose);
  
  let subject, htmlContent, textContent;
  
  if (purpose === 'email_verification') {
    subject = 'Smart Algos - Email Verification Code';
    htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; }
          .otp-box { background: white; padding: 30px; text-align: center; margin: 20px 0; border-radius: 8px; border: 2px dashed #667eea; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: monospace; }
          .warning { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Email Verification</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Thank you for registering with Smart Algos Trading Platform. Please use the verification code below to complete your registration:</p>
            
            <div class="otp-box">
              <p style="margin: 0 0 10px 0; color: #666;">Your verification code:</p>
              <div class="otp-code">${otp}</div>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              This code will expire in 10 minutes. Do not share this code with anyone. Smart Algos will never ask for your verification code.
            </div>
            
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>Smart Algos Trading Platform</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    textContent = `
Smart Algos - Email Verification Code

Hello,

Thank you for registering with Smart Algos Trading Platform. Please use the verification code below to complete your registration:

Verification Code: ${otp}

This code will expire in 10 minutes. Do not share this code with anyone.

If you didn't request this code, please ignore this email.

Smart Algos Trading Platform
    `;
  } else {
    subject = 'Smart Algos - Verification Code';
    htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; text-align: center; font-family: monospace; padding: 20px; background: #f0f0f0; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Your Verification Code</h2>
          <p>Your verification code is:</p>
          <div class="otp-code">${otp}</div>
          <p>This code will expire in 10 minutes.</p>
        </div>
      </body>
      </html>
    `;
    textContent = `Your verification code is: ${otp}\nThis code will expire in 10 minutes.`;
  }
  
  try {
    const result = await emailService.sendEmail({
      to: email,
      subject,
      html: htmlContent,
      text: textContent
    });
    
    return { success: result.success, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return { success: false, message: 'Failed to send OTP email' };
  }
}

/**
 * Check if OTP exists for email
 */
function hasOTP(email, purpose = 'email_verification') {
  const key = `${email}_${purpose}`;
  const data = otpStore.get(key);
  return data && Date.now() < data.expires;
}

/**
 * Resend OTP (if not expired)
 */
async function resendOTP(email, purpose = 'email_verification') {
  // Check if OTP exists and is still valid
  if (hasOTP(email, purpose)) {
    // Get existing OTP
    const key = `${email}_${purpose}`;
    const data = otpStore.get(key);
    const otp = data.otp;
    
    // Send the same OTP
    let subject, htmlContent, textContent;
    if (purpose === 'email_verification') {
      subject = 'Smart Algos - Email Verification Code (Resent)';
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #e0e0e0; }
            .otp-box { background: white; padding: 30px; text-align: center; margin: 20px 0; border-radius: 8px; border: 2px dashed #667eea; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Email Verification (Resent)</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>You requested a resend of your verification code. Here is your code:</p>
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              <p>This code will expire in 10 minutes.</p>
            </div>
          </div>
        </body>
        </html>
      `;
      textContent = `Your verification code (resent): ${otp}\nThis code will expire in 10 minutes.`;
    } else {
      subject = 'Smart Algos - Verification Code (Resent)';
      htmlContent = `<p>Your verification code (resent): <strong>${otp}</strong></p><p>This code will expire in 10 minutes.</p>`;
      textContent = `Your verification code (resent): ${otp}\nThis code will expire in 10 minutes.`;
    }
    
    try {
      await emailService.sendEmail({
        to: email,
        subject,
        html: htmlContent,
        text: textContent
      });
      return { success: true, message: 'OTP resent successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to resend OTP' };
    }
  } else {
    // Generate and send new OTP
    return await sendOTPEmail(email, purpose);
  }
}

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,
  sendOTPEmail,
  resendOTP,
  hasOTP
};

