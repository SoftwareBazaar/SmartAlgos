const fs = require('fs');

console.log('🔧 Fixing Railway healthcheck issue...\n');

// Read server.js
let serverContent = fs.readFileSync('server.js', 'utf8');

// Add the /health endpoint after the existing /api/health endpoint
const healthEndpoint = `
// Add the Railway healthcheck endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    message: 'Railway healthcheck endpoint'
  });
});
`;

// Find the position to insert the new endpoint
const insertPosition = serverContent.indexOf('// Root endpoint (only for API mode)');

if (insertPosition === -1) {
  console.error('❌ Could not find insertion point in server.js');
  process.exit(1);
}

// Insert the new endpoint
const newServerContent = 
  serverContent.slice(0, insertPosition) + 
  healthEndpoint + '\n\n' +
  serverContent.slice(insertPosition);

// Write the updated server.js
fs.writeFileSync('server.js', newServerContent);

// Update railway.json
const railwayConfig = {
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cross-env MOCK_AUTH=false NODE_ENV=production npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
};

fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));

console.log('✅ Fixed healthcheck configuration:');
console.log('   - Added /health endpoint to server.js');
console.log('   - Updated railway.json with correct startCommand');
console.log('   - Set MOCK_AUTH=false for production');
console.log('   - Set NODE_ENV=production');
console.log('\n🚀 Ready to deploy! Run: git add . && git commit -m "Fix healthcheck" && git push');
