import React from 'react';
import { AlertTriangle, Shield } from 'lucide-react';

/**
 * Risk Disclaimer Component
 * Displays trading risk warnings and regulatory compliance notices
 */
const RiskDisclaimer = ({ variant = 'default', className = '' }) => {
  const baseClasses = 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4';
  
  if (variant === 'compact') {
    return (
      <div className={`${baseClasses} ${className} overflow-hidden`}>
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-300 break-words">
            <strong>Risk Warning:</strong> Trading involves substantial risk of loss. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`${baseClasses} ${className}`}>
        <p className="text-xs text-amber-800 dark:text-amber-300 text-center">
          Trading financial instruments involves substantial risk of loss. Only trade with capital you can afford to lose.
        </p>
      </div>
    );
  }

  // Default variant - full disclaimer
  return (
    <div className={`${baseClasses} ${className}`}>
      <div className="flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
            Risk Warning & Regulatory Compliance
          </h4>
          <div className="space-y-1.5 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            <p>
              <strong>Trading Risk:</strong> Trading financial instruments, including forex, CFDs, and cryptocurrencies, 
              involves substantial risk of loss. You may lose some or all of your invested capital. Past performance 
              does not guarantee future results.
            </p>
            <p>
              <strong>Regulatory Notice:</strong> This platform operates in compliance with applicable financial 
              regulations. Trading may be subject to regulatory oversight in your jurisdiction. Please ensure you 
              understand the legal and regulatory requirements applicable to you.
            </p>
            <p>
              <strong>Not Financial Advice:</strong> All trading signals, strategies, and information provided on 
              this platform are for educational and informational purposes only. They do not constitute financial 
              advice, investment recommendations, or solicitation to trade.
            </p>
            <p>
              <strong>Suitability:</strong> Trading may not be suitable for all investors. Please assess your 
              financial situation, risk tolerance, and trading experience before engaging in any trading activities.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2 text-xs">
              <div className="flex-1">
                <p className="text-amber-700 dark:text-amber-400 font-medium mb-1">
                  Regulatory Compliance:
                </p>
                <ul className="space-y-1 text-amber-600 dark:text-amber-500">
                  <li>• CFTC: Trading forex and CFDs carries a high level of risk and may not be suitable for all investors.</li>
                  <li>• SEC: This platform provides educational trading tools and does not provide investment advice.</li>
                  <li>• Compliance with applicable financial regulations in your jurisdiction is required.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDisclaimer;

