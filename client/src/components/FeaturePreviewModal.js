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
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <Card className="bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-2 border-primary-200 dark:border-primary-800 shadow-2xl overflow-hidden">
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 dark:from-primary-700 dark:via-primary-600 dark:to-primary-700 p-4 sm:p-5">
                  <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="flex items-start space-x-3 sm:space-x-4 pr-8">
                    <div className="p-2 sm:p-2.5 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
                      <div className="text-white scale-90 sm:scale-100">
                        {feature.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1.5">
                        <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                          {feature.title}
                        </h2>
                        {feature.isPremium && (
                          <span className="px-1.5 py-0.5 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded flex-shrink-0">
                            PREMIUM
                          </span>
                        )}
                      </div>
                      <p className="text-primary-100 text-xs sm:text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                  {/* Key Benefits */}
                  {feature.benefits && (
                    <div className="mb-4 sm:mb-5">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Key Benefits
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {feature.benefits.map((benefit, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-start space-x-2"
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-4 h-4 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
                                <Check className="h-2.5 w-2.5 text-success-600 dark:text-success-400" />
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {benefit}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats/Highlights */}
                  {feature.stats && (
                    <div className="mb-4 sm:mb-5">
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {feature.stats.map((stat, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.05 }}
                            className="text-center p-2.5 sm:p-3 bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg border border-primary-200 dark:border-primary-800"
                          >
                            <div className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400 mb-0.5">
                              {stat.value}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                              {stat.label}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feature Details */}
                  {feature.details && (
                    <div className="mb-4 sm:mb-5">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2.5">
                        What You Get
                      </h3>
                      <div className="space-y-2">
                        {feature.details.map((detail, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <TrendingUp className="h-4 w-4 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trust Indicators */}
                  <div className="mb-4 sm:mb-5 p-3 bg-success-50 dark:bg-success-900/10 rounded-lg border border-success-200 dark:border-success-800">
                    <div className="flex items-center space-x-2 mb-1.5">
                      <Star className="h-4 w-4 text-success-600 dark:text-success-400 fill-current" />
                      <span className="text-xs sm:text-sm font-semibold text-success-900 dark:text-success-100">
                        Trusted by Professional Traders
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-success-700 dark:text-success-300 leading-relaxed">
                      Join thousands of traders using {feature.title} to optimize their trading strategies and maximize returns.
                    </p>
                  </div>

                  {/* CTA Section */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-5">
                    <div className="mb-3 sm:mb-4">
                      <div className="flex items-center space-x-2 mb-1.5">
                        <Lock className="h-4 w-4 text-gray-400" />
                        <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                          Access Required
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-500">
                        Sign in or create an account to access this feature
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button
                        onClick={handleGetAccess}
                        className="flex-1 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white shadow-lg hover:shadow-xl transition-all text-sm"
                        size="md"
                      >
                        <Download className="h-4 w-4 mr-1.5" />
                        Create Free Account
                        <ArrowRight className="h-4 w-4 ml-1.5" />
                      </Button>
                      <Button
                        onClick={handleSignIn}
                        variant="outline"
                        className="flex-1 text-sm"
                        size="md"
                      >
                        Sign In
                      </Button>
                    </div>

                    <p className="text-[10px] sm:text-xs text-center text-gray-500 dark:text-gray-500 mt-3">
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

