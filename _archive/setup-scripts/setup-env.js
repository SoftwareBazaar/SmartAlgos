const fs = require('fs');
const path = require('path');

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

function setupEnvironment() {
  try {
    log('🔧 Setting up Smart Algos Environment...', 'blue');
    
    // Check if .env file exists
    const envPath = path.join(__dirname, '.env');
    const envExamplePath = path.join(__dirname, 'env.example');
    
    if (fs.existsSync(envPath)) {
      log('✅ .env file already exists', 'green');
      log('💡 If you need to update it, edit the .env file manually', 'yellow');
    } else {
      if (fs.existsSync(envExamplePath)) {
        // Copy env.example to .env
        fs.copyFileSync(envExamplePath, envPath);
        log('✅ Created .env file from env.example', 'green');
        
        // Update with default values
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Set default MongoDB URI
        envContent = envContent.replace(
          'MONGODB_URI=mongodb://localhost:27017/smart-algos',
          'MONGODB_URI=mongodb://localhost:27017/smart-algos'
        );
        
        // Set default JWT secret
        const jwtSecret = generateRandomString(64);
        envContent = envContent.replace(
          'JWT_SECRET=your-super-secret-jwt-key-here',
          `JWT_SECRET=${jwtSecret}`
        );
        
        // Set default encryption key
        const encryptionKey = generateRandomString(32);
        envContent = envContent.replace(
          'ENCRYPTION_KEY=your-32-byte-encryption-key-here',
          `ENCRYPTION_KEY=${encryptionKey}`
        );
        
        // Set default API keys (placeholder values)
        envContent = envContent.replace(
          'VALID_API_KEYS=api_key_1,api_key_2,api_key_3',
          `VALID_API_KEYS=${generateRandomString(16)},${generateRandomString(16)},${generateRandomString(16)}`
        );
        
        fs.writeFileSync(envPath, envContent);
        log('✅ Updated .env file with secure default values', 'green');
      } else {
        log('❌ env.example file not found', 'red');
        process.exit(1);
      }
    }
    
    // Create uploads directory
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      log('✅ Created uploads directory', 'green');
    } else {
      log('✅ Uploads directory already exists', 'green');
    }
    
    // Create subdirectories for uploads
    const subdirs = ['eas', 'hft', 'ai', 'users', 'temp'];
    for (const subdir of subdirs) {
      const subdirPath = path.join(uploadsDir, subdir);
      if (!fs.existsSync(subdirPath)) {
        fs.mkdirSync(subdirPath, { recursive: true });
        log(`✅ Created uploads/${subdir} directory`, 'green');
      }
    }
    
    // Create logs directory
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      log('✅ Created logs directory', 'green');
    } else {
      log('✅ Logs directory already exists', 'green');
    }
    
    // Create .gitignore if it doesn't exist
    const gitignorePath = path.join(__dirname, '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Uploads
uploads/
!uploads/.gitkeep

# Database
*.db
*.sqlite

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Build outputs
dist/
build/
client/build/
desktop/dist/
desktop/build/

# Temporary files
tmp/
temp/
*.tmp
*.temp

# Backup files
*.bak
*.backup

# Lock files
package-lock.json
yarn.lock
pnpm-lock.yaml

# Local development
.local
.cache
`;
      
      fs.writeFileSync(gitignorePath, gitignoreContent);
      log('✅ Created .gitignore file', 'green');
    } else {
      log('✅ .gitignore file already exists', 'green');
    }
    
    // Create .gitkeep files for empty directories
    const gitkeepDirs = [
      path.join(uploadsDir, '.gitkeep'),
      path.join(logsDir, '.gitkeep')
    ];
    
    for (const gitkeepPath of gitkeepDirs) {
      if (!fs.existsSync(gitkeepPath)) {
        fs.writeFileSync(gitkeepPath, '');
      }
    }
    
    log('\n🎉 Environment setup completed successfully!', 'green');
    log('\n📋 What was created/configured:', 'bright');
    log('   • .env file with secure default values', 'cyan');
    log('   • uploads/ directory structure', 'cyan');
    log('   • logs/ directory', 'cyan');
    log('   • .gitignore file', 'cyan');
    log('   • Secure JWT secret and encryption key', 'cyan');
    
    log('\n🔑 Generated secure keys:', 'yellow');
    log('   • JWT_SECRET: Generated 64-character random string', 'bright');
    log('   • ENCRYPTION_KEY: Generated 32-character random string', 'bright');
    log('   • VALID_API_KEYS: Generated 3 random API keys', 'bright');
    
    log('\n📝 Next steps:', 'bright');
    log('   1. Review and customize .env file if needed', 'cyan');
    log('   2. Install dependencies: npm install', 'cyan');
    log('   3. Setup database: npm run setup-db', 'cyan');
    log('   4. Start development: npm run dev', 'cyan');
    
    log('\n⚠️  Important:', 'yellow');
    log('   • Keep your .env file secure and never commit it to version control', 'bright');
    log('   • Change default API keys in production', 'bright');
    log('   • Use strong passwords for database connections', 'bright');
    
  } catch (error) {
    log('❌ Environment setup failed:', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Run setup
setupEnvironment();
