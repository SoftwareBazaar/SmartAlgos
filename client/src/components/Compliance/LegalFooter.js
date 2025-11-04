import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Lock } from 'lucide-react';

/**
 * Legal Footer Component
 * Displays risk/legal footers on all pages
 */
const LegalFooter = ({ className = '' }) => {
  return (
    <footer className={`bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          {/* Legal Links */}
          <div>
            <h5 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Legal
            </h5>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                <Link to="/terms" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refund" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance */}
          <div>
            <h5 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Compliance
            </h5>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>KYC/AML Compliant</li>
              <li>Regulatory Compliance</li>
              <li>Risk Disclosures</li>
            </ul>
          </div>

          {/* Security */}
          <div>
            <h5 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Security
            </h5>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>256-bit SSL Encryption</li>
              <li>Secure Payment Processing</li>
              <li>Data Protection</li>
            </ul>
          </div>
        </div>

        {/* Risk Warning */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            <strong className="text-gray-900 dark:text-white">Risk Warning:</strong> Trading financial instruments 
            involves substantial risk of loss. Past performance does not guarantee future results. Only trade with 
            capital you can afford to lose. This platform does not provide financial advice. Please ensure you understand 
            the risks involved before trading.
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
            © {new Date().getFullYear()} Smart Algos Trading Platform. All rights reserved. | Embu, Kenya
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LegalFooter;

