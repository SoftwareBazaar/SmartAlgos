/**
 * Market Summary Banner Component
 * Shows daily market bias and key events summary
 */

import React from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../UI/Card';

const MarketSummaryBanner = ({ marketBias, keyEvents, sentiment }) => {
  const getBiasConfig = () => {
    switch (marketBias?.toLowerCase()) {
      case 'risk-on':
        return {
          icon: TrendingUp,
          color: 'text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-900',
          label: 'Risk-On'
        };
      case 'risk-off':
        return {
          icon: TrendingDown,
          color: 'text-red-500',
          bgColor: 'bg-red-100 dark:bg-red-900',
          label: 'Risk-Off'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900',
          label: 'Neutral'
        };
    }
  };

  const biasConfig = getBiasConfig();
  const BiasIcon = biasConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-800">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${biasConfig.bgColor}`}>
                <BiasIcon className={`h-6 w-6 ${biasConfig.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Today's Market Bias
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {biasConfig.label}
                </h2>
                {sentiment && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Overall sentiment: {sentiment}
                  </p>
                )}
              </div>
            </div>

            {keyEvents && keyEvents.length > 0 && (
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Key Events Today
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {keyEvents.length} high-impact event{keyEvents.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            )}
          </div>

          {keyEvents && keyEvents.length > 0 && (
            <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
              <div className="flex flex-wrap gap-2">
                {keyEvents.slice(0, 5).map((event, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-700"
                  >
                    {event}
                  </span>
                ))}
                {keyEvents.length > 5 && (
                  <span className="px-3 py-1 text-gray-600 dark:text-gray-400 text-xs">
                    +{keyEvents.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default MarketSummaryBanner;

