import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    const userData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      phone: data.phone,
      country: data.country,
      tradingExperience: data.tradingExperience
    };

    const result = await registerUser(userData);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center relative overflow-hidden py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-5xl px-4 relative z-10">
        <div className="bg-slate-800/40 backdrop-blur-2xl rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden">
          {/* Logo Header */}
          <div className="bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/20 py-3 px-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Smart Algos
              </h1>
            </div>
            <p className="text-slate-400 text-center mt-0.5 text-xs">Join the AI Trading Revolution</p>
          </div>

          <div className="p-4">
            <div className="text-center mb-3">
              <h2 className="text-base font-bold text-white">Create Your Trading Account</h2>
              <p className="text-slate-400 text-xs mt-0.5">Start your journey with AI-powered strategies</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
              {/* Personal Info Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                      className="w-full px-3 py-2 pl-9 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all group-hover:border-slate-500"
                      placeholder="John"
                    />
                    <User className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                  {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName.message}</p>}
                </div>

                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                      className="w-full px-3 py-2 pl-9 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all group-hover:border-slate-500"
                      placeholder="Doe"
                    />
                    <User className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                  {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              {/* Email */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                    className="w-full px-3 py-2 pl-9 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all group-hover:border-slate-500"
                    placeholder="john@example.com"
                  />
                  <Mail className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
                </div>
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
              </div>

              {/* Contact Info Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone (Optional)
                  </label>
                  <div className="relative group">
                    <input
                      type="tel"
                      {...register('phone', {
                        pattern: {
                          value: /^[\+]?[1-9][\d]{0,15}$/,
                          message: 'Invalid phone format',
                        },
                      })}
                      className="w-full px-3 py-2 pl-9 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all group-hover:border-slate-500"
                      placeholder="+1234567890"
                    />
                    <Phone className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                  {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>}
                </div>

                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Country (Optional)
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      {...register('country', {
                        maxLength: { value: 100, message: 'Max 100 characters' },
                      })}
                      className="w-full px-3 py-2 pl-9 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all group-hover:border-slate-500"
                      placeholder="United States"
                    />
                    <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                  {errors.country && <p className="text-xs text-red-400 mt-1">{errors.country.message}</p>}
                </div>
              </div>

              {/* Trading Experience */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Trading Experience
                </label>
                <select
                  {...register('tradingExperience', {
                    required: 'Please select your trading experience',
                  })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                >
                  <option value="" className="bg-slate-800">Select your experience level</option>
                  <option value="beginner" className="bg-slate-800">Beginner (0-1 years)</option>
                  <option value="intermediate" className="bg-slate-800">Intermediate (1-3 years)</option>
                  <option value="advanced" className="bg-slate-800">Advanced (3-5 years)</option>
                  <option value="expert" className="bg-slate-800">Expert (5+ years)</option>
                </select>
                {errors.tradingExperience && <p className="text-xs text-red-400 mt-1">{errors.tradingExperience.message}</p>}
              </div>

              {/* Password Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Min 8 characters' },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                          message: 'Must contain uppercase, lowercase, number & special char',
                        },
                      })}
                      className="w-full px-3 py-2 pl-9 pr-9 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all group-hover:border-slate-500"
                      placeholder="••••••••"
                    />
                    <Lock className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-purple-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
                </div>

                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) => value === password || 'Passwords do not match',
                      })}
                      className="w-full px-3 py-2 pl-9 pr-9 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all group-hover:border-slate-500"
                      placeholder="••••••••"
                    />
                    <Lock className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-purple-400 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 text-xs">
                <input
                  id="terms"
                  type="checkbox"
                  {...register('terms', {
                    required: 'You must accept the terms and conditions',
                  })}
                  className="mt-0.5 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="terms" className="text-slate-300">
                  I agree to the{' '}
                  <Link to="/terms" className="text-purple-400 hover:text-purple-300 transition hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-purple-400 hover:text-purple-300 transition hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.terms && <p className="text-xs text-red-400">{errors.terms.message}</p>}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-600 text-white text-sm font-bold rounded-lg hover:from-purple-600 hover:via-pink-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl hover:shadow-purple-500/50 transform hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group"
                disabled={loading}
              >
                <span className="relative z-10">{loading ? 'Creating Account...' : 'Create Trading Account'}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            </form>

            <div className="pb-3 px-4 flex items-center justify-center gap-1.5 text-slate-400 text-xs mt-3">
              <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>256-bit SSL Encrypted</span>
            </div>
          </div>

          <p className="text-center text-slate-400 text-xs mt-3 pb-3">
            © 2025 Smart Algos · AI Powered Trading Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
