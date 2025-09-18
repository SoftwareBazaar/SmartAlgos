import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';

const AdminRegister = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);
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
    // For admin registration, we'll add the role and admin code
    const userData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      phone: data.phone,
      country: data.country,
      role: 'admin',
      adminCode: data.adminCode,
      tradingExperience: 'expert' // Default for admin
    };

    const result = await registerUser(userData);
    if (result.success) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900">
          <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Create Admin Account
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Register as an administrator for Smart Algos platform.
        </p>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Shield className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Admin Registration:</strong> This form is for creating administrator accounts only. 
              You need a valid admin registration code to proceed.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.firstName?.message}
            {...register('firstName', {
              required: 'First name is required',
              minLength: {
                value: 2,
                message: 'First name must be at least 2 characters',
              },
              maxLength: {
                value: 50,
                message: 'First name must not exceed 50 characters',
              },
            })}
          />

          <Input
            label="Last Name"
            type="text"
            leftIcon={<User className="h-4 w-4" />}
            error={errors.lastName?.message}
            {...register('lastName', {
              required: 'Last name is required',
              minLength: {
                value: 2,
                message: 'Last name must be at least 2 characters',
              },
              maxLength: {
                value: 50,
                message: 'Last name must not exceed 50 characters',
              },
            })}
          />
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Phone (Optional)"
            type="tel"
            leftIcon={<Phone className="h-4 w-4" />}
            error={errors.phone?.message}
            {...register('phone', {
              pattern: {
                value: /^[\+]?[1-9][\d]{0,15}$/,
                message: 'Invalid phone number format',
              },
            })}
          />

          <Input
            label="Country (Optional)"
            type="text"
            leftIcon={<MapPin className="h-4 w-4" />}
            error={errors.country?.message}
            {...register('country', {
              maxLength: {
                value: 100,
                message: 'Country must not exceed 100 characters',
              },
            })}
          />
        </div>

        <Input
          label="Admin Registration Code"
          type={showAdminCode ? 'text' : 'password'}
          leftIcon={<Shield className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowAdminCode(!showAdminCode)}
              className="text-gray-400 hover:text-gray-500"
            >
              {showAdminCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          error={errors.adminCode?.message}
          placeholder="Enter admin registration code"
          {...register('adminCode', {
            required: 'Admin registration code is required',
            minLength: {
              value: 8,
              message: 'Admin code must be at least 8 characters',
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
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
              message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            },
          })}
        />

        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-gray-500"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (value) =>
              value === password || 'Passwords do not match',
          })}
        />

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            {...register('terms', {
              required: 'You must accept the terms and conditions',
            })}
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
            I agree to the{' '}
            <Link
              to="/terms"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              to="/privacy"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.terms && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.terms.message}
          </p>
        )}

        <div className="flex items-center">
          <input
            id="adminAgreement"
            name="adminAgreement"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            {...register('adminAgreement', {
              required: 'You must accept the admin responsibilities',
            })}
          />
          <label htmlFor="adminAgreement" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
            I understand my responsibilities as an administrator and agree to maintain platform security and user privacy
          </label>
        </div>
        {errors.adminAgreement && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.adminAgreement.message}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        >
          Create Admin Account
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an admin account?{' '}
          <Link
            to="/auth/admin-login"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Sign in as Admin
          </Link>
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Need a regular user account?{' '}
          <Link
            to="/auth/register"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Register as User
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminRegister;
