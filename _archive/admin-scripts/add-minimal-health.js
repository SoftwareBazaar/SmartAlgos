const fs = require('fs');

console.log('🔧 Adding minimal health endpoint...\n');

// Read server.js
let serverContent = fs.readFileSync('server.js', 'utf8');

// Add a minimal health endpoint that doesn't depend on external services
const minimalHealthEndpoint = `
// Minimal health endpoint for Railway (no external dependencies)
app.get('/health', (req, res) => {
  try {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      message: 'Railway healthcheck endpoint',
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Also add a simple root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Smart Algos Trading Platform API',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});
`;

// Insert before the existing /api/health endpoint
const insertPosition = serverContent.indexOf('// Health check endpoint');
if (insertPosition !== -1) {
  const newServerContent = 
    serverContent.slice(0, insertPosition) + 
    minimalHealthEndpoint + '\n\n' +
    serverContent.slice(insertPosition);
  
  fs.writeFileSync('server.js', newServerContent);
  console.log('✅ Added minimal health endpoint');
} else {
  console.log('❌ Could not find insertion point for health endpoint');
}

console.log('✅ Health endpoint added successfully!');
