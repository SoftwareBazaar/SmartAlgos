import React, { useCallback, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from 'lucide-react';
import FinancialGlobe from '../../components/animations/FinancialGlobe';

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

export default function SmartAlgosLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showCompliance, setShowCompliance] = useState(false);

  const { login, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterLogin = useCallback(() => {
    const redirectTo = location.state?.from?.pathname || '/dashboard';
    navigate(redirectTo, { replace: true });
  }, [location.state, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const result = await login(email.trim(), password);
    if (result.success) {
      redirectAfterLogin();
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    const result = await loginWithGoogle(credentialResponse.credential);
    if (result.success) {
      redirectAfterLogin();
    } else {
      setError(result.message || 'Google sign-in failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed. Please try again.');
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
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
        <div className="relative flex-[1.1] overflow-hidden bg-gradient-to-br from-[#0b1220] via-[#081733] to-[#160b36] px-10 py-10 sm:px-14 lg:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.22),_transparent_60%)]" />
          <div className="relative z-10 flex h-full flex-col justify-start gap-12 pt-6 lg:pt-8">
            <div className="space-y-6">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <img 
                  src="/logo.png" 
                  alt="Smart Algos" 
                  className="h-14 w-auto object-contain"
                  style={{ 
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))',
                    maxWidth: '140px',
                    height: 'auto'
                  }}
                  onError={(e) => {
                    console.error('Login logo failed to load from /logo.png');
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <div className="space-y-4">
                <h1 className="text-3xl font-semibold leading-snug md:text-4xl">
                  Empower your trading with Smart Algos.
                </h1>
                <p className="max-w-md text-sm text-slate-200/85 md:text-base">
                  AI-driven insights, secure execution, and ultra-fast global access—for hedge funds, quant traders, and institutional teams.
                </p>
              </div>
            </div>
            <FinancialGlobe size="lg" />
            <div className="grid w-full gap-4 text-sm md:grid-cols-3">
              <StatusIndicator color="#38bdf8" label="Real-time institutional streams" />
              <StatusIndicator color="#22c55e" label="Secure, compliant execution" />
              <StatusIndicator color="#f97316" label="24/7 trading support" />
            </div>
            <div className="grid gap-4 text-sm text-slate-200/80 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.25em] text-sky-300">Latency</p>
                <p className="mt-2 text-2xl font-semibold text-white">12ms</p>
                <p className="mt-1 text-xs text-slate-300/80">Average execution speed</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.25em] text-purple-300">Coverage</p>
                <p className="mt-2 text-2xl font-semibold text-white">140+</p>
                <p className="mt-1 text-xs text-slate-300/80">Markets monitored continuously</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Reliability</p>
                <p className="mt-2 text-2xl font-semibold text-white">99.9%</p>
                <p className="mt-1 text-xs text-slate-300/80">Signal uptime across desks</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-[0.9] flex-col justify-center bg-[#050611] px-10 py-14 sm:px-14">
          <div className="mx-auto w-full max-w-[700px] space-y-8 lg:max-w-[55vw] lg:mt-[-3rem]">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold">Sign in to Smart Algos</h2>
              <p className="text-sm text-slate-400">Use your verified email and password to access your account.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
                <div className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-200">
                  {error}
              </div>
            )}
            
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@institutional.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 pl-11 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
                  required
                />
                  <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                </div>
            </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 pl-11 pr-11 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
                  required
                />
                  <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <button
                  type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 rounded-full p-1 text-slate-500 transition hover:text-sky-400"
                >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
                className="w-full rounded-full bg-white py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050611] focus:ring-white disabled:opacity-60"
              disabled={loading}
            >
                {loading ? 'Signing you in…' : 'Sign in'}
            </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#050611] px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                text="signin_with"
                shape="pill"
                width="100%"
              />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-xs text-slate-400">
            <button
              type="button"
                onClick={() => setShowCompliance((prev) => !prev)}
                className="flex w-full items-center justify-between text-left font-medium text-slate-200 transition hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                  Regulatory compliance & risk notice
                </span>
                <span>{showCompliance ? 'Hide' : 'View'}</span>
            </button>
              {showCompliance && (
                <p className="mt-3 leading-relaxed">
                  Smart Algos enforces strict KYC/AML standards. By signing in you confirm that you are authorized to
                  access this platform and accept the financial risks involved. Activity may be monitored for compliance.
                </p>
              )}
            </div>

            <div className="space-y-3 text-center text-xs text-slate-500">
              <p>
                Need an account?{' '}
                <Link to="/auth/register" className="font-semibold text-sky-400 hover:text-sky-300">
                  Create one now
                </Link>
              </p>
              <p className="text-slate-500">
                By signing in you agree to our{' '}
                <Link to="/terms" className="text-sky-400 hover:text-sky-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-sky-400 hover:text-sky-300">
                  Privacy Policy
                </Link>
                .
              </p>
              <p className="text-slate-600">© {new Date().getFullYear()} Smart Algos · AI Powered Trading Platform</p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </GoogleOAuthProvider>
  );
}