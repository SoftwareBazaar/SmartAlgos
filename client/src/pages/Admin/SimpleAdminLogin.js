import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight } from 'lucide-react';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { useAuth } from '../../contexts/AuthContext';

const SimpleAdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('Softwarebazaar.ke@gmail.com');
  const [password, setPassword] = useState('28103441Jw@');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log('=== ADMIN LOGIN ATTEMPT ===');
    console.log('Email:', email);
    
    try {
      const result = await adminLogin(email, password);
      
      if (result.success) {
        console.log('✅ Admin login successful, navigating to admin panel');
        navigate('/admin-dashboard');
      } else {
        setError(result.error || 'Admin login failed');
        setLoading(false);
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.message || 'Admin login failed');
      setLoading(false);
    }
  };

  const handleDirectAdminAccess = async () => {
    console.log('=== DIRECT ADMIN ACCESS REQUESTED ===');
    
    setLoading(true);
    setError('');
    
    try {
      const result = await adminLogin('Softwarebazaar.ke@gmail.com', '28103441Jw@');
      
      if (result.success) {
        console.log('✅ Direct admin access granted');
        navigate('/admin-dashboard');
      } else {
        setError(result.error || 'Direct access failed');
        setLoading(false);
      }
    } catch (err) {
      console.error('Direct access error:', err);
      setError(err.message || 'Direct access failed');
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setLoading(true);
    setError('');
    
    console.log('=== QUICK ADMIN LOGIN ===');
    
    try {
      const result = await adminLogin(email, password);
      
      if (result.success) {
        console.log('✅ Quick admin login successful');
        navigate('/admin-dashboard');
      } else {
        setError(result.error || 'Quick login failed');
        setLoading(false);
      }
    } catch (err) {
      console.error('Quick login error:', err);
      setError(err.message || 'Quick login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-500/20">
            <Shield className="h-8 w-8 text-primary-400" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Admin Access
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Smart Algos Trading Platform - Administrator Login
          </p>
        </div>

        {/* Quick Login Section */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">
                Quick Admin Access
              </h3>
              <p className="text-green-200 text-sm">
                Pre-configured admin credentials ready to use
              </p>
            </div>
            <Button
              onClick={handleQuickLogin}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
            >
              {loading ? 'Logging in...' : 'Quick Login'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Direct Admin Access */}
        <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-blue-200 mb-2">
              Direct Admin Access
            </h3>
            <p className="text-sm text-blue-300 mb-4">
              Bypass authentication for development access
            </p>
            <Button
              onClick={handleDirectAdminAccess}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              <Shield className="h-4 w-4 mr-2" />
              Direct Admin Access
            </Button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter admin email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
            >
              {loading ? 'Signing in...' : 'Sign in to Admin Panel'}
            </Button>
          </div>
        </form>

        {/* Admin Info */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-200">
                <strong>Admin Credentials:</strong> Email and password are pre-filled for quick access.
                All admin activities are logged and monitored for security.
              </p>
            </div>
          </div>
        </div>

        {/* Back to App */}
        <div className="text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="text-gray-400 hover:text-white text-sm underline"
          >
            ← Back to Main Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleAdminLogin;
