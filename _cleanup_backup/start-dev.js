#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Algosmart Platform...\n');

// Start backend server
console.log('📡 Starting backend server...');
const backend = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

// Wait a moment then start frontend
setTimeout(() => {
  console.log('🌐 Starting frontend React app...');
  const frontend = spawn('npm', ['start'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(process.cwd(), 'client')
  });

  frontend.on('error', (error) => {
    console.error('❌ Frontend error:', error);
  });
}, 2000);

backend.on('error', (error) => {
  console.error('❌ Backend error:', error);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Algosmart Platform...');
  backend.kill();
  process.exit(0);
});

console.log('\n✅ Algosmart Platform is starting up!');
console.log('📱 Frontend will be available at: http://localhost:3000');
console.log('🔧 Backend API will be available at: http://localhost:5000');
console.log('🔌 WebSocket will be available at: ws://localhost:5000');
console.log('\nPress Ctrl+C to stop all services.\n');
