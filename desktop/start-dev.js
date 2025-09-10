#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Logging function
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Check if directories exist
function checkDirectories() {
  const backendPath = path.join(__dirname, '..');
  const clientPath = path.join(__dirname, '../client');
  
  if (!fs.existsSync(backendPath)) {
    log('❌ Backend directory not found!', 'red');
    log('Please ensure the backend directory exists at: ' + backendPath, 'yellow');
    process.exit(1);
  }
  
  if (!fs.existsSync(clientPath)) {
    log('❌ Client directory not found!', 'red');
    log('Please ensure the client directory exists at: ' + clientPath, 'yellow');
    process.exit(1);
  }
  
  log('✅ Directories check passed', 'green');
}

// Check if node_modules exist
function checkDependencies() {
  const backendNodeModules = path.join(__dirname, '../node_modules');
  const clientNodeModules = path.join(__dirname, '../client/node_modules');
  const desktopNodeModules = path.join(__dirname, 'node_modules');
  
  const missing = [];
  
  if (!fs.existsSync(backendNodeModules)) {
    missing.push('backend');
  }
  
  if (!fs.existsSync(clientNodeModules)) {
    missing.push('client');
  }
  
  if (!fs.existsSync(desktopNodeModules)) {
    missing.push('desktop');
  }
  
  if (missing.length > 0) {
    log('❌ Missing dependencies for: ' + missing.join(', '), 'red');
    log('Please run: npm install', 'yellow');
    process.exit(1);
  }
  
  log('✅ Dependencies check passed', 'green');
}

// Start backend server
function startBackend() {
  log('🚀 Starting backend server...', 'blue');
  
  const backendProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe',
    shell: true
  });
  
  backendProcess.stdout.on('data', (data) => {
    log(`[Backend] ${data.toString().trim()}`, 'cyan');
  });
  
  backendProcess.stderr.on('data', (data) => {
    log(`[Backend Error] ${data.toString().trim()}`, 'red');
  });
  
  backendProcess.on('close', (code) => {
    if (code !== 0) {
      log(`Backend process exited with code ${code}`, 'red');
    }
  });
  
  return backendProcess;
}

// Start frontend server
function startFrontend() {
  log('🚀 Starting frontend server...', 'blue');
  
  const frontendProcess = spawn('npm', ['start'], {
    cwd: path.join(__dirname, '../client'),
    stdio: 'pipe',
    shell: true
  });
  
  frontendProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output.includes('Local:') || output.includes('On Your Network:')) {
      log(`[Frontend] ${output}`, 'green');
    } else if (output.includes('webpack compiled')) {
      log(`[Frontend] ${output}`, 'green');
    } else if (output.includes('error') || output.includes('Error')) {
      log(`[Frontend] ${output}`, 'red');
    } else {
      log(`[Frontend] ${output}`, 'cyan');
    }
  });
  
  frontendProcess.stderr.on('data', (data) => {
    log(`[Frontend Error] ${data.toString().trim()}`, 'red');
  });
  
  frontendProcess.on('close', (code) => {
    if (code !== 0) {
      log(`Frontend process exited with code ${code}`, 'red');
    }
  });
  
  return frontendProcess;
}

// Wait for server to be ready
function waitForServer(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkServer = () => {
      const http = require('http');
      const urlObj = new URL(url);
      
      const req = http.request({
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method: 'GET',
        timeout: 5000
      }, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          if (Date.now() - startTime > timeout) {
            reject(new Error('Timeout waiting for server'));
          } else {
            setTimeout(checkServer, 1000);
          }
        }
      });
      
      req.on('error', () => {
        if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for server'));
        } else {
          setTimeout(checkServer, 1000);
        }
      });
      
      req.on('timeout', () => {
        req.destroy();
        if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for server'));
        } else {
          setTimeout(checkServer, 1000);
        }
      });
      
      req.end();
    };
    
    checkServer();
  });
}

// Start Electron app
function startElectron() {
  log('🚀 Starting Electron app...', 'blue');
  
  const electronProcess = spawn('npm', ['run', 'electron-dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      ELECTRON_IS_DEV: '1'
    }
  });
  
  electronProcess.on('close', (code) => {
    log(`Electron app closed with code ${code}`, 'yellow');
    process.exit(code);
  });
  
  return electronProcess;
}

// Cleanup function
function cleanup(processes) {
  log('\n🛑 Shutting down...', 'yellow');
  
  processes.forEach(process => {
    if (process && !process.killed) {
      process.kill();
    }
  });
  
  process.exit(0);
}

// Main function
async function main() {
  log('🎯 Smart Algos Desktop Development Environment', 'bright');
  log('===============================================', 'bright');
  
  // Pre-flight checks
  log('\n📋 Running pre-flight checks...', 'blue');
  checkDirectories();
  checkDependencies();
  
  const processes = [];
  
  try {
    // Start backend
    const backendProcess = startBackend();
    processes.push(backendProcess);
    
    // Wait for backend to be ready
    log('\n⏳ Waiting for backend server...', 'yellow');
    await waitForServer('http://localhost:5000/api/health');
    log('✅ Backend server is ready!', 'green');
    
    // Start frontend
    const frontendProcess = startFrontend();
    processes.push(frontendProcess);
    
    // Wait for frontend to be ready
    log('\n⏳ Waiting for frontend server...', 'yellow');
    await waitForServer('http://localhost:3000');
    log('✅ Frontend server is ready!', 'green');
    
    // Start Electron
    log('\n🚀 All servers ready! Starting Electron app...', 'green');
    const electronProcess = startElectron();
    processes.push(electronProcess);
    
    // Handle cleanup
    process.on('SIGINT', () => cleanup(processes));
    process.on('SIGTERM', () => cleanup(processes));
    process.on('exit', () => cleanup(processes));
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    cleanup(processes);
  }
}

// Run main function
main().catch(error => {
  log(`❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
