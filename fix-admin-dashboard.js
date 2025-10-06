/**
 * Fix AdminDashboard.js - Remove duplicate/corrupted EA modal section
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'client/src/pages/Admin/AdminDashboard.js');

console.log('🔧 Fixing AdminDashboard.js...');

// Read the file
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

console.log(`📄 Total lines in file: ${lines.length}`);

// Remove lines 909-1302 (0-indexed: 908-1301)
// These are the duplicate/corrupted EA modal section
const START_LINE = 908; // Line 909 (0-indexed)
const END_LINE = 1301;   // Line 1302 (0-indexed)

console.log(`✂️  Removing duplicate section: lines ${START_LINE + 1} to ${END_LINE + 1}`);

const fixedLines = [
  ...lines.slice(0, START_LINE),
  ...lines.slice(END_LINE + 1)
];

console.log(`✅ New line count: ${fixedLines.length} (removed ${lines.length - fixedLines.length} lines)`);

// Write the fixed content
fs.writeFileSync(filePath, fixedLines.join('\n'), 'utf-8');

console.log('✅ Fixed! AdminDashboard.js has been repaired.');
console.log('\n📝 Summary:');
console.log(`   - Removed duplicate/corrupted EA modal section`);
console.log(`   - File is now ${fixedLines.length} lines (was ${lines.length} lines)`);
console.log(`\n🚀 Next steps:`);
console.log(`   1. Run: npm start`);
console.log(`   2. Test the admin dashboard`);
console.log(`   3. Commit: git add . && git commit -m "Fix AdminDashboard duplicate section"`);
console.log(`   4. Deploy: git push origin master`);

