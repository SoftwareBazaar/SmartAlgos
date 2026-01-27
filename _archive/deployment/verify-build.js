#!/usr/bin/env node

// Build verification script for Railway deployment
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying React build...');

const clientBuildPath = path.join(__dirname, 'client', 'build');
const indexPath = path.join(clientBuildPath, 'index.html');
const staticPath = path.join(clientBuildPath, 'static');

console.log('Build path:', clientBuildPath);
console.log('Index.html exists:', fs.existsSync(indexPath));
console.log('Static folder exists:', fs.existsSync(staticPath));

if (fs.existsSync(clientBuildPath)) {
  const files = fs.readdirSync(clientBuildPath);
  console.log('Build directory contents:', files);
  
  if (fs.existsSync(indexPath)) {
    console.log('✅ React build is complete');
    process.exit(0);
  } else {
    console.log('❌ React build is incomplete - missing index.html');
    process.exit(1);
  }
} else {
  console.log('❌ Build directory does not exist');
  process.exit(1);
}
