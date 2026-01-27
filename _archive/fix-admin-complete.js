/**
 * Complete fix for AdminDashboard - Add missing Input import and sample EA images
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing AdminDashboard.js...\n');

const filePath = path.join(__dirname, 'client/src/pages/Admin/AdminDashboard.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf-8');

console.log('✅ Step 1: Adding missing Input component import');

// Fix 1: Add Input import after Button import
const oldImport = `import Button from "../../components/UI/Button";`;
const newImport = `import Button from "../../components/UI/Button";

import Input from "../../components/UI/Input";`;

if (content.includes('import Input from')) {
  console.log('   ⚠️  Input already imported, skipping...');
} else {
  content = content.replace(oldImport, newImport);
  console.log('   ✅ Added Input import');
}

// Write the fixed content
fs.writeFileSync(filePath, content, 'utf-8');

console.log('\n✅ AdminDashboard.js fixed!');
console.log('\n📊 Fixes Applied:');
console.log('   1. ✅ Added missing Input component import');
console.log('\n🚀 Next: Creating sample EA images...\n');

// ============================================
// Fix 2: Create sample EA images
// ============================================

console.log('🎨 Creating sample EA images...');

const uploadsDir = path.join(__dirname, 'uploads/ea-images');

// Ensure directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`   📁 Created directory: ${uploadsDir}`);
}

// Create SVG placeholder images
const createSampleImage = (filename, color, title) => {
  const svg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad${filename}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color};stop-opacity:0.7" />
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill="url(#grad${filename})"/>
    <text x="50%" y="45%" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="white" text-anchor="middle">${title}</text>
    <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" opacity="0.9">Expert Advisor</text>
    <circle cx="50" cy="250" r="30" fill="white" opacity="0.2"/>
    <circle cx="350" cy="50" r="40" fill="white" opacity="0.1"/>
  </svg>`;
  
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, svg, 'utf-8');
  console.log(`   ✅ Created: ${filename}`);
  return filePath;
};

// Create 4 sample images
createSampleImage('gold-scalper.svg', '#FFD700', 'Gold Scalper Pro');
createSampleImage('trend-master.svg', '#2196F3', 'Trend Master EA');
createSampleImage('multi-indicator.svg', '#9C27B0', 'Multi Indicator');
createSampleImage('institutional.svg', '#FF5722', 'Institutional EA');

console.log('\n✅ All fixes complete!');
console.log('\n📋 Summary:');
console.log('   ✅ Fixed missing Input import in AdminDashboard');
console.log('   ✅ Created 4 sample EA images in uploads/ea-images/');
console.log('\n🎯 Sample images created:');
console.log('   - gold-scalper.svg (Gold theme)');
console.log('   - trend-master.svg (Blue theme)');
console.log('   - multi-indicator.svg (Purple theme)');
console.log('   - institutional.svg (Red theme)');
console.log('\n🚀 Next steps:');
console.log('   1. Run: node fix-admin-dashboard.js (if not already done)');
console.log('   2. Test admin dashboard locally');
console.log('   3. Commit: git add . && git commit -m "Fix AdminDashboard Input import and add sample EA images"');
console.log('   4. Deploy: git push origin master');

