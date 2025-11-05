import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Bot, Star, TrendingUp, Shield, Zap, ArrowRight } from 'lucide-react';
import Card from '../../UI/Card';
import Button from '../../UI/Button';

const EAMarketplaceStep = ({ onNavigate }) => {
  const benefits = [
    {
      icon: Bot,
      title: 'Pre-Built Strategies',
      description: 'Choose from hundreds of proven Expert Advisors',
    },
    {
      icon: Star,
      title: 'Rated & Reviewed',
      description: 'See performance ratings and user reviews',
    },
    {
      icon: TrendingUp,
      title: 'Performance Data',
      description: 'View win rates, monthly returns, and Sharpe ratios',
    },
    {
      icon: Shield,
      title: 'Secure Escrow',
      description: 'Protected transactions with our escrow system',
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
          <ShoppingBag className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          EA Marketplace
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Discover and deploy Expert Advisors created by top traders
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {benefits.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 hover:border-primary-500/50 transition-all">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary-500/10 dark:bg-primary-400/20 rounded-lg">
                  <benefit.icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {benefit.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {benefit.description}
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
        className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg border border-primary-200 dark:border-primary-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Zap className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Ready to explore?
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Browse EAs by category, performance, or price
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('/ea-marketplace')}
            icon={ArrowRight}
            iconPosition="right"
          >
            Visit Marketplace
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default EAMarketplaceStep;

