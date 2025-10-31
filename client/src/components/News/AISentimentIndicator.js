/**
 * AI-Powered Sentiment Indicator Component
 * Displays market sentiment analysis with visual indicators
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const AISentimentIndicator = ({ sentiment, confidence, explanation, source }) => {
  const getSentimentConfig = () => {
    switch (sentiment?.toLowerCase()) {
      case 'bullish':
      case 'positive':
        return {
          icon: TrendingUp,
          color: 'text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-900',
          borderColor: 'border-green-500',
          label: 'Bullish'
        };
      case 'bearish':
      case 'negative':
        return {
          icon: TrendingDown,
          color: 'text-red-500',
          bgColor: 'bg-red-100 dark:bg-red-900',
          borderColor: 'border-red-500',
          label: 'Bearish'
        };
      default:
        return {
          icon: Minus,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          borderColor: 'border-gray-500',
          label: 'Neutral'
        };
    }
  };

  const config = getSentimentConfig();
  const Icon = config.icon;
  const confidencePercent = Math.round((confidence || 0) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`border-l-4 ${config.borderColor} ${config.bgColor} p-4 rounded-r-lg mb-4`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                AI Sentiment: {config.label}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${config.bgColor} ${config.color}`}>
                {confidencePercent}% confidence
              </span>
            </div>
            {explanation && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                <strong>Why this matters:</strong> {explanation}
              </p>
            )}
            {source && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Analysis powered by AI • Source: {source}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AISentimentIndicator;

