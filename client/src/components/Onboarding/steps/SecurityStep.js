import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Key, Bell, Eye, Settings as SettingsIcon, ArrowRight } from 'lucide-react';
import Card from '../../UI/Card';
import Button from '../../UI/Button';

const SecurityStep = ({ onNavigate }) => {
  const securityFeatures = [
    {
      icon: Lock,
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      action: 'Enable 2FA',
    },
    {
      icon: Key,
      title: 'API Key Management',
      description: 'Create, rotate, and manage your API keys securely',
      action: 'Manage Keys',
    },
    {
      icon: Bell,
      title: 'Security Alerts',
      description: 'Get notified of suspicious activity and login attempts',
      action: 'Configure',
    },
    {
      icon: Eye,
      title: 'Audit Trail',
      description: 'View all security events and account activity',
      action: 'View Logs',
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
          <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Security & Privacy
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Protect your account with enterprise-grade security features
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {securityFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 hover:border-primary-500/50 transition-all hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
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
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
      >
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-900 dark:text-red-200 mb-1">
              Security Best Practices
            </p>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 mb-3">
              <li>• Enable 2FA for account protection</li>
              <li>• Regularly rotate your API keys</li>
              <li>• Review your audit trail monthly</li>
              <li>• Use strong, unique passwords</li>
            </ul>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/settings?tab=security')}
              icon={SettingsIcon}
              iconPosition="left"
            >
              Go to Settings
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SecurityStep;

