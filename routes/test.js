const express = require('express');
const databaseService = require('../services/databaseService');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Test endpoint to verify backend is working
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint is working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test database connection
router.get('/db-test', async (req, res) => {
  try {
    const users = await databaseService.supabase
      .from('users_accounts')
      .select('email, first_name, last_name, is_active')
      .limit(5);
    
    res.json({
      success: true,
      message: 'Database connection working',
      userCount: users.data?.length || 0,
      users: users.data || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Test login with specific user
router.post('/test-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🧪 Test login attempt:', { email, hasPassword: !!password });
    
    // Get user
    const user = await databaseService.getUserByEmail(email);
    console.log('👤 User found:', !!user, user ? { id: user.id, email: user.email, is_active: user.is_active } : null);
    
    if (!user) {
      return res.json({
        success: false,
        step: 'user_lookup',
        message: 'User not found',
        email
      });
    }
    
    // Test password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log('🔑 Password match:', isMatch);
    
    if (!isMatch) {
      return res.json({
        success: false,
        step: 'password_check',
        message: 'Password does not match',
        email
      });
    }
    
    res.json({
      success: true,
      message: 'Test login successful',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_active: user.is_active
      }
    });
    
  } catch (error) {
    console.error('Test login error:', error);
    res.status(500).json({
      success: false,
      step: 'error',
      message: 'Server error',
      error: error.message
    });
  }
});

// Create test user
router.post('/create-test-user', async (req, res) => {
  try {
    const email = 'test@algosmart.com';
    const password = 'Test123!';
    const passwordHash = await bcrypt.hash(password, 12);
    
    const userData = {
      email,
      password_hash: passwordHash,
      first_name: 'Test',
      last_name: 'User',
      role: 'user',
      is_active: true,
      is_email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const user = await databaseService.createUser(userData);
    
    res.json({
      success: true,
      message: 'Test user created successfully',
      credentials: {
        email,
        password
      },
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
    
  } catch (error) {
    console.error('Create test user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test user',
      error: error.message
    });
  }
});

module.exports = router;
