import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  X, 
  Zap, 
  Shield, 
  TrendingUp, 
  BarChart3,
  Users,
  Clock,
  Star,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { useAuth } from '../../contexts/AuthContext';
import RiskDisclaimer from '../../components/Compliance/RiskDisclaimer';

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      tagline: 'Perfect for individual traders',
      monthlyPrice: 99,
      annualPrice: 990,
      description: 'Essential tools for getting started with algorithmic trading',
      features: [
        'Access to 5+ Expert Advisors',
        'Basic trading signals',
        'Market data & news',
        'Portfolio tracking',
        'Email support',
        'Community forum access',
        'Mobile app access',
        'Basic risk management tools'
      ],
      limitations: [
        'Limited EA access',
        'Standard signal frequency',
        'Basic analytics'
      ],
      icon: TrendingUp,
      color: 'blue',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      tagline: 'For serious traders and small funds',
      monthlyPrice: 299,
      annualPrice: 2990,
      description: 'Advanced features for professional traders',
      features: [
        'Access to 50+ Expert Advisors',
        'Advanced trading signals',
        'Real-time market data',
        'Advanced portfolio analytics',
        'Priority email & chat support',
        'Advanced risk management',
        'Custom EA development (1/month)',
        'API access',
        'Backtesting tools',
        'Performance reports',
        'Multi-account management',
        'Advanced charting tools'
      ],
      limitations: [
        'Standard API rate limits',
        'Community support for custom features'
      ],
      icon: Zap,
      color: 'primary',
      popular: true,
      badge: 'Most Popular'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      tagline: 'For hedge funds and institutions',
      monthlyPrice: 999,
      annualPrice: 9990,
      description: 'White-glove service for institutional clients',
      features: [
        'Unlimited EA access',
        'Premium trading signals',
        'Real-time market data + news feeds',
        'Advanced portfolio analytics & reporting',
        '24/7 dedicated support',
        'Dedicated account manager',
        'Unlimited custom EA development',
        'Unlimited API access',
        'Advanced backtesting & optimization',
        'Custom integrations',
        'SLA guarantees (99.9% uptime)',
        'White-label options',
        'Volume discounts',
        'On-premise deployment options',
        'Advanced compliance & audit trails',
        'Multi-region deployment'
      ],
      limitations: [],
      icon: Shield,
      color: 'purple',
      popular: false,
      badge: 'Enterprise'
    }
  ];

  const handleGetStarted = (planId) => {
    if (user) {
      // User is logged in, navigate to subscription page
      navigate('/subscription', { state: { selectedPlan: planId } });
    } else {
      // User not logged in, navigate to registration
      navigate('/auth/register', { state: { selectedPlan: planId } });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const calculateAnnualSavings = (monthlyPrice) => {
    const annualFromMonthly = monthlyPrice * 12;
    const annualPrice = (annualFromMonthly * 0.83).toFixed(0); // 17% savings
    return annualFromMonthly - annualPrice;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Trading Plan
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              Professional algorithmic trading tools for traders of all levels. Start with Basic, scale to Pro, or go Enterprise for institutional-grade features.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                Annual
                {billingCycle === 'annual' && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full">
                    Save 17%
                  </span>
                )}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
            const displayPrice = billingCycle === 'annual' ? Math.round(price / 12) : price;
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative ${plan.popular ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}
                
                <Card className={`h-full flex flex-col ${plan.popular ? 'border-2 border-primary-500 shadow-xl' : ''}`}>
                  <div className="p-8 flex flex-col flex-1">
                    {/* Plan Header */}
                    <div className="text-center mb-6">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${plan.color}-100 dark:bg-${plan.color}-900/30 mb-4`}>
                        <Icon className={`w-8 h-8 text-${plan.color}-600 dark:text-${plan.color}-400`} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {plan.tagline}
                      </p>
                      <div className="mb-2">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          {formatPrice(displayPrice)}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">/month</span>
                      </div>
                      {billingCycle === 'annual' && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Billed {formatPrice(plan.annualPrice)} annually
                        </p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {plan.description}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="flex-1 mb-8">
                      <div className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start">
                            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {feature}
                            </span>
                          </div>
                        ))}
                        {plan.limitations.map((limitation, idx) => (
                          <div key={idx} className="flex items-start opacity-60">
                            <X className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-500 dark:text-gray-500">
                              {limitation}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handleGetStarted(plan.id)}
                      variant={plan.popular ? 'primary' : 'outline'}
                      size="lg"
                      className="w-full"
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16"
        >
          <Card>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Feature Comparison
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-4 font-semibold text-gray-900 dark:text-white">Feature</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">Basic</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">Pro</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Expert Advisors Access', '5+', '50+', 'Unlimited'],
                      ['Trading Signals', 'Basic', 'Advanced', 'Premium'],
                      ['API Access', 'No', 'Yes (Standard)', 'Yes (Unlimited)'],
                      ['Custom EA Development', 'No', '1/month', 'Unlimited'],
                      ['Support', 'Email', 'Priority', '24/7 Dedicated'],
                      ['SLA Guarantee', 'No', 'No', '99.9% Uptime'],
                      ['Account Manager', 'No', 'No', 'Yes'],
                      ['White-label Options', 'No', 'No', 'Yes'],
                    ].map(([feature, basic, pro, enterprise], idx) => (
                      <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{feature}</td>
                        <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-400">{basic}</td>
                        <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-400">{pro}</td>
                        <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-400">{enterprise}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Risk Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8"
        >
          <RiskDisclaimer variant="compact" />
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16"
        >
          <Card>
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6 max-w-3xl mx-auto">
                {[
                  {
                    q: 'Can I switch plans later?',
                    a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate the billing.'
                  },
                  {
                    q: 'Do you offer refunds?',
                    a: 'We offer a 7-day money-back guarantee for new subscriptions. See our Refund Policy for details.'
                  },
                  {
                    q: 'What payment methods do you accept?',
                    a: 'We accept all major credit cards, PayPal, bank transfers, and cryptocurrency payments.'
                  },
                  {
                    q: 'Is there a free trial?',
                    a: 'Yes, we offer a 14-day free trial for the Pro plan. No credit card required to start.'
                  },
                  {
                    q: 'Can I cancel anytime?',
                    a: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.'
                  }
                ].map((faq, idx) => (
                  <div key={idx} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;

