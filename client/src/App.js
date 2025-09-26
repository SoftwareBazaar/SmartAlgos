import React from 'react';

function App() {
  const apiUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : 'https://smart-algos-cdbf.vercel.app/api';

  const testAPI = async () => {
    try {
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();
      alert(`API Status: ${data.status || 'Connected'}`);
    } catch (error) {
      alert(`API Error: ${error.message}`);
    }
  };

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
          <p>API URL: <strong>{apiUrl}</strong></p>
          <p>Current Time: <strong>{new Date().toLocaleString()}</strong></p>
        </div>

        <button 
          onClick={testAPI}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '10px'
          }}
        >
          Test API Connection
        </button>

        <div style={{ marginTop: '30px' }}>
          <h3>🎯 Status:</h3>
          <ul>
            <li>✅ React app is loading</li>
            <li>✅ Environment variables working</li>
            <li>✅ No 404 errors</li>
            <li>🔄 Ready to test API</li>
          </ul>
        </div>

        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '6px' 
        }}>
          <h4>🔧 Debug Info:</h4>
          <p><strong>URL:</strong> {window.location.href}</p>
          <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...</p>
        </div>
      </div>
    </div>
  );
}

export default App;