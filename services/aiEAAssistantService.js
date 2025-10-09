const axios = require('axios');

class AIEAAssistantService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.isMockMode = !this.openaiApiKey || this.openaiApiKey.includes('your_');
    
    if (this.isMockMode) {
      console.warn('[AI Assistant] Running in mock mode. Add OPENAI_API_KEY to enable AI responses.');
    }

    this.knowledgeBase = {
      // Common EA questions and answers
      faq: [
        {
          question: "What is an Expert Advisor?",
          answer: "An Expert Advisor (EA) is an automated trading system that executes trades on your behalf based on predefined rules and algorithms. It runs 24/7 on your MetaTrader platform without manual intervention."
        },
        {
          question: "How do I install an EA?",
          answer: "1. Download the .ex4 or .ex5 file. 2. Open MetaTrader 4/5. 3. Go to File > Open Data Folder. 4. Navigate to MQL4/MQL5 > Experts. 5. Copy your EA file here. 6. Restart MetaTrader and find it in the Navigator panel."
        },
        {
          question: "What is the difference between MT4 and MT5 EAs?",
          answer: "MT4 EAs use .ex4 files and MQL4 programming language. MT5 EAs use .ex5 files and MQL5 programming language. MT5 offers more advanced features, better backtesting, and support for more markets, but MT4 is more widely used by retail traders."
        },
        {
          question: "How much should I risk per trade?",
          answer: "Generally, risk 1-2% of your account balance per trade. Never risk more than 5% of your account on a single trade. Use proper position sizing and always set stop losses to protect your capital."
        },
        {
          question: "What is backtesting?",
          answer: "Backtesting is the process of testing your EA strategy on historical data to see how it would have performed. It helps you understand the EA's profitability, drawdown, and win rate before risking real money."
        },
        {
          question: "How do I optimize my EA?",
          answer: "Use MetaTrader's Strategy Tester to optimize parameters like lot size, stop loss, take profit, and indicator settings. Test on different timeframes and market conditions to find the best settings for your trading style."
        },
        {
          question: "What is VPS and why do I need it?",
          answer: "VPS (Virtual Private Server) runs your EA 24/7 without your computer being on. It provides stable internet connection, low latency, and ensures your EA never misses trading opportunities."
        },
        {
          question: "How do I choose the right EA?",
          answer: "Consider: 1) Your risk tolerance, 2) Account size, 3) Trading style (scalping, swing, etc.), 4) Backtesting results, 5) Live performance, 6) Drawdown levels, 7) Support and updates from developer."
        }
      ],
      
      // EA-specific knowledge
      eaTypes: {
        scalping: {
          description: "Scalping EAs make many small trades to capture small price movements. They require low spreads, fast execution, and stable VPS.",
          pros: ["High frequency trading", "Small risk per trade", "Quick profits"],
          cons: ["Requires low spreads", "High transaction costs", "Stressful for some"]
        },
        swing: {
          description: "Swing trading EAs hold positions for days or weeks, targeting larger price movements. They're less dependent on spreads and execution speed.",
          pros: ["Less time intensive", "Lower transaction costs", "Less stress"],
          cons: ["Slower profit accumulation", "Requires patience", "Larger stop losses"]
        },
        grid: {
          description: "Grid EAs place buy and sell orders at regular intervals, profiting from price oscillations within a range.",
          pros: ["Works in ranging markets", "Can generate consistent profits", "Automated execution"],
          cons: ["Risky in trending markets", "Can cause large drawdowns", "Requires careful risk management"]
        },
        martingale: {
          description: "Martingale EAs double the lot size after each losing trade, attempting to recover losses with a single winning trade.",
          pros: ["Can recover losses quickly", "Simple strategy", "Works in ranging markets"],
          cons: ["Extremely risky", "Can cause account blowup", "Requires large account"]
        }
      },

      // Technical support
      technicalIssues: {
        "ea not working": "Check if EA is enabled on the chart, verify input parameters, ensure auto trading is enabled, and check for error messages in the Experts tab.",
        "ea not opening trades": "Verify market hours, check spread requirements, ensure sufficient margin, and confirm the EA is compatible with your broker's trading conditions.",
        "ea causing errors": "Check for missing indicators, verify input parameters, ensure MetaTrader version compatibility, and restart the platform.",
        "slow execution": "Use a VPS with low latency, choose an ECN broker, optimize EA parameters, and ensure stable internet connection."
      }
    };
  }

  /**
   * Process user message and provide response
   */
  async processMessage(message, context = {}) {
    try {
      // Clean and normalize the message
      const normalizedMessage = message.toLowerCase().trim();
      
      // Check if this requires admin escalation
      const escalationKeywords = [
        'refund', 'money back', 'complaint', 'angry', 'frustrated', 
        'not working', 'broken', 'scam', 'fraud', 'legal action'
      ];
      
      if (escalationKeywords.some(keyword => normalizedMessage.includes(keyword))) {
        return this.handleEscalation(message, context);
      }

      // Try to find answer in knowledge base
      const kbAnswer = this.searchKnowledgeBase(normalizedMessage);
      if (kbAnswer) {
        return {
          type: 'answer',
          message: kbAnswer,
          confidence: 0.9,
          sources: ['knowledge_base']
        };
      }

      // Use AI for complex questions
      if (this.isMockMode) {
        return this.getMockResponse(message);
      }

      return await this.getAIResponse(message, context);

    } catch (error) {
      console.error('[AI Assistant] Error processing message:', error);
      return {
        type: 'error',
        message: 'I apologize, but I encountered an error processing your message. Please try again or contact our support team.',
        confidence: 0,
        escalate: true
      };
    }
  }

  /**
   * Search knowledge base for relevant answers
   */
  searchKnowledgeBase(message) {
    // Search FAQ
    for (const faq of this.knowledgeBase.faq) {
      const questionWords = faq.question.toLowerCase().split(' ');
      const messageWords = message.split(' ');
      
      // Check for keyword matches
      const matches = questionWords.filter(word => 
        messageWords.some(msgWord => 
          msgWord.includes(word) || word.includes(msgWord)
        )
      );
      
      if (matches.length >= 2) {
        return faq.answer;
      }
    }

    // Search EA types
    for (const [type, info] of Object.entries(this.knowledgeBase.eaTypes)) {
      if (message.includes(type)) {
        return `${info.description}\n\nPros: ${info.pros.join(', ')}\nCons: ${info.cons.join(', ')}`;
      }
    }

    // Search technical issues
    for (const [issue, solution] of Object.entries(this.knowledgeBase.technicalIssues)) {
      if (message.includes(issue)) {
        return solution;
      }
    }

    return null;
  }

  /**
   * Handle cases that require admin escalation
   */
  handleEscalation(message, context) {
    console.log(`[AI Assistant] Escalating message to admin: ${message}`);
    
    return {
      type: 'escalation',
      message: "I understand you're experiencing an issue. Let me connect you with our admin team who can provide personalized assistance.",
      confidence: 0.8,
      escalate: true,
      priority: 'high',
      adminMessage: message,
      context: context
    };
  }

  /**
   * Get AI response using OpenAI API
   */
  async getAIResponse(message, context) {
    try {
      const prompt = this.buildPrompt(message, context);
      
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an Expert Advisor (EA) specialist assistant. Provide helpful, accurate information about trading EAs, MetaTrader platforms, and automated trading. Be concise but thorough.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        type: 'ai_response',
        message: response.data.choices[0].message.content,
        confidence: 0.8,
        sources: ['openai_gpt']
      };

    } catch (error) {
      console.error('[AI Assistant] OpenAI API error:', error);
      return this.getMockResponse(message);
    }
  }

  /**
   * Build prompt for AI
   */
  buildPrompt(message, context) {
    let prompt = `User question: ${message}\n\n`;
    
    if (context.eaId) {
      prompt += `Context: User is asking about EA ID: ${context.eaId}\n`;
    }
    
    if (context.userLevel) {
      prompt += `User experience level: ${context.userLevel}\n`;
    }
    
    prompt += `\nPlease provide a helpful answer about Expert Advisors, trading, or MetaTrader. If the question is about refunds, complaints, or technical issues beyond basic troubleshooting, suggest contacting admin support.`;
    
    return prompt;
  }

  /**
   * Get mock response for testing
   */
  getMockResponse(message) {
    const responses = [
      "I'd be happy to help you with your EA question. Could you provide more specific details about what you need assistance with?",
      "That's a great question about Expert Advisors. Based on your query, I recommend checking our documentation or contacting our support team for detailed assistance.",
      "I understand you're looking for information about EAs. Let me connect you with our admin team who can provide personalized guidance for your specific situation.",
      "For detailed technical support with your EA, I suggest reaching out to our admin team who can provide hands-on assistance and troubleshooting.",
      "I can help with general EA questions. For specific technical issues or account-related matters, our admin team is better equipped to assist you."
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      type: 'mock_response',
      message: randomResponse,
      confidence: 0.6,
      sources: ['mock_responses']
    };
  }

  /**
   * Get conversation suggestions
   */
  getSuggestions(context = {}) {
    const suggestions = [
      "How do I install an EA?",
      "What's the difference between scalping and swing trading?",
      "How much should I risk per trade?",
      "What is backtesting?",
      "Do I need a VPS for my EA?",
      "How do I choose the right EA?",
      "What are the risks of automated trading?",
      "How do I optimize my EA settings?"
    ];

    return suggestions.slice(0, 6); // Return 6 suggestions
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      service: 'ai-ea-assistant',
      configured: !this.isMockMode,
      mode: this.isMockMode ? 'mock' : 'live',
      features: [
        'faq_responses',
        'ea_knowledge_base',
        'technical_support',
        'admin_escalation',
        'conversation_suggestions'
      ],
      knowledgeBase: {
        faqCount: this.knowledgeBase.faq.length,
        eaTypes: Object.keys(this.knowledgeBase.eaTypes).length,
        technicalIssues: Object.keys(this.knowledgeBase.technicalIssues).length
      }
    };
  }
}

module.exports = new AIEAAssistantService();
