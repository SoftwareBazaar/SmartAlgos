/**
 * License Generation Service for MT5 Expert Advisors
 * Generates hardware-locked license keys with expiry dates
 */

const crypto = require('crypto');
const databaseService = require('./databaseService');

// Secret salt for license key generation (should be in environment variables)
const LICENSE_SECRET_SALT = process.env.LICENSE_SECRET_SALT || 'your-secret-salt-min-32-chars-change-in-production';

// License type configurations
const LICENSE_TYPES = {
  LT: { name: 'Lifetime', days: null, label: 'Lifetime' },
  W1: { name: 'Weekly', days: 7, label: '1 Week' },
  M1: { name: 'Monthly', days: 30, label: '1 Month' },
  M3: { name: '3 Months', days: 90, label: '3 Months' },
  M6: { name: '6 Months', days: 180, label: '6 Months' },
  Y1: { name: 'Yearly', days: 365, label: '1 Year' }
};

/**
 * Generate hash component for license key
 * @param {string} email - Customer email
 * @param {string} mt5Account - MT5 account number
 * @param {string} purchaseDate - Purchase date (YYYY-MM-DD)
 * @param {string} licenseType - License type code (LT, M1, etc.)
 * @returns {string} 8-character uppercase hash
 */
function generateLicenseHash(email, mt5Account, purchaseDate, licenseType) {
  const combinedString = `${email}-${mt5Account}-${purchaseDate}-${licenseType}-${LICENSE_SECRET_SALT}`;
  const hash = crypto.createHash('md5').update(combinedString).digest('hex');
  return hash.substring(0, 8).toUpperCase();
}

/**
 * Calculate expiry date based on license type
 * @param {Date} purchaseDate - Purchase date
 * @param {string} licenseType - License type code
 * @returns {Date|null} Expiry date or null for lifetime
 */
function calculateExpiryDate(purchaseDate, licenseType) {
  const config = LICENSE_TYPES[licenseType];
  
  if (!config) {
    throw new Error(`Invalid license type: ${licenseType}`);
  }
  
  if (config.days === null) {
    return null; // Lifetime license
  }
  
  const expiryDate = new Date(purchaseDate);
  expiryDate.setDate(expiryDate.getDate() + config.days);
  return expiryDate;
}

/**
 * Format date as YYYYMMDD for license key
 * @param {Date|null} date - Date to format
 * @returns {string} Formatted date or '00000000' for lifetime
 */
