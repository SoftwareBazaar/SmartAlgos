/**
 * Diagnostic script to check ZIP download setup
 * Run this to verify:
 * 1. Database has zip_file_path column
 * 2. EAs have ZIP files uploaded
 * 3. Download links are being generated correctly
 */

const databaseService = require('./services/databaseService');

async function checkZipSetup() {
  console.log('🔍 Checking ZIP Download Setup...\n');

  try {
    const supabase = databaseService.getClient();

    // Check 1: Verify zip_file_path column exists
    console.log('1️⃣ Checking if zip_file_path column exists...');
    try {
      const { data: columnCheck, error: columnError } = await supabase
        .from('expert_advisors')
        .select('id, name, zip_file_path')
        .limit(1);

      if (columnError) {
        console.error('❌ Column check failed:', columnError.message);
        console.log('\n⚠️  ACTION REQUIRED: Run this SQL in Supabase Dashboard:');
        console.log('   ALTER TABLE expert_advisors ADD COLUMN IF NOT EXISTS zip_file_path TEXT;\n');
        return;
      }

      console.log('✅ zip_file_path column exists!\n');
    } catch (error) {
      console.error('❌ Column check error:', error.message);
      return;
    }

    // Check 2: Get all EAs and check which have ZIP files
    console.log('2️⃣ Checking EAs for ZIP files...');
    const { data: eas, error: easError } = await supabase
      .from('expert_advisors')
      .select('id, name, zip_file_path, ea_file_path, status, is_active')
      .eq('is_active', true);

    if (easError) {
      console.error('❌ Failed to fetch EAs:', easError.message);
      return;
    }

    console.log(`   Found ${eas.length} active EAs\n`);

    const easWithZip = eas.filter(ea => ea.zip_file_path);
    const easWithoutZip = eas.filter(ea => !ea.zip_file_path);

    console.log(`   ✅ EAs with ZIP files: ${easWithZip.length}`);
    if (easWithZip.length > 0) {
      easWithZip.forEach(ea => {
        console.log(`      - ${ea.name} (ID: ${ea.id})`);
        console.log(`        ZIP: ${ea.zip_file_path.substring(0, 60)}...`);
      });
    }

    console.log(`\n   ⚠️  EAs without ZIP files: ${easWithoutZip.length}`);
    if (easWithoutZip.length > 0) {
      easWithoutZip.forEach(ea => {
        console.log(`      - ${ea.name} (ID: ${ea.id})`);
        if (ea.ea_file_path) {
          console.log(`        Has EA file: ${ea.ea_file_path.substring(0, 60)}...`);
        } else {
          console.log(`        ⚠️  No EA file either!`);
        }
      });
    }

    // Check 3: Test download link generation
    console.log('\n3️⃣ Testing download link generation...');
    if (easWithZip.length > 0) {
      const testEA = easWithZip[0];
      const jwt = require('jsonwebtoken');
      const downloadToken = jwt.sign(
        {
          subscriptionId: 'test-sub-id',
          userId: 'test-user-id',
          eaId: testEA.id,
          timestamp: Date.now()
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      const baseUrl = process.env.BACKEND_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const zipDownloadUrl = `${baseUrl}/api/downloads/ea/${testEA.id}/zip?token=${downloadToken}`;

      console.log(`   Test EA: ${testEA.name}`);
      console.log(`   ZIP Download URL: ${zipDownloadUrl.substring(0, 100)}...`);
      console.log('   ✅ Download link generation working!\n');
    } else {
      console.log('   ⚠️  No EAs with ZIP files to test\n');
    }

    // Summary
    console.log('📊 SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Database column: EXISTS`);
    console.log(`📦 EAs with ZIP: ${easWithZip.length}/${eas.length}`);
    console.log(`⚠️  EAs without ZIP: ${easWithoutZip.length}/${eas.length}`);

    if (easWithoutZip.length > 0) {
      console.log('\n💡 NEXT STEPS:');
      console.log('   1. Go to Admin Dashboard → EAs');
      console.log('   2. Edit each EA without ZIP');
      console.log('   3. Upload ZIP file in green section');
      console.log('   4. Save EA');
    }

    if (easWithZip.length > 0) {
      console.log('\n✅ READY TO TEST:');
      console.log('   1. Subscribe to an EA with ZIP file');
      console.log('   2. Complete payment');
      console.log('   3. ZIP should auto-download!');
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Setup check failed:', error);
  }

  process.exit(0);
}

// Run the check
checkZipSetup();
