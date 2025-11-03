/**
 * AI Chat Assistant Component
 * Allows users to ask questions about market news and get AI-powered answers
 */

import React, { useState } from 'react';
import { MessageCircle, Send, Bot, X, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../UI/Card';
import Button from '../UI/Button';
import apiClient from '../../lib/apiClient';

const AIChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      type: 'ai',
      content: "Hi! I'm your AI trading assistant. I can help you with:\n\n• EA installation and setup\n• Risk management guidelines\n• Market news and analysis\n• Trading strategies and configuration\n\nWhat would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call AI assistant API
      const response = await apiClient.post('/api/ai-assistant/chat', {
        message: input,
        context: {
          feature: 'news',
          page: 'news'
        }
      });

      // Handle response structure: { success: true, data: { message, sources, ... } }
      const responseData = response.data?.data || response.data;
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: responseData?.message || responseData?.content || 'I apologize, but I couldn\'t process your question right now. Please try again.',
        timestamp: new Date(),
        sources: responseData?.sources || []
      };
      
      // Log for debugging if needed
      if (process.env.NODE_ENV === 'development') {
        console.log('AI Response:', responseData);
      }

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('AI Chat error:', error);
      
      // Check if it's an authentication error or network error
      if (error.response?.status === 401) {
        const aiResponse = {
          id: Date.now() + 1,
          type: 'ai',
          content: 'Please log in to use the AI Assistant. I can help with EA installation, risk management, market analysis, and more.',
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        // Fallback response - make it more helpful
        const aiResponse = {
          id: Date.now() + 1,
          type: 'ai',
          content: 'I can help you with:\n\n• EA installation and setup\n• Risk management guidelines\n• Market news and analysis\n• Trading strategies\n\nTry asking: "How do I install an EA?" or "How to set up SmartAlgos VIX75?" or "Why is GBP weak today?"',
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, aiResponse]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "How do I install an EA?",
    "How to set up SmartAlgos VIX75?",
    "Why is GBP so weak today?",
    "What are daily trading limits?",
    "Explain today's Fed decision",
    "How do I configure EA settings?"
  ];

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <MessageCircle className="h-6 w-6" />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed ${isMinimized ? 'bottom-6 right-6 w-80' : 'bottom-6 right-6 w-96 h-[600px]'} z-50 flex flex-col`}
          >
            <Card className="flex flex-col h-full shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  <span className="font-semibold">AI Trading Assistant</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1 hover:bg-white/20 rounded"
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          {message.type === 'ai' && (
                            <div className="flex items-center gap-2 mb-1">
                              <Bot className="h-3 w-3" />
                              <span className="text-xs opacity-70">AI Assistant</span>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs opacity-70">
                              Sources: {message.sources.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <Bot className="h-3 w-3" />
                            <span className="text-xs text-gray-500">AI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Suggested Questions */}
                  {messages.length <= 1 && (
                    <div className="px-4 pb-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 mt-2">
                        Suggested questions:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {suggestedQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => setInput(q)}
                            className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about EA installation, risk management, market news..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                      />
                      <Button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="px-4"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      💡 Tip: Ask "How do I install an EA?" or "Why is GBP weak?" or "Daily trading limits?"
                    </p>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatAssistant;

