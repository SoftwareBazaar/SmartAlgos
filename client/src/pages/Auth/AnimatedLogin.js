import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AnimatedLogin = () => {
  const isEmbedEnabled = process.env.REACT_APP_VISME_EMBED_ENABLED === 'true';
  const [embedStatus, setEmbedStatus] = useState(isEmbedEnabled ? 'loading' : 'disabled');

  useEffect(() => {
    if (!isEmbedEnabled) {
      setEmbedStatus('disabled');
      return;
    }

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      setEmbedStatus('error');
      return;
    }

    setEmbedStatus('loading');

    let isCancelled = false;
    const scriptId = 'visme-animated-login-script';

    const handleLoad = () => {
      if (isCancelled) {
        return;
      }

      try {
        if (window.vismeForms) {
          window.vismeForms.init?.();
          window.vismeForms.setupVisme?.();
          setEmbedStatus('ready');
        } else {
          setEmbedStatus('error');
        }
      } catch (error) {
        console.error('Animated login embed init failed:', error);
        setEmbedStatus('error');
      }
    };

    const handleError = (event) => {
      if (isCancelled) {
        return;
      }

      console.error('Animated login embed failed to load:', event?.error || event);
      setEmbedStatus('error');
    };

    if (window.vismeForms) {
      handleLoad();
    } else {
      let script = document.getElementById(scriptId);

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://static-bundles.visme.co/forms/vismeforms-embed.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.addEventListener('load', handleLoad);
        script.addEventListener('error', handleError);
        document.body.appendChild(script);
      } else {
        script.addEventListener('load', handleLoad, { once: true });
        script.addEventListener('error', handleError, { once: true });
      }
    }

    return () => {
      isCancelled = true;
      const script = document.getElementById(scriptId);

      if (script) {
        script.removeEventListener('load', handleLoad);
        script.removeEventListener('error', handleError);
      }
    };
  }, [isEmbedEnabled]);

  const helperText = embedStatus === 'error'
    ? 'Interactive login failed to load. Please use the secure login instead.'
    : embedStatus === 'disabled'
      ? 'Animated experience is unavailable in this environment. Please use the secure login instead.'
      : 'Loading animated experience...';

  const showSpinner = embedStatus !== 'error' && embedStatus !== 'disabled';

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div
          className="visme_d h-full"
          data-title="Webinar Registration Form"
          data-url="g7ddqxx0-untitled-project?fullPage=true"
          data-domain="forms"
          data-full-page="true"
          data-min-height="100vh"
          data-form-id="133190"
          style={{ minHeight: '520px' }}
        >
          <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl border-2 border-dashed border-gray-300 p-10 text-center">
            <p className="text-gray-500 mb-4">{helperText}</p>
            {showSpinner ? (
              <div className="h-8 w-8 border-b-2 border-gray-400 rounded-full animate-spin" />
            ) : (
              <Link
                to="/auth/secure-login"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go to secure login
              </Link>
            )}
          </div>
        </div>
        <div className="mt-6 text-center text-gray-600">
          <p className="mb-1">Need the classic secure login?</p>
          <Link
            to="/auth/secure-login"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go to secure login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AnimatedLogin;
