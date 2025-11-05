import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Shield, CheckCircle, XCircle, AlertCircle, Key, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getPasswordStrength, validatePassword } from '../../utils/passwordStrength';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedKYC, setAcceptedKYC] = useState(false);
  const [showOTPStep, setShowOTPStep] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resendingOTP, setResendingOTP] = useState(false);
  const { register: registerUser, verifyOTP, resendOTP, loading } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');
  const passwordStrength = password ? getPasswordStrength(password) : null;

  const onSubmit = async (data) => {
    // Validate KYC acceptance
    if (!acceptedKYC) {
      return;
    }

    const userData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      phone: data.phone,
      country: data.country,
      tradingExperience: data.tradingExperience,
      accountTier: data.accountTier || 'basic',
      kycAccepted: acceptedKYC
    };

    const result = await registerUser(userData);
    if (result.success) {
      if (result.requiresVerification) {
        // Show OTP verification step
        setRegistrationEmail(data.email);
        setShowOTPStep(true);
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return;
    }

    const result = await verifyOTP(registrationEmail, otp);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleResendOTP = async () => {
    setResendingOTP(true);
    await resendOTP(registrationEmail);
    setResendingOTP(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 flex items-center justify-center relative overflow-hidden py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-100 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-100 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-100 dark:bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-5xl px-4 relative z-10">
        <div className="bg-white/50 dark:bg-slate-800/40 backdrop-blur-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-purple-500/30 overflow-hidden">
          {/* Logo Header */}
          <div className="bg-gray-50 dark:bg-slate-900/80 backdrop-blur-xl border-b border-purple-200 dark:border-purple-500/20 py-3 px-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
                Smart Algos
              </h1>
            </div>
            <p className="text-gray-600 dark:text-slate-400 text-center mt-0.5 text-xs">Join the AI Trading Revolution</p>
          </div>

          <div className="p-4">
            <div className="text-center mb-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Create Your Trading Account</h2>
              <p className="text-gray-600 dark:text-slate-400 text-xs mt-0.5">Start your journey with AI-powered strategies</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
              {/* Personal Info Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-700 dark:text-slate-300 mb-1">
                    First Name
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      {...register('firstName', {
                        required: 'First name is required',
                        minLength: { value: 2, message: 'Min 2 characters' },
                        maxLength: { value: 50, message: 'Max 50 characters' },
                      })}
                      className="w-full px-3 py-2 pl-9 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all group-hover:border-gray-400 dark:group-hover:border-gray-400 dark:group-hover:border-slate-500"
                      placeholder="John"
                    />
                    <User className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                  </div>
                  {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName.message}</p>}
                </div>

                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-700 dark:text-slate-300 mb-1">
                    Last Name
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      {...register('lastName', {
                        required: 'Last name is required',
                        minLength: { value: 2, message: 'Min 2 characters' },
                        maxLength: { value: 50, message: 'Max 50 characters' },
                      })}
                      className="w-full px-3 py-2 pl-9 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all group-hover:border-gray-400 dark:group-hover:border-gray-400 dark:group-hover:border-slate-500"
                      placeholder="Doe"
                    />
                    <User className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                  </div>
                  {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              {/* Email */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className="w-full px-3 py-2 pl-9 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all group-hover:border-gray-400 dark:group-hover:border-slate-500"
                    placeholder="john@example.com"
                  />
                  <Mail className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                </div>
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
              </div>

              {/* Contact Info Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Phone <span className="text-gray-500 dark:text-slate-400 font-normal">(Optional - for account recovery)</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="tel"
                      {...register('phone', {
                        pattern: {
                          value: /^[\+]?[1-9][\d]{0,15}$/,
                          message: 'Invalid phone format. Use international format: +1234567890',
                        },
                      })}
                      className="w-full px-3 py-2 pl-9 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all group-hover:border-gray-400 dark:group-hover:border-slate-500"
                      placeholder="+1234567890 (optional)"
                    />
                    <Phone className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                  </div>
                  {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>}
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">This field is optional. You can skip it if you prefer.</p>
                </div>

                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Country (Optional)
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      {...register('country', {
                        maxLength: { value: 100, message: 'Max 100 characters' },
                      })}
                      className="w-full px-3 py-2 pl-9 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all group-hover:border-gray-400 dark:group-hover:border-slate-500"
                      placeholder="United States"
                    />
                    <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                  </div>
                  {errors.country && <p className="text-xs text-red-400 mt-1">{errors.country.message}</p>}
                </div>
              </div>

              {/* Account Tier Selection */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Account Tier <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('accountTier', {
                    required: 'Please select an account tier',
                  })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                >
                  <option value="" className="bg-white dark:bg-slate-800">Select account tier</option>
                  <option value="basic" className="bg-white dark:bg-slate-800">Basic - Free tier with limited features</option>
                  <option value="pro" className="bg-white dark:bg-slate-800">Pro - Advanced features and priority support</option>
                  <option value="enterprise" className="bg-white dark:bg-slate-800">Enterprise - Full access with custom solutions</option>
                </select>
                {errors.accountTier && <p className="text-xs text-red-400 mt-1">{errors.accountTier.message}</p>}
              </div>

              {/* Trading Experience */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                  Trading Experience
                </label>
                <select
                  {...register('tradingExperience', {
                    required: 'Please select your trading experience',
                  })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                >
                  <option value="" className="bg-white dark:bg-slate-800">Select your experience level</option>
                  <option value="beginner" className="bg-white dark:bg-slate-800">Beginner (0-1 years)</option>
                  <option value="intermediate" className="bg-white dark:bg-slate-800">Intermediate (1-3 years)</option>
                  <option value="advanced" className="bg-white dark:bg-slate-800">Advanced (3-5 years)</option>
                  <option value="expert" className="bg-white dark:bg-slate-800">Expert (5+ years)</option>
                </select>
                {errors.tradingExperience && <p className="text-xs text-red-400 mt-1">{errors.tradingExperience.message}</p>}
              </div>

              {/* Password Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Min 8 characters' },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
                          message: 'Must contain uppercase, lowercase, number & special char',
                        },
                        validate: (value) => {
                          const validation = validatePassword(value);
                          return validation.isValid || validation.errors[0];
                        },
                      })}
                      className="w-full px-3 py-2 pl-9 pr-9 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all group-hover:border-gray-400 dark:group-hover:border-slate-500"
                      placeholder="••••••••"
                    />
                    <Lock className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-gray-400 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password && password.length > 0 && passwordStrength && (
                    <div className="mt-2 space-y-1.5">
                      {/* Strength Bar */}
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.color === 'red' ? 'bg-red-500' :
                            passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                            passwordStrength.color === 'blue' ? 'bg-blue-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                      
                      {/* Strength Label */}
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-medium ${
                          passwordStrength.color === 'red' ? 'text-red-500' :
                          passwordStrength.color === 'yellow' ? 'text-yellow-500' :
                          passwordStrength.color === 'blue' ? 'text-blue-500' :
                          'text-green-500'
                        }`}>
                          {passwordStrength.label}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-slate-400">
                          {passwordStrength.feedback}
                        </span>
                      </div>
                      
                      {/* Requirements Checklist */}
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className={`flex items-center gap-1 ${passwordStrength.requirements.length ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'}`}>
                          {passwordStrength.requirements.length ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span>8+ characters</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength.requirements.hasLower ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'}`}>
                          {passwordStrength.requirements.hasLower ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span>Lowercase</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength.requirements.hasUpper ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'}`}>
                          {passwordStrength.requirements.hasUpper ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span>Uppercase</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordStrength.requirements.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'}`}>
                          {passwordStrength.requirements.hasNumber ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span>Number</span>
                        </div>
                        <div className={`flex items-center gap-1 col-span-2 ${passwordStrength.requirements.hasSpecial ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'}`}>
                          {passwordStrength.requirements.hasSpecial ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span>Special character (@$!%*?&#)</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
                </div>

                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) => value === password || 'Passwords do not match',
                      })}
                      className="w-full px-3 py-2 pl-9 pr-9 bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all group-hover:border-gray-400 dark:group-hover:border-slate-500"
                      placeholder="••••••••"
                    />
                    <Lock className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-2.5 text-gray-400 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              {/* KYC/AML Disclaimer */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
                      Regulatory Compliance & KYC/AML Notice
                    </h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                      By creating an account, you acknowledge that trading financial instruments involves substantial risk of loss. 
                      This platform operates in compliance with applicable financial regulations. You may be required to complete 
                      Know Your Customer (KYC) and Anti-Money Laundering (AML) verification procedures. Trading may not be suitable 
                      for all investors. Please ensure you understand the risks involved.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <input
                    id="kyc"
                    type="checkbox"
                    checked={acceptedKYC}
                    onChange={(e) => setAcceptedKYC(e.target.checked)}
                    className="mt-0.5 rounded border-amber-300 dark:border-amber-600 bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="kyc" className="text-xs text-amber-900 dark:text-amber-200">
                    I acknowledge and accept the regulatory compliance, KYC/AML requirements, and understand the risks involved in trading.
                  </label>
                </div>
                {!acceptedKYC && (
                  <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    You must accept the regulatory compliance notice to continue
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 text-xs">
                <input
                  id="terms"
                  type="checkbox"
                  {...register('terms', {
                    required: 'You must accept the terms and conditions',
                  })}
                  className="mt-0.5 rounded border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-700 text-purple-600 dark:text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="terms" className="text-gray-700 dark:text-slate-300">
                  I agree to the{' '}
                  <Link to="/terms" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.terms && <p className="text-xs text-red-400">{errors.terms.message}</p>}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-600 text-white text-sm font-bold rounded-lg hover:from-purple-600 hover:via-pink-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transform hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !acceptedKYC}
              >
                <span className="relative z-10">{loading ? 'Creating Account...' : 'Create Trading Account'}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            </form>

            {/* OTP Verification Step */}
            {showOTPStep && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Verify Your Email</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We've sent a 6-digit verification code to
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{registrationEmail}</p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">
                      Enter Verification Code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="w-full px-3 py-2.5 text-center text-2xl font-mono tracking-widest bg-gray-50 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                        autoFocus
                      />
                      <Key className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 dark:text-slate-400" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 text-center">
                      {otp.length}/6 digits
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-600 text-white text-sm font-bold rounded-lg hover:from-purple-600 hover:via-pink-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span>Didn't receive the code?</span>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendingOTP}
                      className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold flex items-center gap-1 disabled:opacity-50"
                    >
                      {resendingOTP ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3" />
                          Resend Code
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="pb-3 px-4 flex items-center justify-center gap-1.5 text-gray-500 dark:text-slate-400 text-xs mt-3">
              <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>256-bit SSL Encrypted</span>
            </div>
          </div>

          <p className="text-center text-gray-600 dark:text-slate-400 text-xs mt-3 pb-3">
            © 2025 Smart Algos · AI Powered Trading Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
