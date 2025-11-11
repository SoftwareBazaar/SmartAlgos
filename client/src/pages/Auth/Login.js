import React, { useCallback, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

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
    <div className="relative h-80 w-80 md:h-96 md:w-96">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-500/10 via-sky-300/5 to-transparent blur-3xl" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-64 w-64 overflow-visible md:h-72 md:w-72">
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

export default function SmartAlgosLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [showCompliance, setShowCompliance] = useState(false);

  const { login, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterLogin = useCallback(() => {
    const redirectTo = location.state?.from?.pathname || '/dashboard';
    navigate(redirectTo, { replace: true });
  }, [location.state, navigate]);

  const handleGoogleSuccess = useCallback(
    async (credentialResponse) => {
      const credential = credentialResponse?.credential;
      try {
        if (!credential) {
          setGoogleError('Google did not return a credential. Please try again.');
          return;
        }
        setGoogleError('');
        const result = await loginWithGoogle(credential);
        if (result.success) {
          redirectAfterLogin();
        } else {
          setGoogleError(result.message || 'Unable to sign in with Google right now.');
        }
      } catch (err) {
        console.error('[Google Login] Error:', err);
        setGoogleError('Google login failed. Please try again.');
      }
    },
    [loginWithGoogle, redirectAfterLogin]
  );

  const handleGoogleError = useCallback(() => {
    setGoogleError('Google sign in failed. Please try again.');
  }, []);

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
                  Empower your trading with Smart Algos.
                </h1>
                <p className="max-w-md text-sm text-slate-200/85 md:text-base">
                  AI-driven insights, secure execution, and ultra-fast global access—for hedge funds, quant traders, and institutional teams.
                </p>
              </div>
            </div>
            <AnimatedGlobe />
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
              <p className="text-sm text-slate-400">Authenticate with Google or use your secure access credentials.</p>
            </div>

            <div className="space-y-3">
              {googleClientId ? (
                <>
                  <div className="flex w-full items-center justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      theme="outline"
                      text="continue_with"
                      shape="pill"
                      width="320"
                    />
                  </div>
                  {googleError && (
                    <p className="text-center text-xs font-medium text-rose-400">{googleError}</p>
                  )}
                </>
              ) : (
                <div className="rounded-lg border border-slate-800 bg-slate-900/80 px-4 py-3 text-center text-sm text-slate-300">
                  Google login is disabled on this build; contact support to enable OAuth.
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="h-px flex-1 bg-slate-800" />
              <span>Or continue with email</span>
              <span className="h-px flex-1 bg-slate-800" />
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
  );
}