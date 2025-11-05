const crypto = require('crypto');
const QRCode = require('qrcode');
const otpService = require('./otpService');

/**
 * Generate a secret key for 2FA
 */
function generateSecret() {
  return crypto.randomBytes(20).toString('base32');
}

/**
 * Generate TOTP (Time-based OTP) code
 * @param {string} secret - Base32 encoded secret
 * @param {number} timeStep - Time step in seconds (default 30)
 * @returns {string} - 6-digit TOTP code
 */
function generateTOTP(secret, timeStep = 30) {
  const time = Math.floor(Date.now() / 1000 / timeStep);
  const timeBuffer = Buffer.allocUnsafe(8);
  timeBuffer.writeUInt32BE(0, 0);
  timeBuffer.writeUInt32BE(time, 4);
  
  const key = Buffer.from(base32Decode(secret), 'base64');
  const hmac = crypto.createHmac('sha1', key);
  hmac.update(timeBuffer);
  const hmacResult = hmac.digest();
  
  const offset = hmacResult[hmacResult.length - 1] & 0x0f;
  const code = ((hmacResult[offset] & 0x7f) << 24 |
                (hmacResult[offset + 1] & 0xff) << 16 |
                (hmacResult[offset + 2] & 0xff) << 8 |
                (hmacResult[offset + 3] & 0xff)) % 1000000;
  
  return code.toString().padStart(6, '0');
}

/**
 * Verify TOTP code
 * @param {string} secret - Base32 encoded secret
 * @param {string} token - 6-digit code to verify
 * @param {number} window - Time window for verification (default 1)
 * @returns {boolean} - True if code is valid
 */
function verifyTOTP(secret, token, window = 1) {
  const timeStep = 30;
  const currentTime = Math.floor(Date.now() / 1000 / timeStep);
  
  // Check current time and adjacent time windows
  for (let i = -window; i <= window; i++) {
    const time = currentTime + i;
    const timeBuffer = Buffer.allocUnsafe(8);
    timeBuffer.writeUInt32BE(0, 0);
    timeBuffer.writeUInt32BE(time, 4);
    
    try {
      const key = Buffer.from(base32Decode(secret), 'base64');
      const hmac = crypto.createHmac('sha1', key);
      hmac.update(timeBuffer);
      const hmacResult = hmac.digest();
      
      const offset = hmacResult[hmacResult.length - 1] & 0x0f;
      const code = ((hmacResult[offset] & 0x7f) << 24 |
                    (hmacResult[offset + 1] & 0xff) << 16 |
                    (hmacResult[offset + 2] & 0xff) << 8 |
                    (hmacResult[offset + 3] & 0xff)) % 1000000;
      
      const expectedCode = code.toString().padStart(6, '0');
      
      if (expectedCode === token) {
        return true;
      }
    } catch (error) {
      // Continue to next window
    }
  }
  
  return false;
}

/**
 * Base32 decode helper
 */
function base32Decode(str) {
  const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let index = 0;
  const output = [];
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i].toUpperCase();
    const charIndex = base32chars.indexOf(char);
    
    if (charIndex === -1) continue;
    
    value = (value << 5) | charIndex;
    bits += 5;
    
    if (bits >= 8) {
      output[index++] = (value >> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }
  
  return Buffer.from(output);
}

/**
 * Generate QR code for 2FA setup
 * @param {string} email - User email
 * @param {string} secret - Base32 encoded secret
 * @param {string} issuer - Service name (default: Smart Algos)
 * @returns {Promise<string>} - Data URL of QR code
 */
async function generateQRCode(email, secret, issuer = 'Smart Algos') {
  const otpAuthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
  
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 1
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw error;
  }
}

/**
 * Setup 2FA for a user
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @returns {Promise<Object>} - Secret and QR code
 */
async function setup2FA(userId, email) {
  const secret = generateSecret();
  const qrCode = await generateQRCode(email, secret);
  
  return {
    secret,
    qrCode,
    backupCodes: generateBackupCodes()
  };
}

/**
 * Generate backup codes for 2FA
 */
function generateBackupCodes() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
}

/**
 * Verify backup code
 */
function verifyBackupCode(storedCodes, code) {
  return storedCodes.includes(code.toUpperCase());
}

module.exports = {
  generateSecret,
  generateTOTP,
  verifyTOTP,
  generateQRCode,
  setup2FA,
  generateBackupCodes,
  verifyBackupCode
};

