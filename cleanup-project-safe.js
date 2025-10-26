#!/usr/bin/env node

/**
 * Safe Project Cleanup Script
 * 
 * This script moves unnecessary files to a backup folder instead of deleting them.
 * You can easily restore files if needed.
 * 
 * Usage:
 *   node cleanup-project-safe.js
 * 
 * To restore files:
 *   Just copy them back from the _cleanup_backup folder
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

const BACKUP_FOLDER = '_cleanup_backup';
const LOG_FILE = `cleanup_log_${Date.now()}.txt`;

let movedCount = 0;
let skippedCount = 0;
let errorCount = 0;
let logLines = [];

function log(message, color = '') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(color + message + colors.reset);
  logLines.push(logMessage);
}

function createBackupFolder() {
  if (!fs.existsSync(BACKUP_FOLDER)) {
    fs.mkdirSync(BACKUP_FOLDER, { recursive: true });
    log(`✅ Created backup folder: ${BACKUP_FOLDER}`, colors.green);
  }
}

function moveFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      skippedCount++;
      log(`⏭️  Skipped (not found): ${filePath}`, colors.dim);
      return;
    }

    const fileName = path.basename(filePath);
    const backupPath = path.join(BACKUP_FOLDER, fileName);
    
    // If backup already exists, add timestamp
    let finalBackupPath = backupPath;
    if (fs.existsSync(backupPath)) {
      const ext = path.extname(fileName);
      const base = path.basename(fileName, ext);
      finalBackupPath = path.join(BACKUP_FOLDER, `${base}_${Date.now()}${ext}`);
    }

    fs.renameSync(filePath, finalBackupPath);
    movedCount++;
    log(`📦 Moved: ${filePath} → ${finalBackupPath}`, colors.cyan);
  } catch (error) {
    errorCount++;
    log(`❌ Error moving ${filePath}: ${error.message}`, colors.red);
  }
}

function saveLog() {
  const logContent = logLines.join('\n');
  fs.writeFileSync(LOG_FILE, logContent);
  log(`\n📄 Log saved to: ${LOG_FILE}`, colors.green);
}

// ============================================
// FILES TO CLEAN UP
// ============================================

const filesToCleanup = [
  // Debug scripts
  'debug-password-check.js',
  'debug-server-error.js',
  'debug-subscription-data.js',
  'debug-subscription-download-flow.js',
  'debug-user-fetch.js',
  
  // Check scripts
  'check-admin-accounts.js',
  'check-admin-role.js',
  'check-all-admin-users.js',
  'check-all-user-subscriptions.js',
  'check-database-schema.js',
  'check-ea-file-paths.js',
  'check-ea-sources.js',
  'check-image-urls.js',
  'check-mock-mode.js',
  'check-subscriptions-in-db.js',
  'check-test-user.js',
  'check-user-role.js',
  'check-user-subscriptions.js',
  'inspect-users-accounts.js',
  
  // Test scripts
  'test-404-fix.js',
  'test-admin-cms.js',
  'test-admin-login-fixed.js',
  'test-admin-login-unified.js',
  'test-api-database-service.js',
  'test-auth.js',
  'test-authentication.js',
  'test-complete-download-flow.js',
  'test-complete-flow.js',
  'test-complete-subscription-auto-download-flow.js',
  'test-comprehensive-apis.js',
  'test-crypto-payment.js',
  'test-database-connection.js',
  'test-download-after-payment.js',
  'test-ea-creation.js',
  'test-environment.js',
  'test-health.js',
  'test-mock-auth.js',
  'test-payment-flow.js',
  'test-supabase-connection.js',
  'test-users-flow.js',
  'simple-test.js',
  'simple-auth-test.js',
  
  // Test HTML files
  'test-actual-image.html',
  'test-comprehensive-apis.html',
  'test-download-flow-simple.html',
  'test-image-display.html',
  'test-image-loading.html',
  'test-subscription-download-flow.html',
  'demo-download-flow-visual.html',
  
  // Fix scripts
  'fix-admin-complete.js',
  'fix-admin-dashboard.js',
  'fix-admin-login.js',
  'fix-all-admin-issues.js',
  'fix-complete-subscription-download-flow.js',
  'fix-database-screenshots.js',
  'fix-ea-file-paths-production.js',
  'fix-ea-file-paths.js',
  'fix-ea-files-bucket.js',
  'fix-ea-update-localStorage-bug.js',
  'fix-ea5-file-paths.js',
  'fix-everything-now.js',
  'fix-frontend-serving.js',
  'fix-healthcheck.js',
  'fix-image-display-complete.js',
  'fix-image-display-immediate.js',
  'fix-image-display.js',
  'fix-images-and-admin-now.js',
  'fix-images-now.js',
  'fix-package-dependencies.js',
  'fix-railway-issues.js',
  'fix-railway-startup.js',
  'fix-rate-limiting-complete.js',
  'fix-subscription-dates.js',
  'aggressive-cleanup.js',
  'auto-cleanup.js',
  'auto-fix-ea-files-bucket.js',
  'cleanup-screenshots.js',
  'clear-cache-and-restart.js',
  'complete-site-fix.js',
  'complete-subscription-download-fix.js',
  'comprehensive-fix.js',
  'ensure-upload-dirs.js',
  'final-admin-setup.js',
  'final-subscription-download-fix.js',
  'quick-improvements.js',
  'simple-download-fix.js',
  'step-by-step-fix.js',
  
  // Setup scripts (keep some)
  'setup-admin-panel.js',
  'setup-admin.js',
  'setup-auth.js',
  'setup-crypto-payments.js',
  'setup-production-admin.js',
  'setup-railway-admin.js',
  'setup-utilities-sync.js',
  'setup-wallet-addresses.js',
  
  // Deploy scripts
  'deploy-complete-fix.bat',
  'deploy-complete-fix.ps1',
  'deploy-complete-fixes.js',
  'deploy-fixes.js',
  'deploy-subscription-fixes.js',
  'deploy.bat',
  'deploy.ps1',
  'deploy-health-fix.bat',
  'deploy-health-fix.ps1',
  'force-railway-minimal.js',
  'force-railway-redeploy.bat',
  'force-restart.bat',
  'force-ultra-minimal.js',
  'railway-build-and-serve.js',
  'railway-deploy-fix.js',
  'railway-start.js',
  
  // Old server files
  'railway-full-server-backup.js',
  'railway-full-server-simple.js',
  'server-minimal.js',
  
  // Old package files
  'package-corrected.json',
  'package-minimal.json',
  'package-optimized.json',
  'package-ultra-minimal.json',
  
  // Backup route files
  'routes/users.js.bak',
  'routes/subscriptions-clean.js',
  
  // SQL files (keep schema)
  '_RUN_THIS_SQL_NOW.sql',
  '_SIMPLE_SQL_FIX.sql',
  'DELETE_ALL_EAS.sql',
  'fix-ea-files.sql',
  'fix-supabase-storage-buckets.sql',
  'RUN_THIS_SQL.sql',
  
  // Miscellaneous
  'ea-response.json',
  'temp-lot-calculator.txt',
  'generate-hash.js',
  'get-uploaded-file-url.js',
  'refresh-signal-prices.js',
  'run-paystack-test.js',
  'run-test-flow.js',
  'delete-all-eas.js',
  'delete-misnamed-files.js',
  'launch-admin-panel.js',
  'monitor-backend.js',
  
  // Startup scripts (duplicates)
  'start-all-services.bat',
  'start-all-services.ps1',
  'start-all.bat',
  'start-all.ps1',
  'start-app.bat',
  'start-app.ps1',
  'start-desktop-app.bat',
  'start-desktop-app.ps1',
  'start-desktop.bat',
  'start-desktop.ps1',
  'start-dev.js',
  'start-railway.js',
  'start-server.bat',
  'start-server.ps1',
  'start-windows.bat',
  'start-windows.ps1',
  
  // Documentation duplicates
  'DEPLOY_FIX_NOW.md',
  'DEPLOY_NOW.md',
  'DEPLOY_TO_HEROKU.md',
  'DEPLOY_TO_RENDER.md',
  'DEPLOYMENT_COMPLETE_FINAL.md',
  'DEPLOYMENT_COMPLETE_SUMMARY.md',
  'DEPLOYMENT_COMPLETE.md',
  'DEPLOYMENT_IN_PROGRESS.md',
  'DEPLOYMENT_PLATFORMS_GUIDE.md',
  'DEPLOYMENT_PUSHED_TO_RAILWAY.md',
  'DEPLOYMENT_READY_SUMMARY.md',
  'DEPLOYMENT_STATUS.md',
  'DEPLOYMENT_SUCCESS.txt',
  'QUICK_DEPLOYMENT_START.md',
  'START_HERE_CHOOSE_PLATFORM.md',
  'START_HERE_DEPLOY.md',
  'START_HERE_DEPLOYMENT.md',
  'START_HERE_FINAL.md',
  'START_HERE_FINAL.txt',
  'START_ME_FIRST.md',
  
  // Railway docs
  'RAILWAY_BUILD_FIX_V2.md',
  'RAILWAY_BUILD_TIMEOUT_FIXED.md',
  'RAILWAY_DEPENDENCIES_FIXED.md',
  'RAILWAY_DEPLOYMENT_COMPLETE.md',
  'RAILWAY_DEPLOYMENT_FIX_APPLIED.md',
  'RAILWAY_DEPLOYMENT_FIX.md',
  'RAILWAY_DEPLOYMENT_FIXED.md',
  'RAILWAY_DEPLOYMENT_STATUS.md',
  'RAILWAY_DEPLOYMENT_STRATEGY.md',
  'RAILWAY_EA_UPDATE_DEBUG.md',
  'RAILWAY_ENV_FIX.md',
  'RAILWAY_HEALTH_CHECK_FINAL_FIX.md',
  'RAILWAY_HEALTH_CHECK_FIX_FINAL.md',
  'RAILWAY_HEALTH_CHECK_PERMANENT_FIX.md',
  'RAILWAY_LOG_FIX.md',
  'RAILWAY_MINIMAL_DEPLOYMENT.md',
  'RAILWAY_ULTRA_MINIMAL_DEPLOYED.md',
  'RAILWAY_WARNINGS_EXPLAINED.md',
  'RAILWAY_PAYSTACK_SETUP.md',
  
  // Status/Complete docs
  '✅_ALL_FIXED_README.md',
  '✅_CHECKLIST.txt',
  '✅_CSP_COMPREHENSIVE_FIX_DEPLOYED.md',
  '✅_CSP_FIX_DEPLOYED.md',
  '✅_DEPLOYMENT_COMPLETE.txt',
  '✅_DOWNLOAD_FLOW_FINAL_SOLUTION.md',
  '✅_FINAL_CSP_FIX_DEPLOYED.md',
  '✅_FINAL_DEPLOYMENT_COMPLETE.md',
  '✅_SIMPLE_SQL_FIX.sql',
  '✅_SIMPLIFIED_CSP_DEPLOYED.md',
  '🎉_FINAL_SUMMARY_ALL_FIXES.md',
  '🎯_CSP_FIX_COMPLETE.md',
  '🎯_CSP_FIX_DEPLOYED.txt',
  '🎯_CSP_FIX_EXPLANATION.md',
  '📥_DOWNLOAD_FLOW_START_HERE.md',
  '📸_FIX_IMAGES_INSTRUCTIONS.txt',
  '🔍_DEDUCTION_SUMMARY.txt',
  '🔍_DIAGNOSE_IMAGES.html',
  '🔥_RUN_THIS_SQL_NOW.sql',
  '🖼️_FIX_IMAGES_START_HERE.md',
  '🚀_DEPLOY_CSP_FIX.bat',
  '🚨_FINAL_FIX_INSTRUCTIONS.md',
  '🚨_IMAGE_FIX_STEP_BY_STEP.md',
  '🚨_URGENT_SUPABASE_FIX.sql',
  '404_ERROR_FIXED.md',
  'ADMIN_LOGIN_FINAL_FIX.md',
  'ADMIN_LOGIN_FIX.md',
  'ALL_FIXES_COMPLETE.md',
  'API_SETUP_COMPLETE.md',
  'AUTHENTICATION_FLOW_UPDATES.md',
  'AUTHENTICATION_SETUP_COMPLETE.md',
  'BACKEND_ENDPOINTS_COMPLETE.md',
  'BUG_FIXES_SUMMARY.md',
  'BUGS_CLEANED.md',
  'CLEAR_LOGIN_DATA.md',
  'COMPLETE_FIX_APPLIED.md',
  'COMPLETE_FIX_GUIDE.md',
  'COMPLETE_SITE_FIXES_DEPLOYED.md',
  'CREATE_EA_IMPROVEMENTS.md',
  'CRYPTO_PAYMENT_IMPLEMENTATION_COMPLETE.md',
  'CRYPTO_PAYMENT_SETUP_COMPLETE.md',
  'CSV_CALENDAR_ANALYSIS.md',
  'CUSTOM_EA_SERVICE_COMPLETE.md',
  'CUSTOM_EA_VISIBILITY_FIX.md',
  'DATABASE_ID_MIGRATION_COMPLETE.md',
  'DEPENDENCIES_FIXED.md',
  'DOWNLOAD_AFTER_PAYMENT_TEST_GUIDE.md',
  'DOWNLOAD_FLOW_COMPLETE_GUIDE.md',
  'DOWNLOAD_FLOW_TEST_SUMMARY.md',
  'DOWNLOAD_PAYMENT_IMPLEMENTATION_COMPLETE.md',
  'DOWNLOAD_TEST_FIX_SUMMARY.md',
  'DOWNLOAD_TEST_SUCCESS.md',
  'EA_DEMO_TEST_COMPLETE.md',
  'EA_EDITOR_COMPLETE.md',
  'EA_SCREENSHOT_FIX_COMPLETE.md',
  'EA_SYNC_IMAGE_FIX_COMPLETE.md',
  'EA_UPDATE_FIXES_COMPLETE.md',
  'EA_UPLOAD_403_FIX.md',
  'FINAL_DEPLOYMENT_CHECKLIST.md',
  'FINAL_DEPLOYMENT_READY.md',
  'FINAL_DEPLOYMENT_VERIFICATION.md',
  'FINAL_EA_FIX_STATUS.md',
  'FINAL_EA_UPDATE_FIX_SUMMARY.md',
  'FINAL_PROJECT_SUMMARY.md',
  'FIX_DEPENDENCY_ISSUES.md',
  'FIX_STALE_PRICES.md',
  'FIXED_ISSUE_SUMMARY.txt',
  'FRONTEND_REBUILT_SUCCESS.md',
  'FRONTEND_SERVING_FIXED.md',
  'HEALTH_CHECK_FIX_DEPLOYED.md',
  'HEALTH_CHECK_FIX_SUMMARY.md',
  'HOW_TO_TEST.txt',
  'IMAGE_DISPLAY_FIX_GUIDE.md',
  'IMAGE_FIX_SUMMARY.md',
  'LOGIN_REDESIGN_COMPLETE.md',
  'MANUAL_EA_UPLOAD_TEST.md',
  'MARKET_DATA_API_FIX.md',
  'MARKET_DATA_APIS_SETUP.md',
  'MOCK_DATA_CLEANUP_CHECKLIST.md',
  'MOCK_DATA_REMOVED_SUMMARY.md',
  'PRE_DEPLOYMENT_AUDIT.md',
  'PROJECT_AUDIT_STATUS.md',
  'PROJECT_STATUS_VISUAL.md',
  'QUICK_FIX_INSTRUCTIONS.md',
  'QUICK_START.md',
  'RESPONSIVE_DESIGN_COMPLETE.md',
  'RESPONSIVE_FIXES_SUMMARY.md',
  'RESTART_SERVER.md',
  'RLS_POLICIES_SUMMARY.md',
  'SCROLL_IMPROVEMENTS_ADDED.md',
  'SELF_SERVICE_CRYPTO_SYSTEM_COMPLETE.md',
  'SUBSCRIPTION_AUTO_DOWNLOAD_COMPLETE.md',
  'SUBSCRIPTION_DOWNLOAD_FIX_COMPLETE.md',
  'SUBSCRIPTION_DOWNLOAD_FIXES_SUMMARY.md',
  'SUBSCRIPTION_DOWNLOAD_FLOW_FIXES.md',
  'SUBSCRIPTION_FIX_DEPLOYED.md',
  'SUMMARY_DOWNLOAD_PAYMENT.md',
  'SUPABASE_STORAGE_COMPLETE.md',
  'TEST_DOWNLOAD_FLOW_RESULTS.md',
  'TEST_DOWNLOAD_NOW.md',
  'TEST_RESULTS.md',
  'WHAT_TO_DO_NOW.md',
  '_DEPLOYMENT_GUIDE.md',
  '_DOWNLOAD_FLOW_FINAL_SOLUTION.md',
  '⚡_ACTION_PLAN_FIX_IMAGES.md'
];

// ============================================
// MAIN EXECUTION
// ============================================

console.log('\n' + '='.repeat(60));
log('🧹 SAFE PROJECT CLEANUP SCRIPT', colors.cyan);
console.log('='.repeat(60) + '\n');

log(`📁 Backup folder: ${BACKUP_FOLDER}`, colors.yellow);
log(`📝 Log file: ${LOG_FILE}`, colors.yellow);
log(`🗑️  Files to process: ${filesToCleanup.length}\n`, colors.yellow);

// Create backup folder
createBackupFolder();

log('\n🔄 Starting cleanup...\n', colors.cyan);

// Move each file
filesToCleanup.forEach(file => {
  moveFile(file);
});

// Summary
console.log('\n' + '='.repeat(60));
log('✅ CLEANUP COMPLETE!', colors.green);
console.log('='.repeat(60) + '\n');

log(`📦 Files moved: ${movedCount}`, colors.green);
log(`⏭️  Files skipped: ${skippedCount}`, colors.yellow);
log(`❌ Errors: ${errorCount}`, errorCount > 0 ? colors.red : colors.green);

log(`\n📂 Backup location: ${path.resolve(BACKUP_FOLDER)}`, colors.cyan);
log(`📄 Log file: ${path.resolve(LOG_FILE)}`, colors.cyan);

// Save log
saveLog();

console.log('\n' + '='.repeat(60));
log('💡 TO RESTORE FILES:', colors.yellow);
console.log('   Just copy them back from the backup folder');
console.log('='.repeat(60) + '\n');

log('✨ Your project is now cleaner and more professional!', colors.green);
log('🚀 Ready for production deployment!\n', colors.green);

process.exit(0);

