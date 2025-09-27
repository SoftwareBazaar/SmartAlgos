import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Activity,
  ArrowUpRight
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

const SimpleDashboard = () => {
  const stats = [
    {
      name: 'Portfolio Value',
      value: '$125,430.50',
      change: '+$2,450.30',
      changePercent: '+2.0%',
      trend: 'up',
      icon: DollarSign,
    },
    {
      name: 'Today\'s P&L',
      value: '+$1,250.75',
      change: '+$150.25',
      changePercent: '+13.6%',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      name: 'Active Signals',
      value: '12',
      change: '+3',
      changePercent: '+33.3%',
      trend: 'up',
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back!
          </h1>
          <p className="text-gray-400 mt-2">
            Here's what's happening with your portfolio today.
          </p>
        </div>
        <Button className="bg-primary-500 hover:bg-primary-600">
          <ArrowUpRight className="h-4 w-4 mr-2" />
          View Portfolio
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="bg-gray-800 border-gray-700 p-6 hover:bg-gray-750 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.name}</p>
                  <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {stat.change} ({stat.changePercent})
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-primary-500/20 rounded-lg">
                  <stat.icon className="h-6 w-6 text-primary-400" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start text-white border-gray-600 hover:bg-gray-700">
              📈 View Markets
            </Button>
            <Button variant="outline" className="w-full justify-start text-white border-gray-600 hover:bg-gray-700">
              🤖 EA Marketplace
            </Button>
            <Button variant="outline" className="w-full justify-start text-white border-gray-600 hover:bg-gray-700">
              ⚡ HFT Bots
            </Button>
          </div>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-300 text-sm">New trading signal received</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-gray-300 text-sm">Portfolio updated</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-gray-300 text-sm">Market analysis completed</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Success Message */}
      <Card className="bg-green-900/20 border-green-500/30 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">✓</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Platform Status: Online</h3>
            <p className="text-green-200">All features are working perfectly! Your Smart Algos Trading Platform is fully operational.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SimpleDashboard;
