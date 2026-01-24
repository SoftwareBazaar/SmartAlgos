import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, Plus, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';
import { ScreenshotDisplay } from '../ImageDisplay';

const EnhancedEAEditor = ({ ea, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    description: '',
    version: '',
    category: 'scalping',
    status: 'active',
    
    // Pricing
    price_weekly: '',
    price_monthly: '',
    price_yearly: '',
    
    // Performance Metrics
    win_rate: '',
    profit_factor: '',
    max_drawdown: '',
    sharpe_ratio: '',
    total_trades: '',
    profitable_trades: '',
    
    // Trading Info
    supported_pairs: '',
    timeframes: '',
    min_deposit: '',
    recommended_deposit: '',
    max_spread: '',
    risk_level: 'medium',
    
    // Keywords/Tags
    keywords: '',
    
    // Files
    image: null,
    eaFile: null,
    zipFile: null,
    screenshots: [],
  });

  const [existingScreenshots, setExistingScreenshots] = useState([]);
  const [previewScreenshots, setPreviewScreenshots] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (ea) {
      setFormData({
        name: ea.name || '',
        description: ea.description || '',
        version: ea.version || '',
        category: ea.category || 'scalping',
        status: ea.status || 'active',
        price_weekly: ea.price_weekly || '',
        price_monthly: ea.price_monthly || '',
        price_yearly: ea.price_yearly || '',
        win_rate: ea.win_rate || '',
        profit_factor: ea.profit_factor || '',
        max_drawdown: ea.max_drawdown || '',
        sharpe_ratio: ea.sharpe_ratio || '',
        total_trades: ea.total_trades || '',
        profitable_trades: ea.profitable_trades || '',
        supported_pairs: Array.isArray(ea.supported_pairs) ? ea.supported_pairs.join(', ') : '',
        timeframes: Array.isArray(ea.timeframes) ? ea.timeframes.join(', ') : '',
        min_deposit: ea.min_deposit || '',
        recommended_deposit: ea.recommended_deposit || '',
        max_spread: ea.max_spread || '',
        risk_level: ea.risk_level || 'medium',
        keywords: Array.isArray(ea.keywords) ? ea.keywords.join(', ') : '',
        image: ea.image || null, // Keep existing image URL
        eaFile: null,
        zipFile: null,
        screenshots: [],
      });

      if (ea.image) {
        setImagePreview(ea.image);
      }

      if (ea.screenshots && Array.isArray(ea.screenshots)) {
        setExistingScreenshots(ea.screenshots);
      }
    }
  }, [ea]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEAFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, eaFile: file }));
    }
  };

  const handleZipFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.zip')) {
        alert('Please upload a ZIP file');
        return;
      }

      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (file.size > maxSize) {
        alert('ZIP file is too large. Maximum size is 100MB');
        return;
      }

      console.log('📦 ZIP file selected:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      setFormData(prev => ({ ...prev, zipFile: file }));
    }
  };

  const handleScreenshotUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, screenshots: [...prev.screenshots, ...files] }));
      setPreviewScreenshots(prev => [...prev, ...newPreviews]);
    }
  };

  const removeScreenshot = (index) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter((_, i) => i !== index)
    }));
    setPreviewScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingScreenshot = (index) => {
    setExistingScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare FormData for submission
    const submitData = new FormData();
    
    // Add basic fields
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('version', formData.version);
    submitData.append('category', formData.category);
    submitData.append('status', formData.status);
    submitData.append('price', formData.price_monthly); // Backend will handle all price tiers
    submitData.append('riskLevel', formData.risk_level);
    
    // Add performance metrics
    if (formData.win_rate) submitData.append('win_rate', formData.win_rate);
    if (formData.profit_factor) submitData.append('profit_factor', formData.profit_factor);
    if (formData.max_drawdown) submitData.append('max_drawdown', formData.max_drawdown);
    if (formData.sharpe_ratio) submitData.append('sharpe_ratio', formData.sharpe_ratio);
    if (formData.total_trades) submitData.append('total_trades', formData.total_trades);
    if (formData.profitable_trades) submitData.append('profitable_trades', formData.profitable_trades);
    
    // Add trading info
    if (formData.supported_pairs) submitData.append('supported_pairs', formData.supported_pairs);
    if (formData.timeframes) submitData.append('timeframes', formData.timeframes);
    if (formData.min_deposit) submitData.append('min_deposit', formData.min_deposit);
    if (formData.recommended_deposit) submitData.append('recommended_deposit', formData.recommended_deposit);
    if (formData.max_spread) submitData.append('max_spread', formData.max_spread);
    
    // Add keywords
    if (formData.keywords) submitData.append('tags', formData.keywords);
    
    // Add files - only append if it's a File object (new upload)
    if (formData.image && formData.image instanceof File) {
      submitData.append('image', formData.image);
    }
    if (formData.eaFile) submitData.append('eaFile', formData.eaFile);
    if (formData.zipFile) submitData.append('zipFile', formData.zipFile);
    
    // Add screenshots - send both existing (after deletions) and new uploads
    // First, send the current state of existing screenshots (after any deletions)
    existingScreenshots.forEach((screenshot, index) => {
      submitData.append(`existingScreenshots[${index}]`, screenshot);
    });
    
    // Then add new screenshot uploads
    formData.screenshots.forEach(screenshot => {
      submitData.append('screenshots', screenshot);
    });
    
    // Call onSave with FormData
    await onSave(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {ea ? 'Edit EA' : 'Create New EA'}
          </h3>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <Card>
            <Card.Body>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Basic Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    EA Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter EA name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Version *
                  </label>
                  <Input
                    value={formData.version}
                    onChange={(e) => handleChange('version', e.target.value)}
                    placeholder="e.g., 1.0.0"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe the EA's strategy, features, and benefits..."
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
                    required
                  >
                    <option value="scalping">Scalping</option>
                    <option value="trend">Trend Following</option>
                    <option value="news">News Trading</option>
                    <option value="grid">Grid Trading</option>
                    <option value="arbitrage">Arbitrage</option>
                    <option value="martingale">Martingale</option>
                    <option value="hedging">Hedging</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Risk Level
                  </label>
                  <select
                    value={formData.risk_level}
                    onChange={(e) => handleChange('risk_level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="very-high">Very High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Keywords (comma separated)
                </label>
                <Input
                  value={formData.keywords}
                  onChange={(e) => handleChange('keywords', e.target.value)}
                  placeholder="gold, scalping, mt5, high-frequency"
                />
              </div>
            </Card.Body>
          </Card>

          {/* Pricing */}
          <Card>
            <Card.Body>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Pricing
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Weekly Price ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price_weekly}
                    onChange={(e) => handleChange('price_weekly', e.target.value)}
                    placeholder="6.99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Price ($) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price_monthly}
                    onChange={(e) => handleChange('price_monthly', e.target.value)}
                    placeholder="18.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lifetime Price ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price_yearly}
                    onChange={(e) => handleChange('price_yearly', e.target.value)}
                    placeholder="97.00"
                  />
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <Card.Body>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Performance Metrics
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Win Rate (%)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.win_rate}
                    onChange={(e) => handleChange('win_rate', e.target.value)}
                    placeholder="68.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profit Factor
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.profit_factor}
                    onChange={(e) => handleChange('profit_factor', e.target.value)}
                    placeholder="1.8"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Drawdown (%)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.max_drawdown}
                    onChange={(e) => handleChange('max_drawdown', e.target.value)}
                    placeholder="12.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sharpe Ratio
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.sharpe_ratio}
                    onChange={(e) => handleChange('sharpe_ratio', e.target.value)}
                    placeholder="2.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Trades
                  </label>
                  <Input
                    type="number"
                    value={formData.total_trades}
                    onChange={(e) => handleChange('total_trades', e.target.value)}
                    placeholder="500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profitable Trades
                  </label>
                  <Input
                    type="number"
                    value={formData.profitable_trades}
                    onChange={(e) => handleChange('profitable_trades', e.target.value)}
                    placeholder="340"
                  />
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Trading Information */}
          <Card>
            <Card.Body>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Trading Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Supported Pairs (comma separated)
                  </label>
                  <Input
                    value={formData.supported_pairs}
                    onChange={(e) => handleChange('supported_pairs', e.target.value)}
                    placeholder="XAUUSD, EURUSD, GBPUSD"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timeframes (comma separated)
                  </label>
                  <Input
                    value={formData.timeframes}
                    onChange={(e) => handleChange('timeframes', e.target.value)}
                    placeholder="M1, M5, M15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min Deposit ($)
                  </label>
                  <Input
                    type="number"
                    value={formData.min_deposit}
                    onChange={(e) => handleChange('min_deposit', e.target.value)}
                    placeholder="500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recommended Deposit ($)
                  </label>
                  <Input
                    type="number"
                    value={formData.recommended_deposit}
                    onChange={(e) => handleChange('recommended_deposit', e.target.value)}
                    placeholder="2000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Spread (points)
                  </label>
                  <Input
                    type="number"
                    value={formData.max_spread}
                    onChange={(e) => handleChange('max_spread', e.target.value)}
                    placeholder="30"
                  />
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* File Uploads */}
          <Card>
            <Card.Body>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Files & Media
              </h4>

              {/* EA Main Image */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  EA Main Image
                </label>
                <div className="flex items-center space-x-4">
                  {(imagePreview || formData.image) ? (
                    <img
                      src={imagePreview || (formData.image instanceof File ? URL.createObjectURL(formData.image) : formData.image)}
                      alt="EA Preview"
                      className="h-32 w-32 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1">
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
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              {/* EA File */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  EA File (.ex4, .mq4, .mq5, .ex5)
                </label>
                <input
                  type="file"
                  accept=".ex4,.mq4,.mq5,.ex5"
                  onChange={handleEAFileUpload}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary-50 file:text-primary-700
                    hover:file:bg-primary-100
                    dark:file:bg-primary-900 dark:file:text-primary-300"
                />
                {formData.eaFile && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Selected: {formData.eaFile.name}
                  </p>
                )}
              </div>

              {/* ZIP Package Upload (RECOMMENDED) */}
              <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                      <Upload className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-green-900 dark:text-green-100 mb-1">
                      📦 Complete EA Package (ZIP) - RECOMMENDED
                    </label>
                    <p className="text-xs text-green-700 dark:text-green-300 mb-3">
                      Upload a single ZIP file containing: EA file, SET file, Manual (PDF), and Screenshots. 
                      This will auto-download to users after payment!
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {formData.zipFile ? (
                    <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg p-3 flex-1">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 block">
                          {formData.zipFile.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {(formData.zipFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, zipFile: null }))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <input
                        type="file"
                        accept=".zip"
                        onChange={handleZipFileUpload}
                        className="block w-full text-sm text-gray-700 dark:text-gray-300
                          file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-green-500 file:text-white
                          hover:file:bg-green-600
                          cursor-pointer"
                      />
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        ✨ ZIP files up to 100MB • Users get instant download after payment
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Screenshots */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Screenshots (Performance Charts, Setup, etc.)
                </label>
                
                {/* Existing Screenshots */}
                {existingScreenshots.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Current Screenshots:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {existingScreenshots.map((screenshot, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <ScreenshotDisplay
                            screenshots={[screenshot]}
                            className="h-24"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingScreenshot(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Screenshots */}
                {previewScreenshots.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">New Screenshots:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {previewScreenshots.map((preview, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <img
                            src={preview}
                            alt={`New Screenshot ${index + 1}`}
                            className="h-24 w-full rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeScreenshot(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG (max 5MB each, up to 10 images)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleScreenshotUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800 pb-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {ea ? 'Update EA' : 'Create EA'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedEAEditor;

