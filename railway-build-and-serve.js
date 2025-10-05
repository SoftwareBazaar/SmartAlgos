const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Railway Build and Serve Script\n');

try {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('\n🏗️  Building React frontend...');
  execSync('cd client && npm install', { stdio: 'inherit' });
  execSync('cd client && npm run build', { stdio: 'inherit' });
  
  console.log('\n✅ Build completed successfully!');
  console.log('🚀 Starting full server...');
  
  // Start the full server
  require('./server.js');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
