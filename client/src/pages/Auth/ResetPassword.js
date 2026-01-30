import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const [success, setSuccess] = useState(false);
  const { resetPassword, loading } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');
  const accessToken = searchParams.get('access_token');
  const type = searchParams.get('type');

  useEffect(() => {
    // Check if this is a password recovery link
    if (type !== 'recovery' || !accessToken) {
      console.error('Invalid password reset link');
    }
  }, [type, accessToken]);

  const onSubmit = async (data) => {
    if (!accessToken) {
      toast.error('Invalid reset link');
      return;
    }
    
    const result = await resetPassword(accessToken, data.password);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    }
  };

  if (!accessToken || type !== 'recovery') {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-brand-900 dark:via-brand-800 dark:to-black flex items-center justify-center py-6">
        <button
          onClick={() => navigate('/auth/login')}
          className="absolute top-6 left-6 text-gray-600 hover:text-gray-900 dark:text-brand-300 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="w-full max-w-sm px-6">
          <div className="bg-white/50 dark:bg-brand-800/50 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-brand-700/50 shadow-2xl overflow-hidden p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Invalid Reset Link
                </h2>
                <p className="text-sm text-gray-600 dark:text-brand-300">
                  The password reset link is invalid or has expired.
                </p>
              </div>
              <Link
                to="/auth/forgot-password"
                className="block w-full py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all"
              >
                Request a New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-brand-900 dark:via-brand-800 dark:to-black flex items-center justify-center py-6">
      <button
        onClick={() => navigate('/auth/login')}
        className="absolute top-6 left-6 text-gray-600 hover:text-gray-900 dark:text-brand-300 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="w-full max-w-sm px-6">
        <div className="bg-white/50 dark:bg-brand-800/50 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-brand-700/50 shadow-2xl overflow-hidden">
          
          {/* Header with Logo */}
          <div className="text-center py-6 px-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Reset Your Password</h1>
            <p className="text-gray-600 dark:text-brand-300 text-sm">Enter your new password below</p>
          </div>

          {/* Form */}
          <form className="px-6 pb-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {!success ? (
              <>
                {/* New Password Field */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-brand-200">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters',
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                          message: 'Must contain uppercase, lowercase, number, and special character',
                        },
                      })}
                      placeholder="Enter new password"
                      className="w-full px-3 py-2.5 pl-10 pr-10 bg-gray-50 dark:bg-brand-700/50 border border-gray-300 dark:border-brand-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-brand-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-brand-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-brand-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-brand-400 mt-1">
                    At least 8 characters with uppercase, lowercase, number & special character
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-brand-200">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) =>
                          value === password || 'Passwords do not match',
                      })}
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2.5 pl-10 pr-10 bg-gray-50 dark:bg-brand-700/50 border border-gray-300 dark:border-brand-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-brand-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-brand-400" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-brand-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-primary-500/25 transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </>
            ) : (
              <>
                {/* Success Message */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">Password Reset!</h3>
                    <p className="text-xs text-gray-600 dark:text-brand-300">
                      Your password has been reset successfully. Redirecting to login...
                    </p>
                  </div>
                </div>

                {/* Back to Login Button */}
                <Link
                  to="/auth/login"
                  className="block w-full py-2.5 bg-gray-100 dark:bg-brand-700/50 border border-gray-300 dark:border-brand-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-brand-700 hover:border-primary-600 dark:hover:border-primary-500 transition-all text-center"
                >
                  Go to Sign In
                </Link>
              </>
            )}

            {/* Back to Login Link */}
            {!success && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-brand-700" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white dark:bg-brand-800/50 text-gray-500 dark:text-brand-400">Remember your password?</span>
                  </div>
                </div>

                <Link
                  to="/auth/login"
                  className="block w-full py-2.5 bg-gray-100 dark:bg-brand-700/50 border border-gray-300 dark:border-brand-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-brand-700 hover:border-primary-600 dark:hover:border-primary-500 transition-all text-center"
                >
                  Sign In Instead
                </Link>
              </>
            )}
          </form>

          {/* Footer */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-brand-400">
              <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>256-bit SSL Encrypted</span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <p className="text-center text-gray-600 dark:text-brand-500 text-xs mt-4">
          © 2025 Smart Algos · AI Powered Trading Platform
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
