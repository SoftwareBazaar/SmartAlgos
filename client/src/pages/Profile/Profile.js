import React from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Bell } from 'lucide-react';
import Card from '../../components/UI/Card';

const Profile = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Profile
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
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
              <User className="h-16 w-16 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Profile Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Profile management features are coming soon
              </p>
            </div>
          </Card.Body>
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile;
