import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { adminLogin, loading } = useAuth();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      // Standardized admin credentials for Railway deployment
      email: 'admin@smartalgos.com',
      password: 'Admin123!@#'
    }
  });

  const onSubmit = async (data) => {
    console.log('🔐 Admin login attempt:', data.email);
    const result = await adminLogin(data.email, data.password);
    if (result.success) {
      navigate('/admin-cms');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900">
          <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Admin Sign In
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Access the Smart Algos administration panel.
        </p>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Shield className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Security Notice:</strong> Admin sessions are temporary and will not be saved. 
              You must re-enter credentials each time for maximum security. All admin activities are logged and monitored.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Login Button */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex">
            <div className="flex-shrink-0">
              <Shield className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Quick Admin Access:</strong> Use the pre-filled credentials below for instant access.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              const form = document.querySelector('form');
              if (form) {
                form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Quick Login
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Admin Email"
          type="email"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-500"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          })}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                <Shield className="h-3 w-3 mr-1" />
                No persistent login
              </span>
            </div>
          </div>

          <div className="text-sm">
            <Link
              to="/auth/admin-forgot-password"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        >
          Sign in as Admin
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an admin account?{' '}
          <Link
            to="/auth/admin-register"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Register as Admin
          </Link>
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Regular user?{' '}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            User Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
