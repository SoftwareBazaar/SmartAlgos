# Smart Algos Desktop Application

A cross-platform desktop application for the Smart Algos Trading Platform, built with Electron.

## Features

- 🖥️ **Cross-Platform**: Works on Windows, macOS, and Linux
- 🔄 **Auto-Updates**: Automatic application updates
- 🔔 **Desktop Notifications**: Native desktop notifications
- 📱 **System Tray**: Minimize to system tray
- ⌨️ **Keyboard Shortcuts**: Global and local keyboard shortcuts
- 🎨 **Native Feel**: Native desktop experience
- 🔒 **Secure**: Secure communication between processes
- 📊 **Real-time Data**: Live market data and trading signals

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/smartalgos/smart-algos-desktop.git
cd smart-algos-desktop
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Backend and Frontend Dependencies

```bash
# Install backend dependencies
cd ../backend
npm install

# Install frontend dependencies
cd ../client
npm install

# Return to desktop directory
cd ../desktop
```

## Development

### Start Development Environment

```bash
# Start all services (backend, frontend, and desktop app)
npm start
```

This will:
1. Start the backend server on `http://localhost:5000`
2. Start the frontend development server on `http://localhost:3000`
3. Launch the Electron desktop application

### Development Commands

```bash
# Start only the Electron app (requires backend and frontend to be running)
npm run electron-dev

# Start backend server
npm run start:backend

# Start frontend server
npm run start:frontend
```

## Building

### Build for Development

```bash
# Build the React app
npm run build:react

# Build the Electron app
npm run build:electron
```

### Build for Production

```bash
# Build for all platforms
npm run dist

# Build for specific platforms
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:linux  # Linux
```

## Distribution

### Windows

The Windows build creates:
- **NSIS Installer**: `Smart Algos-1.0.0-x64.exe`
- **Portable**: `Smart Algos-1.0.0-x64.exe` (portable version)

### macOS

The macOS build creates:
- **DMG**: `Smart Algos-1.0.0-x64.dmg`
- **ZIP**: `Smart Algos-1.0.0-x64.zip`

### Linux

The Linux build creates:
- **AppImage**: `Smart Algos-1.0.0-x64.AppImage`
- **DEB**: `Smart Algos-1.0.0-x64.deb`
- **RPM**: `Smart Algos-1.0.0-x64.rpm`

## Configuration

### Environment Variables

Create a `.env` file in the desktop directory:

```env
# Development
ELECTRON_IS_DEV=1

# Production
NODE_ENV=production
```

### App Configuration

The app configuration is in `main.js`:

```javascript
const APP_CONFIG = {
  name: 'Smart Algos',
  version: app.getVersion(),
  isDev: isDev,
  url: isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../client/build/index.html')}`,
  icon: path.join(__dirname, 'build/icon.png'),
  trayIcon: path.join(__dirname, 'build/tray-icon.png')
};
```

## Features

### Desktop Integration

- **System Tray**: Minimize to system tray with context menu
- **Global Shortcuts**: Global keyboard shortcuts for quick access
- **Auto-Updates**: Automatic application updates with progress
- **Native Notifications**: Desktop notifications for alerts
- **File Operations**: Native file dialogs and downloads

### Security

- **Context Isolation**: Secure communication between processes
- **No Node Integration**: Renderer process doesn't have Node.js access
- **Preload Script**: Secure API exposure to renderer
- **Certificate Handling**: Proper certificate validation

### Performance

- **Lazy Loading**: Components and screens are lazy loaded
- **Memory Management**: Efficient memory usage
- **Background Processing**: Background tasks and sync
- **Caching**: Intelligent data caching

## Keyboard Shortcuts

### Global Shortcuts

- `Ctrl+Shift+A` (Windows/Linux) / `Cmd+Shift+A` (macOS): Show window

### Local Shortcuts

- `Ctrl+R` / `Cmd+R`: Reload
- `Ctrl+Shift+R` / `Cmd+Shift+R`: Force reload
- `F11`: Toggle fullscreen
- `Ctrl+Shift+I` / `Cmd+Shift+I`: Toggle developer tools

### Navigation Shortcuts

- `Ctrl+1` / `Cmd+1`: Dashboard
- `Ctrl+2` / `Cmd+2`: Markets
- `Ctrl+3` / `Cmd+3`: Signals
- `Ctrl+4` / `Cmd+4`: Portfolio
- `Ctrl+5` / `Cmd+5`: EA Marketplace

## Troubleshooting

### Common Issues

1. **App won't start**
   - Ensure Node.js v16+ is installed
   - Run `npm install` in all directories
   - Check that backend and frontend are running

2. **Build fails**
   - Clear node_modules and reinstall
   - Check for platform-specific build tools
   - Ensure all dependencies are installed

3. **Auto-updates not working**
   - Check internet connection
   - Verify update server configuration
   - Check application permissions

### Debug Mode

Run with debug logging:

```bash
DEBUG=* npm run electron-dev
```

### Logs

Logs are stored in:
- **Windows**: `%USERPROFILE%\AppData\Roaming\smart-algos-desktop\logs`
- **macOS**: `~/Library/Logs/smart-algos-desktop`
- **Linux**: `~/.config/smart-algos-desktop/logs`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on all platforms
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- GitHub Issues: https://github.com/smartalgos/smart-algos-desktop/issues
- Email: support@smartalgos.com
- Documentation: https://docs.smartalgos.com

## Changelog

### Version 1.0.0
- Initial release
- Cross-platform support
- Auto-updates
- System tray integration
- Desktop notifications
- Keyboard shortcuts
- Secure architecture
