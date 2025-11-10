import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ShieldCheck, CheckCircle, XCircle, AlertCircle, Key, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getPasswordStrength, validatePassword } from '../../utils/passwordStrength';

const AnimatedGlobe = () => {
  const particleConfigs = useMemo(
    () => [
      { size: 6, distance: 108, duration: 18, delay: 0 },
      { size: 4, distance: 92, duration: 14, delay: -3 },
      { size: 5, distance: 128, duration: 22, delay: -6 },
      { size: 3, distance: 76, duration: 12, delay: -1.5 },
      { size: 7, distance: 140, duration: 26, delay: -10 },
      { size: 4, distance: 100, duration: 16, delay: -4 },
      { size: 5, distance: 118, duration: 20, delay: -7 },
      { size: 3, distance: 86, duration: 15, delay: -2.5 }
    ],
    []
  );

  return (
    <div className="relative h-72 w-72 md:h-80 md:w-80">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-500/10 via-indigo-400/10 to-transparent blur-3xl" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-60 w-60 md:h-64 md:w-64">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-500 opacity-70 blur" />
          <div className="absolute inset-0 rounded-full bg-slate-950/60 backdrop-blur-md shadow-[0_25px_80px_-30px_rgba(56,189,248,0.55)]" />
          <div className="absolute inset-0 rounded-full border border-sky-500/50 opacity-70" />
          <div className="absolute inset-6 rounded-full border border-sky-400/30 opacity-50" />
          <div className="absolute inset-x-10 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-sky-300/40 to-transparent" />
          <div className="absolute inset-y-10 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-transparent via-sky-300/40 to-transparent" />
          {particleConfigs.map((particle, index) => (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className="absolute left-1/2 top-1/2 block rounded-full bg-sky-300 shadow-[0_0_12px_rgba(125,211,252,0.8)]"
              style={{
                width: particle.size,
                height: particle.size,
                marginLeft: -particle.size / 2,
                marginTop: -particle.size / 2,
                transformOrigin: `0 ${particle.distance}px`,
                animation: `orbit ${particle.duration}s linear infinite`,
                animationDelay: `${particle.delay}s`,
                filter: 'drop-shadow(0 0 10px rgba(125,211,252,0.65))'
              }}
            />
          ))}
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-sky-400/30 via-indigo-400/20 to-purple-500/30 opacity-70" />
        </div>
      </div>
      <div className="pointer-events-none absolute -inset-8 -z-10 rounded-full border border-sky-400/10" />
    </div>
  );
};

