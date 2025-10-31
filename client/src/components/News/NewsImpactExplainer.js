/**
 * News Impact Explainer Component
 * Shows why a news item matters and potential market impacts
 */

import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NewsImpactExplainer = ({ newsItem, marketImpact }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!marketImpact && !newsItem?.ai_analysis) {
    return null;
  }

  const impact = marketImpact || newsItem.ai_analysis?.impact || {};
  const potentialMoves = impact.potentialMoves || [];
  const affectedPairs = impact.affectedPairs || [];
  const timeframe = impact.timeframe || 'Short-term';

  return (
    <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
      >
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          <span>Why this matters for traders</span>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-3"
          >
            {impact.explanation && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {impact.explanation}
              </p>
            )}

            {affectedPairs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Affected Markets:
                </p>
                <div className="flex flex-wrap gap-2">
                  {affectedPairs.map((pair, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                    >
                      {pair}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {potentialMoves.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Potential Market Moves:
                </p>
                <ul className="space-y-1">
                  {potentialMoves.map((move, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      {move.direction === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                      ) : move.direction === 'down' ? (
                        <TrendingDown className="h-4 w-4 text-red-500 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      )}
                      <span>{move.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span>Expected impact timeframe: {timeframe}</span>
              <span className="text-blue-600 dark:text-blue-400">•</span>
              <span>AI-Generated Analysis</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewsImpactExplainer;

