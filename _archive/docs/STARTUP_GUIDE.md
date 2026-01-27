# Smart Algos Trading Platform - Startup Guide

This guide explains how to start the Smart Algos Trading Platform and its various components.

## 🚀 Quick Start Options

### Option 1: Start All Services (Recommended)
```powershell
# PowerShell
.\start-all-services.ps1

# Or double-click the batch file
start-all-services.bat
```

### Option 2: Start Individual Components

#### Backend Server Only
```powershell
npm start
```

#### Frontend Client Only
```powershell
cd client
npm start
```

#### Desktop Application Only
```powershell
# PowerShell
.\start-desktop.ps1

# Or batch file
start-desktop-app.bat
```

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** (comes with Node.js)
3. **All dependencies installed**:
   ```bash
   npm install
   cd client && npm install
   cd ../desktop && npm install
   ```

## 🔧 Service Details

### Backend Server (Port 5000)
- **Purpose**: API server, WebSocket server, database connections
- **URL**: http://localhost:5000
- **Features**: 
  - REST API endpoints
  - Real-time WebSocket connections
  - Supabase database integration
  - Escrow.com integration
  - Paystack payment processing

### Frontend Client (Port 3000)
- **Purpose**: React web application
- **URL**: http://localhost:3000
- **Features**:
  - User interface
  - EA Marketplace
  - HFT Bots
  - Trading signals
  - Portfolio management
  - Escrow integration

### Desktop Application
- **Purpose**: Electron desktop app
- **Features**:
  - Native desktop experience
  - System tray integration
  - Keyboard shortcuts
  - Desktop notifications
  - Auto-updater

## 🛠️ Troubleshooting

### Common Issues

#### 1. PowerShell Syntax Error
**Error**: `The token '&&' is not a valid statement separator`

**Solution**: Use the provided PowerShell scripts instead of bash syntax:
```powershell
# ❌ Don't use this (bash syntax)
cd desktop && npm start

# ✅ Use this instead (PowerShell)
.\start-desktop.ps1
```

#### 2. Port Already in Use
**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**: Kill existing processes:
```powershell
# Kill all Node.js processes
taskkill /F /IM node.exe

# Or kill specific port
netstat -ano | findstr :5000
taskkill /F /PID <PID_NUMBER>
```

#### 3. Dependencies Not Installed
**Error**: `Cannot find module`

**Solution**: Install dependencies:
```bash
npm install
cd client && npm install
cd ../desktop && npm install
```

#### 4. Desktop App Won't Start
**Error**: Electron app fails to launch

**Solution**: 
1. Make sure backend and frontend are running first
2. Check if port 3000 is available
3. Try running in development mode:
   ```bash
   cd desktop
   npm run electron-dev
   ```

## 📊 Service Status Check

### Check Running Services
```powershell
# Check Node.js processes
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# Check ports
netstat -an | findstr :5000
netstat -an | findstr :3000
```

### Test API Endpoints
```powershell
# Test backend health
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing

# Test escrow status
Invoke-WebRequest -Uri "http://localhost:5000/api/escrow/status" -UseBasicParsing
```

## 🎯 Development Workflow

### 1. Start Development Environment
```powershell
.\start-all-services.ps1
```

### 2. Make Changes
- Edit files in your preferred editor
- Changes will auto-reload in development mode

### 3. Test Changes
- Backend: Check API endpoints
- Frontend: Check browser at http://localhost:3000
- Desktop: Check Electron app

### 4. Stop Services
- Press `Ctrl+C` in each terminal window
- Or use: `taskkill /F /IM node.exe`

## 🔒 Security Notes

- **Development Mode**: Uses test tokens and mock data
- **Production Mode**: Requires real API keys and certificates
- **Environment Variables**: Configure in `.env` file

## 📱 Mobile App

The mobile app is separate and requires React Native:
```bash
cd mobile
npm install
npm start
```

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. **Backend**: `🚀 Smart Algos Trading Platform Server running on http://localhost:5000`
2. **Frontend**: Browser opens to http://localhost:3000
3. **Desktop**: Electron app window opens
4. **All Services**: No error messages in console

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Verify all prerequisites are met
3. Check the console logs for error messages
4. Ensure all dependencies are installed
5. Try restarting all services

---

**Happy Trading! 🚀📈**
