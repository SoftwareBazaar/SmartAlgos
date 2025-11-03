import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Code, TrendingUp, Zap, BarChart3, Shield, Mail, MapPin, Briefcase, Bot, Award, Clock, Users } from 'lucide-react';
import Card from '../../components/UI/Card';

const AboutMe = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About Me
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Hi, I'm John Wanyaga
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            MQL5 Developer, Algorithmic Trading Specialist, and Trading Tools Developer
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-8"
        >
          {/* Introduction Card */}
          <Card>
            <Card.Body>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                I'm a <strong>MQL5 Developer, Algorithmic Trading Specialist, and Trading Tools Developer</strong> with a passion for transforming trading strategies into powerful automated solutions.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong>Founder Smart Algos Trading solutions</strong>
              </p>
            </Card.Body>
          </Card>

          {/* What I Do */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Briefcase className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  What I Do
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                I specialize in developing cutting-edge trading solutions that help traders automate their strategies and maximize their market potential:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <Bot className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900 dark:text-white">Expert Advisors (EAs)</strong>
                    <p className="text-gray-600 dark:text-gray-400">Custom-built automated trading systems tailored to your strategy</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Zap className="h-5 w-5 text-warning-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900 dark:text-white">Trading Bots & HFTs</strong>
                    <p className="text-gray-600 dark:text-gray-400">High-frequency trading solutions optimized for speed and performance</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-success-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900 dark:text-white">AI Trading Models</strong>
                    <p className="text-gray-600 dark:text-gray-400">Machine learning-powered trading systems that adapt to market conditions</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <BarChart3 className="h-5 w-5 text-info-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900 dark:text-white">AI Trading Dashboards</strong>
                    <p className="text-gray-600 dark:text-gray-400">Intelligent analytics platforms for real-time market insights</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Code className="h-5 w-5 text-danger-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900 dark:text-white">Strategy Automation</strong>
                    <p className="text-gray-600 dark:text-gray-400">Converting manual trading strategies into reliable automated systems</p>
                  </div>
                </li>
              </ul>
            </Card.Body>
          </Card>

          {/* My Expertise */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Code className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  My Expertise
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                With extensive experience in algorithmic trading and software development, I combine technical expertise with deep market understanding to create solutions that work. My development stack includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>MQL4/MQL5 programming</li>
                <li>Algorithmic trading system design</li>
                <li>AI and machine learning integration</li>
                <li>Trading strategy optimization</li>
                <li>Risk management systems</li>
              </ul>
            </Card.Body>
          </Card>

          {/* What You'll Find Here */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  What You'll Find Here
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                This marketplace is your hub for professional trading solutions:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold">•</span>
                  <span className="text-gray-700 dark:text-gray-300"><strong>Premium EAs & Bots:</strong> Ready-to-deploy automated trading systems</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold">•</span>
                  <span className="text-gray-700 dark:text-gray-300"><strong>Custom Development:</strong> Bespoke solutions tailored to your specific needs</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold">•</span>
                  <span className="text-gray-700 dark:text-gray-300"><strong>Trading Models:</strong> Proven algorithmic strategies for various market conditions</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold">•</span>
                  <span className="text-gray-700 dark:text-gray-300"><strong>Forex News & Insights:</strong> Regular blog posts on market trends and trading techniques</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold">•</span>
                  <span className="text-gray-700 dark:text-gray-300"><strong>Educational Resources:</strong> Guides to help you understand and optimize automated trading</span>
                </li>
              </ul>
            </Card.Body>
          </Card>

          {/* My Commitment */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  My Commitment
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                I'm committed to delivering <strong>reliable, ethical, and transparent</strong> trading solutions. Every product is thoroughly tested, and I provide ongoing support to ensure you get the most from your investment.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                Whether you're looking to automate your existing strategy, explore new trading opportunities, or build a custom solution from scratch, I'm here to help you succeed in the markets.
              </p>
            </Card.Body>
          </Card>

          {/* Get In Touch */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Mail className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Get In Touch
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Have a project in mind or questions about automated trading? I'd love to hear from you.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Email:</strong> <a href="mailto:contact@smartalgos.com" className="text-primary-600 hover:underline">contact@smartalgos.com</a>
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Location:</strong> Embu, Kenya
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Briefcase className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    <strong>Specialization:</strong> MQL5 Development | Algo Trading | AI Trading Solutions
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <Card.Body className="text-center">
                <Award className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">100+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Products Developed</div>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body className="text-center">
                <Users className="h-8 w-8 text-success-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Satisfied Clients</div>
              </Card.Body>
            </Card>
            <Card>
              <Card.Body className="text-center">
                <Clock className="h-8 w-8 text-warning-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">5+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Years Experience</div>
              </Card.Body>
            </Card>
          </div>

          {/* Quick Links */}
          <Card>
            <Card.Body>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Explore Our Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/ea-marketplace" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Bot className="h-5 w-5 text-primary-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">EA Marketplace</span>
                  </div>
                </Link>
                <Link to="/custom-ea" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Code className="h-5 w-5 text-primary-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">Custom EA Service</span>
                  </div>
                </Link>
                <Link to="/utilities" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-primary-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">Free Utilities</span>
                  </div>
                </Link>
                <Link to="/hft-bots" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-primary-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">HFT Bots</span>
                  </div>
                </Link>
              </div>
            </Card.Body>
          </Card>

          {/* Footer Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center py-8"
          >
            <p className="text-xl italic text-gray-600 dark:text-gray-400">
              Let's automate your trading success together.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutMe;

