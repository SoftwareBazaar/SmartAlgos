import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Shield, Zap, Users, Globe } from 'lucide-react';
import Card from '../../UI/Card';

const WelcomeStep = ({ user }) => {
  const features = [
    {
      icon: TrendingUp,
      title: 'AI-Powered Signals',
      description: 'Get intelligent trading signals powered by advanced algorithms',
    },
    {
      icon: Zap,
      title: 'High-Frequency Bots',
      description: 'Automate your trading with lightning-fast execution',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and institutional-grade protection',
    },
    {
      icon: Users,
      title: 'Expert EAs',
      description: 'Access proven Expert Advisors from top traders',
    },
    {
      icon: Globe,
      title: 'Global Markets',
      description: 'Trade across multiple markets and asset classes',
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mb-4">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Welcome{user?.first_name ? `, ${user.first_name}` : ''}!
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          We're thrilled to have you join Smart Algos. This quick tour will help you get the most out of our platform.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 hover:border-primary-500/50 transition-colors">
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
        transition={{ delay: 0.6 }}
        className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800"
      >
        <p className="text-sm text-primary-700 dark:text-primary-300 text-center">
          <strong>Pro Tip:</strong> You can always restart this tour from your Settings page.
        </p>
      </motion.div>
    </div>
  );
};

export default WelcomeStep;

