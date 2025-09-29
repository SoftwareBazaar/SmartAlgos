import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const VISME_SCRIPT_URL = 'https://static-bundles.visme.co/forms/vismeforms-embed.js';

const animationStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-20px) scale(1.05); }
  }
  @keyframes float-delayed {
    0%, 100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-28px) scale(1.08); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-100px) rotate(-20deg); }
    to { opacity: 1; transform: translateX(0) rotate(-20deg); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(100px) rotate(20deg); }
    to { opacity: 1; transform: translateX(0) rotate(20deg); }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0) rotate(-20deg); }
    25% { transform: translateX(-2px) rotate(-22deg); }
    75% { transform: translateX(2px) rotate(-18deg); }
  }
  @keyframes drip {
    0% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(18px); }
  }
  @keyframes blink {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(0.12); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
  .animate-slide-in-left { animation: slideInLeft 0.4s ease-out forwards; }
  .animate-slide-in-right { animation: slideInRight 0.4s ease-out forwards; }
  .animate-shake { animation: shake 0.28s ease-in-out; }
  .animate-drip { animation: drip 0.9s ease-out forwards; }
  .animate-blink { animation: blink 0.3s ease-in-out; }
  .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
`;

export default function SmartAlgosLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [isTyping, setIsTyping] = useState(false);
  const [shakeHands, setShakeHands] = useState(false);

  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (window.innerWidth < 1024) {
      return;
    }

    const handleMouseMove = (event) => {
      if (!isPasswordFocused) {
        const x = (event.clientX / window.innerWidth - 0.5) * 20;
        const y = (event.clientY / window.innerHeight - 0.5) * 10;
        setEyePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPasswordFocused]);

  useEffect(() => {
    if (password.length > 0 && isPasswordFocused) {
      setIsTyping(true);
      setShakeHands(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
        setShakeHands(false);
      }, 320);
      return () => clearTimeout(timer);
    }
  }, [password, isPasswordFocused]);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      return;
    }

    const existingScript = document.querySelector(`script[src="${VISME_SCRIPT_URL}"]`);

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = VISME_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window?.VismeForms?.init) {
          window.VismeForms.init();
        }
      };
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  const handlePasswordFocus = () => {
    setIsPasswordFocused(true);
    setEyePosition({ x: 0, y: 0 });
  };

  const handlePasswordBlur = () => {
    setIsPasswordFocused(false);
    setEyePosition({ x: 0, y: 0 });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await login(email.trim(), password);
    if (result.success) {
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  };

  const goToRegister = () => navigate('/auth/register');

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex flex-col relative overflow-hidden">
      <style>{animationStyles}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="w-full py-6 px-4 bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/20 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center animate-pulse">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Smart Algos
            </h1>
          </div>
          <p className="text-slate-400 text-center mt-2 text-sm md:text-base">
            AI Powered Trading Excellence
          </p>
        </div>
      </div>

      <div className="flex-1 w-full flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-xl">
          <div className="bg-slate-800/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden">
            <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 p-10 relative overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute top-4 left-4 w-2 h-2 bg-white/40 rounded-full animate-ping" />
                <div className="absolute top-8 right-8 w-1 h-1 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-6 left-12 w-1.5 h-1.5 bg-white/50 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                <div className="absolute top-1/2 right-6 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-36 h-36 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center shadow-2xl mb-4 relative transition-all duration-500 ${isPasswordFocused ? 'scale-95' : 'scale-100'}`}>
                  <div
                    className={`absolute top-8 left-8 w-8 h-1 bg-slate-800 rounded-full transition-all duration-300 ${isPasswordFocused ? '-rotate-12 scale-90' : ''}`}
                    style={{ transform: isPasswordFocused ? 'rotate(-12deg) translateY(-2px)' : `translateX(${eyePosition.x * 0.3}px)` }}
                  />
                  <div
                    className={`absolute top-8 right-8 w-8 h-1 bg-slate-800 rounded-full transition-all duration-300 ${isPasswordFocused ? 'rotate-12 scale-90' : ''}`}
                    style={{ transform: isPasswordFocused ? 'rotate(12deg) translateY(-2px)' : `translateX(${eyePosition.x * 0.3}px)` }}
                  />

                  <div className="flex gap-8 mb-2">
                    <div className="relative w-7 h-7 bg-white rounded-full shadow-inner">
                      <div
                        className={`absolute bg-slate-800 rounded-full transition-all duration-300 ${isPasswordFocused ? 'w-7 h-1 top-3 left-0' : 'w-4 h-4 top-1.5 left-1.5'}`}
                        style={{ transform: !isPasswordFocused ? `translate(${eyePosition.x}px, ${eyePosition.y}px)` : 'none' }}
                      >
                        {!isPasswordFocused && (
                          <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        )}
                      </div>
                      {isPasswordFocused && <div className="absolute inset-0 bg-amber-200 rounded-full animate-blink" />}
                    </div>
                    <div className="relative w-7 h-7 bg-white rounded-full shadow-inner">
                      <div
                        className={`absolute bg-slate-800 rounded-full transition-all duration-300 ${isPasswordFocused ? 'w-7 h-1 top-3 left-0' : 'w-4 h-4 top-1.5 left-1.5'}`}
                        style={{ transform: !isPasswordFocused ? `translate(${eyePosition.x}px, ${eyePosition.y}px)` : 'none' }}
                      >
                        {!isPasswordFocused && (
                          <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        )}
                      </div>
                      {isPasswordFocused && <div className="absolute inset-0 bg-amber-200 rounded-full animate-blink" />}
                    </div>
                  </div>

                  <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-3 h-4 bg-amber-300 rounded-full" />

                  <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-300 ${isPasswordFocused ? 'w-6 h-6' : 'w-10 h-5'}`}>
                    {isPasswordFocused ? (
                      <div className="w-6 h-6 border-2 border-slate-800 rounded-full bg-slate-800/20" />
                    ) : (
                      <div className="w-10 h-5 border-b-4 border-slate-800 rounded-b-full" />
                    )}
                  </div>

                  {isPasswordFocused && (
                    <>
                      <div className="absolute top-16 left-4 w-6 h-4 bg-pink-300/60 rounded-full blur-sm animate-fade-in" />
                      <div className="absolute top-16 right-4 w-6 h-4 bg-pink-300/60 rounded-full blur-sm animate-fade-in" />
                    </>
                  )}

                  {isPasswordFocused && (
                    <>
                      <div className={`absolute top-10 left-4 w-14 h-10 bg-gradient-to-br from-amber-200 to-amber-300 rounded-2xl transform -rotate-20 shadow-lg ${shakeHands ? 'animate-shake' : 'animate-slide-in-left'}`}>
                        <div className="absolute -top-1 left-1 w-2 h-3 bg-amber-300 rounded-t-full" />
                        <div className="absolute -top-2 left-3 w-2 h-4 bg-amber-300 rounded-t-full" />
                        <div className="absolute -top-2 left-5 w-2 h-4 bg-amber-300 rounded-t-full" />
                        <div className="absolute -top-1 left-7 w-2 h-3 bg-amber-300 rounded-t-full" />
                      </div>
                      <div className={`absolute top-10 right-4 w-14 h-10 bg-gradient-to-br from-amber-200 to-amber-300 rounded-2xl transform rotate-20 shadow-lg ${shakeHands ? 'animate-shake' : 'animate-slide-in-right'}`}>
                        <div className="absolute -top-1 right-1 w-2 h-3 bg-amber-300 rounded-t-full" />
                        <div className="absolute -top-2 right-3 w-2 h-4 bg-amber-300 rounded-t-full" />
                        <div className="absolute -top-2 right-5 w-2 h-4 bg-amber-300 rounded-t-full" />
                        <div className="absolute -top-1 right-7 w-2 h-3 bg-amber-300 rounded-t-full" />
                      </div>
                    </>
                  )}

                  {isTyping && isPasswordFocused && (
                    <>
                      <div className="absolute top-6 right-8 w-2 h-3 bg-blue-300 rounded-full animate-drip" />
                      <div className="absolute top-8 right-10 w-1.5 h-2 bg-blue-300 rounded-full animate-drip" style={{ animationDelay: '0.18s' }} />
                    </>
                  )}
                </div>

                <div className="text-center space-y-2 min-h-[80px] flex flex-col items-center justify-center">
                  <h2 className={`text-3xl font-bold text-white transition-all duration-500 ${isPasswordFocused ? 'scale-95 opacity-90' : 'scale-100'}`}>
                    {isPasswordFocused ? 'Sorry, not looking!' : 'Welcome back trader!'}
                  </h2>
                  <p className="text-purple-100 text-center max-w-xs transition-all duration-300">
                    {isPasswordFocused
                      ? isTyping
                        ? 'Speed typing detected. Promise we are not peeking.'
                        : 'We will keep that password secret.'
                      : email.length > 0
                        ? `Great to see you, ${email.split('@')[0]}!`
                        : 'Let us set up profitable trades today.'}
                  </p>
                </div>
              </div>
            </div>

            <form className="p-8 space-y-5" onSubmit={handleSubmit}>
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="trader@smartalgos.com"
                    className="w-full px-4 py-3 pl-11 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all group-hover:border-slate-500"
                  />
                  <svg className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onFocus={handlePasswordFocus}
                    onBlur={handlePasswordBlur}
                    placeholder="**********"
                    className="w-full px-4 py-3 pl-11 bg-slate-700/50 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all group-hover:border-slate-500"
                  />
                  <svg className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-slate-300 cursor-pointer hover:text-white transition group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="mr-2 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="group-hover:translate-x-0.5 transition-transform">Remember me</span>
                </label>
                <Link to="/auth/forgot-password" className="text-purple-400 hover:text-purple-300 transition hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-600 text-white font-bold rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                disabled={loading}
              >
                <span className="relative z-10">{loading ? 'Signing in...' : 'Launch Trading Dashboard'}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800/40 text-slate-400">New to Smart Algos?</span>
                </div>
              </div>

              <button
                type="button"
                onClick={goToRegister}
                className="w-full py-3 bg-slate-700/50 border-2 border-slate-600 text-white font-semibold rounded-xl hover:bg-slate-700 hover:border-purple-500 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
              >
                Create Account
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-sm">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>256-bit SSL Encrypted • Your data is secure</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full py-4 px-4 bg-slate-900/80 backdrop-blur-xl border-t border-purple-500/20 relative z-10">
        <p className="text-center text-slate-400 text-xs md:text-sm">
          © 2025 Smart Algos • AI Powered Trading Platform
        </p>
      </div>
    </div>
  );
}

