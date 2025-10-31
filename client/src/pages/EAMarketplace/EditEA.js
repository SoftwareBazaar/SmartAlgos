import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Upload, 
  X, 
  Save, 
  Eye, 
  Trash2, 
  Plus,
  Image as ImageIcon,
  Settings,
  BarChart3,
  Target,
  DollarSign,
  Calendar,
  Tag
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { useEA } from '../../contexts/EAContext';

const EditEA = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { eas, updateEA } = useEA();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Find the EA to edit
  const ea = eas.find(e => e.id === parseInt(id));

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '',
    status: 'pending',
    price: '',
    category: '',
    tags: '',
    image: null,
    screenshots: [],
    features: [],
    specifications: {
      winRate: '',
      monthlyReturn: '',
      maxDrawdown: '',
      profitFactor: '',
      totalTrades: '',
      supportedPairs: '',
      timeframes: '',
      minDeposit: '',
      recommendedDeposit: '',
      maxSpread: '',
      slippageTolerance: '',
      riskLevel: '',
      maxRiskPerTrade: '',
      maxDailyRisk: ''
    }
  });

  const [newFeature, setNewFeature] = useState('');
  const [newScreenshot, setNewScreenshot] = useState(null);
  const [eaFile, setEaFile] = useState(null);

  useEffect(() => {
    if (ea) {
      setFormData({
        name: ea.name || '',
        description: ea.description || '',
        version: ea.version || '',
        status: ea.status || 'pending',
        price: ea.price || '',
        category: ea.category || '',
        tags: ea.tags || '',
        image: ea.image || null,
        screenshots: ea.screenshots || [],
        features: ea.features || [],
        specifications: {
          winRate: ea.specifications?.winRate || '',
          monthlyReturn: ea.specifications?.monthlyReturn || '',
          maxDrawdown: ea.specifications?.maxDrawdown || '',
          profitFactor: ea.specifications?.profitFactor || '',
          totalTrades: ea.specifications?.totalTrades || '',
          supportedPairs: ea.specifications?.supportedPairs || '',
          timeframes: ea.specifications?.timeframes || '',
          minDeposit: ea.specifications?.minDeposit || '',
          recommendedDeposit: ea.specifications?.recommendedDeposit || '',
          maxSpread: ea.specifications?.maxSpread || '',
          slippageTolerance: ea.specifications?.slippageTolerance || '',
          riskLevel: ea.specifications?.riskLevel || '',
          maxRiskPerTrade: ea.specifications?.maxRiskPerTrade || '',
          maxDailyRisk: ea.specifications?.maxDailyRisk || ''
        }
      });
    }
  }, [ea]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSpecificationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value
      }
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Store the file object for upload
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleScreenshotUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewScreenshot(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addScreenshot = () => {
    if (newScreenshot) {
      setFormData(prev => ({
        ...prev,
        screenshots: [...prev.screenshots, newScreenshot]
      }));
      setNewScreenshot(null);
    }
  };

  const removeScreenshot = (index) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index)
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleEaFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setEaFile(file);
      setFormData(prev => ({
        ...prev,
        eaFile: file
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEA(id, formData);
      navigate('/ea-marketplace');
    } catch (error) {
      console.error('Error saving EA:', error);
      alert('Failed to save EA. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!ea) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">EA not found</h2>
          <Button 
            variant="outline" 
            onClick={() => navigate('/ea-marketplace')}
            className="mt-4"
          >
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit EA</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Update your Expert Advisor details and preview</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/ea-marketplace')}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Basic Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  EA Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter EA name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Describe your EA's features and strategy"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Version
                  </label>
                  <Input
                    value={formData.version}
                    onChange={(e) => handleInputChange('version', e.target.value)}
                    placeholder="e.g., 1.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price
                  </label>
                  <Input
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="e.g., $299"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    <option value="scalping">Scalping</option>
                    <option value="trend">Trend Following</option>
                    <option value="news">News Trading</option>
                    <option value="grid">Grid Trading</option>
                    <option value="arbitrage">Arbitrage</option>
                    <option value="hedging">Hedging</option>
                    <option value="institutional">Institutional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <Input
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="e.g., gold,scalping,mt4"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* EA Image */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              EA Image
            </h3>
            
            <div className="space-y-4">
              {formData.image ? (
                <div className="relative">
                  <img 
                    src={formData.image instanceof File ? URL.createObjectURL(formData.image) : formData.image} 
                    alt="EA Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleInputChange('image', null)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No image uploaded</p>
                  </div>
                </div>
              )}

              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary-50 file:text-primary-700
                    hover:file:bg-primary-100
                    dark:file:bg-primary-900 dark:file:text-primary-300"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Upload a preview image for your EA
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Screenshots */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Screenshots
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {formData.screenshots.map((screenshot, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={screenshot} 
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeScreenshot(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="flex-1 text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary-50 file:text-primary-700
                    hover:file:bg-primary-100
                    dark:file:bg-primary-900 dark:file:text-primary-300"
                />
                <Button 
                  variant="outline" 
                  onClick={addScreenshot}
                  disabled={!newScreenshot}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* EA File Upload */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              EA File
            </h3>
            
            <div className="space-y-4">
              {eaFile ? (
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bot className="h-8 w-8 text-primary-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{eaFile.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(eaFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEaFile(null);
                      setFormData(prev => ({ ...prev, eaFile: null }));
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Bot className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No EA file uploaded</p>
                  </div>
                </div>
              )}

              <div>
                <input
                  type="file"
                  accept=".ex4,.mq4,.mq5,.ex5"
                  onChange={handleEaFileUpload}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary-50 file:text-primary-700
                    hover:file:bg-primary-100
                    dark:file:bg-primary-900 dark:file:text-primary-300"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Upload EA file (.ex4, .mq4, .mq5, .ex5)
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Features */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Features
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    <span className="text-sm">{feature}</span>
                    <button
                      onClick={() => removeFeature(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature..."
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                />
                <Button 
                  variant="outline" 
                  onClick={addFeature}
                  disabled={!newFeature.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Specifications */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Trading Specifications
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Win Rate (%)
              </label>
              <Input
                value={formData.specifications.winRate}
                onChange={(e) => handleSpecificationChange('winRate', e.target.value)}
                placeholder="e.g., 85"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monthly Return (%)
              </label>
              <Input
                value={formData.specifications.monthlyReturn}
                onChange={(e) => handleSpecificationChange('monthlyReturn', e.target.value)}
                placeholder="e.g., 15"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Drawdown (%)
              </label>
              <Input
                value={formData.specifications.maxDrawdown}
                onChange={(e) => handleSpecificationChange('maxDrawdown', e.target.value)}
                placeholder="e.g., 5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Profit Factor
              </label>
              <Input
                value={formData.specifications.profitFactor}
                onChange={(e) => handleSpecificationChange('profitFactor', e.target.value)}
                placeholder="e.g., 2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Trades
              </label>
              <Input
                value={formData.specifications.totalTrades}
                onChange={(e) => handleSpecificationChange('totalTrades', e.target.value)}
                placeholder="e.g., 1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Supported Pairs
              </label>
              <Input
                value={formData.specifications.supportedPairs}
                onChange={(e) => handleSpecificationChange('supportedPairs', e.target.value)}
                placeholder="e.g., EURUSD,GBPUSD"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timeframes
              </label>
              <Input
                value={formData.specifications.timeframes}
                onChange={(e) => handleSpecificationChange('timeframes', e.target.value)}
                placeholder="e.g., M1,M5,M15"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Min Deposit ($)
              </label>
              <Input
                value={formData.specifications.minDeposit}
                onChange={(e) => handleSpecificationChange('minDeposit', e.target.value)}
                placeholder="e.g., 1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recommended Deposit ($)
              </label>
              <Input
                value={formData.specifications.recommendedDeposit}
                onChange={(e) => handleSpecificationChange('recommendedDeposit', e.target.value)}
                placeholder="e.g., 5000"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EditEA;
