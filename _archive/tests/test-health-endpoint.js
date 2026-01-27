// Test the health endpoint
const http = require('http');

console.log('Testing health endpoint...\n');

const PORT = process.env.PORT || 5000;
const HOST = 'localhost';

// Wait a bit for server to start
setTimeout(() => {
  const options = {
    hostname: HOST,
    port: PORT,
    path: '/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`Status Code: ${res.statusCode}`);
      console.log('Response:', data);
      
      if (res.statusCode === 200) {
        console.log('\n✅ Health check endpoint is working correctly!');
      } else {
        console.log('\n❌ Health check endpoint returned non-200 status');
      }
      
      process.exit(res.statusCode === 200 ? 0 : 1);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error connecting to health endpoint:', error.message);
    console.log('\nMake sure the server is running on port', PORT);
    process.exit(1);
  });

  req.end();
}, 2000);

console.log(`Waiting for server to start on ${HOST}:${PORT}...`);

