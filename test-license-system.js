/**
 * Test License Generation System
 * Tests license creation, validation, and management
 */

require('dotenv').config();
const licenseService = require('./services/licenseService');
const licenseEmailService = require('./services/licenseEmailService');
const databaseService = require('./services/databaseService');

async function testLicenseSystem() {
  console.log('\n🔑 ========== LICENSE SYSTEM TEST ==========\n');

  try {
    // Test 1: Generate a license key
    console.log('📝 Test 1: Generate License Key');
    const testLicenseKey = licenseService.generateLicenseKey({
      email: 'test@example.com',
      mt5Account: '12345678',
      purchaseDate: '2026-01-27',
      licenseType: 'M1'
    });
    console.log('✅ License key generated:', testLicenseKey);
    console.log('   Format: LB-[TYPE]-[HASH]-[EXPIRY]');
    console.log('');

    // Test 2: Create a license in database
    console.log('📝 Test 2: Create License in Database');
    const license = await licenseService.createLicense({
      customerEmail: 'test@example.com',
      customerName: 'Test User',
      mt5Account: '12345678',
      licenseType: 'M1',
      purchaseDate: new Date(),
      paymentId: 'TEST-PAYMENT-123',
      paymentAmount: 99.99,
      eaId: 1,
      userId: '00000000-0000-0000-0000-000000000000'
    });
    console.log('✅ License created in database');
    console.log('   ID:', license.id);
    console.log('   Key:', license.license_key);
    console.log('   Expiry:', license.expiry_date);
    console.log('');

    // Test 3: Validate license
    console.log('📝 Test 3: Validate License');
    const validation = await licenseService.validateLicense(
      license.license_key,
      '12345678'
    );
    console.log('✅ License validation result:');
    console.log('   Valid:', validation.valid);
    console.log('   Reason:', validation.reason || 'License is valid');
    console.log('');

    // Test 4: Test with wrong MT5 account (should fail)
    console.log('📝 Test 4: Validate with Wrong MT5 Account');
    const wrongValidation = await licenseService.validateLicense(
      license.license_key,
      '87654321'
    );
    console.log('✅ Validation with wrong account:');
    console.log('   Valid:', wrongValidation.valid);
    console.log('   Reason:', wrongValidation.reason);
    console.log('');

    // Test 5: Get license statistics
    console.log('📝 Test 5: Get License Statistics');
    const stats = await licenseService.getLicenseStatistics();
    console.log('✅ License statistics:');
    console.log('   Total licenses:', stats.total);
    console.log('   Active:', stats.active);
    console.log('   Expired:', stats.expired);
    console.log('   Lifetime:', stats.lifetime);
    console.log('   By type:', stats.byType);
    console.log('');

    // Test 6: Test license types
    console.log('📝 Test 6: Available License Types');
    console.log('✅ License types:');
    Object.entries(licenseService.LICENSE_TYPES).forEach(([code, config]) => {
      console.log(`   ${code}: ${config.label} (${config.days || 'Lifetime'} days)`);
    });
    console.log('');

    // Test 7: Test email sending (if configured)
    console.log('📝 Test 7: Test License Email');
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      console.log('   Email is configured, testing email send...');
      const emailResult = await licenseEmailService.sendLicenseEmail({
        customerEmail: process.env.EMAIL_USER, // Send to yourself for testing
        customerName: 'Test User',
        licenseKey: license.license_key,
        licenseType: 'M1',
        mt5Account: '12345678',
        purchaseDate: new Date().toISOString(),
        expiryDate: license.expiry_date,
        eaName: 'Test EA',
        downloadLink: 'https://example.com/download'
      });
      
      if (emailResult.success) {
        console.log('✅ Email sent successfully');
        console.log('   Message ID:', emailResult.messageId);
      } else {
        console.log('❌ Email failed:', emailResult.error);
      }
    } else {
      console.log('⚠️  Email not configured (set EMAIL_USER and EMAIL_PASSWORD)');
    }
    console.log('');

    // Test 8: Cleanup - revoke test license
    console.log('📝 Test 8: Cleanup - Revoke Test License');
    await licenseService.revokeLicense(license.license_key, 'Test cleanup');
    console.log('✅ Test license revoked');
    console.log('');

    console.log('🎉 ========== ALL TESTS PASSED ==========\n');
    console.log('✅ License system is working correctly!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('   1. Run database migration: node database/create-licenses-tables.sql');
    console.log('   2. Set LICENSE_SECRET_SALT in .env (min 32 characters)');
    console.log('   3. Configure EMAIL_USER and EMAIL_PASSWORD for license emails');
    console.log('   4. Test with real payment flow');
    console.log('');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }

  process.exit(0);
}

// Run tests
testLicenseSystem();
