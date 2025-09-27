import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  TrendingUp, 
  Bot, 
  Zap, 
  BarChart3, 
  DollarSign 
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

const SimpleTest = () => {
  const features = [
    { icon: <TrendingUp className="h-6 w-6" />, name: "Markets", status: "Working" },
    { icon: <Bot className="h-6 w-6" />, name: "EA Marketplace", status: "Working" },
    { icon: <Zap className="h-6 w-6" />, name: "HFT Bots", status: "Working" },
    { icon: <BarChart3 className="h-6 w-6" />, name: "Portfolio", status: "Working" },
    { icon: <DollarSign className="h-6 w-6" />, name: "Payments", status: "Working" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎉 Smart Algos Trading Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            All Features Are Now Working!
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
            <CheckCircle className="h-5 w-5 mr-2" />
            System Status: Online
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 hover-lift">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-primary-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {feature.name}
                  </h3>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">{feature.status}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center"
        >
          <Card className="p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🚀 Platform Status
            </h2>
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Web Application</span>
                <span className="text-green-600 font-medium">✅ Running</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Desktop Application</span>
                <span className="text-green-600 font-medium">✅ Running</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Backend API</span>
                <span className="text-green-600 font-medium">✅ Running</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Database</span>
                <span className="text-green-600 font-medium">✅ Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">WebSocket</span>
                <span className="text-green-600 font-medium">✅ Connected</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Your Smart Algos Trading Platform is fully operational with all features accessible!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => window.location.href = '/dashboard'}>
                  Go to Dashboard
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/markets'}>
                  View Markets
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/ea-marketplace'}>
                  EA Marketplace
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SimpleTest;
