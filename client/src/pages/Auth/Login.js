import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const heroImage =
  'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?auto=format&fit=crop&w=1600&q=80';

export default function SmartAlgosLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [showCompliance, setShowCompliance] = useState(false);

  const googleButtonRef = useRef(null);
  const googleReady = useRef(false);

  const { login, loginWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterLogin = useCallback(() => {
    const redirectTo = location.state?.from?.pathname || '/dashboard';
    navigate(redirectTo, { replace: true });
  }, [location.state, navigate]);

  const handleGoogleCredential = useCallback(
    async (response) => {
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
    },
    [loginWithGoogle, redirectAfterLogin]
  );

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
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        width: 320
      });
      googleReady.current = true;
    };

    if (window.google?.accounts?.id) {
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
      script?.removeEventListener?.('load', renderGoogleButton);
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
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen flex-col lg:flex-row">
        <div className="relative flex-1 overflow-hidden">
          <img
            src={heroImage}
            alt="Smart trading interface"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-900/85" />
          <div className="relative z-10 flex h-full flex-col justify-between px-10 pb-12 pt-14 lg:px-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-medium text-slate-200 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="space-y-6">
              <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
                Look first. Then leap.
              </h1>
              <p className="max-w-md text-sm text-slate-200/80 md:text-base">
                Seamless access to AI-powered signals, institutional analytics, and automated execution. Sign in,
                align your risk, and deploy strategies within seconds.
              </p>
            </div>
            <div className="space-y-4 text-xs text-slate-200/70">
              <p>• AI-curated market snapshots each session</p>
              <p>• Institutional-grade compliance and logging</p>
              <p>• 24/7 monitoring across FX, indices, and crypto</p>
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-lg flex-col justify-center bg-slate-950 px-8 py-12 sm:px-12">
          <div className="mx-auto w-full max-w-md space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Sign in to Smart Algos</h2>
              <p className="text-sm text-slate-400">Use Google or your secure trading credentials.</p>
            </div>

            <div className="space-y-3">
              {googleClientId ? (
                <>
                  <div ref={googleButtonRef} className="flex w-full items-center justify-center" />
                  {googleError && (
                    <p className="text-center text-xs font-medium text-rose-400">{googleError}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => googleReady.current && window.google?.accounts?.id?.prompt()}
                    className="w-full text-xs font-medium text-slate-400 transition hover:text-white"
                  >
                    Button missing? Click to retry Google sign in.
                  </button>
                </>
              ) : (
                <div className="rounded-lg border border-slate-800 bg-slate-900/80 px-4 py-3 text-center text-sm text-slate-300">
                  Google login is not yet configured. Ask an administrator to set <span className="font-semibold">GOOGLE_CLIENT_ID</span>.
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
                className="w-full rounded-full bg-white py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-white disabled:opacity-60"
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
                  Smart Algos enforces strict KYC/AML standards. By signing in you confirm that you are authorized
                  to access this platform and accept the financial risks involved. Activity may be monitored for
                  compliance.
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