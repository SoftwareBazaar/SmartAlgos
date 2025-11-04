import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Database, Mail, FileText } from 'lucide-react';
import Card from '../../components/UI/Card';

const PrivacyPolicy = () => {
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
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-8"
        >
          {/* Introduction */}
          <Card>
            <Card.Body>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                At Smart Algos Trading Solutions, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              </p>
            </Card.Body>
          </Card>

          {/* Information We Collect */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Database className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Information We Collect
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Personal Information
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    When you register an account or use our services, we may collect:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Name and contact information (email address, phone number)</li>
                    <li>Account credentials and authentication information</li>
                    <li>Payment information (processed securely through third-party payment processors)</li>
                    <li>Profile information and preferences</li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Usage Information
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    We automatically collect certain information about your use of our platform:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Log data (IP address, browser type, access times)</li>
                    <li>Device information</li>
                    <li>Usage patterns and interactions with our services</li>
                    <li>Trading activity and portfolio data (stored locally and on our servers)</li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* How We Use Your Information */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Eye className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  How We Use Your Information
                </h3>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use the collected information for the following purposes:
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300">To provide, maintain, and improve our trading platform and services</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300">To process transactions and manage subscriptions</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300">To send you important updates, notifications, and support communications</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300">To personalize your experience and provide relevant content</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300">To detect, prevent, and address technical issues and security threats</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300">To comply with legal obligations and enforce our terms of service</span>
                </li>
              </ul>
            </Card.Body>
          </Card>

          {/* Data Security */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Lock className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Data Security
                </h3>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We implement industry-standard security measures to protect your personal information:
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300">Encryption of sensitive data in transit and at rest</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300">Secure authentication and access controls</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300">Regular security assessments and updates</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300">Restricted access to personal information on a need-to-know basis</span>
                </li>
              </ul>
              
              <p className="text-gray-700 dark:text-gray-300 mt-6">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
              </p>
            </Card.Body>
          </Card>

          {/* Information Sharing */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <FileText className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Information Sharing and Disclosure
                </h3>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300"><strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our platform (e.g., payment processors, hosting services)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300"><strong>Legal Requirements:</strong> When required by law, court order, or governmental authority</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300"><strong>Business Transfers:</strong> In connection with any merger, acquisition, or sale of assets</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300"><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</span>
                </li>
              </ul>
            </Card.Body>
          </Card>

          {/* Your Rights */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Your Rights and Choices
                </h3>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                You have the following rights regarding your personal information:
              </p>
              
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300"><strong>Access:</strong> Request access to the personal information we hold about you</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300"><strong>Correction:</strong> Request correction of inaccurate or incomplete information</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300"><strong>Deletion:</strong> Request deletion of your personal information (subject to legal retention requirements)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300"><strong>Opt-Out:</strong> Opt-out of marketing communications and data processing where applicable</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span className="text-gray-700 dark:text-gray-300"><strong>Account Management:</strong> Update your account settings and preferences at any time</span>
                </li>
              </ul>
            </Card.Body>
          </Card>

          {/* Cookies and Tracking */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Eye className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Cookies and Tracking Technologies
                </h3>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We use cookies and similar tracking technologies to enhance your experience on our platform. These technologies help us:
              </p>
              
              <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-4 list-disc">
                <li>Remember your preferences and settings</li>
                <li>Analyze how our services are used</li>
                <li>Provide personalized content and features</li>
                <li>Improve security and prevent fraud</li>
              </ul>
              
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                You can control cookies through your browser settings. However, disabling cookies may limit certain features of our platform.
              </p>
            </Card.Body>
          </Card>

          {/* Data Retention */}
          <Card>
            <Card.Body>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Data Retention
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Specifically:
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-4 list-disc">
                <li><strong>Account Information:</strong> Retained for the duration of your account and up to 7 years after account closure for legal and regulatory compliance</li>
                <li><strong>Trading Data:</strong> Retained for 7 years as required by financial regulations</li>
                <li><strong>Marketing Data:</strong> Retained until you opt-out or request deletion</li>
                <li><strong>Support Communications:</strong> Retained for 3 years for quality assurance and dispute resolution</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                When we no longer need your personal information, we will securely delete or anonymize it in accordance with our data retention policies and applicable laws.
              </p>
            </Card.Body>
          </Card>

          {/* International Data Transfers */}
          <Card>
            <Card.Body>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                International Data Transfers
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. When we transfer your information internationally, we ensure appropriate safeguards are in place:
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-4 list-disc">
                <li>Standard contractual clauses approved by regulatory authorities</li>
                <li>Adequacy decisions recognizing equivalent data protection levels</li>
                <li>Other legally recognized transfer mechanisms ensuring your data protection rights</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                By using our services, you consent to the transfer of your information to countries outside your jurisdiction, including but not limited to the United States, European Union, and other locations where our service providers operate.
              </p>
            </Card.Body>
          </Card>

          {/* Third-Party Services */}
          <Card>
            <Card.Body>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Third-Party Services and Integrations
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our platform integrates with various third-party services to provide enhanced functionality. These services have their own privacy policies:
              </p>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span><strong>Payment Processors:</strong> We use secure payment processors (Paystack, Stripe) that handle payment information according to PCI-DSS standards. We do not store full payment card details.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span><strong>Market Data Providers:</strong> We integrate with market data providers (Polygon, MarketAux) for real-time trading information. These providers may collect usage analytics.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span><strong>Cloud Infrastructure:</strong> We use cloud services (Supabase, Railway) for hosting and data storage. These providers maintain industry-standard security certifications.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-primary-600 font-bold mt-1">•</span>
                  <span><strong>Analytics Services:</strong> We may use analytics tools to understand platform usage and improve our services. These tools collect anonymized usage data.</span>
                </li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                We encourage you to review the privacy policies of these third-party services to understand how they handle your information.
              </p>
            </Card.Body>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <Card.Body>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Children's Privacy
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately at privacy@smartalgos.com. We will promptly delete such information upon verification.
              </p>
            </Card.Body>
          </Card>

          {/* California Privacy Rights */}
          <Card>
            <Card.Body>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                California Privacy Rights (CCPA)
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-4 list-disc">
                <li><strong>Right to Know:</strong> You can request information about the categories and specific pieces of personal information we collect, use, disclose, and sell</li>
                <li><strong>Right to Delete:</strong> You can request deletion of your personal information, subject to certain exceptions</li>
                <li><strong>Right to Opt-Out:</strong> You can opt-out of the sale of your personal information (we do not sell personal information)</li>
                <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your privacy rights</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                To exercise these rights, please contact us at privacy@smartalgos.com or through your account settings.
              </p>
            </Card.Body>
          </Card>

          {/* GDPR Rights */}
          <Card>
            <Card.Body>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                European Privacy Rights (GDPR)
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR):
              </p>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300 ml-4 list-disc">
                <li><strong>Right of Access:</strong> Obtain confirmation of whether we process your personal data and access to that data</li>
                <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete personal data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your personal data under certain circumstances</li>
                <li><strong>Right to Restrict Processing:</strong> Request limitation of processing of your personal data</li>
                <li><strong>Right to Data Portability:</strong> Receive your personal data in a structured, commonly used format</li>
                <li><strong>Right to Object:</strong> Object to processing of your personal data for certain purposes</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                You also have the right to lodge a complaint with a supervisory authority if you believe your data protection rights have been violated. To exercise these rights, contact us at privacy@smartalgos.com.
              </p>
            </Card.Body>
          </Card>

          {/* Changes to Privacy Policy */}
          <Card>
            <Card.Body>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Changes to This Privacy Policy
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
              </p>
            </Card.Body>
          </Card>

          {/* Contact Information */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Mail className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Contact Us
                </h3>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Email:</strong> <a href="mailto:privacy@smartalgos.com" className="text-primary-600 hover:underline">privacy@smartalgos.com</a>
                </p>
                <p>
                  <strong>Location:</strong> Embu, Kenya
                </p>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

