import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initErrorMonitoring } from './utils/errorMonitoring';
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

// Initialize error monitoring
initErrorMonitoring();

// Enhanced error logging for Railway (captures React Error #31)
if (process.env.NODE_ENV === 'production') {
  const originalError = console.error;
  console.error = (...args) => {
    originalError.apply(console, args);
    // Capture React Error #31 specifically
    const errorString = args.map(arg => 
      typeof arg === 'string' ? arg : JSON.stringify(arg)
    ).join(' ');
    
    if (errorString.includes('Objects are not valid') || 
        errorString.includes('Minified React error #31') ||
        errorString.includes('$$typeof') ||
        errorString.includes('render') && errorString.includes('displayName')) {
      console.error('=== RAILWAY REACT ERROR #31 DETECTED ===');
      console.error('Full error args:', JSON.stringify(args, null, 2));
      console.error('Error string:', errorString);
      console.error('Stack trace:', new Error().stack);
      console.error('Timestamp:', new Date().toISOString());
      console.error('URL:', window.location.href);
    }
  };

  // Capture unhandled errors
  window.addEventListener('error', (event) => {
    if (event.message?.includes('Objects are not valid') || 
        event.message?.includes('Minified React error #31')) {
      console.error('[RAILWAY WINDOW ERROR]', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.toString(),
        stack: event.error?.stack
      });
    }
  });
}

if (!googleClientId) {
  console.warn('Google OAuth client ID is missing. Google login button will be hidden.');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    ) : (
      <App />
    )}
  </React.StrictMode>
);

