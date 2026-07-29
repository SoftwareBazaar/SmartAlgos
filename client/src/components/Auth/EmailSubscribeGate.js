import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, CheckCircle, Loader, X } from 'lucide-react';

const STORAGE_KEY = 'algosmart_subscriber_email';

/**
 * EmailSubscribeGate
 *
 * Wraps gated content. If the visitor has not subscribed (given their email),
 * it shows a modal/overlay prompting them to subscribe. Once they submit,
 * the email is stored in localStorage and the content is revealed.
 *
 * Props:
 *  - children: the gated content to show after subscribing
 *  - title: headline shown in the gate overlay (default: "Subscribe to Access")
 *  - description: sub-text (default provided)
 *  - preview: optional JSX rendered above the gate blur so visitors see a teaser
 *  - className: extra classes on the wrapper
 */
const EmailSubscribeGate = ({
  children,
  title = 'Subscribe to Access',
  description = 'Enter your email to unlock strategies, analysis, and more exclusive content — no account needed.',
  preview = null,
  className = '',
}) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setIsSubscribed(true);
    }
  }, []);

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Attempt to notify the backend (non-blocking — works even if endpoint is absent)
      try {
        await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      } catch {
        // Silently ignore network errors — we still unlock content locally
      }

      localStorage.setItem(STORAGE_KEY, email);
      setSuccess(true);

      setTimeout(() => {
        setIsSubscribed(true);
      }, 1200);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Already subscribed — show content directly
  if (isSubscribed) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Teaser / preview visible above the gate */}
      {preview && (
        <div className="relative">
          {preview}
          {/* Fade-out gradient over the preview */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent pointer-events-none" />
        </div>
      )}

      {/* Blurred content placeholder (only shown when no preview) */}
      {!preview && (
        <div className="relative overflow-hidden rounded-xl">
          <div className="filter blur-sm select-none pointer-events-none opacity-40 max-h-48 overflow-hidden">
            {children}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/80 dark:via-gray-900/80 to-gray-50 dark:to-gray-900" />
        </div>
      )}

      {/* Gate card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative mt-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center mx-auto max-w-md"
      >
        {/* Lock icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center">
            {success ? (
              <CheckCircle className="h-7 w-7 text-green-500" />
            ) : (
              <Lock className="h-7 w-7 text-primary-600 dark:text-primary-400" />
            )}
          </div>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              You're in!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Unlocking content for you now...
            </p>
          </motion.div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              {description}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-xs text-left">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    <span>Subscribe &amp; Unlock</span>
                  </>
                )}
              </button>
            </form>

            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              No spam. Unsubscribe anytime. Already have an account?{' '}
              <a href="/auth/login" className="text-primary-600 hover:underline font-medium">
                Sign in
              </a>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default EmailSubscribeGate;
