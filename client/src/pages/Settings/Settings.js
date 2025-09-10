import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Shield, Bell } from 'lucide-react';
import Card from '../../components/UI/Card';

const Settings = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Configure your account and application preferences
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <Card.Body>
            <div className="text-center py-12">
              <SettingsIcon className="h-16 w-16 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Settings Panel
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Settings management features are coming soon
              </p>
            </div>
          </Card.Body>
        </Card>
      </motion.div>
    </div>
  );
};

export default Settings;
