#!/usr/bin/env node

/**
 * Smart Algos Admin Panel Launcher
 * Quick setup and launch script for the admin panel
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const { setupAdminPanel } = require('./setup-admin-panel');

const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
    bright: '\x1b[1m'
};

function colorLog(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function printHeader() {
    console.log('\n' + '='.repeat(60));
    colorLog('cyan', '🚀 SMART ALGOS ADMIN PANEL LAUNCHER');
    console.log('='.repeat(60));
    colorLog('white', '   Advanced Content Management & System Administration');
    console.log('='.repeat(60) + '\n');
}

function printMenu() {
    colorLog('bright', 'Available Commands:');
    console.log('');
    colorLog('green', '  1. setup     - Initialize admin panel (first time setup)');
    colorLog('blue', '  2. start     - Start the admin panel server');
    colorLog('yellow', '  3. dev       - Start in development mode with hot reload');
    colorLog('magenta', '  4. build     - Build the admin panel for production');
    colorLog('cyan', '  5. status    - Check system status');
    colorLog('red', '  6. reset     - Reset admin panel (WARNING: Destructive)');
    console.log('');
    colorLog('white', '  help         - Show this menu');
    colorLog('white', '  exit         - Exit the launcher');
    console.log('');
}

async function checkEnvironment() {
    try {
        // Check if .env file exists
        await fs.access('.env');
        
        // Check required environment variables
        require('dotenv').config();
        
        const required = [
            'SUPABASE_URL',
            'SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY',
            'JWT_SECRET'
        ];
        
        const missing = required.filter(key => !process.env[key]);
        
        if (missing.length > 0) {
            colorLog('red', '❌ Missing required environment variables:');
            missing.forEach(key => colorLog('yellow', `   - ${key}`));
            console.log('');
            colorLog('white', '💡 Please check your .env file or copy from env.example');
            return false;
        }
        
        return true;
    } catch (error) {
        colorLog('red', '❌ Environment file (.env) not found');
        colorLog('white', '💡 Please create .env file from env.example');
        return false;
    }
}

async function checkDependencies() {
    try {
        // Check if node_modules exists
        await fs.access('node_modules');
        
        // Check if client dependencies are installed
        await fs.access('client/node_modules');
        
        return true;
    } catch (error) {
        colorLog('red', '❌ Dependencies not installed');
        colorLog('white', '💡 Run: npm install && cd client && npm install');
        return false;
    }
}

async function runSetup() {
    colorLog('blue', '🔧 Setting up admin panel...');
    
    try {
        await setupAdminPanel();
        colorLog('green', '✅ Admin panel setup completed successfully!');
        console.log('');
        colorLog('white', '📧 Default Admin Credentials:');
        colorLog('cyan', '   Email: admin@smartalgos.com');
        colorLog('cyan', '   Password: admin123456');
        console.log('');
        colorLog('yellow', '⚠️  Please change the password after first login!');
        return true;
    } catch (error) {
        colorLog('red', `❌ Setup failed: ${error.message}`);
        return false;
    }
}

async function startServer(mode = 'production') {
    colorLog('blue', `🚀 Starting server in ${mode} mode...`);
    
    const serverProcess = spawn('node', ['server.js'], {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: mode }
    });
    
    let clientProcess;
    
    if (mode === 'development') {
        // Also start the client in development mode
        setTimeout(() => {
            colorLog('blue', '🎨 Starting client development server...');
            clientProcess = spawn('npm', ['start'], {
                stdio: 'inherit',
                cwd: 'client',
                shell: true
            });
        }, 3000);
    }
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        colorLog('yellow', '\n🛑 Shutting down servers...');
        serverProcess.kill('SIGINT');
        if (clientProcess) {
            clientProcess.kill('SIGINT');
        }
        process.exit(0);
    });
    
    serverProcess.on('close', (code) => {
        if (code !== 0) {
            colorLog('red', `❌ Server exited with code ${code}`);
        }
        if (clientProcess) {
            clientProcess.kill('SIGINT');
        }
    });
}

async function buildProduction() {
    colorLog('blue', '🏗️  Building admin panel for production...');
    
    return new Promise((resolve, reject) => {
        const buildProcess = spawn('npm', ['run', 'build'], {
            stdio: 'inherit',
            cwd: 'client',
            shell: true
        });
        
        buildProcess.on('close', (code) => {
            if (code === 0) {
                colorLog('green', '✅ Build completed successfully!');
                resolve();
            } else {
                colorLog('red', `❌ Build failed with code ${code}`);
                reject(new Error(`Build failed with code ${code}`));
            }
        });
    });
}

async function checkStatus() {
    colorLog('blue', '📊 Checking system status...');
    
    try {
        // Check server status
        const response = await fetch('http://localhost:5000/api/health');
        const health = await response.json();
        
        colorLog('green', '✅ Server is running');
        console.log(`   Status: ${health.status}`);
        console.log(`   Uptime: ${Math.floor(health.uptime / 60)} minutes`);
        console.log(`   Environment: ${health.environment}`);
        
        // Check client status
        try {
            const clientResponse = await fetch('http://localhost:3000');
            if (clientResponse.ok) {
                colorLog('green', '✅ Client is running');
            }
        } catch {
            colorLog('yellow', '⚠️  Client not running or not accessible');
        }
        
    } catch (error) {
        colorLog('red', '❌ Server not running or not accessible');
        colorLog('white', '💡 Run: node launch-admin-panel.js start');
    }
}

async function resetAdminPanel() {
    colorLog('red', '⚠️  WARNING: This will reset all admin panel data!');
    
    // In a real implementation, you'd want to add confirmation
    colorLog('yellow', '🔄 This feature is not implemented for safety reasons.');
    colorLog('white', '💡 To reset manually:');
    console.log('   1. Delete admin user from database');
    console.log('   2. Truncate content, activity_logs, and system_settings tables');
    console.log('   3. Run setup command again');
}

async function createStartupScript() {
    const scripts = {
        'start-admin.bat': `@echo off
echo Starting Smart Algos Admin Panel...
node launch-admin-panel.js start
pause`,
        
        'start-admin.sh': `#!/bin/bash
echo "Starting Smart Algos Admin Panel..."
node launch-admin-panel.js start`,
        
        'start-admin-dev.bat': `@echo off
echo Starting Smart Algos Admin Panel in Development Mode...
node launch-admin-panel.js dev
pause`,
        
        'start-admin-dev.sh': `#!/bin/bash
echo "Starting Smart Algos Admin Panel in Development Mode..."
node launch-admin-panel.js dev`
    };
    
    for (const [filename, content] of Object.entries(scripts)) {
        try {
            await fs.writeFile(filename, content);
            if (filename.endsWith('.sh')) {
                // Make shell scripts executable
                await fs.chmod(filename, 0o755);
            }
        } catch (error) {
            console.error(`Failed to create ${filename}:`, error.message);
        }
    }
    
    colorLog('green', '✅ Startup scripts created');
}

async function main() {
    printHeader();
    
    const command = process.argv[2];
    
    if (!command || command === 'help') {
        printMenu();
        return;
    }
    
    // Check environment for most commands
    if (!['help'].includes(command)) {
        const envOk = await checkEnvironment();
        if (!envOk) return;
    }
    
    switch (command.toLowerCase()) {
        case 'setup':
            const depsOk = await checkDependencies();
            if (!depsOk) return;
            
            const setupOk = await runSetup();
            if (setupOk) {
                await createStartupScript();
                colorLog('white', '\n🎉 Ready to start! Run: node launch-admin-panel.js start');
            }
            break;
            
        case 'start':
            await startServer('production');
            break;
            
        case 'dev':
            await startServer('development');
            break;
            
        case 'build':
            try {
                await buildProduction();
            } catch (error) {
                colorLog('red', `Build failed: ${error.message}`);
            }
            break;
            
        case 'status':
            await checkStatus();
            break;
            
        case 'reset':
            await resetAdminPanel();
            break;
            
        default:
            colorLog('red', `❌ Unknown command: ${command}`);
            printMenu();
            break;
    }
}

// Handle unhandled errors
process.on('unhandledRejection', (reason, promise) => {
    colorLog('red', '❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    colorLog('red', '❌ Uncaught Exception:', error);
    process.exit(1);
});

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        colorLog('red', `❌ Error: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { main };