function formatExpiryForKey(date) {
  if (!date) {
    return '00000000'; // Lifetime
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}${month}${day}`;
}

/**
 * Generate complete license key
 * @param {Object} params - License parameters
 * @returns {string} Complete license key (e.g., LB-M1-9C8E7F2A-20260227)
 */
function generateLicenseKey({ email, mt5Account, purchaseDate, licenseType }) {
  // Validate inputs
  if (!email || !mt5Account || !purchaseDate || !licenseType) {
    throw new Error('Missing required parameters for license generation');
  }
  
  if (!LICENSE_TYPES[licenseType]) {
    throw new Error(`Invalid license type: ${licenseType}. Valid types: ${Object.keys(LICENSE_TYPES).join(', ')}`);
  }
  
  // Validate MT5 account (6-10 digits)
  if (!/^\d{6,10}$/.test(mt5Account)) {
    throw new Error('MT5 account must be 6-10 digits');
  }
  
  // Generate hash
  const hash = generateLicenseHash(email, mt5Account, purchaseDate, licenseType);
  
  // Calculate expiry
  const expiryDate = calculateExpiryDate(new Date(purchaseDate), licenseType);
  const expiryString = formatExpiryForKey(expiryDate);
  
  // Format: LB-[TYPE]-[HASH]-[EXPIRY]
  return `LB-${licenseType}-${hash}-${expiryString}`;
}

/**
 * Create a new license in the database
 * @param {Object} licenseData - License data
 * @returns {Promise<Object>} Created license record
 */
async function createLicense(licenseData) {
  const {
    customerEmail,
    customerName,
    mt5Account,
    licenseType,
    purchaseDate = new Date(),
    paymentId,
    paymentAmount,
    eaId,
    userId
  } = licenseData;
  
  // Generate license key
  const purchaseDateStr = purchaseDate instanceof Date 
    ? purchaseDate.toISOString().split('T')[0] 
    : purchaseDate;
    
  const licenseKey = generateLicenseKey({
    email: customerEmail,
    mt5Account,
    purchaseDate: purchaseDateStr,
    licenseType
  });
  
  // Calculate expiry date
  const expiryDate = calculateExpiryDate(new Date(purchaseDate), licenseType);
  const isLifetime = licenseType === 'LT';
  
  // Insert into database
  const license = await databaseService.insert('ea_licenses', {
    license_key: licenseKey,
    customer_email: customerEmail,
    customer_name: customerName,
    mt5_account: mt5Account,
    license_type: licenseType,
    purchase_date: purchaseDateStr,
    expiry_date: expiryDate ? expiryDate.toISOString().split('T')[0] : null,
    is_lifetime: isLifetime,
    is_active: true,
    payment_id: paymentId,
    payment_amount: paymentAmount,
    ea_id: eaId,
    user_id: userId
  });
  
  console.log('✅ License created:', licenseKey);
  
  return license;
}

/**
 * Get license by key
 * @param {string} licenseKey - License key
 * @returns {Promise<Object|null>} License record
 */
async function getLicenseByKey(licenseKey) {
  const licenses = await databaseService.query('ea_licenses', {
    filter: { license_key: licenseKey },
    single: true
  });
  
  return licenses;
}

/**
 * Get licenses by email
 * @param {string} email - Customer email
 * @returns {Promise<Array>} License records
 */
async function getLicensesByEmail(email) {
  return await databaseService.query('ea_licenses', {
    filter: { customer_email: email },
    sort: { created_at: 'desc' }
  });
}

/**
 * Get licenses by MT5 account
 * @param {string} mt5Account - MT5 account number
 * @returns {Promise<Array>} License records
 */
async function getLicensesByAccount(mt5Account) {
  return await databaseService.query('ea_licenses', {
    filter: { mt5_account: mt5Account },
    sort: { created_at: 'desc' }
  });
}

/**
 * Get licenses by user ID
 * @param {number} userId - User ID
 * @returns {Promise<Array>} License records
 */
async function getLicensesByUserId(userId) {
  return await databaseService.query('ea_licenses', {
    filter: { user_id: userId },
    sort: { created_at: 'desc' }
  });
}

/**
 * Check if license is valid
 * @param {string} licenseKey - License key
 * @param {string} mt5Account - MT5 account number
 * @returns {Promise<Object>} Validation result
 */
async function validateLicense(licenseKey, mt5Account) {
  const license = await getLicenseByKey(licenseKey);
  
  if (!license) {
    return {
      valid: false,
      reason: 'License key not found'
    };
  }
  
  // Check if active
  if (!license.is_active) {
    return {
      valid: false,
      reason: 'License has been deactivated'
    };
  }
  
  // Check MT5 account match (hardware lock)
  if (license.mt5_account !== mt5Account) {
    return {
      valid: false,
      reason: 'License is locked to a different MT5 account'
    };
  }
  
  // Check expiry
  if (!license.is_lifetime && license.expiry_date) {
    const expiryDate = new Date(license.expiry_date);
    const now = new Date();
    
    if (now > expiryDate) {
      return {
        valid: false,
        reason: 'License has expired',
        expiredOn: license.expiry_date
      };
    }
  }
  
  // Record usage
  await recordLicenseUsage(licenseKey, mt5Account);
  
  return {
    valid: true,
    license: license,
    expiryDate: license.expiry_date,
    isLifetime: license.is_lifetime
  };
}

/**
 * Record license usage
 * @param {string} licenseKey - License key
 * @param {string} mt5Account - MT5 account number
 * @param {Object} metadata - Additional metadata
 */
async function recordLicenseUsage(licenseKey, mt5Account, metadata = {}) {
  try {
    await databaseService.insert('ea_license_usage', {
      license_key: licenseKey,
      mt5_account: mt5Account,
      ip_address: metadata.ipAddress || null,
      platform_version: metadata.platformVersion || null,
      terminal_build: metadata.terminalBuild || null
    });
  } catch (error) {
    console.error('Failed to record license usage:', error.message);
    // Don't throw - usage tracking is non-critical
  }
}

/**
 * Regenerate license for new MT5 account
 * @param {string} oldLicenseKey - Old license key
 * @param {string} newMt5Account - New MT5 account number
 * @param {Object} options - Regeneration options
 * @returns {Promise<Object>} New license
 */
async function regenerateLicense(oldLicenseKey, newMt5Account, options = {}) {
  const oldLicense = await getLicenseByKey(oldLicenseKey);
  
  if (!oldLicense) {
    throw new Error('Original license not found');
  }
  
  // Validate new MT5 account
  if (!/^\d{6,10}$/.test(newMt5Account)) {
    throw new Error('New MT5 account must be 6-10 digits');
  }
  
  // Generate new license key with same expiry
  const newLicenseKey = generateLicenseKey({
    email: oldLicense.customer_email,
    mt5Account: newMt5Account,
    purchaseDate: oldLicense.purchase_date,
    licenseType: oldLicense.license_type
  });
  
  // Deactivate old license
  await databaseService.update('ea_licenses', oldLicense.id, {
    is_active: false
  });
  
  // Create new license
  const newLicense = await databaseService.insert('ea_licenses', {
    license_key: newLicenseKey,
    customer_email: oldLicense.customer_email,
    customer_name: oldLicense.customer_name,
    mt5_account: newMt5Account,
    license_type: oldLicense.license_type,
    purchase_date: oldLicense.purchase_date,
    expiry_date: oldLicense.expiry_date,
    is_lifetime: oldLicense.is_lifetime,
    is_active: true,
    payment_id: oldLicense.payment_id,
    payment_amount: oldLicense.payment_amount,
    ea_id: oldLicense.ea_id,
    user_id: oldLicense.user_id
  });
  
  // Record regeneration
  await databaseService.insert('ea_license_regenerations', {
    old_license_key: oldLicenseKey,
    new_license_key: newLicenseKey,
    old_mt5_account: oldLicense.mt5_account,
    new_mt5_account: newMt5Account,
    reason: options.reason || 'Customer requested account change',
    regenerated_by: options.regeneratedBy || null
  });
  
  console.log('✅ License regenerated:', oldLicenseKey, '->', newLicenseKey);
  
  return newLicense;
}

/**
 * Extend license expiry date
 * @param {string} licenseKey - License key
 * @param {number} additionalDays - Days to add
 * @returns {Promise<Object>} Updated license
 */
async function extendLicense(licenseKey, additionalDays) {
  const license = await getLicenseByKey(licenseKey);
  
  if (!license) {
    throw new Error('License not found');
  }
  
  if (license.is_lifetime) {
    throw new Error('Cannot extend lifetime license');
  }
  
  const currentExpiry = new Date(license.expiry_date);
  const newExpiry = new Date(currentExpiry);
  newExpiry.setDate(newExpiry.getDate() + additionalDays);
  
  const updated = await databaseService.update('ea_licenses', license.id, {
    expiry_date: newExpiry.toISOString().split('T')[0]
  });
  
  console.log(`✅ License extended by ${additionalDays} days:`, licenseKey);
  
  return updated;
}

/**
 * Revoke license
 * @param {string} licenseKey - License key
 * @param {string} reason - Revocation reason
 * @returns {Promise<Object>} Updated license
 */
async function revokeLicense(licenseKey, reason = 'Revoked by admin') {
  const license = await getLicenseByKey(licenseKey);
  
  if (!license) {
    throw new Error('License not found');
  }
  
  const updated = await databaseService.update('ea_licenses', license.id, {
    is_active: false
  });
  
  console.log('⚠️ License revoked:', licenseKey, '-', reason);
  
  return updated;
}

/**
 * Get license statistics
 * @returns {Promise<Object>} Statistics
 */
async function getLicenseStatistics() {
  const allLicenses = await databaseService.query('ea_licenses', {});
  
  const stats = {
    total: allLicenses.length,
    active: 0,
    expired: 0,
    lifetime: 0,
    expiringSoon: 0, // Within 7 days
    byType: {}
  };
  
  const now = new Date();
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  
  allLicenses.forEach(license => {
    // Count by type
    if (!stats.byType[license.license_type]) {
      stats.byType[license.license_type] = 0;
    }
    stats.byType[license.license_type]++;
    
    // Count lifetime
    if (license.is_lifetime) {
      stats.lifetime++;
    }
    
    // Count active/expired
    if (license.is_active) {
      if (license.is_lifetime) {
        stats.active++;
      } else if (license.expiry_date) {
        const expiryDate = new Date(license.expiry_date);
        
        if (expiryDate > now) {
          stats.active++;
          
          // Check if expiring soon
          if (expiryDate <= sevenDaysFromNow) {
            stats.expiringSoon++;
          }
        } else {
          stats.expired++;
        }
      }
    } else {
      stats.expired++;
    }
  });
  
  return stats;
}

/**
 * Get expiring licenses (within specified days)
 * @param {number} days - Days threshold
 * @returns {Promise<Array>} Expiring licenses
 */
async function getExpiringLicenses(days = 7) {
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + days);
  
  const allLicenses = await databaseService.query('ea_licenses', {
    filter: {
      is_active: true,
      is_lifetime: false
    }
  });
  
  return allLicenses.filter(license => {
    if (!license.expiry_date) return false;
    
    const expiryDate = new Date(license.expiry_date);
    return expiryDate > now && expiryDate <= futureDate;
  });
}

module.exports = {
  LICENSE_TYPES,
  generateLicenseKey,
  createLicense,
  getLicenseByKey,
  getLicensesByEmail,
  getLicensesByAccount,
  getLicensesByUserId,
  validateLicense,
  regenerateLicense,
  extendLicense,
  revokeLicense,
  getLicenseStatistics,
  getExpiringLicenses,
  recordLicenseUsage
};
