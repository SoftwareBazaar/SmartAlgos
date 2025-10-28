const express = require('express');
const cryptoPaymentRoutes = require('./routes/cryptoPayments');

const app = express();
app.use(express.json());

// Register the route exactly as in server.js
app.use('/api/payments/crypto', cryptoPaymentRoutes);

// Add a test 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API route not found',
    path: req.originalUrl
  });
});

// List all registered routes
console.log('\n📋 Registered Routes:');
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`  ${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    console.log(`  Router mounted at: ${middleware.regexp}`);
    if (middleware.handle.stack) {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods).join(', ').toUpperCase();
          console.log(`    ${methods} ${handler.route.path}`);
        }
      });
    }
  }
});

// Start server
const PORT = 5001; // Use different port to avoid conflict
app.listen(PORT, () => {
  console.log(`\n✅ Test server running on port ${PORT}`);
  console.log(`\n🧪 Test the endpoint with:`);
  console.log(`  curl -X POST http://localhost:${PORT}/api/payments/crypto/generate \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"amount":99.99,"currency":"USD","cryptoCurrency":"usdt","productType":"ea_subscription","productId":"1"}'`);
});

