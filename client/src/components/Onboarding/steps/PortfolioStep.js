import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, BarChart3, PieChart, TrendingUp, Eye, ArrowRight } from 'lucide-react';
import Card from '../../UI/Card';
import Button from '../../UI/Button';

const PortfolioStep = ({ onNavigate }) => {
  const portfolioFeatures = [
    {
      icon: BarChart3,
      title: 'Performance Tracking',
      description: 'Monitor returns, win rates, and risk metrics',
    },
    {
      icon: PieChart,
      title: 'Asset Allocation',
      description: 'Visualize your portfolio distribution',
    },
    {
      icon: TrendingUp,
      title: 'Historical Analysis',
      description: 'View performance over time with detailed charts',
    },
    {
      icon: Eye,
      title: 'Real-Time Updates',
      description: 'Track positions and P&L in real-time',
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
          <Wallet className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Portfolio Management
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Track and analyze all your trading positions in one place
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {portfolioFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 hover:border-primary-500/50 transition-all">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary-500/10 dark:bg-primary-400/20 rounded-lg">
                  <feature.icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {feature.description}
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
        className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg border border-primary-200 dark:border-primary-800"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white mb-1">
              Create Your First Portfolio
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Start tracking your trades and see your performance metrics
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('/portfolio')}
            icon={ArrowRight}
            iconPosition="right"
          >
            View Portfolio
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default PortfolioStep;

