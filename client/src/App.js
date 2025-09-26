import React from 'react';

function App() {
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#2563eb', marginBottom: '20px' }}>
          🚀 Smart Algos Trading Platform
        </h1>
        
        <div style={{ marginBottom: '30px' }}>
          <h2>✅ App is Working!</h2>
          <p>Environment: <strong>{process.env.NODE_ENV || 'production'}</strong></p>
          <p>Current Time: <strong>{new Date().toLocaleString()}</strong></p>
          <p>Status: <strong>Deployment Successful!</strong></p>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3>🎯 Next Steps:</h3>
          <ul>
            <li>✅ React app deployed successfully</li>
            <li>✅ No 404 errors</li>
            <li>✅ Clean project structure</li>
            <li>🔄 Ready to add features</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;