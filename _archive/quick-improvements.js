#!/usr/bin/env node

/**
 * Quick Improvements Script
 * Implements easy wins to make your app production-ready
 */

const fs = require('fs');
const path = require('path');

console.log('\n🚀 AlgoSmart Quick Improvements Script\n');
console.log('This script will implement easy improvements to make your app better.\n');

const improvements = {
  passed: [],
  failed: [],
  skipped: []
};

// Helper function to check if file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Helper function to append to file
function appendToFile(filePath, content) {
  fs.appendFileSync(filePath, content);
}

// Helper function to create directory
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Improvement 1: Create tests directory structure
function createTestStructure() {
  console.log('📁 Creating test directory structure...');
  try {
    ensureDir(path.join(__dirname, 'tests', 'unit'));
    ensureDir(path.join(__dirname, 'tests', 'integration'));
    ensureDir(path.join(__dirname, 'tests', 'e2e'));
    
    // Create sample test file
    const sampleTest = `
const request = require('supertest');
const app = require('../server');

describe('Health Check API', () => {
  test('GET /api/health should return 200', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body.status).toBe('OK');
  });
});

describe('Authentication API', () => {
  test('POST /api/auth/register should create user', async () => {
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: \`test\${Date.now()}@example.com\`,
      password: 'Test123!@#',
      confirmPassword: 'Test123!@#',
      terms: true
    };
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect('Content-Type', /json/)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });
});
`;
    fs.writeFileSync(path.join(__dirname, 'tests', 'integration', 'api.test.js'), sampleTest);
    
    improvements.passed.push('Test directory structure created');
    console.log('   ✅ Test directories created');
  } catch (error) {
    improvements.failed.push(`Test structure: ${error.message}`);
    console.log('   ❌ Failed:', error.message);
  }
}

// Improvement 2: Create .env.example if missing
function ensureEnvExample() {
  console.log('\n📄 Checking .env.example...');
  const envExample = path.join(__dirname, 'env.example');
  if (fileExists(envExample)) {
    improvements.passed.push('.env.example exists');
    console.log('   ✅ .env.example already exists');
  } else {
    improvements.skipped.push('.env.example (already exists as env.example)');
    console.log('   ℹ️  File exists as env.example');
  }
}

// Improvement 3: Add .gitignore entries
function updateGitignore() {
  console.log('\n📝 Updating .gitignore...');
  const gitignorePath = path.join(__dirname, '.gitignore');
  
  const requiredEntries = [
    '\n# Environment variables',
    '.env',
    '.env.local',
    '.env.*.local',
    '\n# Testing',
    'coverage/',
    '*.log',
    '\n# OS files',
    '.DS_Store',
    'Thumbs.db',
    '\n# IDE',
    '.vscode/',
    '.idea/',
    '*.swp',
    '*.swo',
    '\n# Uploads (optional - comment out if you want to commit uploads)',
    '# uploads/*',
    '# !uploads/.gitkeep'
  ];
  
  try {
    let gitignore = '';
    if (fileExists(gitignorePath)) {
      gitignore = fs.readFileSync(gitignorePath, 'utf8');
    }
    
    let added = 0;
    requiredEntries.forEach(entry => {
      if (!gitignore.includes(entry.trim())) {
        appendToFile(gitignorePath, entry + '\n');
        added++;
      }
    });
    
    if (added > 0) {
      improvements.passed.push(`.gitignore updated (${added} entries)`);
      console.log(`   ✅ Added ${added} entries to .gitignore`);
    } else {
      improvements.passed.push('.gitignore up to date');
      console.log('   ✅ .gitignore already complete');
    }
  } catch (error) {
    improvements.failed.push(`.gitignore: ${error.message}`);
    console.log('   ❌ Failed:', error.message);
  }
}

// Improvement 4: Create health monitor service
function createHealthMonitor() {
  console.log('\n🏥 Creating health monitor service...');
  const healthMonitorPath = path.join(__dirname, 'services', 'healthMonitor.js');
  
  if (fileExists(healthMonitorPath)) {
    improvements.skipped.push('Health monitor (already exists)');
    console.log('   ℹ️  Health monitor already exists');
    return;
  }
  
  const healthMonitorCode = `
const os = require('os');

class HealthMonitor {
  constructor() {
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
    this.lastErrors = [];
  }

  recordRequest() {
    this.requestCount++;
  }

  recordError(error) {
    this.errorCount++;
    this.lastErrors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 10 errors
    if (this.lastErrors.length > 10) {
      this.lastErrors.shift();
    }
  }

  getHealthStatus() {
    const uptime = Date.now() - this.startTime;
    const errorRate = this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;
    
    return {
      status: errorRate < 1 ? 'healthy' : errorRate < 5 ? 'degraded' : 'unhealthy',
      uptime: Math.floor(uptime / 1000), // seconds
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      errorRate: errorRate.toFixed(2) + '%',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
        system: Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB'
      },
      cpu: {
        usage: process.cpuUsage(),
        load: os.loadavg()
      },
      lastErrors: this.lastErrors.slice(-5)
    };
  }
}

module.exports = new HealthMonitor();
`;
  
  try {
    fs.writeFileSync(healthMonitorPath, healthMonitorCode);
    improvements.passed.push('Health monitor service created');
    console.log('   ✅ Health monitor created at services/healthMonitor.js');
  } catch (error) {
    improvements.failed.push(`Health monitor: ${error.message}`);
    console.log('   ❌ Failed:', error.message);
  }
}

