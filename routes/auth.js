const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const databaseService = require('../services/databaseService');
const mockAuthStore = require('../services/mockAuthStore');
const { auth, createActionRateLimit } = require('../middleware/auth');
const securityService = require('../services/securityService');
const otpService = require('../services/otpService');
const twoFactorService = require('../services/twoFactorService');
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

const FALLBACK_ERROR_CODES = new Set(['42501', 'PGRST301', 'PGRST302']);
const FALLBACK_ERROR_PATTERNS = [
  /row[-\s]?level security/i,
  /permission denied/i,
  /not authorized/i,
  /violates policy/i
];

const OPTIONAL_COLUMN_DEPENDENCIES = {
  kyc_accepted: ['kyc_accepted_at'],
  kyc_accepted_at: ['kyc_accepted'],
  account_tier: [],
  trading_experience: [],
  phone: [],
  country: [],
  preferences: [],
  metadata: [],
  two_factor_secret: [],
  two_factor_enabled: []
};

const shouldFallbackToMock = (error) => {
  if (!error) {
    return false;
  }

  const code = error.code || error.status || error.name;
  if (code && FALLBACK_ERROR_CODES.has(String(code))) {
    return true;
  }

  const combinedMessage = `${error.message || ''} ${error.details || ''}`.trim();
  if (!combinedMessage) {
    return false;
  }

  return FALLBACK_ERROR_PATTERNS.some((pattern) => pattern.test(combinedMessage));
};

const removeUnsupportedColumn = (payload, column) => {
  if (payload && Object.prototype.hasOwnProperty.call(payload, column)) {
    delete payload[column];
  }

  const dependents = OPTIONAL_COLUMN_DEPENDENCIES[column] || [];
  dependents.forEach((dependentColumn) => {
    if (payload && Object.prototype.hasOwnProperty.call(payload, dependentColumn)) {
      delete payload[dependentColumn];
    }
  });
};

const extractMissingColumnName = (message = '') => {
  if (!message) {
    return null;
  }

  const match = message.match(/column\s+"?([a-zA-Z0-9_]+)"?\s+(of\s+relation\s+"?[a-zA-Z0-9_]+"?\s+)?does not exist/i);
  if (match && match[1]) {
    return match[1];
  }

  const altMatch = message.match(/column\s+"?([a-zA-Z0-9_]+)"?\s+of\s+relation/i);
  if (altMatch && altMatch[1]) {
    return altMatch[1];
  }

  return null;
};

const insertUserWithColumnFallback = async (supabase, payload) => {
  let workingPayload = { ...payload };
  const removedColumns = new Set();
  const maxAttempts = 8;
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt += 1;

    const { data, error } = await supabase
      .from('users_accounts')
      .insert(workingPayload)
      .select('*')
      .single();

    if (!error) {
      return { data, removedColumns: [...removedColumns] };
    }

    const missingColumn = extractMissingColumnName(error.message);
    if (missingColumn && Object.prototype.hasOwnProperty.call(workingPayload, missingColumn)) {
      console.warn(`[Registration] Removing unsupported column "${missingColumn}" and retrying insert.`);
      removeUnsupportedColumn(workingPayload, missingColumn);
      removedColumns.add(missingColumn);
      continue;
    }

    return { error, removedColumns: [...removedColumns] };
  }

  return {
    error: new Error('Exceeded maximum attempts while inserting user record'),
    removedColumns: [...removedColumns]
  };
};

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
  all_lowercase: true,
  gmail_remove_dots: false,
  gmail_remove_subaddress: false,
  outlookdotcom_remove_subaddress: false,
  yahoo_remove_subaddress: false,
  icloud_remove_subaddress: false
};

// No longer using custom JWT tokens - using Supabase tokens only

// Rate limiting for auth actions (production-ready limits)
const loginRateLimit = createActionRateLimit(5, 15 * 60 * 1000, 'login'); // 5 attempts per 15 minutes
const registerRateLimit = createActionRateLimit(10, 10 * 60 * 1000, 'register'); // 10 attempts per 10 minutes
const passwordResetRateLimit = createActionRateLimit(5, 10 * 60 * 1000, 'password-reset'); // 5 attempts per 10 minutes

// Import account lockout middleware
const { accountLockout, updateLockoutAttempts } = require('../middleware/security');

const rawGoogleClientId =
  process.env.GOOGLE_CLIENT_ID ||
  process.env.GOOGLE_OAUTH_CLIENT_ID ||
  process.env.REACT_APP_GOOGLE_CLIENT_ID;

