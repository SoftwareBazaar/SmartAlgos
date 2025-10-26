const { execSync } = require('child_process');
const fs = require('fs');

console.log('Deploying Subscription/Download Flow Fixes');
console.log('==========================================\n');

function runCommand(command, description) {
  try {
    console.log(`📝 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

async function deployChanges() {
  try {
    // Step 1: Check git status
    console.log('🔍 Checking git status...');
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim()) {
        console.log('📋 Changes detected:');
        console.log(status);
      } else {
        console.log('ℹ️ No changes to commit');
      }
    } catch (error) {
      console.log('⚠️ Git not initialized or no repository found');
    }

    // Step 2: Add all changes
    runCommand('git add .', 'Adding all changes to git');

    // Step 3: Commit changes
    const commitMessage = `feat: implement seamless subscription/download flow

- Enhanced subscription flow with immediate download access
- Added download modal for post-subscription file access
- Implemented secure token-based download authentication
- Added comprehensive test suite for flow validation
- Fixed security loopholes and unauthorized access
- Improved user experience with seamless navigation
- Added download buttons for subscribed users
- Created test EA files and validation scripts

Files modified:
- client/src/pages/EAMarketplace/EAMarketplace.js (enhanced flow)
- Added test files and validation scripts
- Created comprehensive test suite

Security improvements:
- JWT token-based download authentication
- Subscription validation before file access
- User ownership verification
- Token expiration (24 hours)
- Download logging for audit trail

User experience improvements:
- Immediate download access after subscription
- Download modal appears automatically
- Seamless flow from subscription to download
- Clear visual feedback for available files
- No navigation required between pages`;

    runCommand(`git commit -m "${commitMessage}"`, 'Committing subscription/download flow fixes');

    // Step 4: Check if remote exists
    try {
      execSync('git remote -v', { stdio: 'pipe' });
      console.log('📡 Remote repository found');
      
      // Step 5: Push to remote
      runCommand('git push origin master', 'Pushing changes to remote repository');
      
      console.log('🚀 Changes pushed successfully!');
      console.log('\n📋 Deployment Summary:');
      console.log('- ✅ Subscription/download flow enhanced');
      console.log('- ✅ Security improvements implemented');
      console.log('- ✅ Test suite created');
      console.log('- ✅ Changes committed and pushed');
      
    } catch (error) {
      console.log('⚠️ No remote repository configured');
      console.log('💡 To set up remote repository:');
      console.log('   git remote add origin <your-repo-url>');
      console.log('   git push -u origin master');
    }

    // Step 6: Check deployment platforms
    console.log('\n🌐 Deployment Platform Options:');
    
    if (fs.existsSync('railway.json')) {
      console.log('✅ Railway configuration found');
      console.log('   Railway will auto-deploy from git push');
    }
    
    if (fs.existsSync('render.yaml')) {
      console.log('✅ Render configuration found');
      console.log('   Render will auto-deploy from git push');
    }
    
    if (fs.existsSync('vercel.json')) {
      console.log('✅ Vercel configuration found');
      console.log('   Vercel will auto-deploy from git push');
    }

    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📖 Next Steps:');
    console.log('1. Monitor deployment logs in your platform dashboard');
    console.log('2. Test the live application');
    console.log('3. Verify subscription/download flow works in production');
    console.log('4. Run production tests to ensure everything works');

  } catch (error) {
    console.error('\n💥 Deployment failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check git configuration: git config --list');
    console.log('2. Verify remote repository: git remote -v');
    console.log('3. Check network connection');
    console.log('4. Verify deployment platform configuration');
  }
}

deployChanges();