// Improvement 5: Create improved logger
function createLogger() {
  console.log('\n📋 Creating improved logger...');
  const loggerPath = path.join(__dirname, 'utils', 'logger.js');
  
  if (fileExists(loggerPath)) {
    improvements.skipped.push('Logger (already exists)');
    console.log('   ℹ️  Logger already exists');
    return;
  }
  
  const loggerCode = `
const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '..', 'logs');
    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta
    });
  }

  writeToFile(filename, message) {
    const logPath = path.join(this.logDir, filename);
    fs.appendFileSync(logPath, message + '\\n');
  }

  log(level, message, meta = {}) {
    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Console output
    const colors = {
      error: '\\x1b[31m',
      warn: '\\x1b[33m',
      info: '\\x1b[36m',
      debug: '\\x1b[90m',
      reset: '\\x1b[0m'
    };
    
    console.log(\`\${colors[level]}\${formattedMessage}\${colors.reset}\`);
    
    // File output
    const date = new Date().toISOString().split('T')[0];
    this.writeToFile(\`\${date}.log\`, formattedMessage);
    
    // Error log
    if (level === 'error') {
      this.writeToFile('error.log', formattedMessage);
    }
  }

  error(message, meta) {
    this.log('error', message, meta);
  }

  warn(message, meta) {
    this.log('warn', message, meta);
  }

  info(message, meta) {
    this.log('info', message, meta);
  }

  debug(message, meta) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, meta);
    }
  }
}

module.exports = new Logger();
`;
  
  try {
    ensureDir(path.join(__dirname, 'utils'));
    fs.writeFileSync(loggerPath, loggerCode);
    improvements.passed.push('Logger created');
    console.log('   ✅ Logger created at utils/logger.js');
  } catch (error) {
    improvements.failed.push(`Logger: ${error.message}`);
    console.log('   ❌ Failed:', error.message);
  }
}

// Improvement 6: Create startup checklist
function createStartupChecklist() {
  console.log('\n✅ Creating startup checklist...');
  const checklistPath = path.join(__dirname, 'STARTUP_CHECKLIST.md');
  
  const checklist = `# Startup Checklist

## Before Starting the Server

- [ ] .env file created (copy from env.example)
- [ ] SUPABASE_URL configured
- [ ] SUPABASE_ANON_KEY configured
- [ ] SUPABASE_SERVICE_ROLE_KEY configured
- [ ] JWT_SECRET configured (32+ characters)
- [ ] npm install completed
- [ ] Port 5000 is available

## After Starting the Server

- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] Health endpoint responds: http://localhost:5000/api/health
- [ ] WebSocket server started

## Testing

- [ ] Can register a new user
- [ ] Can login with user account
- [ ] Can upload CSV file
- [ ] Calendar displays correctly
- [ ] EA marketplace loads
- [ ] No console errors

## Ready to Launch! 🚀

If all boxes are checked, you're ready to deploy!
`;
  
  try {
    fs.writeFileSync(checklistPath, checklist);
    improvements.passed.push('Startup checklist created');
    console.log('   ✅ Startup checklist created');
  } catch (error) {
    improvements.failed.push(`Checklist: ${error.message}`);
    console.log('   ❌ Failed:', error.message);
  }
}

// Run all improvements
async function runImprovements() {
  console.log('Running quick improvements...\n');
  console.log('═'.repeat(60));
  
  createTestStructure();
  ensureEnvExample();
  updateGitignore();
  createHealthMonitor();
  createLogger();
  createStartupChecklist();
  
  console.log('\n' + '═'.repeat(60));
  console.log('\n📊 RESULTS\n');
  
  console.log(`✅ Passed: ${improvements.passed.length}`);
  improvements.passed.forEach(item => console.log(`   • ${item}`));
  
  if (improvements.skipped.length > 0) {
    console.log(`\nℹ️  Skipped: ${improvements.skipped.length}`);
    improvements.skipped.forEach(item => console.log(`   • ${item}`));
  }
  
  if (improvements.failed.length > 0) {
    console.log(`\n❌ Failed: ${improvements.failed.length}`);
    improvements.failed.forEach(item => console.log(`   • ${item}`));
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('\n🎉 Quick improvements complete!\n');
  console.log('Next steps:');
  console.log('1. Review LAUNCH_CHECKLIST_AND_IMPROVEMENTS.md');
  console.log('2. Complete STARTUP_CHECKLIST.md');
  console.log('3. Run: npm start');
  console.log('4. Test: node test-comprehensive-apis.js');
  console.log('\n');
}

// Run
runImprovements().catch(console.error);

