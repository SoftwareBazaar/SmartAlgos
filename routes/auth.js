const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const databaseService = require('../services/databaseService');
const mockAuthStore = require('../services/mockAuthStore');
const { auth, createActionRateLimit } = require('../middleware/auth');
const securityService = require('../services/securityService');
const router = express.Router();

const isPlaceholderKey = (value = '') => {
  if (!value) {
    return true;
  }

  const normalized = value.toLowerCase();
  return ['your-', 'example', 'changeme', 'replace', 'dummy'].some((token) => normalized.includes(token));
};

const explicitMockFlag = (process.env.MOCK_AUTH || '').toLowerCase();
const useMockAuth = explicitMockFlag === 'true' || (explicitMockFlag !== 'false' && isPlaceholderKey(process.env.SUPABASE_SERVICE_ROLE_KEY));

const authStore = {
  async createUser(payload) {
    if (useMockAuth) {
      return mockAuthStore.createUser(payload);
    }

    try {
      return await databaseService.createUser(payload);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[auth] Falling back to mock auth store for createUser:', error.message);
        return mockAuthStore.createUser(payload);
      }
      throw error;
    }
  },

  async getUserByEmail(email) {
    if (useMockAuth) {
      return mockAuthStore.getUserByEmail(email);
    }

    try {
      return await databaseService.getUserByEmail(email);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[auth] Falling back to mock auth store for getUserByEmail:', error.message);
        return mockAuthStore.getUserByEmail(email);
      }
      throw error;
    }
  },

  async getUserById(id) {
    if (useMockAuth) {
      return mockAuthStore.getUserById(id);
    }

    try {
      return await databaseService.getUserById(id);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[auth] Falling back to mock auth store for getUserById:', error.message);
        return mockAuthStore.getUserById(id);
      }
      throw error;
    }
  },

  async updateUser(id, updates) {
    if (useMockAuth) {
      return mockAuthStore.updateUser(id, updates);
    }

    try {
      return await databaseService.updateUser(id, updates);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[auth] Falling back to mock auth store for updateUser:', error.message);
        return mockAuthStore.updateUser(id, updates);
      }
      throw error;
    }
  }
};

const EMAIL_NORMALIZE_OPTIONS = {
  gmail_remove_dots: false,
  gmail_remove_subaddress: false,
  outlookdotcom_remove_dots: false,
  yahoo_remove_subaddress: false,
  icloud_remove_subaddress: false
};

// No longer using custom JWT tokens - using Supabase tokens only

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

    // For development: Create user directly in database (bypass Supabase Auth email confirmation)
    const supabase = databaseService.getClient();
    
    // Generate a UUID for the user
    const userId = uuidv4();
    
    // Hash password for our database
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user profile in users_accounts table
    const userData = {
      id: userId,
      first_name: firstName,
      last_name: lastName,
      email,
      password_hash: passwordHash,
      phone,
      country,
      trading_experience: tradingExperience || 'beginner',
      is_active: true,
      is_email_verified: true, // Auto-verify for development
      role: 'user',
      subscription_type: 'free',
      subscription_status: 'active',
      subscription_start_date: new Date().toISOString(),
      subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      preferences: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: profileData, error: profileError } = await supabase
      .from('users_accounts')
      .insert(userData)
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError.message);
      // If profile creation fails, we should clean up the auth user
      // But for now, just log the error
    }

    // For development: Generate a simple token (not JWT)
    const token = `dev_token_${userId}`;

    // Remove sensitive data from response
    const userResponse = {
      id: userId,
      email: email,
      first_name: firstName,
      last_name: lastName,
      role: 'user',
      is_active: true,
      is_email_verified: true,
      created_at: new Date().toISOString()
    };

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
// @desc    Login user using Supabase
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

    // For development: Use direct database authentication
    const supabase = databaseService.getClient();
    
    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users_accounts')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      console.warn('[login] User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, profile.password_hash);
    if (!isPasswordValid) {
      console.warn('[login] Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!profile.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Update last login and activity
    await supabase
      .from('users_accounts')
      .update({
        last_login: new Date().toISOString(),
        last_activity: new Date().toISOString()
      })
      .eq('id', profile.id);

    // For development: Generate a simple token
    const token = `dev_token_${profile.id}`;

    // Remove password from response
    const userResponse = { ...profile };
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
    // User is already verified by auth middleware
    const user = req.userRaw || req.user;
    
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

    const user = await authStore.getUserByEmail(email);
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

    // Generate reset token using Supabase
    const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    
    if (resetError) {
      console.error('Password reset error:', resetError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email'
      });
    }
    
    const resetToken = null; // Supabase handles the reset flow

    await authStore.updateUser(user.id, {
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

    // Password reset is handled by Supabase - no custom token verification needed
    // This endpoint should not be used with Supabase authentication
    return res.status(400).json({
      success: false,
      message: 'Password reset is handled by Supabase. Use the reset link from your email.'
    });

    // This code is unreachable due to the return statement above
    // Password reset is handled by Supabase
  } catch (error) {
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
    const user = await authStore.getUserById(req.user.userId);
    
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
    await authStore.updateUser(user.id, {
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

    // Email verification is handled by Supabase - no custom token verification needed
    return res.status(400).json({
      success: false,
      message: 'Email verification is handled by Supabase. Use the verification link from your email.'
    });

  } catch (error) {
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

    // Email verification is handled by Supabase
    const verificationToken = null;

    await authStore.updateUser(req.user.userId, {
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
    await authStore.updateUser(req.user.userId, {
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
// @desc    Admin login using database authentication
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

    // Use authStore for admin login (supports both database and mock auth)
    console.log('[admin-login] Looking for user with email:', email);
    const profile = await authStore.getUserByEmail(email);

    if (!profile) {
      console.warn('[admin-login] User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('[admin-login] Found user:', profile.email, 'role:', profile.role);

    // Check if user is admin
    if (profile.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Check if account is active
    if (!profile.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, profile.password_hash);
    if (!isPasswordValid) {
      console.warn('[admin-login] Invalid password for admin:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login and activity
    await authStore.updateUser(profile.id, {
      last_login: new Date().toISOString(),
      last_activity: new Date().toISOString()
    });

    // Generate a dev token for admin (consistent with regular user tokens)
    const token = `dev_token_${profile.id}`;

    // Remove password from response
    const userResponse = { ...profile };
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
    const existingUser = await authStore.getUserByEmail(email);
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

    const user = await authStore.createUser(userData);

    // No custom token generation - using Supabase tokens only
    const token = null;

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






