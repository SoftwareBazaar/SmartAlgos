import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPassword = () => {
  const { forgotPassword, loading } = useAuth();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const result = await forgotPassword(data.email);
    if (result.success) {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-brand-900 dark:via-brand-800 dark:to-black flex items-center justify-center py-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/auth/login')}
        className="absolute top-6 left-6 text-gray-600 hover:text-gray-900 dark:text-brand-300 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <div className="w-full max-w-sm px-6">
        {/* Main Card */}
        <div className="bg-white/50 dark:bg-brand-800/50 backdrop-blur-xl rounded-xl border border-gray-200 dark:border-brand-700/50 shadow-2xl overflow-hidden">
          
          {/* Header with Logo */}
          <div className="text-center py-6 px-6">
            {/* App Logo */}
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            
            {/* App Title */}
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password?</h1>
            <p className="text-gray-600 dark:text-brand-300 text-sm">No worries, we'll send you reset instructions</p>
          </div>

          {/* Form */}
          <form className="px-6 pb-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {!success ? (
              <>
                {/* Email Field */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700 dark:text-brand-200">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      placeholder="trader@smartalgos.com"
                      className="w-full px-3 py-2.5 pl-10 bg-gray-50 dark:bg-brand-700/50 border border-gray-300 dark:border-brand-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-brand-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-brand-400" />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-primary-500/25 transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Instructions'}
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
                    <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">Email Sent!</h3>
                    <p className="text-xs text-gray-600 dark:text-brand-300">
                      Please check your email for password reset instructions.
                    </p>
                  </div>
                </div>

                {/* Back to Login Button */}
                <Link
                  to="/auth/login"
                  className="block w-full py-2.5 bg-gray-100 dark:bg-brand-700/50 border border-gray-300 dark:border-brand-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-brand-700 hover:border-primary-600 dark:hover:border-primary-500 transition-all text-center"
                >
                  Back to Sign In
                </Link>
              </>
            )}

            {/* Divider */}
            {!success && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-brand-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white dark:bg-brand-800/50 text-gray-500 dark:text-brand-400">Remember your password?</span>
                </div>
              </div>
            )}

            {/* Back to Login Link */}
            {!success && (
              <Link
                to="/auth/login"
                className="block w-full py-2.5 bg-gray-100 dark:bg-brand-700/50 border border-gray-300 dark:border-brand-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-brand-700 hover:border-primary-600 dark:hover:border-primary-500 transition-all text-center"
              >
                Sign In Instead
              </Link>
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

export default ForgotPassword;