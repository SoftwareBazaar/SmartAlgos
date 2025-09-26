import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Shield, Bell } from 'lucide-react';
import Card from '../../components/UI/Card';
import MT5ConnectionsManager from '../../components/Settings/MT5ConnectionsManager';

const Settings = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Platform Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage trading terminals, notification preferences, and account security.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        <MT5ConnectionsManager />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <Card.Body>
              <div className="flex items-start space-x-3">
                <Shield className="h-10 w-10 text-primary-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Security status</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Two-factor authentication and biometric approvals are available from the security center.
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <li>• Review unusual logins in the Security tab</li>
                    <li>• Rotate API keys every 90 days</li>
                    <li>• Enable trading session alerts for high-risk accounts</li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="flex items-start space-x-3">
                <Bell className="h-10 w-10 text-primary-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notification preferences</h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Notifications now sync with the backend preferences API. Configure channels under Profile &gt; Preferences.
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <li>• Trading alerts delivered via email and in-app</li>
                    <li>• Escrow milestones surfaced in the Escrow dashboard</li>
                    <li>• Monthly AI market briefings posted in News</li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
