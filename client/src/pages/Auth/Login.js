import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight } from 'lucide-react';

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default function SmartAlgosLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [showCompliance, setShowCompliance] = useState(false);

  const googleButtonRef = useRef(null);
  const googleInitialized = useRef(false);

  const { login, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterLogin = useCallback(() => {
    const redirectTo = location.state?.from?.pathname || '/dashboard';
    navigate(redirectTo, { replace: true });
  }, [location.state, navigate]);

  const handleGoogleCredential = useCallback(async (response) => {
    try {
      if (!response?.credential) {
        setGoogleError('Google did not return a credential. Please try again.');
        return;
      }
      setGoogleError('');
      const result = await loginWithGoogle(response.credential);
      if (result.success) {
        redirectAfterLogin();
      } else {
        setGoogleError(result.message || 'Unable to sign in with Google right now.');
      }
    } catch (err) {
      console.error('[Google Login] Error:', err);
      setGoogleError('Google login failed. Please try again.');
    }
  }, [loginWithGoogle, redirectAfterLogin]);

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    const renderGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential
      });
      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        width: 280
      });
      googleInitialized.current = true;
    };

    if (window.google && window.google.accounts && window.google.accounts.id) {
      renderGoogleButton();
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
      script.onload = renderGoogleButton;
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', renderGoogleButton);
    }

    return () => {
      if (script) {
        script.removeEventListener?.('load', renderGoogleButton);
      }
    };
  }, [handleGoogleCredential]);

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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900/95 to-slate-950 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl grid overflow-hidden rounded-3xl border border-slate-800 shadow-[0_30px_120px_-50px_rgba(56,189,248,0.45)] backdrop-blur">
        <div className="hidden bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-900/30 p-12 text-slate-200 lg:flex lg:flex-col lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300/90">
              <span className="block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Smart Algos
            </span>
            <h2 className="mt-6 text-3xl font-semibold leading-tight text-white">
              Institutional-grade trading intelligence, now one tap away.
            </h2>
            <p className="mt-4 text-sm text-slate-300/80">
              Sign in to access real-time strategies, portfolio automation, and AI-driven risk controls. Switch between Google and secure email sign-in anytime.
            </p>
          </div>
          <div className="mt-12 space-y-4 text-sm text-slate-300/80">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              <p>Latency-monitored execution across FX, indices, and commodities.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
              <p>Granular compliance logging to satisfy institutional KYC/AML requirements.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-violet-400" />
              <p>AI portfolio coach that adapts to your risk appetite in real-time.</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/90 p-10 sm:p-12">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
                <p className="mt-1 text-sm text-slate-400">Sign in to continue to your trading console</p>
              </div>
              <Link
                to="/"
                className="hidden text-xs font-medium text-slate-400 transition-colors hover:text-slate-200 sm:flex items-center gap-1"
              >
                Go home <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {googleClientId ? (
                <>
                  <div ref={googleButtonRef} className="flex items-center justify-center" />
                  <button
                    type="button"
                    onClick={() => {
                      if (googleInitialized.current) {
                        window.google?.accounts?.id?.prompt();
                      }
                    }}
                    className="w-full text-xs font-medium text-slate-500 transition-colors hover:text-slate-200"
                  >
                    Having trouble with the button? Try again
                  </button>
                </>
              ) : (
                <div className="rounded-lg border border-slate-800/70 bg-slate-900/70 px-4 py-3 text-center text-sm text-slate-400">
                  Google login is not configured yet. Ask an administrator to set <span className="font-semibold">GOOGLE_CLIENT_ID</span>.
                </div>
              )}
              {googleError && (
                <p className="text-center text-xs font-medium text-rose-400">{googleError}</p>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="h-px flex-1 bg-slate-800/80" />
              <span>or continue with email</span>
              <span className="h-px flex-1 bg-slate-800/80" />
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-200">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Email address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="trader@smartalgos.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-800/80 bg-slate-900/80 px-4 py-3 pl-11 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                    required
                  />
                  <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                </div>
              </div>

              <div className="space-y-2">
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
                    className="w-full rounded-xl border border-slate-800/80 bg-slate-900/80 px-4 py-3 pl-11 pr-11 text-sm text-white placeholder-slate-500 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40"
                    required
                  />
                  <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 rounded-full p-1 text-slate-500 transition-colors hover:text-sky-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:shadow-sky-500/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Signing you in...' : 'Launch trading dashboard'}
              </button>
            </form>

            <div className="rounded-xl border border-slate-800/80 bg-slate-900/70 px-4 py-3 text-xs text-slate-400">
              <button
                type="button"
                onClick={() => setShowCompliance((prev) => !prev)}
                className="flex w-full items-center justify-between text-left font-medium text-slate-300 transition hover:text-slate-100"
              >
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-400" />
                  Regulatory compliance notice
                </span>
                <span>{showCompliance ? 'Hide' : 'View'}</span>
              </button>
              {showCompliance && (
                <p className="mt-2 leading-relaxed text-slate-400">
                  Smart Algos operates under strict KYC/AML protocols. By signing in you confirm you are an authorized
                  user and accept the associated trading risks. Activity may be monitored for regulatory compliance.
                </p>
              )}
            </div>

            <div className="space-y-3 text-center text-xs text-slate-500">
              <p>
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
              <p className="text-slate-400">
                Need an account?{' '}
                <Link to="/auth/register" className="font-semibold text-sky-400 hover:text-sky-300">
                  Create one now
                </Link>
              </p>
              <p className="text-slate-500">© {new Date().getFullYear()} Smart Algos · AI Powered Trading Platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}