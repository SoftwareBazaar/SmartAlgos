import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Calendar, 
  Download, 
  TrendingUp,
  DollarSign,
  Clock,
  BarChart3,
  Settings,
  Upload,
  Eye,
  BookOpen,
  AlertTriangle,
  Shield,
  Star,
  MessageCircle,
  ThumbsUp,
  X,
  Plus,
  Image as ImageIcon
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { useUtilities } from '../../contexts/UtilitiesContext';

const UtilitiesPage = () => {
  const { utilities } = useUtilities();
  const [selectedUtility, setSelectedUtility] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);

  // Get icon mapping for utilities
  const getUtilityIcon = (category) => {
    switch (category) {
      case 'Risk Management':
        return Calculator;
      case 'Market Analysis':
        return Calendar;
      case 'Trading Tools':
        return TrendingUp;
      case 'EA Tools':
        return Settings;
      default:
        return Settings;
    }
  };

  const categories = [
    { id: 'all', name: 'All Tools', count: utilities.length },
    { id: 'Risk Management', name: 'Risk Management', count: utilities.filter(u => u.category === 'Risk Management').length },
    { id: 'Market Analysis', name: 'Market Analysis', count: utilities.filter(u => u.category === 'Market Analysis').length },
    { id: 'Trading Tools', name: 'Trading Tools', count: utilities.filter(u => u.category === 'Trading Tools').length },
    { id: 'EA Tools', name: 'EA Tools', count: utilities.filter(u => u.category === 'EA Tools').length },
  ];

  const [activeCategory, setActiveCategory] = useState('all');

  const filteredUtilities = activeCategory === 'all' 
    ? utilities 
    : utilities.filter(utility => utility.category === activeCategory);

  const getCategoryColor = (category) => {
    const colors = {
      'Risk Management': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Market Analysis': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Trading Tools': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'EA Tools': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const handleDownload = (utility) => {
    // Simulate download
    console.log(`Downloading ${utility.name}...`);
    // In a real app, this would trigger the actual download
    alert(`Downloading ${utility.name} v${utility.version}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
              Free Trading Utilities
            </h1>
            <p className="mt-2 text-brand-200 font-medium">
              Professional trading tools and calculators - completely free
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">FREE</div>
            <div className="text-sm text-gray-400">No subscription required</div>
          </div>
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </motion.div>

      {/* Utilities Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredUtilities.map((utility, index) => {
          const Icon = getUtilityIcon(utility.category);
          return (
          <motion.div
            key={utility.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card hover className="h-full">
              <div className="p-6">
                {/* Utility Image */}
                <div className="mb-4">
                  <img 
                    key={`utility-${utility.id}-${utility.imageTimestamp || utility.updated_at || 0}`}
                    src={utility.image} 
                    alt={utility.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                      <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {utility.name}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(utility.category)}`}>
                        {utility.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                    <div>v{utility.version}</div>
                    <div>{utility.size}</div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {utility.description}
                </p>

                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Features:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {utility.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    {utility.downloads.toLocaleString()} downloads
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDownload(utility)}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUtility(utility);
                      setShowGuide(true);
                    }}
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUtility(utility);
                      setShowGuide(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
          );
        })}
      </motion.div>

      {/* ROI Guarantee Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">40% ROI Guarantee</h3>
              <p className="text-green-100">
                We guarantee a 40% return on investment when using our tools properly. 
                If you don't see results, we'll refund your subscription.
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">40%</div>
            <div className="text-sm text-green-100">ROI Guaranteed</div>
          </div>
        </div>
      </motion.div>

      {/* Trading Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-red-900/20 border border-red-500/30 rounded-lg p-6"
      >
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-400 mb-2">
              Trading Risk Disclaimer
            </h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>
                <strong>Trading involves substantial risk of loss and is not suitable for all investors.</strong> 
                The high degree of leverage can work against you as well as for you. Before deciding to trade, 
                you should carefully consider your investment objectives, level of experience, and risk appetite.
              </p>
              <p>
                Past performance is not indicative of future results. No representation is being made that 
                any account will or is likely to achieve profits or losses similar to those shown. 
                The possibility exists that you could sustain a loss of some or all of your initial investment.
              </p>
              <p>
                <strong>Never trade with money you cannot afford to lose.</strong> Only invest capital that 
                you can afford to lose without affecting your lifestyle or financial security.
              </p>
            </div>
            
            {/* Disclaimer Acceptance */}
            <div className="mt-4 p-4 bg-red-800/30 rounded-lg border border-red-500/50">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="disclaimer-accept"
                  className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-red-300 rounded"
                />
                <label htmlFor="disclaimer-accept" className="text-sm text-gray-300">
                  <strong className="text-red-300">I acknowledge and accept the trading risks:</strong>
                  <ul className="mt-2 ml-4 space-y-1 text-xs">
                    <li>• I understand that trading involves substantial risk of loss</li>
                    <li>• I will only trade with money I can afford to lose</li>
                    <li>• I understand that past performance does not guarantee future results</li>
                    <li>• I have read and understood all the risk warnings above</li>
                  </ul>
                </label>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Feedback Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-gray-800 rounded-lg p-6"
      >
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">
            We Appreciate Your Feedback
          </h3>
          <p className="text-gray-300">
            Help us improve by sharing your experience with our tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium text-white mb-4">Rate Our Tools</h4>
            <div className="flex space-x-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-400'
                  }`}
                >
                  <Star className="h-6 w-6" />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-400">
              {rating === 0 ? 'Click to rate' : 
               rating === 1 ? 'Poor' :
               rating === 2 ? 'Fair' :
               rating === 3 ? 'Good' :
               rating === 4 ? 'Very Good' : 'Excellent'}
            </p>
          </div>

          <div>
            <h4 className="text-lg font-medium text-white mb-4">Share Your Experience</h4>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about your experience with our tools..."
              className="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button 
              variant="primary" 
              className="mt-3"
              onClick={() => {
                alert('Thank you for your feedback! We appreciate your input.');
                setFeedback('');
                setRating(0);
              }}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Submit Feedback
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gray-800 rounded-lg p-6"
      >
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">
            Why Our Free Utilities?
          </h3>
          <p className="text-gray-300 mb-4">
            We believe in providing professional-grade tools to help traders succeed. 
            These utilities are completely free and regularly updated with new features.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">No registration required</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Regular updates</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Professional quality</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Guide Modal */}
      {showGuide && selectedUtility && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {selectedUtility.guide.title}
              </h3>
              <button
                onClick={() => setShowGuide(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Tool Preview</h4>
                  <img 
                    key={`modal-${selectedUtility.id}-${selectedUtility.imageTimestamp || selectedUtility.updated_at || 0}`}
                    src={selectedUtility.image} 
                    alt={selectedUtility.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Additional Previews</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedUtility.previews.map((preview, idx) => (
                      <img 
                        key={idx}
                        src={preview} 
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-16 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">How to Use</h4>
                <ol className="space-y-2">
                  {selectedUtility.guide.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="primary"
                  onClick={() => handleDownload(selectedUtility)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowGuide(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UtilitiesPage;
