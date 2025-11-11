import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from 'lucide-react';
import FinancialGlobe from '../../components/animations/FinancialGlobe';

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

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

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 10.2v4.08h5.78c-.25 1.32-1.75 3.88-5.78 3.88a6.68 6.68 0 0 1 0-13.36 5.82 5.82 0 0 1 4.1 1.6l2.77-2.67A9.64 9.64 0 0 0 12 2a10 10 0 1 0 0 20c5.76 0 9.6-4 9.6-9.64a8.78 8.78 0 0 0-.16-1.76Z"
      fill="#4285F4"
    />
    <path d="M3.16 7.36 6.38 9.72A4 4 0 0 1 9.6 7.64a4 4 0 0 1 2.4.8l2.93-2.93A8.84 8.84 0 0 0 9.6 4 10 10 0 0 0 3.16 7.36Z" fill="#EA4335" />
    <path d="M12 20c2.72 0 5-1 6.7-2.68l-3.1-2.42a4.43 4.43 0 0 1-3.6 1.08 4.41 4.41 0 0 1-3.4-2.5l-3.2 2.5A9.84 9.84 0 0 0 12 20Z" fill="#34A853" />
    <path d="M3.2 7.36a10 10 0 0 0 0 9.28l3.2-2.5a4.33 4.33 0 0 1 0-4.3Z" fill="#FBBC04" />
  </svg>
);

export default function SmartAlgosLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [showCompliance, setShowCompliance] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const googleInitialized = useRef(false);

  const { login, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterLogin = useCallback(() => {
    const redirectTo = location.state?.from?.pathname || '/dashboard';
    navigate(redirectTo, { replace: true });
  }, [location.state, navigate]);

  const handleGoogleCredential = useCallback(
    async (credentialResponse) => {
      console.info('[Google Login] Credential callback received', {
        hasCredential: Boolean(credentialResponse?.credential),
        clientId: credentialResponse?.clientId,
        select_by: credentialResponse?.select_by
      });
      const credential = credentialResponse?.credential;
      try {
        if (!credential) {
          setGoogleError('Google did not return a credential. Please try again.');
          console.warn('[Google Login] Missing credential field in response');
          return;
        }
        setGoogleError('');
        const result = await loginWithGoogle(credential);
        if (result.success) {
          console.info('[Google Login] Backend authentication succeeded');
          redirectAfterLogin();
        } else {
          console.error('[Google Login] Backend authentication failed', result);
          setGoogleError(result.message || 'Unable to sign in with Google right now.');
        }
      } catch (err) {
        console.error('[Google Login] Error during login flow:', err);
        setGoogleError('Google login failed. Please try again.');
      }
    },
    [loginWithGoogle, redirectAfterLogin]
  );

  useEffect(() => {
    if (!googleClientId) {
      console.warn('[Google Login] Google client ID missing; button disabled.');
      return;
    }

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) {
        console.error('[Google Login] Google Identity Services unavailable after script load');
        setGoogleError('Google sign in is unavailable right now. Please retry shortly.');
        return;
      }

      if (!googleInitialized.current) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredential,
          context: 'signin',
          ux_mode: 'popup',
          itp_support: true
        });
        googleInitialized.current = true;
        setGoogleReady(true);
        console.info('[Google Login] Google Identity initialized successfully');
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const scriptId = 'google-identity-services';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      script.onerror = () => {
        console.error('[Google Login] Failed to load Google Identity script');
        setGoogleError('Unable to load Google sign in. Please check your network and try again.');
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', initializeGoogle);
    }

    return () => {
      script?.removeEventListener?.('load', initializeGoogle);
    };
  }, [handleGoogleCredential]);

  const handleGoogleButtonClick = useCallback(() => {
    console.info('[Google Login] Sign-in button clicked');
    setGoogleError('');

    if (!googleInitialized.current) {
      console.warn('[Google Login] Google Identity not ready yet');
      setGoogleError('Google sign in is still initializing. Please retry in a moment.');
      return;
    }

    const google = window.google;
    if (!google?.accounts?.id) {
      console.error('[Google Login] Google Identity object missing at click time');
      setGoogleError('Google sign in is unavailable right now. Please refresh and try again.');
      return;
    }

    google.accounts.id.prompt((notification) => {
      if (notification?.isNotDisplayed?.()) {
        console.warn('[Google Login] Prompt not displayed', notification.getNotDisplayedReason?.());
        setGoogleError('Google sign in popup was blocked. Please disable popup blockers and retry.');
      } else if (notification?.isSkippedMoment?.()) {
        console.warn('[Google Login] Prompt skipped', notification.getSkippedReason?.());
      } else if (notification?.isDismissedMoment?.()) {
        console.info('[Google Login] Prompt dismissed', notification.getDismissedReason?.());
      } else {
        console.info('[Google Login] Prompt displayed successfully');
      }
    }, { prompt_parent_id: 'google-signin-prompt' });
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
        <div className="relative flex-[1.1] overflow-hidden bg-gradient-to-br from-[#0b1220] via-[#081733] to-[#160b36] px-10 py-10 sm:px-14 lg:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.22),_transparent_60%)]" />
          <div className="relative z-10 flex h-full flex-col justify-start gap-12 pt-6 lg:pt-8">
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
              <p className="text-sm text-slate-400">Authenticate with Google or use your secure access credentials.</p>
            </div>

            <div className="space-y-3">
              {googleClientId ? (
                <>
                  <div id="google-signin-prompt" className="flex w-full items-center justify-center">
                    <button
                      type="button"
                      onClick={handleGoogleButtonClick}
                      disabled={!googleReady}
                      className="flex w-full max-w-[320px] items-center justify-center gap-3 rounded-full border border-slate-700 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050611] focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="flex items-center justify-center rounded-full bg-white">
                        <GoogleIcon />
                      </span>
                      <span>Continue with Google</span>
                    </button>
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