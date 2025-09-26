import React, { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';

const DebugInfo = () => {
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    setApiUrl(apiClient.defaults.baseURL);
    
    // Test API connection
    apiClient.get('/api/health')
      .then(response => {
        setApiStatus(`✅ API Connected: ${response.data.status}`);
      })
      .catch(error => {
        setApiStatus(`❌ API Error: ${error.message}`);
      });
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <div><strong>Debug Info:</strong></div>
      <div>API URL: {apiUrl}</div>
      <div>Status: {apiStatus}</div>
      <div>Environment: {process.env.NODE_ENV}</div>
    </div>
  );
};

export default DebugInfo;