const StatusIndicator = ({ color, label }) => (
  <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur">
    <span
      className="relative block h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }}
    >
      <span
        className="absolute inset-0 rounded-full opacity-60"
        style={{
          backgroundColor: color,
          animation: 'pulse 2.4s ease-out infinite'
        }}
      />
    </span>
    <p className="text-xs font-medium tracking-wide text-slate-200">{label}</p>
  </div>
);

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
  const inputWithIconClasses = 'h-12 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 pl-11 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30';
  const inputClasses = 'h-12 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30';

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
      tradingExperience: data.tradingExperience || 'beginner',
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
    <div className="min-h-screen bg-[#050611] text-white">
      <style>{`
        @keyframes orbit {
          from { transform: rotate(0deg) translateY(-50%); }
          to { transform: rotate(360deg) translateY(-50%); }
        }
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.8; }
          70% { transform: translate(-50%, -50%) scale(1.35); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0; }
        }
      `}</style>
      <div className="mx-auto flex min-h-screen w-full flex-col lg:flex-row">
        <div className="relative flex-[1.1] overflow-hidden bg-gradient-to-br from-[#0b1220] via-[#081733] to-[#160b36] px-10 py-14 sm:px-14 lg:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.22),_transparent_60%)]" />
          <div className="relative z-10 flex h-full flex-col justify-center gap-16">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200/80 backdrop-blur">
                Smart Algos
              </div>
              <div className="space-y-4">
                <h1 className="text-3xl font-semibold leading-snug md:text-4xl">
                  Build your trading edge.
                </h1>
                <p className="max-w-md text-sm text-slate-200/85 md:text-base">
                  Set up your institutional-grade account, configure compliance preferences, and unlock AI automation in minutes.
                </p>
              </div>
            </div>
            <AnimatedGlobe />
            <div className="grid w-full gap-4 text-sm md:grid-cols-3">
              <StatusIndicator color="#38bdf8" label="5 min onboarding" />
              <StatusIndicator color="#22c55e" label="KYC/AML ready" />
              <StatusIndicator color="#f97316" label="Dedicated support" />
            </div>
          </div>
        </div>

        <div className="flex w-full flex-[0.9] flex-col justify-center bg-[#050611] px-10 py-14 sm:px-14">
          <div className="mx-auto w-full max-w-[700px] space-y-8 lg:max-w-[55vw]">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold">Create your trading account</h2>
              <p className="text-sm text-slate-400">Secure onboarding. No spam.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">First name</label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register('firstName', {
                        required: 'First name is required',
                        minLength: { value: 2, message: 'Min 2 characters' },
                        maxLength: { value: 50, message: 'Max 50 characters' },
                      })}
                      className={`${inputWithIconClasses}`}
                      placeholder="Jane"
                    />
                    <User className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                  </div>
                  {errors.firstName && <p className="text-xs text-rose-400">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Last name</label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register('lastName', {
                        required: 'Last name is required',
                        minLength: { value: 2, message: 'Min 2 characters' },
                        maxLength: { value: 50, message: 'Max 50 characters' },
                      })}
                      className={`${inputWithIconClasses}`}
                      placeholder="Doe"
                    />
                    <User className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                  </div>
                  {errors.lastName && <p className="text-xs text-rose-400">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Email</label>
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
                    className={`${inputWithIconClasses}`}
                    placeholder="you@institutional.com"
                  />
                  <Mail className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                </div>
                {errors.email && <p className="text-xs text-rose-400">{errors.email.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Phone (optional)</label>
                  <div className="relative">
                    <input
                      type="tel"
                      {...register('phone', {
                        pattern: {
                          value: /^[\+]?[1-9][\d]{0,15}$/,
                          message: 'Invalid phone format. Use +1234567890',
                        },
                      })}
                      className={`${inputWithIconClasses}`}
                      placeholder="+1234567890"
                    />
                    <Phone className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                  </div>
                  {errors.phone && <p className="text-xs text-rose-400">{errors.phone.message}</p>}
                  <p className="text-xs text-slate-500">Used only for account recovery.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Country (optional)</label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register('country', {
                        maxLength: { value: 100, message: 'Max 100 characters' },
                      })}
                      className={`${inputWithIconClasses}`}
                      placeholder="United States"
                    />
                    <MapPin className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                  </div>
                  {errors.country && <p className="text-xs text-rose-400">{errors.country.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Trading experience</label>
                <select
                  {...register('tradingExperience', {
                    required: 'Please select your trading experience',
                  })}
                  className={`${inputClasses} appearance-none`}
                >
                  <option value="">Select experience level</option>
                  <option value="beginner">Beginner (0-1 years)</option>
                  <option value="intermediate">Intermediate (1-3 years)</option>
                  <option value="advanced">Advanced (3-5 years)</option>
                  <option value="expert">Expert (5+ years)</option>
                </select>
                {errors.tradingExperience && <p className="text-xs text-rose-400">{errors.tradingExperience.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Password</label>
                  <div className="relative">
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
                      className={`${inputWithIconClasses} pr-12`}
                      placeholder="Create a password"
                    />
                    <Lock className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-2.5 rounded-full p-1 text-slate-500 transition hover:text-sky-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && passwordStrength && (
                    <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-xs">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className={`h-full transition-all duration-300 ${
                            passwordStrength.color === 'red'
                              ? 'bg-rose-500'
                              : passwordStrength.color === 'yellow'
                              ? 'bg-amber-400'
                              : passwordStrength.color === 'blue'
                              ? 'bg-sky-400'
                              : 'bg-emerald-400'
                          }`}
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-slate-300">
                        <span className="font-medium text-slate-100">{passwordStrength.label}</span>
                        <span className="text-slate-400">{passwordStrength.feedback}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-slate-400">
                        <span className="flex items-center gap-1">
                          {passwordStrength.requirements.length ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-rose-400" />}
                          8+ characters
                        </span>
                        <span className="flex items-center gap-1">
                          {passwordStrength.requirements.hasLower ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-rose-400" />}
                          Lowercase
                        </span>
                        <span className="flex items-center gap-1">
                          {passwordStrength.requirements.hasUpper ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-rose-400" />}
                          Uppercase
                        </span>
                        <span className="flex items-center gap-1">
                          {passwordStrength.requirements.hasNumber ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-rose-400" />}
                          Number
                        </span>
                        <span className="col-span-2 flex items-center gap-1">
                          {passwordStrength.requirements.hasSpecial ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-rose-400" />}
                          Special character
                        </span>
                      </div>
                    </div>
                  )}
                  {errors.password && <p className="text-xs text-rose-400">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Confirm password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) => value === password || 'Passwords do not match',
                      })}
                      className={`${inputWithIconClasses} pr-12`}
                      placeholder="Repeat password"
                    />
                    <Lock className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-2.5 rounded-full p-1 text-slate-500 transition hover:text-sky-400"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-rose-400">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-1 h-5 w-5 flex-shrink-0 text-sky-400" />
                  <div className="space-y-1 text-sm text-slate-200/80">
                    <p>We comply with global KYC/AML policies to protect every account.</p>
                    <ul className="space-y-1 text-xs text-slate-400">
                      <li>• Identity verification may be requested after sign up.</li>
                      <li>• Trading activity is monitored to prevent fraud.</li>
                      <li>• You can update compliance preferences in your profile.</li>
                    </ul>
                  </div>
                </div>
                <label className="flex items-start gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={acceptedKYC}
                    onChange={(e) => setAcceptedKYC(e.target.checked)}
                    className="mt-0.5 rounded border-slate-600 bg-slate-800 text-sky-400 focus:ring-sky-500"
                  />
                  <span>I understand the regulatory requirements and agree to proceed.</span>
                </label>
                {!acceptedKYC && (
                  <p className="flex items-center gap-1 text-xs text-rose-400">
                    <AlertCircle className="h-3 w-3" />
                    Accept the compliance notice to continue.
                  </p>
                )}
              </div>

              <label className="flex items-start gap-2 text-xs text-slate-400">
                <input
                  type="checkbox"
                  {...register('terms', {
                    required: 'You must accept the terms and conditions',
                  })}
                  className="mt-0.5 rounded border-slate-600 bg-slate-800 text-sky-400 focus:ring-sky-500"
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="text-sky-400 hover:text-sky-300">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-sky-400 hover:text-sky-300">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.terms && <p className="text-xs text-rose-400">{errors.terms.message}</p>}

              <button
                type="submit"
                className="w-full rounded-full bg-white py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050611] focus:ring-white disabled:opacity-60"
                disabled={loading || !acceptedKYC}
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            {showOTPStep && (
              <div className="space-y-4 rounded-2xl border border-sky-500/30 bg-slate-900/80 px-6 py-6">
                <div className="space-y-2 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/20">
                    <Mail className="h-6 w-6 text-sky-300" />
                  </div>
                  <h3 className="text-lg font-semibold">Verify your email</h3>
                  <p className="text-sm text-slate-400">Enter the 6-digit code sent to {registrationEmail}.</p>
                </div>
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">Verification code</label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="h-14 w-full rounded-xl border border-slate-800 bg-slate-900 text-center text-2xl font-mono tracking-[0.75em] text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
                        autoFocus
                      />
                      <Key className="pointer-events-none absolute right-3 top-4 h-5 w-5 text-slate-500" />
                    </div>
                    <p className="text-xs text-slate-500">{otp.length}/6 digits entered.</p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full rounded-full bg-sky-500 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050611] focus:ring-sky-500 disabled:opacity-60"
                  >
                    {loading ? 'Verifying…' : 'Verify email'}
                  </button>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <span>Didn’t receive the code?</span>
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendingOTP}
                      className="inline-flex items-center gap-1 font-semibold text-sky-400 hover:text-sky-300 disabled:opacity-60"
                    >
                      {resendingOTP ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3" />
                          Resend code
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <p className="text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-sky-400 hover:text-sky-300">
                Sign in
              </Link>
            </p>
            <p className="text-center text-xs text-slate-600">
              © {new Date().getFullYear()} Smart Algos · AI Powered Trading Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
