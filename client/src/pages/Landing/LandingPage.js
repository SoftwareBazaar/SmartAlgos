import React, { useState } from 'react';
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
import FeaturePreviewModal from '../../components/FeaturePreviewModal';
import BookingSection from '../../components/BookingSection/BookingSection';

const LandingPage = () => {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFeatureClick = (feature) => {
    setSelectedFeature(feature);
    setIsModalOpen(true);
  };

  const sampleEAs = [
    {
      name: 'Gold Scalper Pro',
      profit: '+$1,250',
      winRate: '68.5%',
      trades: '3',
      gradient: 'linear-gradient(to bottom right, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05), transparent)',
      borderColor: 'rgba(34, 197, 94, 0.2)'
    },
    {
      name: 'Multi Indicator EA',
      profit: '+$890',
      winRate: '72.3%',
      trades: '2',
      gradient: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05), transparent)',
      borderColor: 'rgba(59, 130, 246, 0.2)'
    },
    {
      name: 'Institutional Scalper',
      profit: '+$2,100',
      winRate: '75.8%',
      trades: '5',
      gradient: 'linear-gradient(to bottom right, rgba(251, 146, 60, 0.1), rgba(251, 146, 60, 0.05), transparent)',
      borderColor: 'rgba(251, 146, 60, 0.2)'
    },
    {
      name: 'Trend Master EA',
      profit: '+$1,580',
      winRate: '70.2%',
      trades: '4',
      gradient: 'linear-gradient(to bottom right, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05), transparent)',
      borderColor: 'rgba(139, 92, 246, 0.2)'
    },
    {
      name: 'HFT Pro Bot',
      profit: '+$3,240',
      winRate: '78.9%',
      trades: '7',
      gradient: 'linear-gradient(to bottom right, rgba(236, 72, 153, 0.1), rgba(236, 72, 153, 0.05), transparent)',
      borderColor: 'rgba(236, 72, 153, 0.2)'
    }
  ];

  const features = [
    {
      icon: <TrendingUp className="h-8 w-8 text-primary-600" />,
      title: "Real-time Markets",
      description: "Live market data, charts, and analysis for Forex, Crypto, and Stocks",
      link: "/markets",
      benefits: [
        "Real-time price updates from 500+ trading pairs",
        "Advanced charting with 50+ technical indicators",
        "Multi-timeframe analysis (1m to monthly)",
        "Customizable watchlists and alerts"
      ],
      stats: [
        { value: "500+", label: "Trading Pairs" },
        { value: "50+", label: "Indicators" },
        { value: "<1ms", label: "Latency" }
      ],
      details: [
        "Access live streaming data from major exchanges",
        "Professional-grade charting tools with drawing capabilities",
        "Automated alerts for price movements and patterns",
        "Historical data analysis and backtesting capabilities"
      ]
    },
    {
      icon: <Bot className="h-8 w-8 text-success-600" />,
      title: "EA Marketplace",
      description: "Expert Advisors and algorithmic trading solutions",
      link: "/ea-marketplace",
      benefits: [
        "Browse 100+ verified Expert Advisors",
        "Real-time performance metrics and reviews",
        "One-click installation and activation",
        "Community ratings and testimonials"
      ],
      stats: [
        { value: "100+", label: "EAs Available" },
        { value: "4.8★", label: "Avg Rating" },
        { value: "95%", label: "Uptime" }
      ],
      details: [
        "Access to professionally developed trading algorithms",
        "Automated trading without manual intervention",
        "Backtested strategies with proven track records",
        "Support for multiple trading platforms and brokers"
      ]
    },
    {
      icon: <Zap className="h-8 w-8 text-warning-600" />,
      title: "HFT Bots",
      description: "High-frequency trading bots for advanced strategies",
      link: "/hft-bots",
      isPremium: true,
      benefits: [
        "Microsecond execution speeds",
        "Advanced market making strategies",
        "Risk management and position sizing",
        "24/7 automated trading operations"
      ],
      stats: [
        { value: "<1μs", label: "Execution" },
        { value: "24/7", label: "Operation" },
        { value: "99.9%", label: "Reliability" }
      ],
      details: [
        "Institutional-grade high-frequency trading algorithms",
        "Co-location services for optimal latency",
        "Advanced order types and execution strategies",
        "Real-time monitoring and performance analytics"
      ]
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-info-600" />,
      title: "Portfolio Management",
      description: "Track and manage your trading portfolio",
      link: "/portfolio",
      benefits: [
        "Real-time portfolio valuation",
        "Performance analytics and reporting",
        "Risk assessment and diversification",
        "Tax reporting and documentation"
      ],
      stats: [
        { value: "Real-time", label: "Tracking" },
        { value: "Multi-asset", label: "Support" },
        { value: "Auto", label: "Reports" }
      ],
      details: [
        "Comprehensive portfolio dashboard with all positions",
        "Advanced analytics including Sharpe ratio, drawdown analysis",
        "Automated P&L calculations and tax reporting",
        "Risk management tools and position sizing recommendations"
      ]
    },
    {
      icon: <DollarSign className="h-8 w-8 text-success-600" />,
      title: "Payment Integration",
      description: "Secure payment processing with Paystack",
      link: "/payments",
      benefits: [
        "Multiple payment methods supported",
        "Bank-level encryption and security",
        "Instant deposit and withdrawal processing",
        "Transaction history and receipts"
      ],
      stats: [
        { value: "Instant", label: "Processing" },
        { value: "100%", label: "Secure" },
        { value: "24/7", label: "Support" }
      ],
      details: [
        "Seamless integration with major payment providers",
        "Support for credit cards, bank transfers, and cryptocurrencies",
        "Automated reconciliation and accounting",
        "Multi-currency support for global traders"
      ]
    },
    {
      icon: <Shield className="h-8 w-8 text-danger-600" />,
      title: "Security & Escrow",
      description: "Bank-level security and escrow services",
      link: "/escrow",
      benefits: [
        "Two-factor authentication (2FA)",
        "Cold storage for digital assets",
        "Escrow services for secure transactions",
        "Insurance coverage for funds"
      ],
      stats: [
        { value: "256-bit", label: "Encryption" },
        { value: "99.99%", label: "Uptime" },
        { value: "Insured", label: "Funds" }
      ],
      details: [
        "Enterprise-grade security infrastructure",
        "Regular security audits and penetration testing",
        "Compliance with financial regulations",
        "Dedicated security team monitoring 24/7"
      ]
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
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Smart Algos" 
                className="h-10 w-auto object-contain"
                style={{ 
                  filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.12))',
                  maxWidth: '120px',
                  height: 'auto'
                }}
                onError={(e) => {
                  console.error('Logo failed to load from /logo.png');
                  e.target.style.display = 'none';
                }}
              />
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 px-4">
              Advanced Algorithmic
              <span className="text-gradient-primary"> Trading Platform</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
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
              <a href="#book-consultation">
                <Button size="lg" variant="outline" className="flex items-center space-x-2">
                  <span>📅 Book Free Consultation</span>
                </Button>
              </a>
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

      {/* EA Highlights Carousel Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Featured Expert Advisors
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              Watch live trading performance from our top-performing EAs
            </p>
          </motion.div>

          {/* Simplified EA Highlights for Public */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="overflow-hidden border-2 border-gray-200 dark:border-gray-800">
              <div className="bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-transparent dark:from-primary-400/20 dark:via-primary-400/10 p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-500/20 dark:bg-primary-400/30 rounded-lg">
                      <Bot className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Live EA Performance
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Real-time trading stats
                      </p>
                    </div>
                  </div>
                  <Link to="/auth/register">
                    <Button size="sm">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 overflow-hidden">
                <motion.div
                  className="flex space-x-3 sm:space-x-4"
                  animate={{
                    x: [0, -1400],
                  }}
                  transition={{
                    x: {
                      repeat: Infinity,
                      repeatType: "loop",
                      duration: 30,
                      ease: "linear",
                    },
                  }}
                  style={{ width: 'max-content' }}
                >
                  {[...sampleEAs, ...sampleEAs].map((ea, index) => (
                    <div
                      key={`${ea.name}-${index}`}
                      className="flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px] p-4 sm:p-5 rounded-xl border h-full"
                      style={{
                        background: ea.gradient,
                        borderColor: ea.borderColor
                      }}
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate flex-1 mr-2">{ea.name}</h4>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-success-500 rounded-full animate-pulse flex-shrink-0"></div>
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Profit</span>
                          <span className="text-xs sm:text-sm font-bold text-success-600 dark:text-success-400">{ea.profit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Win Rate</span>
                          <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{ea.winRate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">Active Trades</span>
                          <span className="text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400">{ea.trades}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </Card>
          </motion.div>
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleFeatureClick(feature)}
                  >
                    Explore Feature
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <BookingSection />

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
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                  View Pricing
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
      <footer className="bg-gray-800 text-white py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center mb-6">
                <img 
                  src="/logo.png" 
                  alt="Smart Algos" 
                  className="h-10 w-auto object-contain"
                  style={{ 
                    filter: 'drop-shadow(0 1px 3px rgba(255, 255, 255, 0.3))',
                    maxWidth: '120px',
                    height: 'auto'
                  }}
                  onError={(e) => {
                    console.error('Footer logo failed to load from /logo.png');
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <p className="text-gray-400 leading-relaxed">
                Professional algorithmic trading platform for serious traders and institutional investors.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-lg">Features</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/markets" className="hover:text-white transition-colors">Markets</Link></li>
                <li><Link to="/signals" className="hover:text-white transition-colors">Trading Signals</Link></li>
                <li><Link to="/ea-marketplace" className="hover:text-white transition-colors">EA Marketplace</Link></li>
                <li><Link to="/hft-bots" className="hover:text-white transition-colors">HFT Bots</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-lg">Account</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/portfolio" className="hover:text-white transition-colors">Portfolio</Link></li>
                <li><Link to="/payments" className="hover:text-white transition-colors">Payments</Link></li>
                <li><Link to="/settings" className="hover:text-white transition-colors">Settings</Link></li>
                <li><Link to="/profile" className="hover:text-white transition-colors">Profile</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-lg">Support & Legal</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/auth/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/auth/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><a href="mailto:support@smartalgos.com" className="hover:text-white transition-colors">Contact</a></li>
                <li><Link to="/desktop-features" className="hover:text-white transition-colors">Desktop App</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p className="mb-2">&copy; 2025 Smart Algos Trading Platform. All rights reserved.</p>
            <p className="text-sm">Embu, Kenya | Licensed Financial Services Provider</p>
          </div>
        </div>
      </footer>

      {/* Feature Preview Modal */}
      <FeaturePreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        feature={selectedFeature}
      />
    </div>
  );
};

export default LandingPage;