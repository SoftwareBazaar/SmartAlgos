import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, TrendingUp, Download, Lock, ArrowRight, Star } from 'lucide-react';
import Card from './UI/Card';
import Button from './UI/Button';

const FeaturePreviewModal = ({ isOpen, onClose, feature }) => {
  const navigate = useNavigate();

  if (!feature) return null;

  const handleGetAccess = () => {
    onClose();
    navigate('/auth/register', { state: { redirectTo: feature.link } });
  };

  const handleSignIn = () => {
    onClose();
    navigate('/auth/login', { state: { redirectTo: feature.link } });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-4xl"
            >
              <Card className="bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-2 border-primary-200 dark:border-primary-800 shadow-2xl overflow-hidden">
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 dark:from-primary-700 dark:via-primary-600 dark:to-primary-700 p-6 sm:p-8">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="flex items-start space-x-4 sm:space-x-6">
                    <div className="p-3 sm:p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white">
                          {feature.title}
                        </h2>
                        {feature.isPremium && (
                          <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded">
                            PREMIUM
                          </span>
                        )}
                      </div>
                      <p className="text-primary-100 text-sm sm:text-base">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8">
                  {/* Key Benefits */}
                  {feature.benefits && (
                    <div className="mb-6 sm:mb-8">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Key Benefits
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {feature.benefits.map((benefit, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start space-x-3"
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-5 h-5 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                                <Check className="h-3 w-3 text-success-600 dark:text-success-400" />
                              </div>
                            </div>
                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                              {benefit}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats/Highlights */}
                  {feature.stats && (
                    <div className="mb-6 sm:mb-8">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {feature.stats.map((stat, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg border border-primary-200 dark:border-primary-800"
                          >
                            <div className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                              {stat.value}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              {stat.label}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feature Details */}
                  {feature.details && (
                    <div className="mb-6 sm:mb-8">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                        What You Get
                      </h3>
                      <div className="space-y-2 sm:space-y-3">
                        {feature.details.map((detail, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <TrendingUp className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                              {detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trust Indicators */}
                  <div className="mb-6 sm:mb-8 p-4 bg-success-50 dark:bg-success-900/10 rounded-lg border border-success-200 dark:border-success-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="h-5 w-5 text-success-600 dark:text-success-400 fill-current" />
                      <span className="text-sm font-semibold text-success-900 dark:text-success-100">
                        Trusted by Professional Traders
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-success-700 dark:text-success-300">
                      Join thousands of traders using {feature.title} to optimize their trading strategies and maximize returns.
                    </p>
                  </div>

                  {/* CTA Section */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6 sm:pt-8">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Lock className="h-5 w-5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Access Required
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                          Sign in or create an account to access this feature
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Button
                        onClick={handleGetAccess}
                        className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white shadow-lg hover:shadow-xl transition-all"
                        size="lg"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Create Free Account
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                      <Button
                        onClick={handleSignIn}
                        variant="outline"
                        className="flex-1"
                        size="lg"
                      >
                        Sign In
                      </Button>
                    </div>

                    <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-4">
                      No credit card required • Free account includes limited access
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FeaturePreviewModal;

