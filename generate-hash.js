const bcrypt = require('bcryptjs');

async function generateHashes() {
  const userPassword = 'TestUser123!';
  const adminPassword = 'AdminTest123!';
  
  const userHash = await bcrypt.hash(userPassword, 12);
  const adminHash = await bcrypt.hash(adminPassword, 12);
  
  console.log('User password hash:', userHash);
  console.log('Admin password hash:', adminHash);
  
  // Test verification
  const userTest = await bcrypt.compare(userPassword, userHash);
  const adminTest = await bcrypt.compare(adminPassword, adminHash);
  
  console.log('User verification:', userTest);
  console.log('Admin verification:', adminTest);
}

generateHashes();
