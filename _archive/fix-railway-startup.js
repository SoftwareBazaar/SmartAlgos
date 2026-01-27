const fs = require('fs');

console.log('🔧 Creating Railway-compatible server startup...\n');

// Read server.js
let serverContent = fs.readFileSync('server.js', 'utf8');

// Add error handling and fallback for Railway
const railwayStartupFix = `
// Railway startup fix - ensure server starts even with missing env vars
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost');

// Add error handling for server startup
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(\`Port \${PORT} is already in use\`);
  }
});

if (!process.env.VERCEL) {
  try {
    server.listen(PORT, HOST, () => {
      console.log(\`[startup] Smart Algos API running on http://\${HOST}:\${PORT}\`);
      console.log(\`[startup] WebSocket server ready on ws://\${HOST}:\${PORT}\`);
      console.log(\`[startup] Environment: \${process.env.NODE_ENV || 'development'}\`);
      console.log(\`[startup] Railway deployment ready\`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}`;

// Replace the existing startup section
const oldStartupPattern = /\/\/ Start server[\s\S]*?server\.listen\(PORT, HOST, \(\) => \{[\s\S]*?\}\);[\s\S]*?\}/;
serverContent = serverContent.replace(oldStartupPattern, railwayStartupFix);

// Write the updated server.js
fs.writeFileSync('server.js', serverContent);

// Create a simple package.json start script
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
packageJson.scripts = {
  ...packageJson.scripts,
  'start:railway': 'node server.js'
};
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

console.log('✅ Fixed Railway startup:');
console.log('   - Added error handling for server startup');
console.log('   - Added Railway-specific logging');
console.log('   - Updated package.json with Railway start script');
console.log('\n🚀 Ready to deploy! Run: git add . && git commit -m "Fix Railway startup" && git push');
