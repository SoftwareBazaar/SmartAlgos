import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';

export default function SmartAlgosLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Clear previous errors
    const result = await login(email.trim(), password);
    if (result.success) {
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  const goToRegister = () => navigate('/auth/register');

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-brand-900 dark:via-brand-800 dark:to-black flex items-center justify-center py-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 text-gray-600 hover:text-gray-900 dark:text-brand-300 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Proxy Settings - Top Right */}
      <button className="absolute top-6 right-6 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors">
        Proxy Settings
      </button>

      <div className="w-full max-w-sm px-6">
        {/* Main Login Card */}
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Smart Algos</h1>
            <p className="text-gray-600 dark:text-brand-300 text-sm">AI Powered Trading Platform</p>
          </div>

          {/* Login Form */}
          <form className="px-6 pb-6 space-y-4" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2 animate-shake">
                <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-400 text-xs font-medium">{error}</p>
              </div>
            )}
            
            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-brand-200">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="trader@smartalgos.com"
                  className="w-full px-3 py-2.5 pl-10 bg-gray-50 dark:bg-brand-700/50 border border-gray-300 dark:border-brand-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-brand-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  required
                />
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-brand-400" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-brand-200">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pl-10 pr-10 bg-gray-50 dark:bg-brand-700/50 border border-gray-300 dark:border-brand-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-brand-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  required
                />
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-brand-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 dark:text-brand-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-gray-600 dark:text-brand-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="mr-2 rounded border-gray-300 dark:border-brand-600 bg-gray-100 dark:bg-brand-700 text-primary-600 dark:text-primary-500 focus:ring-primary-500"
                />
                Remember me
              </label>
              <Link 
                to="/auth/forgot-password" 
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-primary-500/25 transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Launch Trading Dashboard'}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-brand-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white dark:bg-brand-800/50 text-gray-500 dark:text-brand-400">New to Smart Algos?</span>
              </div>
            </div>

            {/* Register Button */}
            <button
              type="button"
              onClick={goToRegister}
              className="w-full py-2.5 bg-gray-100 dark:bg-brand-700/50 border border-gray-300 dark:border-brand-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-brand-700 hover:border-primary-600 dark:hover:border-primary-500 transition-all"
            >
              Create Account
            </button>
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
}