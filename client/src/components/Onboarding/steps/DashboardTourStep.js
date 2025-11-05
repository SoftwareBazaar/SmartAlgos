import React from 'react';
import { motion } from 'framer-motion';
import { Home, DollarSign, TrendingUp, Activity, Eye, BarChart3, Target } from 'lucide-react';
import Card from '../../UI/Card';

const DashboardTourStep = ({ onNavigate }) => {
  const dashboardFeatures = [
    {
      icon: DollarSign,
      title: 'Portfolio Value',
      description: 'Track your total portfolio value and daily P&L in real-time',
      color: 'text-green-500',
    },
    {
      icon: TrendingUp,
      title: 'Performance Metrics',
      description: 'Monitor win rates, Sharpe ratios, and risk metrics',
      color: 'text-blue-500',
    },
    {
      icon: Activity,
      title: 'Active Signals',
      description: 'View all your active trading signals and their status',
      color: 'text-purple-500',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Deep dive into your trading performance with advanced charts',
      color: 'text-orange-500',
    },
    {
      icon: Target,
      title: 'Quick Actions',
      description: 'Access key features like EA Marketplace and Portfolio management',
      color: 'text-primary-500',
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
          <Home className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Your Command Center
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          The Dashboard is your home base for monitoring everything at a glance
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dashboardFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 hover:border-primary-500/50 transition-all hover:shadow-lg">
              <div className="flex items-start space-x-3">
                <div className={`p-2 bg-gray-100 dark:bg-gray-700 rounded-lg ${feature.color}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
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
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-start space-x-3">
          <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
              What You'll See
            </p>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Real-time portfolio value and P&L</li>
              <li>• Active EA performance metrics</li>
              <li>• Recent trading signals and alerts</li>
              <li>• Market overview and trends</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardTourStep;

