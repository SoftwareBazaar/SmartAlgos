const fs = require('fs').promises;
const path = require('path');

const directories = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads/ea-files'),
  path.join(__dirname, 'uploads/ea-images'),
  path.join(__dirname, 'uploads/admin')
];

async function ensureDirectories() {
  console.log('Creating upload directories...');
  
  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`✅ Created/verified directory: ${dir}`);
    } catch (error) {
      console.error(`❌ Failed to create directory ${dir}:`, error);
    }
  }
  
  console.log('Done!');
}

ensureDirectories();
