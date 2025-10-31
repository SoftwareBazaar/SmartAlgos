/**
 * News Alert Setup Component
 * Allows users to set custom alerts for news events
 */

import React, { useState } from 'react';
import { Bell, Plus, X, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';

const NewsAlertSetup = ({ onSaveAlert }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [alertType, setAlertType] = useState('keyword');
  const [keywords, setKeywords] = useState('');
  const [eventTypes, setEventTypes] = useState([]);
  const [marketConditions, setMarketConditions] = useState({
    volatility: '',
    currency: '',
    threshold: ''
  });

  const eventTypeOptions = [
    'Fed Speeches',
    'ECB Decisions',
    'BoE Meetings',
    'NFP Releases',
    'CPI Reports',
    'GDP Releases',
    'Earnings',
    'Central Bank Minutes'
  ];

  const handleSave = () => {
    const alert = {
      type: alertType,
      keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
      eventTypes,
      marketConditions,
      enabled: true,
      createdAt: new Date().toISOString()
    };

    if (onSaveAlert) {
      onSaveAlert(alert);
    }

    // Reset form
    setKeywords('');
    setEventTypes([]);
    setMarketConditions({ volatility: '', currency: '', threshold: '' });
    setIsOpen(false);
  };

  const toggleEventType = (type) => {
    setEventTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Bell className="h-4 w-4" />
        Set Alert
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          >
            <Card
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Create News Alert
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Alert Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Alert Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setAlertType('keyword')}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        alertType === 'keyword'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                      }`}
                    >
                      Keyword
                    </button>
                    <button
                      onClick={() => setAlertType('event')}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        alertType === 'event'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                      }`}
                    >
                      Event Type
                    </button>
                    <button
                      onClick={() => setAlertType('market')}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        alertType === 'market'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                      }`}
                    >
                      Market Condition
                    </button>
                  </div>
                </div>

                {/* Keyword Alerts */}
                {alertType === 'keyword' && (
                  <div className="mb-6">
                    <Input
                      label="Keywords (comma-separated)"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="e.g., Fed, oil supply, ECB"
                      helperText="Enter keywords you want to monitor in news headlines"
                    />
                  </div>
                )}

                {/* Event Type Alerts */}
                {alertType === 'event' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Select Event Types
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {eventTypeOptions.map((type) => (
                        <button
                          key={type}
                          onClick={() => toggleEventType(type)}
                          className={`p-2 rounded-lg text-sm text-left transition-all ${
                            eventTypes.includes(type)
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-2 border-blue-500'
                              : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Market Condition Alerts */}
                {alertType === 'market' && (
                  <div className="mb-6 space-y-4">
                    <Input
                      label="Currency Pair (e.g., GBPUSD, EURUSD)"
                      value={marketConditions.currency}
                      onChange={(e) => setMarketConditions(prev => ({ ...prev, currency: e.target.value }))}
                      placeholder="GBPUSD"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Volatility Threshold
                      </label>
                      <select
                        value={marketConditions.volatility}
                        onChange={(e) => setMarketConditions(prev => ({ ...prev, volatility: e.target.value }))}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select threshold</option>
                        <option value="high">High Volatility</option>
                        <option value="medium">Medium Volatility</option>
                        <option value="low">Low Volatility</option>
                      </select>
                    </div>
                    <Input
                      label="Price Movement Threshold (%)"
                      type="number"
                      value={marketConditions.threshold}
                      onChange={(e) => setMarketConditions(prev => ({ ...prev, threshold: e.target.value }))}
                      placeholder="1.5"
                      helperText="Alert when price moves more than this percentage"
                    />
                  </div>
                )}

                {/* Session Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trading Session
                  </label>
                  <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                    <option value="all">All Sessions</option>
                    <option value="london">London Session</option>
                    <option value="newyork">New York Session</option>
                    <option value="asia">Asia Session</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={!keywords && eventTypes.length === 0}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Alert
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NewsAlertSetup;

