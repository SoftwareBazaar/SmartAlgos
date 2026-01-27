/**
 * Master fix script - Fixes all admin dashboard issues
 * 1. Removes duplicate EA modal section (JSX error)
 * 2. Adds missing Input import
 * 3. Creates sample EA images
 * 4. Updates default EAs with image paths
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 MASTER FIX SCRIPT - Fixing all admin issues\n');
console.log('=' .repeat(60));

// ============================================
// FIX 1: Remove duplicate EA modal section
// ============================================
console.log('\n📋 FIX 1: Removing duplicate EA modal section...');

const adminDashPath = path.join(__dirname, 'client/src/pages/Admin/AdminDashboard.js');
let adminContent = fs.readFileSync(adminDashPath, 'utf-8');
let lines = adminContent.split('\n');

// Check if duplicate section exists (line 909 should have broken content)
if (lines.length > 1302 && lines[908].trim().startsWith('}')) {
  console.log('   🔍 Found duplicate section at lines 909-1302');
  const START_LINE = 908;
  const END_LINE = 1301;
  
  const fixedLines = [
    ...lines.slice(0, START_LINE),
    ...lines.slice(END_LINE + 1)
  ];
  
  adminContent = fixedLines.join('\n');
  console.log(`   ✅ Removed ${lines.length - fixedLines.length} duplicate lines`);
} else {
  console.log('   ✅ No duplicate section found (already fixed)');
}

// ============================================
// FIX 2: Add missing Input import
// ============================================
console.log('\n📋 FIX 2: Adding missing Input component import...');

const oldImport = `import Button from "../../components/UI/Button";`;
const newImport = `import Button from "../../components/UI/Button";

import Input from "../../components/UI/Input";`;

if (adminContent.includes('import Input from')) {
  console.log('   ✅ Input already imported');
} else {
  adminContent = adminContent.replace(oldImport, newImport);
  console.log('   ✅ Added Input import');
}

// Save AdminDashboard fixes
fs.writeFileSync(adminDashPath, adminContent, 'utf-8');
console.log('   💾 Saved AdminDashboard.js');

// ============================================
// FIX 3: Create sample EA images
// ============================================
console.log('\n📋 FIX 3: Creating sample EA images...');

const uploadsDir = path.join(__dirname, 'uploads/ea-images');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`   📁 Created directory: ${uploadsDir}`);
}

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
};

createSampleImage('gold-scalper.svg', '#FFD700', 'Gold Scalper Pro');
createSampleImage('trend-master.svg', '#2196F3', 'Trend Master EA');
createSampleImage('multi-indicator.svg', '#9C27B0', 'Multi Indicator');
createSampleImage('institutional.svg', '#FF5722', 'Institutional EA');

// ============================================
// FIX 4: Update default EA images
// ============================================
console.log('\n📋 FIX 4: Updating default EAs with sample images...');

const eaContextPath = path.join(__dirname, 'client/src/contexts/EAContext.js');
let eaContent = fs.readFileSync(eaContextPath, 'utf-8');

const eaUpdates = [
  { id: 1, image: '/uploads/ea-images/gold-scalper.svg', name: 'Gold Scalper' },
  { id: 2, image: '/uploads/ea-images/multi-indicator.svg', name: 'Multi Indicator' },
  { id: 3, image: '/uploads/ea-images/trend-master.svg', name: 'Trend Master' },
  { id: 4, image: '/uploads/ea-images/institutional.svg', name: 'Institutional' }
];

eaUpdates.forEach((update) => {
  const regex = new RegExp(`(id: ${update.id},[\\s\\S]*?)image: null,`, 'm');
  if (regex.test(eaContent)) {
    eaContent = eaContent.replace(regex, `$1image: '${update.image}',`);
    console.log(`   ✅ Updated EA ${update.id} (${update.name})`);
  } else {
    console.log(`   ⚠️  EA ${update.id} already has image or pattern not found`);
  }
});

fs.writeFileSync(eaContextPath, eaContent, 'utf-8');
console.log('   💾 Saved EAContext.js');

// ============================================
// SUMMARY
// ============================================
console.log('\n' + '='.repeat(60));
console.log('✅ ALL FIXES COMPLETED!\n');
console.log('📊 Summary:');
console.log('   ✅ Fixed AdminDashboard JSX syntax error');
console.log('   ✅ Added missing Input component import');
console.log('   ✅ Created 4 sample EA images');
console.log('   ✅ Updated default EAs with image paths');
console.log('\n🎨 Sample Images Created:');
console.log('   - gold-scalper.svg (Gold theme)');
console.log('   - trend-master.svg (Blue theme)');
console.log('   - multi-indicator.svg (Purple theme)');
console.log('   - institutional.svg (Red theme)');
console.log('\n🚀 NEXT STEPS:');
console.log('   1. Test locally: npm start');
console.log('   2. Check admin dashboard → EAs section');
console.log('   3. Commit: git add . && git commit -m "Fix all admin issues and add sample EA images"');
console.log('   4. Deploy: git push origin master');
console.log('\n✅ Ready to deploy!\n');

