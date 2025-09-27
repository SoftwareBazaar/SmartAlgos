import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Bot, 
  Zap, 
  BarChart3, 
  DollarSign, 
  Shield,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Globe,
  Smartphone
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

const LandingPage = () => {
  const features = [
    {
      icon: <TrendingUp className="h-8 w-8 text-primary-600" />,
      title: "Real-time Markets",
      description: "Live market data, charts, and analysis for Forex, Crypto, and Stocks",
      link: "/markets"
    },
    {
      icon: <Bot className="h-8 w-8 text-success-600" />,
      title: "EA Marketplace",
      description: "Expert Advisors and algorithmic trading solutions",
      link: "/ea-marketplace"
    },
    {
      icon: <Zap className="h-8 w-8 text-warning-600" />,
      title: "HFT Bots",
      description: "High-frequency trading bots for advanced strategies",
      link: "/hft-bots"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-info-600" />,
      title: "Portfolio Management",
      description: "Track and manage your trading portfolio",
      link: "/portfolio"
    },
    {
      icon: <DollarSign className="h-8 w-8 text-success-600" />,
      title: "Payment Integration",
      description: "Secure payment processing with Paystack",
      link: "/payments"
    },
    {
      icon: <Shield className="h-8 w-8 text-danger-600" />,
      title: "Security & Escrow",
      description: "Bank-level security and escrow services",
      link: "/escrow"
    }
  ];

  const stats = [
    { label: "Active Users", value: "10,000+", icon: <Users className="h-6 w-6" /> },
    { label: "Trading Pairs", value: "500+", icon: <Globe className="h-6 w-6" /> },
    { label: "Success Rate", value: "95%", icon: <CheckCircle className="h-6 w-6" /> },
    { label: "Mobile Ready", value: "100%", icon: <Smartphone className="h-6 w-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container-custom">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Smart Algos</span>
            </div>
            <div className="flex space-x-4">
              <Link to="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Advanced Algorithmic
              <span className="text-gradient-primary"> Trading Platform</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Professional-grade trading tools, real-time market data, and automated strategies 
              for serious traders and investors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/register">
                <Button size="lg" className="flex items-center space-x-2">
                  <span>Start Trading</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/demo/visme">
                <Button variant="outline" size="lg">
                  View Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4 text-primary-600">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Complete Trading Solution
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need for professional algorithmic trading and investment management.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover-lift p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    {feature.icon}
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {feature.description}
                  </p>
                  <Link to={feature.link}>
                    <Button variant="outline" size="sm" className="w-full">
                      Explore Feature
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to Start Trading?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of traders using Smart Algos for their algorithmic trading needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/register">
                <Button variant="outline" size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Smart Algos</span>
              </div>
              <p className="text-gray-400">
                Professional algorithmic trading platform for serious traders.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/markets" className="hover:text-white">Markets</Link></li>
                <li><Link to="/signals" className="hover:text-white">Trading Signals</Link></li>
                <li><Link to="/ea-marketplace" className="hover:text-white">EA Marketplace</Link></li>
                <li><Link to="/hft-bots" className="hover:text-white">HFT Bots</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Account</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/portfolio" className="hover:text-white">Portfolio</Link></li>
                <li><Link to="/payments" className="hover:text-white">Payments</Link></li>
                <li><Link to="/settings" className="hover:text-white">Settings</Link></li>
                <li><Link to="/profile" className="hover:text-white">Profile</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/auth/login" className="hover:text-white">Login</Link></li>
                <li><Link to="/auth/register" className="hover:text-white">Register</Link></li>
                <li><Link to="/test" className="hover:text-white">Test Page</Link></li>
                <li><Link to="/desktop-features" className="hover:text-white">Desktop App</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Smart Algos Trading Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
