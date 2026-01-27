require('dotenv').config();

console.log('🔧 Environment Variables Check:\n');

const requiredVars = [
  'JWT_SECRET',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'NODE_ENV',
  'PORT',
  'ADMIN_REGISTRATION_CODE'
];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    if (varName.includes('SECRET') || varName.includes('KEY') || varName.includes('CODE')) {
      console.log(`✅ ${varName}: ${'*'.repeat(Math.min(value.length, 20))} (${value.length} chars)`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`❌ ${varName}: NOT SET`);
  }
});

console.log('\n🧪 Testing JWT Generation:');

try {
  const jwt = require('jsonwebtoken');
  const testToken = jwt.sign({ userId: 'test123' }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '1h' });
  console.log('✅ JWT generation works');
  console.log('   Token length:', testToken.length);
  
  const decoded = jwt.verify(testToken, process.env.JWT_SECRET || 'fallback-secret');
  console.log('✅ JWT verification works');
  console.log('   Decoded userId:', decoded.userId);
} catch (error) {
  console.log('❌ JWT error:', error.message);
}

console.log('\n🧪 Testing bcrypt:');

try {
  const bcrypt = require('bcryptjs');
  const testHash = bcrypt.hashSync('test123', 12);
  const isValid = bcrypt.compareSync('test123', testHash);
  console.log('✅ bcrypt works:', isValid);
} catch (error) {
  console.log('❌ bcrypt error:', error.message);
}
