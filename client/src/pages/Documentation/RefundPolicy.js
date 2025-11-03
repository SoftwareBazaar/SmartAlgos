import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Clock, 
  FileText, 
  CreditCard,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Card from '../../components/UI/Card';

const RefundPolicy = () => {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (sectionId) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const faqItems = [
    {
      question: "Can I get a refund if the EA loses money?",
      answer: "No. Trading losses are not grounds for refund. All trading involves risk."
    },
    {
      question: "What if the EA doesn't work with my broker?",
      answer: "Check broker compatibility before purchase. We recommend testing on demo first. Broker-specific issues are generally not refundable."
    },
    {
      question: "Can I get a partial refund if I used it for a few days?",
      answer: "Partial refunds are considered only for severe technical defects, not for short-term use."
    },
    {
      question: "What if I don't like the product?",
      answer: "Personal preference is not grounds for refund. Review product details carefully before purchase."
    },
    {
      question: "How long do refunds take?",
      answer: "Approved refunds are processed within 14 business days to your original payment method."
    },
    {
      question: "Can I exchange for a different product?",
      answer: "Yes, in some cases we offer product exchanges instead of refunds."
    }
  ];

  const nonRefundableItems = [
    { category: "Performance-Related", items: [
      "The EA is not profitable",
      "Trading losses occurred",
      "Results don't match backtests",
      "Expected profits were not achieved",
      "Drawdown exceeded expectations"
    ]},
    { category: "User Error", items: [
      "Incorrect installation or configuration",
      "Failure to read documentation",
      "Using wrong account type or broker",
      "Insufficient account balance or margin",
      "Not following recommended settings"
    ]},
    { category: "Broker-Related", items: [
      "Broker doesn't allow automated trading",
      "High spread or commission at your broker",
      "Slippage or execution issues",
      "Broker-specific restrictions",
      "Platform compatibility with your specific broker"
    ]},
    { category: "Market Conditions", items: [
      "Unexpected market volatility",
      "News events affecting performance",
      "Changed market conditions",
      "Seasonal variations in performance"
    ]},
    { category: "Change of Mind", items: [
      "You decided you don't want the product",
      "You found a similar product elsewhere",
      "You no longer want to trade",
      "You realized trading is risky"
    ]},
    { category: "License Violations", items: [
      "You shared the software with others",
      "You exceeded the authorized account limit",
      "You attempted to reverse engineer the software",
      "You violated any terms of the EULA"
    ]}
  ];

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
              <RefreshCw className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Refund and Return Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: November 3, 2025
          </p>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-2 border-warning-500 bg-warning-50 dark:bg-warning-900/20 mb-8">
            <Card.Body>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Important Notice</h3>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                    <strong>Digital products are non-refundable except in cases of technical defects.</strong> Please ensure you understand the risks of trading and the limitations of automated systems before purchasing.
                  </p>
                  <p className="text-gray-800 dark:text-gray-200 mt-2">
                    By making a purchase, you acknowledge that you have read, understood, and agree to this Refund Policy.
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
          {/* Overview */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <FileText className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Overview
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                At John Wanyaga's EA Marketplace, we strive to provide high-quality trading software and ensure customer satisfaction. However, due to the nature of digital products and automated trading systems, our refund policy has specific conditions and limitations outlined below.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4 font-semibold">
                <strong>Please read this policy carefully before making a purchase.</strong>
              </p>
            </Card.Body>
          </Card>

          {/* General Policy */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  1. General Policy
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    1.1 Digital Products
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    All our products are digital software (Expert Advisors, trading bots, indicators, models) that are delivered electronically. Once you receive access to the product, the sale is generally considered final.
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    1.2 No Refunds for Performance
                  </h4>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-red-800 dark:text-red-200 font-semibold mb-2">
                      IMPORTANT: We do NOT provide refunds based on:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300">
                      <li>Trading losses or unprofitability</li>
                      <li>Negative trading results</li>
                      <li>Unmet profit expectations</li>
                      <li>Market conditions or volatility</li>
                      <li>Personal dissatisfaction with returns</li>
                      <li>Change of mind after purchase</li>
                    </ul>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mt-4">
                    Trading inherently involves risk, and no automated system can guarantee profits. Past performance does not indicate future results.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Eligible Refund Circumstances */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircle className="h-6 w-6 text-success-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  2. Eligible Refund Circumstances
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    2.1 Technical Defects
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Refunds may be considered if:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>The software fails to install despite proper system requirements</li>
                    <li>The software consistently crashes or malfunctions</li>
                    <li>Core functionality is completely broken and cannot be fixed</li>
                    <li>The product description was materially false or misleading</li>
                    <li>You received the wrong product</li>
                  </ul>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    2.2 Timeframe
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Refund requests must be submitted <strong>within 7 days of purchase</strong></li>
                    <li>Requests after 7 days will not be considered</li>
                    <li>You must provide proof of technical issues (screenshots, error messages, logs)</li>
                  </ul>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    2.3 Good Faith Requirement
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    To request a refund, you must:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Have made a genuine attempt to use the product</li>
                    <li>Have contacted support to resolve the issue</li>
                    <li>Have provided adequate time for troubleshooting (48-72 hours)</li>
                    <li>Be able to demonstrate the technical defect</li>
                    <li>Not have violated the license terms</li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Non-Refundable Situations */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <XCircle className="h-6 w-6 text-danger-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  3. Non-Refundable Situations
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    3.1 We Do NOT Provide Refunds For:
                  </h4>
                  <div className="space-y-4">
                    {nonRefundableItems.map((category, idx) => (
                      <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {category.category}
                        </h5>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-2">
                          {category.items.map((item, itemIdx) => (
                            <li key={itemIdx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    3.2 Partial Use
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    If you have used the product for any period (even briefly), you are not entitled to a full refund except in cases of severe technical defects.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Refund Request Process */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Clock className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  4. Refund Request Process
                </h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    4.1 How to Request a Refund
                  </h4>
                  <div className="space-y-4">
                    <div className="border-l-4 border-primary-600 pl-4">
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Step 1: Contact Support
                      </h5>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        Email us at <a href="mailto:support@smartalgos.com" className="text-primary-600 hover:underline">support@smartalgos.com</a> with:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-2">
                        <li>Your full name and order number</li>
                        <li>Date of purchase</li>
                        <li>Product name</li>
                        <li>Detailed description of the issue</li>
                        <li>Screenshots or error messages</li>
                        <li>Steps you've taken to resolve the issue</li>
                        <li>Evidence of the technical problem</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-primary-600 pl-4">
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Step 2: Troubleshooting
                      </h5>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-2">
                        <li>Our support team will work with you to resolve the issue</li>
                        <li>You must cooperate fully with troubleshooting efforts</li>
                        <li>Allow 48-72 hours for technical support</li>
                        <li>Follow provided instructions and recommendations</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-primary-600 pl-4">
                      <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Step 3: Evaluation
                      </h5>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-2">
                        <li>We will review your case within 3-5 business days</li>
                        <li>We may request additional information or evidence</li>
                        <li>Decision will be communicated via email</li>
                        <li>Our decision is final</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    4.2 Required Information
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">You must provide:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Proof of purchase (order confirmation, receipt)</li>
                    <li>Account details for license verification</li>
                    <li>Evidence of technical defect (screenshots, logs)</li>
                    <li>Summary of support interactions</li>
                    <li>Confirmation that software hasn't been shared</li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Refund Processing */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <CreditCard className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  5. Refund Processing
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    5.1 Approved Refunds
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    If your refund is approved:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Refunds are processed within 14 business days</li>
                    <li>Refund will be issued to the original payment method</li>
                    <li>Your license will be immediately terminated</li>
                    <li>You must uninstall and delete the software</li>
                    <li>You may not continue using the product</li>
                  </ul>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    5.2 Partial Refunds
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    In some cases, we may offer:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>A partial refund (e.g., 50%) if the product was partially functional</li>
                    <li>Store credit for future purchases</li>
                    <li>An exchange for a different product</li>
                    <li>Extended support or custom modifications</li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Chargebacks and Disputes */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <AlertTriangle className="h-6 w-6 text-danger-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  8. Chargebacks and Disputes
                </h3>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-4">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  8.1 Chargeback Policy
                </h4>
                <p className="text-red-700 dark:text-red-300 mb-2">
                  If you initiate a chargeback or payment dispute:
                </p>
                <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300 ml-4">
                  <li>Your account will be immediately suspended</li>
                  <li>Your license will be permanently revoked</li>
                  <li>You will be banned from future purchases</li>
                  <li>We will contest fraudulent chargebacks</li>
                  <li>Legal action may be taken for fraud</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  8.2 Proper Dispute Resolution
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Before initiating a chargeback:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Contact our support team first</li>
                  <li>Allow us to resolve the issue</li>
                  <li>Follow the proper refund request process</li>
                  <li>Give us reasonable time to respond (3-5 business days)</li>
                </ul>
              </div>
            </Card.Body>
          </Card>

          {/* FAQ Section */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <HelpCircle className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  14. Frequently Asked Questions
                </h3>
              </div>
              
              <div className="space-y-4">
                {faqItems.map((faq, index) => {
                  const isOpen = openSections[`faq-${index}`];
                  return (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection(`faq-${index}`)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 dark:text-white pr-4">
                          {faq.question}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-4 py-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
                        >
                          <p className="text-gray-700 dark:text-gray-300">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>

          {/* Contact Information */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Mail className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  15. Contact Information
                </h3>
              </div>
              
              <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg border border-primary-200 dark:border-primary-800">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  For refund requests or questions about this policy:
                </p>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p><strong>John Wanyaga</strong></p>
                  <p>MQL5 & Algo Trading Developer</p>
                  <p>
                    <strong>Email:</strong> <a href="mailto:support@smartalgos.com" className="text-primary-600 hover:underline">support@smartalgos.com</a>
                  </p>
                  <p>
                    <strong>Website:</strong> <a href="https://web-production-fdb58.up.railway.app/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">https://web-production-fdb58.up.railway.app/</a>
                  </p>
                  <p><strong>Location:</strong> Embu, Kenya</p>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-4 italic">
                  *Subject Line: Include "REFUND REQUEST" for faster processing
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Response Time: Within 24-48 hours (business days)
                </p>
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
            Last Updated: November 3, 2025
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RefundPolicy;

