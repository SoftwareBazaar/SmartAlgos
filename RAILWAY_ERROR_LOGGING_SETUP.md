# Railway Build Log Error Capture Setup

## Method 1: Enhanced Error Logging in Production

Add this to your `client/src/index.js` to capture errors in Railway logs:

```javascript
// Add before root.render() in client/src/index.js
if (process.env.NODE_ENV === 'production') {
  // Capture React errors
  window.addEventListener('error', (event) => {
    console.error('[RAILWAY ERROR]', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      stack: event.error?.stack
    });
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[RAILWAY UNHANDLED REJECTION]', {
      reason: event.reason,
      promise: event.promise
    });
  });

  // Override console.error to capture React errors
  const originalError = console.error;
  console.error = (...args) => {
    originalError.apply(console, args);
    // This will appear in Railway logs
    if (args[0]?.includes?.('Objects are not valid') || 
        args[0]?.includes?.('Minified React error #31')) {
      console.error('[RAILWAY REACT ERROR #31]', {
        fullError: args,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }
  };
}
```

## Method 2: Railway Build Logs

### Access Railway Build Logs:

1. **Via Railway Dashboard:**
   - Go to your Railway project
   - Click on your service
   - Go to "Deployments" tab
   - Click on the latest deployment
   - View "Build Logs" and "Deploy Logs"

2. **Via Railway CLI:**
   ```bash
   railway logs --deployment <deployment-id>
   ```

3. **Via Railway API:**
   ```bash
   curl -H "Authorization: Bearer $RAILWAY_TOKEN" \
     https://api.railway.app/v1/deployments/<deployment-id>/logs
   ```

## Method 3: Add Error Boundary with Logging

Create `client/src/components/ErrorBoundary/ProductionErrorBoundary.js`:

```javascript
import React from 'react';

class ProductionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to console (will appear in Railway logs)
    console.error('[RAILWAY ERROR BOUNDARY]', {
      error: error.toString(),
      errorInfo,
      componentStack: errorInfo.componentStack,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // Optionally send to error tracking service
    if (window.errorTracking) {
      window.errorTracking.captureException(error, {
        contexts: { react: errorInfo }
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.error?.stack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ProductionErrorBoundary;
```

Then wrap your App in `client/src/index.js`:

```javascript
import ProductionErrorBoundary from './components/ErrorBoundary/ProductionErrorBoundary';

root.render(
  <React.StrictMode>
    <ProductionErrorBoundary>
      <App />
    </ProductionErrorBoundary>
  </React.StrictMode>
);
```

## Method 4: Build-Time Error Detection

Add to `client/package.json` scripts:

```json
{
  "scripts": {
    "build:verbose": "react-scripts build 2>&1 | tee build.log",
    "build:check": "npm run build:verbose && grep -i 'error\\|warning' build.log"
  }
}
```

## Method 5: Runtime Error Monitoring

Add to your build process to capture runtime errors:

```javascript
// In client/src/utils/errorMonitoring.js - enhance existing
export const logToRailway = (error, context) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  };

  // This will appear in Railway application logs
  console.error('[RAILWAY RUNTIME ERROR]', JSON.stringify(errorData, null, 2));

  // Also try to send to backend if available
  if (window.apiClient) {
    window.apiClient.post('/api/errors', errorData).catch(() => {
      // Silently fail if backend is unavailable
    });
  }
};
```

## Quick Setup for Immediate Testing

1. **Add to `client/src/index.js`** (before `root.render`):

```javascript
// Enhanced error logging for Railway
if (process.env.NODE_ENV === 'production') {
  const originalError = console.error;
  console.error = (...args) => {
    originalError.apply(console, args);
    if (args.some(arg => 
      typeof arg === 'string' && 
      (arg.includes('Objects are not valid') || 
       arg.includes('Minified React error #31') ||
       arg.includes('$$typeof'))
    )) {
      console.error('=== RAILWAY REACT ERROR #31 DETECTED ===');
      console.error('Full error:', JSON.stringify(args, null, 2));
      console.error('Stack trace:', new Error().stack);
    }
  };
}
```

2. **Deploy to Railway**

3. **Check Railway Logs:**
   - Go to Railway Dashboard → Your Service → Deployments → Latest → Logs
   - Look for lines starting with `=== RAILWAY REACT ERROR #31 DETECTED ===`

## Testing Locally (Simulate Production)

```powershell
cd client
npm run build
npx serve -s build -l 3000
```

Then check console for errors (they'll be minified, but our logging will capture them).