const googleClientId = typeof rawGoogleClientId === 'string' ? rawGoogleClientId.trim() : null;
const googleOAuthClient = googleClientId ? new OAuth2Client(googleClientId) : null;

if (!googleClientId) {
  console.warn('[Google Auth] Google client ID not configured. Google login will be disabled.');
}

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  // registerRateLimit REMOVED - no rate limiting
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

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      country,
      tradingExperience,
      accountTier,
      kycAccepted
    } = req.body;

    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const normalizedAccountTier = (() => {
      if (!accountTier) {
        return 'basic';
      }

      const tier = String(accountTier).toLowerCase();
      if (['basic', 'pro', 'enterprise'].includes(tier)) {
        return tier;
      }

      return 'basic';
    })();

    const derivedSubscriptionType = (() => {
      const subscriptionMap = {
        basic: 'free',
        pro: 'premium',
        enterprise: 'institutional'
      };

      return subscriptionMap[normalizedAccountTier] || 'free';
    })();

    // For development: Create user directly in database (bypass Supabase Auth email confirmation)
    const supabase = databaseService.getClient();
    
    // Check if we're in mock mode
    if (!supabase) {
      console.log('[Auth] Mock mode: Skipping user registration');
      return res.status(400).json({
        success: false,
        message: 'User registration not available in mock mode. Please set up Supabase credentials.'
      });
    }
    
    // Generate a UUID for the user
    const userId = uuidv4();
    
    // Hash password for our database
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Validate KYC acceptance
    if (!kycAccepted) {
      return res.status(400).json({
        success: false,
        message: 'You must accept the regulatory compliance and KYC/AML notice to register'
      });
    }

    let existingUser = null;
    try {
      if (supabase) {
        const { data: existingData, error: existingError } = await supabase
          .from('users_accounts')
          .select('id')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (existingError && existingError.code !== 'PGRST116') {
          if (!shouldFallbackToMock(existingError)) {
            throw existingError;
          }
        }

        if (!existingError && existingData) {
          existingUser = existingData;
        }
      }

      if (!existingUser && (useMockAuth || !supabase)) {
        existingUser = await mockAuthStore.getUserByEmail(normalizedEmail);
      }
    } catch (lookupError) {
      console.error('[Registration] Failed to check existing user:', lookupError);
      if (shouldFallbackToMock(lookupError) || useMockAuth || !supabase) {
        existingUser = await mockAuthStore.getUserByEmail(normalizedEmail);
      } else {
        return res.status(500).json({
          success: false,
          message: 'Unable to verify existing accounts. Please try again later.'
        });
      }
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // Send OTP for email verification
    const otpResult = await otpService.sendOTPEmail(normalizedEmail, 'email_verification');
    
    if (!otpResult.success) {
      console.warn('[Registration] Failed to send OTP email, proceeding with registration anyway');
      // Continue with registration even if OTP email fails (for development)
    }

    // Store registration data temporarily (in production, use Redis or database)
    // For now, we'll create the user but mark email as unverified
    const basePreferences = {
      phone: phone || null,
      country: country || null,
      tradingExperience: tradingExperience || 'beginner',
      accountTier: normalizedAccountTier,
      kycAccepted: !!kycAccepted,
      kycAcceptedAt: new Date().toISOString(),
      metadataVersion: 1
    };

    const userData = {
      id: userId,
      first_name: firstName,
      last_name: lastName,
      email: normalizedEmail,
      password_hash: passwordHash,
      is_active: true,
      is_email_verified: false, // Require OTP verification
      role: 'user',
      subscription_type: derivedSubscriptionType,
      subscription_status: 'active',
      subscription_start_date: new Date().toISOString(),
      subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      trading_experience: tradingExperience || 'beginner',
      account_tier: normalizedAccountTier,
      kyc_accepted: kycAccepted,
      kyc_accepted_at: new Date().toISOString(),
      preferences: basePreferences,
      phone: phone || null,
      country: country || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let userProfile = null;
    let createdInMockStore = false;
    let removedColumns = [];

    if (supabase) {
      const { data: profileData, error: profileError, removedColumns: removed } = await insertUserWithColumnFallback(
        supabase,
        userData
      );

      if (profileError) {
        console.error('[Registration] Supabase profile creation error:', profileError);

        if (!shouldFallbackToMock(profileError)) {
          return res.status(500).json({
            success: false,
            message: 'Failed to create user account'
          });
        }
      } else {
        userProfile = profileData;
        removedColumns = removed || [];
      }
    }

    if (!userProfile) {
      console.warn('[Registration] Using mock auth store for new user profile.');
      userProfile = await mockAuthStore.createUser({ ...userData });
      createdInMockStore = true;
    }

    if (removedColumns.length > 0) {
      console.warn(`[Registration] Skipped unsupported columns during insert: ${removedColumns.join(', ')}`);
    }

    // Check if user wants to enable 2FA during registration
    const { enable2FA } = req.body;
    let twoFactorData = null;

    if (enable2FA) {
      // Setup 2FA for the user
      twoFactorData = await twoFactorService.setup2FA(userId, email);
      
      // Store 2FA secret temporarily (will be confirmed after verification)
      // We'll update it after email verification is complete
      await supabase
        .from('users_accounts')
        .update({
          two_factor_secret: twoFactorData.secret,
          two_factor_enabled: false // Will be enabled after verification
        })
        .eq('id', userId);
    }

    // Return success but require OTP verification
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email with the OTP sent to your inbox.',
      requiresVerification: true,
      email: email,
      twoFactorSetup: enable2FA ? {
        qrCode: twoFactorData.qrCode,
        secret: twoFactorData.secret,
        backupCodes: twoFactorData.backupCodes
      } : null,
      mockAuth: createdInMockStore
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/google
// @desc    Login or register user via Google Sign-In
// @access  Public
router.post('/google', async (req, res) => {
  try {
    if (!googleOAuthClient) {
      return res.status(503).json({
        success: false,
        message: 'Google login is not configured. Please contact support.'
      });
    }

    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Missing Google credential token'
      });
    }

    let ticket;
    try {
      ticket = await googleOAuthClient.verifyIdToken({
        idToken: credential,
        audience: googleClientId
      });
    } catch (verifyError) {
      console.error('[Google Auth] Token verification failed:', verifyError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token'
      });
    }

    const payload = ticket.getPayload();
    const email = payload?.email;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google account does not have a public email address'
      });
    }

    const supabase = databaseService.getClient();
    const normalizedEmail = email.toLowerCase();

    let userProfile = null;

    if (supabase) {
      const { data: existingProfile, error: profileError } = await supabase
        .from('users_accounts')
        .select('*')
        .eq('email', normalizedEmail)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('[Google Auth] Failed to fetch user profile:', profileError.message);
        return res.status(500).json({
          success: false,
          message: 'Failed to process Google login'
        });
      }

      userProfile = existingProfile;

      if (!userProfile) {
        const googleFirstName = payload.given_name || payload.name?.split(' ')?.[0] || 'Trader';
        const googleLastName = payload.family_name || payload.name?.split(' ')?.slice(1).join(' ') || 'User';
        const randomPassword = `${uuidv4()}_${Date.now()}`;
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const passwordHash = await bcrypt.hash(randomPassword, saltRounds);
        const userId = uuidv4();

        const newUser = {
          id: userId,
          first_name: googleFirstName,
          last_name: googleLastName,
          email: normalizedEmail,
          password_hash: passwordHash,
          phone: null,
          country: null,
          trading_experience: 'beginner',
          account_tier: 'basic',
          kyc_accepted: true,
          kyc_accepted_at: new Date().toISOString(),
          is_active: true,
          is_email_verified: true,
          role: 'user',
          subscription_type: 'free',
          subscription_status: 'active',
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          preferences: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          avatar_url: payload.picture || null,
          auth_provider: 'google'
        };

        const { data: insertedUser, error: insertError } = await supabase
          .from('users_accounts')
          .insert(newUser)
          .select('*')
          .single();

        if (insertError) {
          console.error('[Google Auth] Failed to create user profile:', insertError);
          return res.status(500).json({
            success: false,
            message: 'Failed to create account with Google'
          });
        }

        userProfile = insertedUser;
      } else {
        // Update existing profile with latest avatar/provider info
        const updates = {};
        if (payload.picture && userProfile.avatar_url !== payload.picture) {
          updates.avatar_url = payload.picture;
        }
        if (!userProfile.auth_provider) {
          updates.auth_provider = 'google';
        }
        if (Object.keys(updates).length > 0) {
          updates.updated_at = new Date().toISOString();
          await supabase
            .from('users_accounts')
            .update(updates)
            .eq('id', userProfile.id);
          userProfile = { ...userProfile, ...updates };
        }
      }
    } else {
      console.warn('[Google Auth] Supabase unavailable - using mock auth store for Google login');
      userProfile = await mockAuthStore.getUserByEmail(normalizedEmail);

      if (!userProfile) {
        const googleFirstName = payload.given_name || payload.name?.split(' ')?.[0] || 'Trader';
        const googleLastName = payload.family_name || payload.name?.split(' ')?.slice(1).join(' ') || 'User';
        userProfile = await mockAuthStore.createUser({
          first_name: googleFirstName,
          last_name: googleLastName,
          email: normalizedEmail,
          is_active: true,
          is_email_verified: true,
          role: 'user',
          subscription_type: 'free',
          subscription_status: 'active',
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          preferences: {},
          avatar_url: payload.picture || null,
          auth_provider: 'google',
          password_hash: null
        });
      } else {
        const updates = { auth_provider: 'google' };
        if (payload.picture && userProfile.avatar_url !== payload.picture) {
          updates.avatar_url = payload.picture;
        }
        userProfile = await mockAuthStore.updateUser(userProfile.id, updates);
      }
    }

    if (!userProfile.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    const token = `dev_token_${userProfile.id}`;
    const userResponse = { ...userProfile };
    delete userResponse.password_hash;
    delete userResponse.two_factor_secret;

    res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('[Google Auth] Unexpected error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google login'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user using Supabase
// @access  Public
router.post('/login', [
  loginRateLimit, // Re-enabled rate limiting
  accountLockout(5, 15 * 60 * 1000), // 5 failed attempts = 15 min lockout
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
    
    // Check if we're in mock mode
    if (!supabase) {
      console.log('[Auth] Mock mode: Skipping database lookup for login');
      updateLockoutAttempts(req, false); // Record failed attempt
      return res.status(401).json({
        success: false,
        message: 'Authentication not available in mock mode. Please set up Supabase credentials.'
      });
    }
    
    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users_accounts')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      console.warn('[login] User not found:', email);
      updateLockoutAttempts(req, false); // Record failed attempt
      // Log security event
      securityService.logSecurityEvent('failed_login', {
        email,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        reason: 'user_not_found'
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked due to too many failed attempts
    const lockoutData = req.accountLockout;
    if (lockoutData && lockoutData.isLocked) {
      const remainingTime = Math.ceil((lockoutData.attempts.lockedUntil - Date.now()) / 1000 / 60);
      securityService.logSecurityEvent('login_blocked_locked', {
        email,
        ip: req.ip || req.connection.remoteAddress,
        remainingTime
      });
      return res.status(423).json({
        success: false,
        message: `Account temporarily locked due to too many failed login attempts. Please try again in ${remainingTime} minute(s).`
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, profile.password_hash);
    if (!isPasswordValid) {
      console.warn('[login] Invalid password for user:', email);
      updateLockoutAttempts(req, false); // Record failed attempt
      
      // Update login attempts in database
      const currentAttempts = (profile.login_attempts || 0) + 1;
      const maxAttempts = 5;
      
      await supabase
        .from('users_accounts')
        .update({
          login_attempts: currentAttempts,
          last_failed_login: new Date().toISOString(),
          ...(currentAttempts >= maxAttempts && {
            account_locked_until: new Date(Date.now() + 15 * 60 * 1000).toISOString()
          })
        })
        .eq('id', profile.id);
      
      // Log security event
      securityService.logSecurityEvent('failed_login', {
        email,
        userId: profile.id,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        attempts: currentAttempts,
        reason: 'invalid_password',
        locked: currentAttempts >= maxAttempts
      });
      
      const remainingAttempts = Math.max(0, maxAttempts - currentAttempts);
      return res.status(401).json({
        success: false,
        message: `Invalid email or password. ${remainingAttempts > 0 ? `${remainingAttempts} attempt(s) remaining.` : 'Account locked for 15 minutes.'}`
      });
    }

    // Check if account is active
    if (!profile.is_active) {
      updateLockoutAttempts(req, false);
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if account is locked in database
    if (profile.account_locked_until && new Date(profile.account_locked_until) > new Date()) {
      const remainingTime = Math.ceil((new Date(profile.account_locked_until) - Date.now()) / 1000 / 60);
      return res.status(423).json({
        success: false,
        message: `Account temporarily locked. Please try again in ${remainingTime} minute(s).`
      });
    }

    // Check if 2FA is enabled and if code is provided
    const { twoFactorCode } = req.body;
    if (profile.two_factor_enabled && profile.two_factor_secret) {
      if (!twoFactorCode) {
        // Password is valid, but 2FA code is required
        return res.status(200).json({
          success: false,
          requires2FA: true,
          message: 'Two-factor authentication code required'
        });
      }

      // Verify 2FA code
      const isValid2FA = twoFactorService.verifyTOTP(profile.two_factor_secret, twoFactorCode);
      if (!isValid2FA) {
        updateLockoutAttempts(req, false);
        securityService.logSecurityEvent('failed_login', {
          email,
          userId: profile.id,
          ip: req.ip || req.connection.remoteAddress,
          reason: 'invalid_2fa_code'
        });
        return res.status(401).json({
          success: false,
          message: 'Invalid two-factor authentication code'
        });
      }
    }

    // Reset login attempts on successful login
    updateLockoutAttempts(req, true);
    
    // Update last login and activity, reset login attempts
    await supabase
      .from('users_accounts')
      .update({
        last_login: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        login_attempts: 0,
        account_locked_until: null,
        last_successful_login: new Date().toISOString()
      })
      .eq('id', profile.id);

    // Log successful login
    securityService.logSecurityEvent('successful_login', {
      email,
      userId: profile.id,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      twoFactorUsed: profile.two_factor_enabled || false
    });

    // For development: Generate a simple token
    const token = `dev_token_${profile.id}`;

    // Remove password from response
    const userResponse = { ...profile };
    delete userResponse.password_hash;
    delete userResponse.two_factor_secret; // Never send secret to client

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
  // passwordResetRateLimit REMOVED - no rate limiting
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

// @route   POST /api/auth/verify-otp
// @desc    Verify email OTP
// @access  Public
router.post('/verify-otp', [
  body('email')
    .isEmail()
    .normalizeEmail(EMAIL_NORMALIZE_OPTIONS)
    .withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number')
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

    const { email, otp } = req.body;

    // Verify OTP
    const verification = otpService.verifyOTP(email, otp, 'email_verification');
    
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    // OTP is valid - verify email in database
    const supabase = databaseService.getClient();
    if (!supabase) {
      return res.status(500).json({
        success: false,
        message: 'Database service unavailable'
      });
    }

    // Update user email verification status
    const { data: user, error: updateError } = await supabase
      .from('users_accounts')
      .update({ 
        is_email_verified: true,
        email_verified_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()
      .single();

    if (updateError || !user) {
      console.error('Failed to verify email:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify email'
      });
    }

    // Generate token for verified user
    const token = `dev_token_${user.id}`;

    // Remove sensitive data from response
    const userResponse = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active,
      is_email_verified: true,
      created_at: user.created_at
    };

    res.json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP for email verification
// @access  Public
router.post('/resend-otp', [
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

    // Check if user exists
    const supabase = databaseService.getClient();
    if (!supabase) {
      return res.status(500).json({
        success: false,
        message: 'Database service unavailable'
      });
    }

    const { data: user } = await supabase
      .from('users_accounts')
      .select('id, is_email_verified')
      .eq('email', email)
      .single();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.is_email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Resend OTP
    const result = await otpService.resendOTP(email, 'email_verification');

    res.json({
      success: result.success,
      message: result.message || 'OTP resent successfully'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Verify email address (legacy endpoint - kept for compatibility)
// @access  Public
router.post('/verify-email', [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required')
], async (req, res) => {
  try {
    const { token } = req.body;

    // Email verification is handled by OTP now
    return res.status(400).json({
      success: false,
      message: 'Please use /api/auth/verify-otp endpoint for email verification'
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
  // loginRateLimit removed for admin login to prevent blocking
  body('email')
    .isEmail()
    .normalizeEmail(EMAIL_NORMALIZE_OPTIONS)
    .customSanitizer(value => value.toLowerCase().trim()) // Force lowercase and trim
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
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

    const { email, password } = req.body;
    
    // Ensure email is lowercase and trimmed
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('[admin-login] Looking for user with email:', normalizedEmail);
    const profile = await authStore.getUserByEmail(normalizedEmail);

    if (!profile) {
      console.warn('[admin-login] User not found:', normalizedEmail);
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
      console.warn('[admin-login] Invalid password for admin:', normalizedEmail);
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
  // registerRateLimit REMOVED - no rate limiting
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






