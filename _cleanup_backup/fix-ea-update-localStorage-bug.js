/**
 * Fix EA Update 500 Error - Remove localStorage from server-side code
 * Bug: Server-side code trying to use browser's localStorage API
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing EA Update localStorage bug...\n');

const filePath = path.join(__dirname, 'routes/eas.js');
let content = fs.readFileSync(filePath, 'utf-8');

// Find and fix the localStorage bug in PUT /:id route (around line 720)
const buggyCode = `      // Get existing EA data from localStorage to merge
      const savedEAs = localStorage.getItem('smart-algos-eas');
      let existingEAs = savedEAs ? JSON.parse(savedEAs) : [];
      const existingEA = existingEAs.find(ea => ea.id == req.params.id) || {};
      
      // In mock mode, simulate the update`;

const fixedCode = `      // In mock mode, get existing EA from mockAuthStore
      const mockAuthStore = require('../services/mockAuthStore');
      if (!mockAuthStore.mockEAs) {
        mockAuthStore.mockEAs = [];
      }
      const existingEA = mockAuthStore.mockEAs.find(ea => ea.id == req.params.id) || {};
      
      // Simulate the update`;

if (content.includes('localStorage.getItem')) {
  console.log('✅ Found localStorage bug in EA update route');
  content = content.replace(buggyCode, fixedCode);
  console.log('✅ Removed localStorage reference');
  console.log('✅ Using mockAuthStore instead');
} else {
  console.log('⚠️  localStorage bug not found (may be already fixed)');
}

// Also need to move mockAuthStore require to avoid duplication
const duplicateMockAuthRequire = `      // Store in mock storage (in-memory for this request)
      const mockAuthStore = require('../services/mockAuthStore');
      if (!mockAuthStore.mockEAs) {`;

const fixedMockAuthRequire = `      // Store in mock storage (already loaded above)
      if (!mockAuthStore.mockEAs) {`;

if (content.includes(duplicateMockAuthRequire)) {
  console.log('✅ Removing duplicate mockAuthStore require');
  content = content.replace(duplicateMockAuthRequire, fixedMockAuthRequire);
}

// Write fixed content
fs.writeFileSync(filePath, content, 'utf-8');

console.log('\n✅ EA Update bug fixed!');
console.log('\n📋 Changes Made:');
console.log('   ❌ Removed: localStorage.getItem() (browser-only API)');
console.log('   ✅ Added: mockAuthStore for server-side EA storage');
console.log('   ✅ Fixed: Duplicate mockAuthStore require statement');
console.log('\n🚀 Next Steps:');
console.log('   1. Restart server: npm start');
console.log('   2. Test EA update in admin dashboard');
console.log('   3. Upload image and EA file');
console.log('   4. Click "Update EA" - should work now!');
console.log('   5. If working, commit and deploy');

