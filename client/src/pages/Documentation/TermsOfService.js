import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Shield, 
  AlertTriangle, 
  Lock, 
  Scale, 
  Gavel, 
  Mail,
  CreditCard,
  User,
  Globe,
  Ban
} from 'lucide-react';
import Card from '../../components/UI/Card';

const TermsOfService = () => {
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
              <Scale className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-2 border-amber-500 bg-amber-50 dark:bg-amber-900/20 mb-8">
            <Card.Body>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Important Legal Notice</h3>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    By accessing and using Smart Algos Trading Platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this platform. Trading involves substantial risk of loss and is not suitable for all investors.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-8"
        >
          {/* 1. Acceptance of Terms */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <FileText className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  1. Acceptance of Terms
                </h3>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you", or "your") and Smart Algos Trading Solutions ("Company", "we", "us", or "our") governing your use of our trading platform, software, services, and website (collectively, the "Service").
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  By registering an account, accessing, or using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not use our Service.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-semibold">
                  You must be at least 18 years old and have the legal capacity to enter into binding agreements to use our Service.
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* 2. Service Description */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Globe className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  2. Service Description
                </h3>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Smart Algos Trading Platform provides:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Automated trading software (Expert Advisors/EAs) for financial markets</li>
                  <li>Trading signals and market analysis tools</li>
                  <li>Portfolio management and tracking capabilities</li>
                  <li>Market data, news, and economic calendar services</li>
                  <li>Subscription-based access to trading algorithms and strategies</li>
                  <li>Educational resources and trading tools</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  <strong>Important:</strong> We provide software tools and educational services. We do not provide investment advice, financial advisory services, or guarantee trading profits. All trading decisions are your own responsibility.
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* 3. Risk Disclosure */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <AlertTriangle className="h-6 w-6 text-danger-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  3. Risk Disclosure and Trading Warnings
                </h3>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-4">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  CRITICAL RISK WARNING
                </h4>
                <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300 ml-4">
                  <li><strong>Trading involves substantial risk of loss</strong> and may result in the loss of your entire investment</li>
                  <li>Past performance does not guarantee future results</li>
                  <li>Automated trading systems can generate significant losses, especially during volatile market conditions</li>
                  <li>You may lose more than your initial investment</li>
                  <li>Trading on margin increases both potential profits and losses</li>
                  <li>Market conditions can change rapidly, making automated systems ineffective</li>
                  <li>Technical failures, internet connectivity issues, or broker problems can cause losses</li>
                </ul>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                By using our Service, you acknowledge that you understand these risks and are solely responsible for all trading decisions and their consequences. You agree not to hold us liable for any trading losses.
              </p>
            </Card.Body>
          </Card>

          {/* 4. User Accounts and Registration */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <User className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  4. User Accounts and Registration
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    4.1 Account Creation
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>You must provide accurate, current, and complete information during registration</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                    <li>You must notify us immediately of any unauthorized access to your account</li>
                    <li>One person or entity may maintain only one account unless expressly permitted</li>
                    <li>You must be at least 18 years old to create an account</li>
                  </ul>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    4.2 Account Responsibilities
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>You are responsible for all activities that occur under your account</li>
                    <li>You must not share your account credentials with others</li>
                    <li>You must use your account in compliance with all applicable laws</li>
                    <li>You must not use the Service for any illegal or unauthorized purpose</li>
                    <li>We reserve the right to suspend or terminate accounts that violate these Terms</li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* 5. Subscription and Payment Terms */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <CreditCard className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  5. Subscription and Payment Terms
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    5.1 Subscription Plans
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    We offer various subscription plans with different features and pricing:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                    <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
                    <li>Prices are subject to change with 30 days' notice to existing subscribers</li>
                    <li>All fees are non-refundable except as required by law or as specified in our Refund Policy</li>
                  </ul>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    5.2 Payment Processing
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>All payments are processed through third-party payment processors</li>
                    <li>You agree to provide valid payment information</li>
                    <li>Failed payments may result in service suspension</li>
                    <li>You are responsible for any taxes applicable to your subscription</li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* 6. Intellectual Property */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Lock className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  6. Intellectual Property Rights
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    6.1 Our Property
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    All content, software, algorithms, trademarks, logos, and materials on our platform are the exclusive property of Smart Algos Trading Solutions or our licensors and are protected by copyright, trademark, and other intellectual property laws.
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    6.2 License Restrictions
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">You may NOT:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Copy, modify, distribute, or create derivative works of our software</li>
                    <li>Reverse engineer, decompile, or disassemble our software</li>
                    <li>Share your account or subscription access with others</li>
                    <li>Use our software for commercial purposes beyond your personal trading</li>
                    <li>Remove or alter any copyright, trademark, or proprietary notices</li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* 7. Prohibited Uses */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Ban className="h-6 w-6 text-danger-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  7. Prohibited Uses
                </h3>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">You agree NOT to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Transmit viruses, malware, or any harmful code</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Impersonate any person or entity</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Violate any securities regulations or financial laws</li>
                <li>Use the Service to manipulate markets or engage in fraudulent trading</li>
              </ul>
            </Card.Body>
          </Card>

          {/* 8. Limitation of Liability */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  8. Limitation of Liability and Disclaimers
                </h3>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800 mb-4">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  IMPORTANT DISCLAIMERS
                </h4>
                <ul className="list-disc list-inside space-y-1 text-amber-700 dark:text-amber-300 ml-4">
                  <li><strong>No Investment Advice:</strong> We do not provide investment, financial, or trading advice</li>
                  <li><strong>No Guarantees:</strong> We make no guarantees about profits, performance, or results</li>
                  <li><strong>As-Is Service:</strong> The Service is provided "as-is" without warranties of any kind</li>
                  <li><strong>Market Risk:</strong> All trading involves risk of loss</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    8.1 Limitation of Liability
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    8.2 Maximum Liability
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    Our total liability to you for any claims arising from or related to the Service shall not exceed the amount you paid us in the 12 months preceding the claim.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* 9. Indemnification */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Gavel className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  9. Indemnification
                </h3>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                You agree to indemnify, defend, and hold harmless Smart Algos Trading Solutions, its officers, directors, employees, agents, and affiliates from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4 mt-4">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Your trading activities and decisions</li>
                <li>Any content you submit or transmit through the Service</li>
              </ul>
            </Card.Body>
          </Card>

          {/* 10. Termination */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Ban className="h-6 w-6 text-danger-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  10. Termination
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    10.1 Termination by You
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of your current billing period.
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    10.2 Termination by Us
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    We may suspend or terminate your account immediately if you:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Violate these Terms or our policies</li>
                    <li>Engage in fraudulent, abusive, or illegal activity</li>
                    <li>Fail to pay subscription fees</li>
                    <li>Violate intellectual property rights</li>
                    <li>Pose a security risk to our Service or other users</li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* 11. Governing Law */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Scale className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  11. Governing Law and Dispute Resolution
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    11.1 Governing Law
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    These Terms shall be governed by and construed in accordance with the laws of Kenya, without regard to its conflict of law provisions.
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    11.2 Dispute Resolution
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in accordance with Kenyan arbitration laws, unless otherwise required by law.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* 12. Changes to Terms */}
          <Card>
            <Card.Body>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                12. Changes to Terms
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on our website and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the modified Terms. If you do not agree to the changes, you must stop using the Service and cancel your subscription.
              </p>
            </Card.Body>
          </Card>

          {/* 13. Contact Information */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Mail className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  13. Contact Information
                </h3>
              </div>
              
              <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg border border-primary-200 dark:border-primary-800">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  For questions about these Terms of Service:
                </p>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p><strong>Smart Algos Trading Solutions</strong></p>
                  <p>
                    <strong>Email:</strong> <a href="mailto:legal@smartalgos.com" className="text-primary-600 hover:underline">legal@smartalgos.com</a>
                  </p>
                  <p>
                    <strong>Support Email:</strong> <a href="mailto:support@smartalgos.com" className="text-primary-600 hover:underline">support@smartalgos.com</a>
                  </p>
                  <p><strong>Location:</strong> Embu, Kenya</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center py-8 mt-8"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm italic">
            By using Smart Algos Trading Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;

