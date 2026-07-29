import React from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Shield,
  Key,
  Eye,
  Server,
  AlertTriangle,
  CheckCircle,
  Mail,
  Smartphone
} from 'lucide-react';
import Card from '../../components/UI/Card';

const SecurityPolicy = () => {
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
            Security Policy
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
            Smart Algos Investment Solution Ltd is committed to maintaining the highest security
            standards to protect your account, data, and funds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-8"
        >

          {/* Platform Security */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Lock className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Platform Security
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Encryption
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>All data transmitted between your browser and our servers is encrypted using TLS 1.2 or higher</li>
                    <li>Sensitive data stored at rest is encrypted using AES-256</li>
                    <li>Passwords are hashed using industry-standard bcrypt with salt rounds</li>
                    <li>API keys and secrets are stored in encrypted vaults, never in plain text</li>
                  </ul>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Infrastructure
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Hosted on enterprise-grade cloud infrastructure with 99.9% uptime SLA</li>
                    <li>Firewalls and intrusion detection systems monitor all traffic</li>
                    <li>Regular automated security scans and vulnerability assessments</li>
                    <li>Database access is restricted to authorized services only via private networking</li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Account Security */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Key className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Account Security
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Authentication
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Email and password authentication with strong password requirements</li>
                    <li>Google OAuth sign-in as an additional login option</li>
                    <li>Session tokens expire automatically after periods of inactivity</li>
                    <li>Admin sessions are memory-only and do not persist after browser close</li>
                  </ul>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Best Practices for Users
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Use a strong, unique password that you do not reuse elsewhere</li>
                    <li>Never share your login credentials with anyone</li>
                    <li>Log out when using shared or public devices</li>
                    <li>Report any suspicious activity on your account immediately</li>
                    <li>Keep your registered email address secure and up to date</li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Payment Security */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Payment Security
                </h3>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  We take payment security seriously. All financial transactions are handled
                  by PCI-DSS compliant third-party processors:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>We do not store full card numbers or CVV codes on our servers</li>
                  <li>Payment data is tokenized and handled entirely by Paystack's secure infrastructure</li>
                  <li>All payment pages use extended validation SSL certificates</li>
                  <li>Transactions are monitored for fraudulent activity in real time</li>
                  <li>Chargebacks and disputes are managed through our payment processor's secure portal</li>
                </ul>
              </div>
            </Card.Body>
          </Card>

          {/* Data Protection */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Server className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Data Protection
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Data Storage
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>User data is stored in Supabase, a SOC 2 Type II certified platform</li>
                    <li>Row-level security (RLS) policies ensure users can only access their own data</li>
                    <li>Regular automated backups with point-in-time recovery</li>
                    <li>Data is replicated across multiple availability zones</li>
                  </ul>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Access Controls
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 ml-4">
                    <li>Internal staff access to user data follows the principle of least privilege</li>
                    <li>All admin actions are logged and auditable</li>
                    <li>Background checks and NDAs are required for all team members with data access</li>
                  </ul>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Monitoring */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Eye className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Security Monitoring
                </h3>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>24/7 automated monitoring for unusual login attempts and account activity</li>
                <li>Rate limiting on all authentication endpoints to prevent brute-force attacks</li>
                <li>IP-based anomaly detection for suspicious access patterns</li>
                <li>Automated alerts for high-risk events such as admin logins and bulk data access</li>
                <li>Dependency vulnerability scanning on every deployment</li>
              </ul>
            </Card.Body>
          </Card>

          {/* Incident Response */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Incident Response
                </h3>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  In the event of a security incident, we commit to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                  <li>Notifying affected users within 72 hours of discovering a breach, as required by applicable law</li>
                  <li>Providing clear information about what data was affected and what steps to take</li>
                  <li>Working with relevant authorities and regulators as required</li>
                  <li>Conducting a post-incident review and implementing corrective measures</li>
                </ul>
              </div>
            </Card.Body>
          </Card>

          {/* Responsible Disclosure */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircle className="h-6 w-6 text-success-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Responsible Disclosure
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you discover a security vulnerability in our platform, we encourage responsible
                disclosure. Please report it to us privately before disclosing it publicly so we
                can address it promptly.
              </p>
              <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-200 dark:border-primary-800">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Report security issues to:</strong>{' '}
                  <a href="mailto:security@smartalgos.com" className="text-primary-600 hover:underline">
                    security@smartalgos.com
                  </a>
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm">
                  Please include a description of the vulnerability, steps to reproduce, and the
                  potential impact. We will acknowledge your report within 48 hours.
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* Contact */}
          <Card>
            <Card.Body>
              <div className="flex items-center space-x-3 mb-6">
                <Mail className="h-6 w-6 text-primary-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Contact
                </h3>
              </div>
              <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-lg border border-primary-200 dark:border-primary-800">
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p><strong>Smart Algos Investment Solution Ltd</strong></p>
                  <p>
                    <strong>Security:</strong>{' '}
                    <a href="mailto:security@smartalgos.com" className="text-primary-600 hover:underline">
                      security@smartalgos.com
                    </a>
                  </p>
                  <p>
                    <strong>Support:</strong>{' '}
                    <a href="mailto:support@smartalgos.com" className="text-primary-600 hover:underline">
                      support@smartalgos.com
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
            Security is a shared responsibility. We protect the platform; you protect your account credentials.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SecurityPolicy;
