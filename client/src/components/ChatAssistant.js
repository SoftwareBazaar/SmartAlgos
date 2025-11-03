import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  HelpCircle,
  Download,
  Settings,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import apiClient from '../lib/apiClient';

const ChatAssistant = ({ isOpen, onClose, context = 'general' }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      // Initialize with welcome message based on context
      const welcomeMessage = getWelcomeMessage(context);
      setMessages([welcomeMessage]);
    }
  }, [isOpen, context]);

  const getWelcomeMessage = (ctx) => {
    const baseMessage = {
      id: Date.now(),
      type: 'bot',
      timestamp: new Date(),
      content: ''
    };

    switch (ctx) {
      case 'ea-creation':
        return {
          ...baseMessage,
          content: "👋 Hi! I'm your EA Creation Assistant. I can help you with:\n\n• Understanding EA types and strategies\n• Technical requirements and indicators\n• Budget planning and timeline estimation\n• Step-by-step guidance through the form\n• Answering questions about our services\n\nWhat would you like to know?"
        };
      case 'installation':
        return {
          ...baseMessage,
          content: "🔧 Hello! I'm here to help you install and set up your EA. I can guide you through:\n\n• MetaTrader installation\n• EA file placement\n• Settings configuration\n• Testing and optimization\n• Troubleshooting common issues\n\nWhat do you need help with?"
        };
      case 'payment':
        return {
          ...baseMessage,
          content: "💳 Hi! I can help you with payment-related questions:\n\n• Available payment methods\n• Crypto payment setup\n• Payment processing status\n• Billing and invoicing\n• Refund policies\n\nHow can I assist you?"
        };
      default:
        return {
          ...baseMessage,
          content: "👋 Welcome! I'm your Smart Algos assistant. I can help you with:\n\n• EA installation and setup (MT5 indicators, templates, EAs)\n• SmartAlgos VIX75 complete setup\n• Risk management guidelines\n• EA configuration and calibration\n• Custom EA creation\n• Payment processing\n• Technical support\n\nWhat can I help you with today?"
        };
    }
  };

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // EA Creation context responses
    if (context === 'ea-creation') {
      if (message.includes('scalping') || message.includes('scalp')) {
        return "Scalping EAs are designed for high-frequency trading with small profits. They typically:\n\n• Trade on lower timeframes (1m, 5m)\n• Use tight stop losses\n• Target small pip gains\n• Require low spreads\n• Work best during high volatility periods\n\nWould you like to know about specific scalping strategies or indicators?"
      }
      
      if (message.includes('swing') || message.includes('swing trading')) {
        return "Swing trading EAs hold positions for days to weeks. They:\n\n• Use higher timeframes (H4, Daily)\n• Target larger price movements\n• Use wider stop losses\n• Focus on trend following\n• Work well with fundamental analysis\n\nWhat specific swing trading aspects interest you?"
      }
      
      if (message.includes('budget') || message.includes('price') || message.includes('cost')) {
        return "Our EA pricing depends on complexity:\n\n• Basic EAs: $500-$1,500\n• Advanced EAs: $1,500-$5,000\n• Complex/Quant EAs: $5,000+\n\nFactors affecting price:\n• Number of indicators\n• Advanced features (AI, sentiment analysis)\n• Custom algorithms\n• Urgency of delivery\n• Backtesting requirements\n\nWhat's your budget range?"
      }
      
      if (message.includes('timeline') || message.includes('delivery') || message.includes('how long')) {
        return "Typical delivery timelines:\n\n• Simple EA: 1-2 weeks\n• Standard EA: 2-4 weeks\n• Complex EA: 4-8 weeks\n• Rush orders: +50% fee for faster delivery\n\nFactors affecting timeline:\n• Complexity requirements\n• Current workload\n• Client feedback cycles\n• Testing requirements\n\nWhat's your preferred timeline?"
      }
      
      if (message.includes('indicators') || message.includes('technical')) {
        return "Popular indicators for EAs:\n\n• **Trend**: SMA, EMA, MACD\n• **Momentum**: RSI, Stochastic, Williams %R\n• **Volatility**: Bollinger Bands, ATR\n• **Volume**: Volume Profile, OBV\n• **Support/Resistance**: Pivot Points, Fibonacci\n\nWhich type of analysis interests you most?"
      }
    }

    // Installation context responses - these are fallbacks if API fails
    if (context === 'installation' || message.includes('install') || message.includes('installation')) {
      if (message.includes('indicator')) {
        return "To install indicators to MT5:\n\n1. Copy indicators from your package folder\n2. Open MT5 → File → Open Data Folder\n3. Navigate to MQL5 → Indicators folder\n4. Paste indicator files here\n5. Restart MT5\n6. Find indicators in Navigator panel\n\nFor complete setup instructions, ask: 'How to install indicators to MT5?'"
      }
      
      if (message.includes('template')) {
        return "To install templates to MT5:\n\n1. Copy template file from your package\n2. Open MT5 → File → Open Data Folder\n3. Navigate to MQL5 → Profiles → Templates\n4. Paste template file here\n5. Close and reopen MT5\n6. Right-click chart → Templates → Select your template\n\nFor complete setup, ask: 'How to install templates?'"
      }
      
      if (message.includes('ea') || message.includes('expert advisor')) {
        return "To install your EA:\n\n1. Download the .ex5 file (MT5) or .ex4 file (MT4)\n2. Open MetaTrader → File → Open Data Folder\n3. Navigate to MQL5/Experts (MT5) or MQL4/Experts (MT4)\n4. Copy EA file to this folder\n5. Restart MetaTrader\n6. Drag EA from Navigator to your chart\n7. Configure settings and enable Auto Trading\n\nFor detailed instructions, ask: 'How do I install an EA?'"
      }
      
      if (message.includes('setup') || message.includes('vix75') || message.includes('smartalgos')) {
        return "For complete SmartAlgos VIX75 setup:\n\n1. Install indicators to MQL5/Indicators\n2. Install template to MQL5/Profiles/Templates\n3. Restart MT5 and load chart\n4. Apply template\n5. Attach indicators\n6. Install and configure EA\n\nAsk: 'How to set up SmartAlgos VIX75?' for step-by-step guide."
      }
      
      if (message.includes('settings') || message.includes('configure') || message.includes('parameters')) {
        return "Common EA settings:\n\n• Stop Loss: ALWAYS set this first (critical)\n• Trading Hours: Start from 10:30 AM during volatility\n• Profit Target: Default $3 with 0.01 lot\n• Lot Size: Adjust based on account size\n• Risk:Reward: Default 30:20 ratio\n\nAsk: 'How do I configure EA settings?' for complete guide."
      }
      
      // General installation response
      return "I can help with installation! Ask me:\n\n• 'How do I install indicators to MT5?'\n• 'How do I install templates to MT5?'\n• 'How do I install an EA?'\n• 'How to set up SmartAlgos VIX75?'\n• 'How do I configure EA settings?'\n\nWhat would you like to install?"
    }

    // Payment context responses
    if (context === 'payment') {
      if (message.includes('crypto') || message.includes('bitcoin') || message.includes('usdt')) {
        return "We accept crypto payments:\n\n• **Bitcoin (BTC)**\n• **Ethereum (ETH)**\n• **USDT (Tether)**\n• **USDC**\n\nProcess:\n1. Select crypto payment\n2. Receive wallet address\n3. Send exact amount\n4. Wait for confirmations\n5. Access granted automatically\n\nWhich cryptocurrency would you like to use?"
      }
      
      if (message.includes('download') || message.includes('access') || message.includes('file')) {
        return "After successful payment:\n\n1. **Automatic Access**: Files unlock immediately\n2. **Email Confirmation**: Download links sent\n3. **Dashboard Access**: Files in your account\n4. **Support**: Installation guidance available\n5. **Updates**: Lifetime updates included\n\nCan't find your files? Check your email or contact support!"
      }
    }

    // General responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! 👋 How can I assist you today? I'm here to help with EA creation, installation, payments, or any other questions you might have."
    }
    
    if (message.includes('help') || message.includes('support')) {
      return "I'm here to help! You can:\n\n• Ask questions about our services\n• Get guidance on EA creation\n• Learn about installation\n• Understand payment options\n• Troubleshoot issues\n\nWhat specific help do you need?"
    }
    
    if (message.includes('contact') || message.includes('email') || message.includes('phone')) {
      return "You can reach us through:\n\n• **Email**: support@smartalgos.com\n• **Live Chat**: Available 24/7\n• **Phone**: +1-555-SMART-ALGO\n• **Telegram**: @SmartAlgosSupport\n\nOur team responds within 2 hours during business hours."
    }

    // Default response - improved to handle installation queries
    if (message.includes('install') || message === 'installation') {
      return "I can help with installation! Here are common installation questions:\n\n• 'How do I install indicators to MT5?'\n• 'How do I install templates to MT5?'\n• 'How do I install an EA?'\n• 'How to set up SmartAlgos VIX75?'\n• 'How do I configure EA settings?'\n\nWhat would you like to install? Be specific and I'll provide detailed step-by-step instructions!"
    }
    
    return "I understand you're asking about that. Let me help you find the right information. Could you be more specific about what you'd like to know? I can assist with:\n\n• EA installation and setup\n• Risk management\n• EA creation\n• Payment processing\n• Technical support\n\nTry asking: 'How do I install an EA?' or 'How to set up SmartAlgos VIX75?'"
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      timestamp: new Date(),
      content: inputMessage.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call the backend AI Assistant API
      const response = await apiClient.post('/api/ai-assistant/chat', {
        message: messageToSend,
        context: {
          feature: context,
          page: 'general'
        }
      });

      // Handle response structure: { success: true, data: { message, sources, ... } }
      const responseData = response.data?.data || response.data;
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        timestamp: new Date(),
        content: responseData?.message || responseData?.content || 'I apologize, but I couldn\'t process your question right now. Please try again.',
        sources: responseData?.sources || []
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('AI Assistant error:', error);
      
      // Fallback to local responses if API fails
      const fallbackResponse = getBotResponse(messageToSend);
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        timestamp: new Date(),
        content: fallbackResponse,
        isError: true
      };

      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-500 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5" />
          <span className="font-semibold">EA Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'bot' && <Bot className="w-4 h-4 mt-1 flex-shrink-0" />}
                <div className="flex-1">
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
