import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  TrendingDown,
  Globe,
  Bot,
  BarChart3,
  Scale,
  Mail
} from 'lucide-react';
import Card from '../../components/UI/Card';

const Disclaimers = () => {
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
            <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Disclaimers
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Critical Warning Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-red-800 dark:text-red-200 mb-2 text-lg">
                  Important Risk Warning
                </h3>
                <p className="text-red-700 dark:text-red-300 leading-relaxed">
                  Trading financial instruments involves a substantial risk of loss and is not suitable
                  for all investors. You may lose all or more than your initial investment.
                  Past performance is not indicative of future results. Please read all disclaimers
                  carefully before using this platform.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-8"
        >

          {/* No Investment Advice */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Scale className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  No Investment Advice
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Nothing on this platform constitutes financial, investment, tax, or legal advice.
                All content, including strategies, signals, analysis, and commentary, is provided
                for informational and educational purposes only.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Smart Algos Investment Solution Ltd is not a registered investment adviser,
                broker-dealer, or financial planner. You should seek advice from a qualified
                financial professional before making any investment decisions.
              </p>
            </Card.Body>
          </Card>

          {/* Trading Risk */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <TrendingDown className="h-6 w-6 text-danger-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Trading Risk Disclaimer
                </h3>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  The following risks are inherent in trading financial markets and you acknowledge
                  them by using this platform:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Market prices can move rapidly and unpredictably, leading to significant losses</li>
                  <li>Leverage amplifies both potential gains and potential losses</li>
                  <li>You may lose your entire invested capital</li>
                  <li>Forex, cryptocurrency, and derivatives markets carry especially high risk</li>
                  <li>Market volatility, gaps, and slippage may result in orders executing at different prices than expected</li>
                  <li>Liquidity risk may prevent you from exiting positions at desired prices</li>
                  <li>Counterparty and broker risk may affect your funds independently of market movements</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-semibold">
                  Only trade with capital you can afford to lose entirely.
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* Automated Trading / EA Disclaimer */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Bot className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Automated Trading and Expert Advisors
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Expert Advisors (EAs) and automated trading bots provided through this platform
                carry additional risks:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>EAs are algorithmic tools and do not guarantee profitability</li>
                <li>Past backtested or live performance does not guarantee future results</li>
                <li>EAs may perform well in certain market conditions and poorly in others</li>
                <li>Technical failures, connectivity issues, or platform outages may cause unintended trades or prevent order execution</li>
                <li>You are solely responsible for monitoring automated systems running on your account</li>
                <li>You should test any EA in a demo account before using it with real funds</li>
              </ul>
            </Card.Body>
          </Card>

          {/* Performance Data */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <BarChart3 className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Performance Data Disclaimer
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Any performance figures, win rates, profit statistics, or historical results
                displayed on this platform:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Are for informational purposes only and do not constitute a guarantee</li>
                <li>May be based on backtested data, which is hypothetical and subject to look-ahead bias</li>
                <li>Do not account for slippage, commissions, spreads, or taxes in all cases</li>
                <li>May reflect results under specific market conditions that may not recur</li>
                <li>Are not audited or independently verified unless stated otherwise</li>
              </ul>
            </Card.Body>
          </Card>

          {/* Third Party Content */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Globe className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Third-Party Content and Links
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Our platform may include market news, analysis, or links to third-party websites
                and resources. We do not endorse, control, or take responsibility for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>The accuracy or completeness of third-party market data or news</li>
                <li>Content on linked external websites</li>
                <li>Products or services offered by third parties</li>
                <li>Any losses arising from reliance on third-party information</li>
              </ul>
            </Card.Body>
          </Card>

          {/* Platform Availability */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Platform Availability
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                While we strive to maintain platform availability, we do not guarantee
                uninterrupted access:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>The platform may be unavailable during scheduled or unscheduled maintenance</li>
                <li>Technical failures may temporarily prevent access to features or trading functions</li>
                <li>Real-time market data feeds may be delayed or temporarily unavailable</li>
                <li>We are not liable for losses resulting from platform downtime or technical issues</li>
              </ul>
            </Card.Body>
          </Card>

          {/* Jurisdictional */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Scale className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Jurisdictional Disclaimer
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                Our platform and services may not be available or appropriate for use in all
                jurisdictions. It is your responsibility to ensure that your use of the platform
                complies with local laws and regulations.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Residents of certain countries may be restricted from accessing trading services
                due to regulatory requirements. We reserve the right to restrict access to our
                services from any jurisdiction at our discretion.
              </p>
            </Card.Body>
          </Card>

          {/* Contact */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Mail className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Questions
                </h3>
              </div>
              <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg border border-primary-200 dark:border-primary-800">
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p><strong>Smart Algos Investment Solution Ltd</strong></p>
                  <p>
                    <strong>Email:</strong>{' '}
                    <a href="mailto:legal@smartalgos.com" className="text-primary-600 hover:underline">
                      legal@smartalgos.com
                    </a>
                  </p>
                  <p><strong>Location:</strong> Embu, Kenya</p>
                </div>
              </div>
            </Card.Body>
          </Card>

        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center py-8 mt-8"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm italic">
            By using Smart Algos Trading Platform you acknowledge that you have read and understood all disclaimers above.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Disclaimers;
