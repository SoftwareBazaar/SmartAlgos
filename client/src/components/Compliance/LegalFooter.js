import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Lock, Award, ExternalLink } from 'lucide-react';

/**
 * Legal Footer Component
 * Displays risk/legal footers, compliance badges, and partners on all pages
 */
const LegalFooter = ({ className = '' }) => {
  const partners = [
    {
      name: 'Funding Pips',
      url: 'https://fundingpips.com',
      description: 'Prop trading firm'
    },
    {
      name: 'Funded Next',
      url: 'https://fundednext.com',
      description: 'Prop funding challenge'
    },
    {
      name: 'FTMO',
      url: 'https://ftmo.com',
      description: 'Funded trader program'
    },
    {
      name: 'MyForexFunds',
      url: 'https://myforexfunds.com',
      description: 'Prop trading'
    },
  ];

  const compliance = [
    { label: 'GDPR', title: 'General Data Protection Regulation — EU data privacy standard' },
    { label: 'PCI-DSS', title: 'Payment Card Industry Data Security Standard' },
    { label: 'ISO 27001', title: 'International standard for information security management' },
    { label: 'SOC 2', title: 'Service Organization Control 2 — data security & availability (via Supabase)' },
    { label: 'AML/KYC', title: 'Anti-Money Laundering & Know Your Customer compliance' },
  ];

  return (
    <footer className={`bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Partners Section */}
        <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 text-center">
            Compatible with Leading Prop Firms
          </h5>
          <div className="flex flex-wrap justify-center gap-3">
            {partners.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                title={p.description}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {p.name}
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            ))}
          </div>
        </div>

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
              <li>
                <Link to="/security" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Security Policy
                </Link>
              </li>
              <li>
                <Link to="/disclaimers" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Disclaimers
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance */}
          <div>
            <h5 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Compliance Standards
            </h5>
            <div className="flex flex-wrap gap-2">
              {compliance.map((c) => (
                <span
                  key={c.label}
                  title={c.title}
                  className="inline-flex items-center px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-default"
                >
                  <Award className="w-3 h-3 mr-1 text-primary-500" />
                  {c.label}
                </span>
              ))}
            </div>
          </div>

          {/* Security */}
          <div>
            <h5 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Security
            </h5>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>256-bit TLS Encryption</li>
              <li>Secure Payment Processing</li>
              <li>Row-Level Data Protection</li>
              <li>Regular Security Audits</li>
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
            © {new Date().getFullYear()} Smart Algos Trading Platform. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">
            Smart Algos Investment Solution Ltd (Kenya) · Embu, Kenya
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LegalFooter;

