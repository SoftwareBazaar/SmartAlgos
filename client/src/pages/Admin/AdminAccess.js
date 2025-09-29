import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Settings, 
  Users, 
  BarChart3, 
  Database,
  ArrowRight,
  Home
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

const AdminAccess = () => {
  const adminFeatures = [
    {
      title: 'Admin Dashboard',
      description: 'Access the main admin dashboard with system overview',
      icon: Shield,
      href: '/admin',
      color: 'bg-primary-500',
      hoverColor: 'hover:bg-primary-600'
    },
    {
      title: 'Admin Login',
      description: 'Login to admin panel with admin credentials',
      icon: Lock,
      href: '/admin-login',
      color: 'bg-gray-600',
      hoverColor: 'hover:bg-gray-700'
    },
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      href: '/admin/panel',
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700'
    },
    {
      title: 'System Settings',
      description: 'Configure system settings and preferences',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700'
    },
    {
      title: 'Analytics',
      description: 'View system analytics and reports',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700'
    },
    {
      title: 'Database',
      description: 'Database management and maintenance',
      icon: Database,
      href: '/admin/database',
      color: 'bg-red-600',
      hoverColor: 'hover:bg-red-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Admin Access Portal
            </h1>
            <p className="text-gray-400 text-lg">
              Access administrative functions and system management tools
            </p>
          </div>
          <Link to="/dashboard">
            <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-800">
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Admin Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 hover:scale-105">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg ${feature.color} ${feature.hoverColor} transition-colors`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white ml-3">
                      {feature.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-400 mb-4">
                    {feature.description}
                  </p>
                  
                  <Button
                    onClick={() => window.open(feature.href, '_blank')}
                    className={`w-full ${feature.color} ${feature.hoverColor} text-white border-0`}
                  >
                    Access
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Access Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-primary-500/20 to-blue-500/20 border-primary-500/30">
            <div className="p-6">
              <h3 className="text-2xl font-bold text-white mb-4">
                Quick Admin Access
              </h3>
              <p className="text-gray-300 mb-6">
                Use these direct links for immediate access to admin functions:
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => window.open('/admin', '_blank')}
                  className="bg-primary-500 hover:bg-primary-600 text-white"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Button>
                <Button
                  onClick={() => window.open('/admin-login', '_blank')}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Admin Login
                </Button>
                <Button
                  onClick={() => window.open('/admin/panel', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Users className="h-4 w-4 mr-2" />
                  User Management
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAccess;
