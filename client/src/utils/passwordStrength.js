/**
 * Password strength validation utility
 * Provides real-time feedback on password strength
 */

/**
 * Calculate password strength score (0-100)
 * @param {string} password - Password to evaluate
 * @returns {number} - Strength score from 0 to 100
 */
export const calculatePasswordStrength = (password) => {
  if (!password || password.length === 0) {
    return 0;
  }

  let score = 0;
  const checks = {
    length: password.length >= 8,
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[@$!%*?&#]/.test(password),
    hasLongLength: password.length >= 12,
    hasVeryLongLength: password.length >= 16
  };

  // Length scoring (max 30 points)
  if (checks.length) score += 20;
  if (checks.hasLongLength) score += 5;
  if (checks.hasVeryLongLength) score += 5;

  // Character variety scoring (max 40 points)
  if (checks.hasLower) score += 8;
  if (checks.hasUpper) score += 8;
  if (checks.hasNumber) score += 8;
  if (checks.hasSpecial) score += 16;

  // Pattern bonus (max 30 points)
  // Check for common patterns that weaken passwords
  const commonPatterns = [
    /(.)\1{2,}/, // Repeated characters (aaa, 111)
    /123|abc|qwe/i, // Sequential patterns
    /password|admin|user|test/i // Common words
  ];

  let patternPenalty = 0;
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      patternPenalty += 10;
    }
  }

  score = Math.max(0, score - patternPenalty);

  // Bonus for complexity
  if (checks.hasLower && checks.hasUpper && checks.hasNumber && checks.hasSpecial) {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
};

/**
 * Get password strength level
 * @param {string} password - Password to evaluate
 * @returns {object} - Strength level with label, color, and feedback
 */
export const getPasswordStrength = (password) => {
  const score = calculatePasswordStrength(password);

  if (score === 0) {
    return {
      score: 0,
      level: 'none',
      label: 'No password',
      color: 'gray',
      feedback: 'Enter a password to see strength',
      requirements: {
        length: false,
        hasLower: false,
        hasUpper: false,
        hasNumber: false,
        hasSpecial: false
      }
    };
  }

  if (score < 30) {
    return {
      score,
      level: 'weak',
      label: 'Weak',
      color: 'red',
      feedback: 'Password is too weak. Add more characters and variety.',
      requirements: {
        length: password.length >= 8,
        hasLower: /[a-z]/.test(password),
        hasUpper: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[@$!%*?&#]/.test(password)
      }
    };
  }

  if (score < 60) {
    return {
      score,
      level: 'fair',
      label: 'Fair',
      color: 'yellow',
      feedback: 'Password is acceptable but could be stronger.',
      requirements: {
        length: password.length >= 8,
        hasLower: /[a-z]/.test(password),
        hasUpper: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[@$!%*?&#]/.test(password)
      }
    };
  }

  if (score < 80) {
    return {
      score,
      level: 'good',
      label: 'Good',
      color: 'blue',
      feedback: 'Password is strong. Consider adding more length for maximum security.',
      requirements: {
        length: password.length >= 8,
        hasLower: /[a-z]/.test(password),
        hasUpper: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[@$!%*?&#]/.test(password)
      }
    };
  }

  return {
    score,
    level: 'strong',
    label: 'Strong',
    color: 'green',
    feedback: 'Excellent! This password is very strong.',
    requirements: {
      length: password.length >= 8,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[@$!%*?&#]/.test(password)
    }
  };
};

/**
 * Validate password meets minimum requirements
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with isValid and errors
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[@$!%*?&#]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&#)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

