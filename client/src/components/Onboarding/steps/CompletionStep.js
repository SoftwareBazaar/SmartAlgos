import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, Rocket, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import Card from '../../UI/Card';
import Button from '../../UI/Button';

const CompletionStep = ({ user, onNavigate, onComplete }) => {
  const nextSteps = [
    {
      icon: TrendingUp,
      title: 'Browse EA Marketplace',
      description: 'Discover powerful Expert Advisors',
      action: () => onNavigate('/ea-marketplace'),
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Zap,
      title: 'View Trading Signals',
      description: 'Get AI-powered trading insights',
      action: () => onNavigate('/signals'),
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Sparkles,
      title: 'Create Portfolio',
      description: 'Start tracking your trades',
      action: () => onNavigate('/portfolio'),
      color: 'from-primary-500 to-primary-600',
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-6"
        >
          <CheckCircle className="h-12 w-12 text-white" />
        </motion.div>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          You're All Set{user?.first_name ? `, ${user.first_name}` : ''}!
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          You're ready to start trading smarter with Smart Algos. Here are some great ways to get started.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {nextSteps.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 hover:border-primary-500/50 transition-all hover:shadow-xl group cursor-pointer">
              <div
                onClick={step.action}
                className="flex flex-col items-center text-center"
              >
                <div className={`p-4 bg-gradient-to-br ${step.color} rounded-full mb-4 group-hover:scale-110 transition-transform`}>
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {step.description}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="w-full"
                >
                  Get Started
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 p-6 bg-gradient-to-r from-primary-50 via-blue-50 to-purple-50 dark:from-primary-900/20 dark:via-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-primary-200 dark:border-primary-800"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Rocket className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          <p className="font-semibold text-gray-900 dark:text-white text-lg">
            Ready to start trading?
          </p>
        </div>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
          You can always access help and tutorials from the Help menu or restart this tour from Settings.
        </p>
        <div className="flex justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={onComplete}
            icon={CheckCircle}
            iconPosition="right"
            className="px-8"
          >
            Start Trading
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default CompletionStep;

