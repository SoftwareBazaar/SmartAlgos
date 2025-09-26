const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const databaseService = require('../services/databaseService');
const { auth, createActionRateLimit } = require('../middleware/auth');
const securityService = require('../services/securityService');
const router = express.Router();

const EMAIL_NORMALIZE_OPTIONS = {
  gmail_remove_dots: false,
  gmail_remove_subaddress: false,
  outlookdotcom_remove_dots: false,
  yahoo_remove_subaddress: false,
  icloud_remove_subaddress: false
};

// Generate JWT token
const generateToken = (userId) => {
  return securityService.generateToken({ userId }, process.env.JWT_EXPIRE || '7d');
};

// Rate limiting for auth actions (very lenient for development)
const loginRateLimit = createActionRateLimit(1000, 5 * 60 * 1000, 'login'); // 1000 attempts per 5 minutes (development)
const registerRateLimit = createActionRateLimit(500, 10 * 60 * 1000, 'register'); // 500 attempts per 10 minutes (development)
const passwordResetRateLimit = createActionRateLimit(200, 10 * 60 * 1000, 'password-reset'); // 200 attempts per 10 minutes

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  registerRateLimit,
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail(EMAIL_NORMALIZE_OPTIONS)
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password, phone, country, tradingExperience } = req.body;

    // Check if user already exists
    const existingUser = await databaseService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new user
    const userData = {
      first_name: firstName,
      last_name: lastName,
      email,
      password_hash: passwordHash,
      phone,
      country,
      trading_experience: tradingExperience || 'beginner',
      is_active: true,
      is_email_verified: false,
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const user = await databaseService.createUser(userData);

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password_hash;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  loginRateLimit,
  body('email')
    .isEmail()
    .normalizeEmail(EMAIL_NORMALIZE_OPTIONS)
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await databaseService.getUserByEmail(email);
    if (!user) {
      console.warn('[admin-login] user not found for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('[admin-login] fetched user', {
      id: user.id,
      role: user.role,
      is_active: user.is_active,
      login_attempts: user.login_attempts
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.lock_until && new Date() < new Date(user.lock_until)) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.warn('[admin-login] password mismatch for user:', user.id);
    }
    if (!isMatch) {
      // Increment login attempts
      const loginAttempts = (user.login_attempts || 0) + 1;
      const lockUntil = loginAttempts >= 5 ? new Date(Date.now() + 2 * 60 * 60 * 1000) : null; // Lock for 2 hours after 5 attempts
      
      await databaseService.updateUser(user.id, {
        login_attempts: loginAttempts,
        lock_until: lockUntil
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts on successful login
    if (user.login_attempts > 0) {
      await databaseService.updateUser(user.id, {
        login_attempts: 0,
        lock_until: null
      });
    }

    // Update last login and activity
    await databaseService.updateUser(user.id, {
      last_login: new Date().toISOString(),
      last_activity: new Date().toISOString()
    });

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password_hash;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error details:', {
      message: error.message,
      stack: error.stack,
      email: req.body.email,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const user = await databaseService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove sensitive data
    const userResponse = { ...user };
    delete userResponse.password_hash;

    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  passwordResetRateLimit,
  body('email')
    .isEmail()
    .normalizeEmail(EMAIL_NORMALIZE_OPTIONS)
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const user = await databaseService.getUserByEmail(email);
    if (!user) {
      console.warn('[admin-login] user not found for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('[admin-login] fetched user', {
      id: user.id,
      role: user.role,
      is_active: user.is_active,
      login_attempts: user.login_attempts
    });
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Generate reset token (in a real app, you'd send this via email)
    const resetToken = securityService.generateToken(
      { userId: user.id, type: 'password-reset' },
      '1h'
    );

    await databaseService.updateUser(user.id, {
      password_reset_token: resetToken,
      password_reset_expires: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    });

    // In a real application, you would send an email here
    // For now, we'll just return the token (remove this in production)
    res.json({
      success: true,
      message: 'Password reset link sent to your email',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    // Verify token
    const decoded = securityService.verifyToken(token);
    if (decoded.type !== 'password-reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    const user = await databaseService.getUserById(decoded.userId);
    
    if (!user || user.password_reset_token !== token || new Date(user.password_reset_expires) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update password
    await databaseService.updateUser(user.id, {
      password_hash: passwordHash,
      password_reset_token: null,
      password_reset_expires: null
    });

    res.json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change password for authenticated user
// @access  Private
router.post('/change-password', [
  auth,
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await databaseService.getUserById(req.user.userId);
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await databaseService.updateUser(user.id, {
      password_hash: passwordHash
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email address
// @access  Public
router.post('/verify-email', [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required')
], async (req, res) => {
  try {
    const { token } = req.body;

    const decoded = securityService.verifyToken(token);
    if (decoded.type !== 'email-verification') {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    const user = await databaseService.getUserById(decoded.userId);

    if (!user || user.email_verification_token !== token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    await databaseService.updateUser(user.id, {
      is_email_verified: true,
      email_verification_token: null
    });

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification
// @access  Private
router.post('/resend-verification', auth, async (req, res) => {
  try {
    if (req.user.is_email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate verification token
    const verificationToken = securityService.generateToken(
      { userId: req.user.userId, type: 'email-verification' },
      '24h'
    );

    await databaseService.updateUser(req.user.userId, {
      email_verification_token: verificationToken
    });

    // In a real application, you would send an email here
    res.json({
      success: true,
      message: 'Verification email sent',
      verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // Update last activity
    await databaseService.updateUser(req.user.userId, {
      last_activity: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/admin/login
// @desc    Admin login
// @access  Public
router.post('/admin/login', [
  loginRateLimit,
  body('email')
    .isEmail()
    .normalizeEmail(EMAIL_NORMALIZE_OPTIONS)
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await databaseService.getUserByEmail(email);
    if (!user) {
      console.warn('[admin-login] user not found for email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('[admin-login] fetched user', {
      id: user.id,
      role: user.role,
      is_active: user.is_active,
      login_attempts: user.login_attempts
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Check if account is locked
    if (user.lock_until && new Date() < new Date(user.lock_until)) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts'
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.warn('[admin-login] password mismatch for user:', user.id);
    }
    if (!isMatch) {
      // Increment login attempts
      const loginAttempts = (user.login_attempts || 0) + 1;
      const lockUntil = loginAttempts >= 5 ? new Date(Date.now() + 2 * 60 * 60 * 1000) : null;
      
      await databaseService.updateUser(user.id, {
        login_attempts: loginAttempts,
        lock_until: lockUntil
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts on successful login
    if (user.login_attempts > 0) {
      await databaseService.updateUser(user.id, {
        login_attempts: 0,
        lock_until: null
      });
    }

    // Update last login and activity
    await databaseService.updateUser(user.id, {
      last_login: new Date().toISOString(),
      last_activity: new Date().toISOString()
    });

    // Generate token with admin role
    const token = generateToken(user.id);

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password_hash;

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login'
    });
  }
});

// @route   POST /api/auth/admin/register
// @desc    Register a new admin user
// @access  Public (but requires admin code)
router.post('/admin/register', [
  registerRateLimit,
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail(EMAIL_NORMALIZE_OPTIONS)
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  body('adminCode')
    .notEmpty()
    .withMessage('Admin registration code is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password, phone, country, adminCode } = req.body;

    // Validate admin code (you should set this in your environment variables)
    const validAdminCode = process.env.ADMIN_REGISTRATION_CODE || 'ADMIN_SMART_ALGOS_2024';
    if (adminCode !== validAdminCode) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin registration code'
      });
    }

    // Check if user already exists
    const existingUser = await databaseService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new admin user
    const userData = {
      first_name: firstName,
      last_name: lastName,
      email,
      password_hash: passwordHash,
      phone,
      country,
      trading_experience: 'expert',
      is_active: true,
      is_email_verified: true, // Auto-verify admin emails
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const user = await databaseService.createUser(userData);

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password_hash;

    res.status(201).json({
      success: true,
      message: 'Admin user registered successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin registration'
    });
  }
});

// @route   POST /api/auth/setup
// @desc    Setup initial admin user (development only)
// @access  Public
router.post('/setup', async (req, res) => {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Setup endpoint is only available in development mode'
      });
    }

    const { setupAuth } = require('../setup-auth');
    await setupAuth();

    res.json({
      success: true,
      message: 'Authentication setup completed successfully'
    });

  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Setup failed: ' + error.message
    });
  }
});

module.exports = router;





