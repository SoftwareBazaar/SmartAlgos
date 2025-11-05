import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Bell, Target, TrendingUp, TrendingDown, Clock, ArrowRight } from 'lucide-react';
import Card from '../../UI/Card';
import Button from '../../UI/Button';

const SignalsStep = ({ onNavigate }) => {
  const signalTypes = [
    {
      icon: TrendingUp,
      title: 'BUY Signals',
      description: 'AI-identified entry opportunities',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      icon: TrendingDown,
      title: 'SELL Signals',
      description: 'Exit points and profit-taking alerts',
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      icon: Target,
      title: 'Price Targets',
      description: 'Confidence scores and risk/reward ratios',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Clock,
      title: 'Real-Time Alerts',
      description: 'Instant notifications for market movements',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/10 dark:bg-primary-400/20 rounded-full mb-4">
          <Activity className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          AI-Powered Trading Signals
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Get intelligent trading signals based on advanced market analysis
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {signalTypes.map((signal, index) => (
          <motion.div
            key={signal.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-4 ${signal.bgColor} border-2 hover:shadow-lg transition-all`}>
              <div className="flex items-start space-x-3">
                <div className={`p-2 bg-white dark:bg-gray-800 rounded-lg ${signal.color}`}>
                  <signal.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {signal.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {signal.description}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-start space-x-3">
          <Bell className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white mb-1">
              Smart Notifications
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Configure alerts for signals matching your criteria. Get notified via email, SMS, or in-app notifications.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/signals')}
              icon={ArrowRight}
              iconPosition="right"
            >
              View Signals
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignalsStep;

