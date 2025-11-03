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
          question: "How do I install indicators to MT5?",
          answer: "1. Copy indicators from your package folder. 2. Open MT5 → File → Open Data Folder. 3. Navigate to MQL5 → Indicators folder. 4. Paste indicator files here. 5. Restart MT5. 6. Find indicators in Navigator panel under 'Indicators' section."
        },
        {
          question: "How do I install templates to MT5?",
          answer: "1. Copy template file from your package. 2. Open MT5 → File → Open Data Folder. 3. Navigate to MQL5 → Profiles → Templates. 4. Paste template file here. 5. Close and reopen MT5. 6. Right-click chart → Templates → Select your template."
        },
        {
          question: "How do I set up SmartAlgos VIX75?",
          answer: "1. Install indicators to MQL5/Indicators. 2. Install template to MQL5/Profiles/Templates. 3. Restart MT5. 4. Load Volatility 75 chart. 5. Apply template via right-click → Templates. 6. Attach indicators from Navigator. 7. Install EA to MQL5/Experts. 8. Drag EA to chart and configure settings. Always use default settings first before adjusting."
        },
        {
          question: "How do I configure EA settings?",
          answer: "1. Always check stop loss first (critical). 2. Set trading hours (start from 10:30 AM during volatility). 3. Configure profit target (default $3 with 0.01 lot). 4. Adjust lot size based on account size and risk. 5. Set risk:reward ratio (default 30:20). 6. Start with default settings, then adjust one parameter at a time. 7. Test each change thoroughly before making more adjustments."
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
        },
        {
          question: "What is proper position sizing?",
          answer: "Position sizing depends on account balance and risk tolerance. For $100-$500 accounts: 0.01-0.03 lots. For $500-$2,000: 0.03-0.10 lots. For $2,000-$10,000: 0.10-0.50 lots. Always risk 1-2% per trade maximum."
        },
        {
          question: "How do I manage risk with multiple pairs?",
          answer: "For multi-pair trading: 1) Maximum 3-5 simultaneous positions, 2) Total portfolio risk: 5-10% maximum, 3) Avoid high correlation pairs (EUR/USD & GBP/USD), 4) Adjust position sizes based on correlation, 5) Monitor total exposure constantly."
        },
        {
          question: "What stop loss should I use?",
          answer: "For major forex pairs: 30-50 pips typical. For JPY pairs: 30-50 pips. For Gold/XAUUSD: 50-100 pips (scalping), 150-300 pips (swing), 300-500 pips (position). Always use stop losses - never trade without them."
        },
        {
          question: "What are daily trading limits?",
          answer: "Conservative: Max 2% daily loss, 5-10 trades, 2-3 consecutive losses, 2-3 open positions. Moderate: Max 3-5% daily loss, 10-15 trades, 3-4 consecutive losses, 3-5 open positions. Always set automatic stops to prevent catastrophic losses."
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
      },

      // Installation Guides
      installationGuides: {
        mt5Indicators: {
          title: "How to Install Indicators to MT5",
          steps: [
            "Locate the 'Indicators' folder inside your SmartAlgos VIX75 package",
            "Copy all indicator files from this folder",
            "Open MetaTrader 5 platform on your PC",
            "Go to File menu → Open Data Folder",
            "Navigate to MQL5 folder",
            "Open the 'Indicators' folder",
            "Paste the copied indicator files into this folder",
            "Restart MetaTrader 5 to load the indicators",
            "Find your indicators in the Navigator panel under 'Indicators' section"
          ],
          notes: [
            "Ensure you copy all indicator files, not just some",
            "After pasting, always restart MT5 for changes to take effect",
            "If indicators don't appear, check the file extensions (.ex5 for MT5)"
          ]
        },
        mt5Templates: {
          title: "How to Install Templates to MT5",
          steps: [
            "Locate the 'Template' folder inside your SmartAlgos VIX75 package",
            "Copy the template file (usually named 'SmartAlgos VIX75.tpl')",
            "Open MetaTrader 5 platform on your PC",
            "Go to File menu → Open Data Folder",
            "Navigate to MQL5 folder",
            "Open the 'Profiles' folder",
            "Open the 'Templates' folder inside Profiles",
            "Paste your template file into the Templates folder",
            "Close MetaTrader 5 completely",
            "Reopen MetaTrader 5",
            "Load your trading pair chart (e.g., Volatility 75)",
            "Right-click on the chart → Templates → Select 'SmartAlgos VIX75' template"
          ],
          notes: [
            "Templates save your chart setup including indicators and settings",
            "Always close and reopen MT5 after installing templates",
            "You can apply templates to any chart by right-clicking → Templates"
          ]
        },
        mt5EA: {
          title: "How to Install and Load EA Files to MT5",
          steps: [
            "Download your EA file (.ex5 for MT5)",
            "Open MetaTrader 5 platform",
            "Go to File menu → Open Data Folder",
            "Navigate to MQL5 folder",
            "Open the 'Experts' folder",
            "Copy your EA file into the Experts folder",
            "Restart MetaTrader 5",
            "Locate the EA in the Navigator panel under 'Expert Advisors'",
            "Drag and drop the EA onto your chart",
            "Configure the EA settings in the popup window",
            "Enable 'Auto Trading' button in the toolbar (green button)",
            "Verify the EA is running by checking the chart for EA name and smiley face"
          ],
          notes: [
            "EA files must be .ex5 format for MT5 (not .ex4 which is for MT4)",
            "Always enable Auto Trading button for EAs to execute trades",
            "Check the EA settings before starting, especially stop loss values"
          ]
        },
        smartAlgosVIX75Setup: {
          title: "Complete SmartAlgos VIX75 Setup Guide",
          overview: "This guide covers the complete setup process for SmartAlgos VIX75 trading system including indicators, templates, and EA configuration.",
          step1: {
            title: "Step 1: Install Indicators",
            instructions: "Follow the indicator installation guide above. Copy all indicators from the Indicators folder to MQL5/Indicators in your MT5 data folder."
          },
          step2: {
            title: "Step 2: Install Template",
            instructions: "Follow the template installation guide above. Copy the template file to MQL5/Profiles/Templates folder."
          },
          step3: {
            title: "Step 3: Load Chart and Apply Template",
            instructions: [
              "Close and reopen MetaTrader 5",
              "Load Volatility 75 pair (or XAUUSD/any other pair) to a chart",
              "Right-click on chart → Templates → Select 'SmartAlgos VIX75' template",
              "The template will automatically apply all indicators and settings"
            ]
          },
          step4: {
            title: "Step 4: Attach Indicators from Navigator",
            instructions: [
              "Open Navigator panel (Ctrl+N if not visible)",
              "Navigate to 'Indicators' section",
              "Drag and drop each indicator onto your chart",
              "DO NOT change settings initially - use default settings first",
              "Test the system with default settings before adjusting"
            ]
          },
          step5: {
            title: "Step 5: Install and Configure EA",
            instructions: [
              "Follow the EA installation guide above",
              "Copy EA file to MQL5/Experts folder",
              "Restart MT5 and drag EA onto chart",
              "Configure EA settings (see EA Configuration Guide below)",
              "Enable Auto Trading button"
            ]
          },
          importantNotes: [
            "Always use default settings first before customizing",
            "Test on demo account before live trading",
            "Ensure all indicators are properly loaded before attaching EA",
            "Restart MT5 after each installation step"
          ]
        },
        eaConfiguration: {
          title: "EA Configuration and Calibration Guide",
          criticalSettings: {
            stopLoss: {
              description: "ALWAYS check and set stop loss before starting",
              importance: "Critical - protects your account from excessive losses",
              recommendation: "Set appropriate stop loss based on your risk tolerance"
            },
            tradingHours: {
              description: "Optimal trading times",
              recommendation: "Start trading from 10:30 AM during volatility periods",
              note: "Volatility 75 is best traded during high volatility sessions"
            },
            profitTarget: {
              description: "Profit target configuration",
              default: "Default is set to $3 with 0.01 lot size",
              calculation: "Simple mathematics: Changing lot size affects profit/loss proportionally",
              example: "0.01 lot = $3 target | 0.20 lot = $30 target (with 30:20 R:R ratio)",
              riskReward: "With 0.20 lot and 30:20 R:R - Profit: $30, Loss: $60 per trade"
            },
            lotSize: {
              description: "Position sizing",
              default: "Start with 0.01 lot (default setting)",
              adjustment: "Can be adjusted based on account size and risk tolerance",
              warning: "Increasing lot size increases both profit potential and risk"
            },
            riskRewardRatio: {
              description: "Risk:Reward ratio",
              default: "30:20 ratio (30 pips profit target, 20 pips stop loss)",
              note: "This ratio can be adjusted based on your trading strategy",
              calculation: "Ensure R:R ratio aligns with your risk management rules"
            }
          },
          calibrationSteps: [
            {
              step: 1,
              action: "Start with default settings - DO NOT change anything initially",
              reason: "Test the system as designed before modifications"
            },
            {
              step: 2,
              action: "Monitor performance for at least 5-10 trades",
              reason: "Understand how the system behaves with default settings"
            },
            {
              step: 3,
              action: "Adjust one parameter at a time",
              reason: "Isolate which changes affect performance"
            },
            {
              step: 4,
              action: "Test each adjustment for sufficient trades",
              reason: "Ensure changes are beneficial before making more"
            },
            {
              step: 5,
              action: "Document your settings and results",
              reason: "Track what works best for your trading style"
            }
          ],
          performanceNotes: [
            {
              note: "Win Rate: System operates with approximately 70% win rate",
              implication: "Wins will typically outweigh losses over time"
            },
            {
              note: "Volatility Days: First 5 trades on good volatility days often make clean wins",
              strategy: "Consider closing trades after 5 successful trades on high volatility days"
            },
            {
              note: "Risk Management: Always maintain proper risk management",
              reminder: "Never risk more than 2% per trade, maintain stop losses"
            }
          ],
          calibrationGuidance: "Adjust and calibrate settings step by step. Make one change at a time, test thoroughly, and you'll end up with a good system customized to your preferences. Remember: patience and systematic testing lead to optimal results."
        }
      },

      // Comprehensive Risk Management Knowledge Base
      riskManagement: {
        positionSizing: {
          majorPairs: {
            "$100": { conservative: "0.01 lot", moderate: "0.01 lot", risk: "2-5%", stopLoss: "30-50 pips" },
            "$200": { conservative: "0.01-0.02 lot", moderate: "0.02 lot", risk: "2-5%", stopLoss: "30-50 pips" },
            "$300": { conservative: "0.02-0.03 lot", moderate: "0.03 lot", risk: "2-5%", stopLoss: "30-50 pips" },
            "$500": { conservative: "0.03-0.05 lot", moderate: "0.05 lot", risk: "2-5%", stopLoss: "30-50 pips" },
            "$1,000": { conservative: "0.05-0.10 lot", moderate: "0.10 lot", risk: "1-3%", stopLoss: "30-50 pips" },
            "$2,000": { conservative: "0.10-0.20 lot", moderate: "0.20 lot", risk: "1-3%", stopLoss: "30-50 pips" },
            "$5,000": { conservative: "0.25-0.50 lot", moderate: "0.50 lot", risk: "1-2%", stopLoss: "30-50 pips" },
            "$10,000": { conservative: "0.50-1.00 lot", moderate: "1.00 lot", risk: "1-2%", stopLoss: "30-50 pips" }
          },
          jpyPairs: {
            "$100": { conservative: "0.01 lot", moderate: "0.01 lot", risk: "2-5%", stopLoss: "30-50 pips" },
            "$200": { conservative: "0.01-0.02 lot", moderate: "0.02 lot", risk: "2-5%", stopLoss: "30-50 pips" },
            "$300": { conservative: "0.02-0.03 lot", moderate: "0.03 lot", risk: "2-5%", stopLoss: "30-50 pips" },
            "$500": { conservative: "0.03-0.05 lot", moderate: "0.05 lot", risk: "2-5%", stopLoss: "30-50 pips" },
            "$1,000": { conservative: "0.05-0.10 lot", moderate: "0.10 lot", risk: "1-3%", stopLoss: "30-50 pips" },
            "$2,000": { conservative: "0.10-0.20 lot", moderate: "0.20 lot", risk: "1-3%", stopLoss: "30-50 pips" },
            "$5,000": { conservative: "0.25-0.50 lot", moderate: "0.50 lot", risk: "1-2%", stopLoss: "30-50 pips" },
            "$10,000": { conservative: "0.50-1.00 lot", moderate: "1.00 lot", risk: "1-2%", stopLoss: "30-50 pips" }
          },
          gold: {
            "$100": { conservative: "0.01 lot", moderate: "0.01 lot", risk: "2-5%", stopLoss: "50-100 pips" },
            "$200": { conservative: "0.01-0.02 lot", moderate: "0.02 lot", risk: "2-5%", stopLoss: "50-100 pips" },
            "$300": { conservative: "0.02-0.03 lot", moderate: "0.03 lot", risk: "2-5%", stopLoss: "50-100 pips" },
            "$500": { conservative: "0.03-0.05 lot", moderate: "0.05 lot", risk: "2-5%", stopLoss: "50-100 pips" },
            "$1,000": { conservative: "0.05-0.10 lot", moderate: "0.10 lot", risk: "1-3%", stopLoss: "50-100 pips" },
            "$2,000": { conservative: "0.10-0.20 lot", moderate: "0.20 lot", risk: "1-3%", stopLoss: "50-100 pips" },
            "$5,000": { conservative: "0.25-0.50 lot", moderate: "0.50 lot", risk: "1-2%", stopLoss: "50-100 pips" },
            "$10,000": { conservative: "0.50-1.00 lot", moderate: "1.00 lot", risk: "1-2%", stopLoss: "50-100 pips" }
          }
        },
        pipValues: {
          standardPairs: {
            "0.01": "$0.10 per pip",
            "0.10": "$1.00 per pip",
            "1.00": "$10.00 per pip"
          },
          jpyPairs: {
            "0.01": "$0.09 per pip",
            "0.10": "$0.91 per pip",
            "1.00": "$9.12 per pip"
          },
          gold: {
            "0.01": "$0.10 per $0.10 movement",
            "0.10": "$1.00 per $0.10 movement",
            "1.00": "$10.00 per $0.10 movement"
          }
        },
        multiPairGuidelines: {
          maxPositions: "3-5 simultaneous positions",
          maxPortfolioRisk: "5-10% maximum",
          highCorrelationPairs: [
            "EUR/USD & GBP/USD (typically move together)",
            "AUD/USD & NZD/USD (commodity currencies)",
            "EUR/USD & USD/CHF (inverse correlation)"
          ],
          independentPairs: [
            "EUR/USD & USD/JPY",
            "GBP/JPY & AUD/USD",
            "XAUUSD & most forex pairs"
          ],
          rule: "No more than 2 highly correlated pairs open simultaneously"
        },
        takeProfitStrategy: {
          threeStage: true,
          stage1: "30-50% of position at 1:1 or 1.5:1 risk:reward",
          stage2: "30-50% of remaining at 2:1 or 2.5:1 risk:reward (move stop to breakeven)",
          stage3: "Remaining position at 3:1+ risk:reward (trail stop or fixed target)"
        },
        goldSpecific: {
          volatility: "Average daily range: $15-$30 (150-300 pips), can spike $50+ during major news",
          stopLoss: {
            scalping: "50-100 pips",
            swing: "150-300 pips",
            position: "300-500 pips"
          },
          takeProfit: {
            tp1: "100-150 pips",
            tp2: "200-300 pips",
            tp3: "300-500 pips"
          },
          bestSessions: "London & NY overlap"
        },
        dailyLimits: {
          conservative: {
            maxDailyLoss: "2%",
            maxTrades: "5-10",
            maxConsecutiveLosses: "2-3",
            maxOpenPositions: "2-3",
            positionHoldTime: "Intraday"
          },
          moderate: {
            maxDailyLoss: "3-5%",
            maxTrades: "10-15",
            maxConsecutiveLosses: "3-4",
            maxOpenPositions: "3-5",
            positionHoldTime: "1-3 days"
          },
          aggressive: {
            maxDailyLoss: "5-7%",
            maxTrades: "15-20",
            maxConsecutiveLosses: "4-5",
            maxOpenPositions: "5-7",
            positionHoldTime: "3-7 days"
          }
        },
        accountSizeRecommendations: {
          micro: {
            range: "$100-$500",
            positionSize: "0.01-0.03 per trade",
            riskPerTrade: "2-5%",
            maxPositions: "2-3",
            dailyTradeLimit: "5-10",
            pairsToTrade: "3-5 (choose least correlated)"
          },
          small: {
            range: "$500-$2,000",
            positionSize: "0.03-0.10 per trade",
            riskPerTrade: "2-3%",
            maxPositions: "3-5",
            dailyTradeLimit: "10-15",
            pairsToTrade: "5-8"
          },
          standard: {
            range: "$2,000-$10,000",
            positionSize: "0.10-0.50 per trade",
            riskPerTrade: "1-2%",
            maxPositions: "5-7",
            dailyTradeLimit: "15-20",
            pairsToTrade: "8-12"
          },
          large: {
            range: "$10,000+",
            positionSize: "0.50-2.00 per trade",
            riskPerTrade: "0.5-1%",
            maxPositions: "7-10",
            dailyTradeLimit: "20-30",
            pairsToTrade: "10-15"
          }
        },
        criticalWarnings: [
          "NEVER risk more than 2% per single trade",
          "ALWAYS use stop losses on every position",
          "ALWAYS monitor correlation between open positions",
          "NEVER have more than 10% total portfolio risk",
          "NEVER trade during major news without wider stops",
          "NEVER overtrade after consecutive losses"
        ],
        emergencyProcedures: {
          accountDrop10Percent: [
            "Close all positions immediately",
            "Stop automated trading",
            "Review all trades for errors",
            "Reduce position size by 50% when resuming",
            "Trade only highest-probability setups"
          ],
          consecutiveLosses: [
            "Pause trading for 24 hours",
            "Review system settings",
            "Check for changing market conditions",
            "Consider reducing position size",
            "Resume with 1 test trade"
          ]
        },
        performanceMetrics: {
          excellent: {
            winRate: ">65%",
            profitFactor: ">2.0",
            averageRR: ">1:2",
            maxDrawdown: "<5%",
            recoveryFactor: ">5"
          },
          good: {
            winRate: "55-65%",
            profitFactor: "1.5-2.0",
            averageRR: "1:1.5",
            maxDrawdown: "5-10%",
            recoveryFactor: "3-5"
          },
          acceptable: {
            winRate: "50-55%",
            profitFactor: "1.2-1.5",
            averageRR: "1:1",
            maxDrawdown: "10-15%",
            recoveryFactor: "2-3"
          },
          poor: {
            winRate: "<50%",
            profitFactor: "<1.2",
            averageRR: "<1:1",
            maxDrawdown: ">15%",
            recoveryFactor: "<2"
          }
        }
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

    // Search installation guides
    const installAnswer = this.searchInstallationGuides(message);
    if (installAnswer) {
      return installAnswer;
    }

    // Search risk management topics
    const riskAnswer = this.searchRiskManagement(message);
    if (riskAnswer) {
      return riskAnswer;
    }

    return null;
  }

  /**
   * Search installation guides
   */
  searchInstallationGuides(message) {
    const guides = this.knowledgeBase.installationGuides;
    
    // Indicator installation
    if (message.includes('install indicator') || message.includes('indicator installation') || 
        (message.includes('indicator') && (message.includes('install') || message.includes('setup') || message.includes('how')))) {
      const guide = guides.mt5Indicators;
      return `${guide.title}:\n\n${guide.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\n` +
        `Important Notes:\n${guide.notes.map(note => `• ${note}`).join('\n')}`;
    }

    // Template installation
    if (message.includes('install template') || message.includes('template installation') ||
        (message.includes('template') && (message.includes('install') || message.includes('setup') || message.includes('how')))) {
      const guide = guides.mt5Templates;
      return `${guide.title}:\n\n${guide.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\n` +
        `Important Notes:\n${guide.notes.map(note => `• ${note}`).join('\n')}`;
    }

    // EA installation (more detailed)
    if (message.includes('install ea') || message.includes('ea installation') || 
        (message.includes('ea') && message.includes('install') && !message.includes('indicator'))) {
      const guide = guides.mt5EA;
      return `${guide.title}:\n\n${guide.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\n` +
        `Important Notes:\n${guide.notes.map(note => `• ${note}`).join('\n')}`;
    }

    // Complete SmartAlgos VIX75 setup
    if (message.includes('vix75') || message.includes('smartalgos') || message.includes('complete setup') ||
        message.includes('full setup') || (message.includes('setup') && message.includes('smart'))) {
      const setup = guides.smartAlgosVIX75Setup;
      return `${setup.title}\n\n${setup.overview}\n\n` +
        `${setup.step1.title}:\n${setup.step1.instructions}\n\n` +
        `${setup.step2.title}:\n${setup.step2.instructions}\n\n` +
        `${setup.step3.title}:\n${setup.step3.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\n` +
        `${setup.step4.title}:\n${setup.step4.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\n` +
        `${setup.step5.title}:\n${setup.step5.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\n` +
        `⚠️ Important Notes:\n${setup.importantNotes.map(note => `• ${note}`).join('\n')}`;
    }

    // EA configuration
    if (message.includes('configure ea') || message.includes('ea settings') || message.includes('ea configuration') ||
        message.includes('calibrate') || message.includes('ea setup') || 
        (message.includes('settings') && message.includes('ea'))) {
      const config = guides.eaConfiguration;
      return `${config.title}\n\n` +
        `Critical Settings:\n\n` +
        `1. Stop Loss:\n   ${config.criticalSettings.stopLoss.description}\n   Importance: ${config.criticalSettings.stopLoss.importance}\n   Recommendation: ${config.criticalSettings.stopLoss.recommendation}\n\n` +
        `2. Trading Hours:\n   ${config.criticalSettings.tradingHours.description}\n   Recommendation: ${config.criticalSettings.tradingHours.recommendation}\n   Note: ${config.criticalSettings.tradingHours.note}\n\n` +
        `3. Profit Target:\n   ${config.criticalSettings.profitTarget.description}\n   Default: ${config.criticalSettings.profitTarget.default}\n   Calculation: ${config.criticalSettings.profitTarget.calculation}\n   Example: ${config.criticalSettings.profitTarget.example}\n   Risk:Reward: ${config.criticalSettings.profitTarget.riskReward}\n\n` +
        `4. Lot Size:\n   ${config.criticalSettings.lotSize.description}\n   Default: ${config.criticalSettings.lotSize.default}\n   Adjustment: ${config.criticalSettings.lotSize.adjustment}\n   ⚠️ Warning: ${config.criticalSettings.lotSize.warning}\n\n` +
        `5. Risk:Reward Ratio:\n   ${config.criticalSettings.riskRewardRatio.description}\n   Default: ${config.criticalSettings.riskRewardRatio.default}\n   Note: ${config.criticalSettings.riskRewardRatio.note}\n   Calculation: ${config.criticalSettings.riskRewardRatio.calculation}\n\n` +
        `Calibration Steps:\n${config.calibrationSteps.map(step => `${step.step}. ${step.action}\n   Reason: ${step.reason}`).join('\n\n')}\n\n` +
        `Performance Notes:\n${config.performanceNotes.map(note => `• ${note.note}\n  Implication: ${note.implication || note.strategy || note.reminder}`).join('\n\n')}\n\n` +
        `💡 Calibration Guidance:\n${config.calibrationGuidance}`;
    }

    return null;
  }

  /**
   * Search risk management knowledge base
   */
  searchRiskManagement(message) {
    const rm = this.knowledgeBase.riskManagement;
    
    // Position sizing queries
    if (message.includes('position size') || message.includes('lot size') || message.includes('how much should i trade')) {
      if (message.includes('gold') || message.includes('xau')) {
        return this.formatPositionSizingResponse(rm.positionSizing.gold, 'Gold/XAUUSD');
      } else if (message.includes('jpy')) {
        return this.formatPositionSizingResponse(rm.positionSizing.jpyPairs, 'JPY Pairs');
      } else {
        return this.formatPositionSizingResponse(rm.positionSizing.majorPairs, 'Major Forex Pairs');
      }
    }

    // Multi-pair risk management
    if (message.includes('multiple pair') || message.includes('multi pair') || message.includes('portfolio risk') || message.includes('correlation')) {
      return `Multi-Pair Portfolio Risk Management:\n\n` +
        `• Maximum simultaneous positions: ${rm.multiPairGuidelines.maxPositions}\n` +
        `• Total portfolio risk: ${rm.multiPairGuidelines.maxPortfolioRisk}\n` +
        `• ${rm.multiPairGuidelines.rule}\n\n` +
        `High Correlation Pairs (reduce combined exposure):\n` +
        rm.multiPairGuidelines.highCorrelationPairs.map(p => `  - ${p}`).join('\n') + '\n\n' +
        `Independent Pairs (can trade full size):\n` +
        rm.multiPairGuidelines.independentPairs.map(p => `  - ${p}`).join('\n');
    }

    // Daily limits
    if (message.includes('daily limit') || message.includes('daily loss') || message.includes('max trades')) {
      return `Daily Trading Limits:\n\n` +
        `Conservative:\n` +
        `  • Max Daily Loss: ${rm.dailyLimits.conservative.maxDailyLoss}\n` +
        `  • Max Trades: ${rm.dailyLimits.conservative.maxTrades}\n` +
        `  • Max Consecutive Losses: ${rm.dailyLimits.conservative.maxConsecutiveLosses}\n` +
        `  • Max Open Positions: ${rm.dailyLimits.conservative.maxOpenPositions}\n\n` +
        `Moderate:\n` +
        `  • Max Daily Loss: ${rm.dailyLimits.moderate.maxDailyLoss}\n` +
        `  • Max Trades: ${rm.dailyLimits.moderate.maxTrades}\n` +
        `  • Max Consecutive Losses: ${rm.dailyLimits.moderate.maxConsecutiveLosses}\n` +
        `  • Max Open Positions: ${rm.dailyLimits.moderate.maxOpenPositions}`;
    }

    // Stop loss queries
    if (message.includes('stop loss') || message.includes('stop loss pips')) {
      return `Recommended Stop Loss Ranges:\n\n` +
        `Major Forex Pairs: 30-50 pips\n` +
        `JPY Pairs: 30-50 pips\n` +
        `Gold/XAUUSD:\n` +
        `  • Scalping: ${rm.goldSpecific.stopLoss.scalping}\n` +
        `  • Swing Trading: ${rm.goldSpecific.stopLoss.swing}\n` +
        `  • Position Trading: ${rm.goldSpecific.stopLoss.position}\n\n` +
        `⚠️ ALWAYS use stop losses - never trade without them!`;
    }

    // Take profit strategy
    if (message.includes('take profit') || message.includes('target') || message.includes('exit strategy')) {
      return `Three-Stage Take Profit Strategy:\n\n` +
        `Stage 1: Close 30-50% of position at 1:1 or 1.5:1 risk:reward\n` +
        `  • Secures initial profit\n` +
        `  • Reduces exposure\n\n` +
        `Stage 2: Close 30-50% of remaining at 2:1 or 2.5:1 risk:reward\n` +
        `  • Move stop to breakeven\n` +
        `  • Captures trend continuation\n\n` +
        `Stage 3: Final position at 3:1+ risk:reward\n` +
        `  • Trail stop or fixed target\n` +
        `  • Maximizes strong moves`;
    }

    // Account size recommendations
    if (message.includes('account size') || message.includes('account balance') || message.includes('$100') || message.includes('$500') || message.includes('$1000') || message.includes('$2000')) {
      return `Recommended Settings by Account Size:\n\n` +
        `Micro Account ($100-$500):\n` +
        `  • Position Size: ${rm.accountSizeRecommendations.micro.positionSize}\n` +
        `  • Risk Per Trade: ${rm.accountSizeRecommendations.micro.riskPerTrade}\n` +
        `  • Max Positions: ${rm.accountSizeRecommendations.micro.maxPositions}\n` +
        `  • Daily Trade Limit: ${rm.accountSizeRecommendations.micro.dailyTradeLimit}\n` +
        `  • Pairs: ${rm.accountSizeRecommendations.micro.pairsToTrade}\n\n` +
        `Small Account ($500-$2,000):\n` +
        `  • Position Size: ${rm.accountSizeRecommendations.small.positionSize}\n` +
        `  • Risk Per Trade: ${rm.accountSizeRecommendations.small.riskPerTrade}\n` +
        `  • Max Positions: ${rm.accountSizeRecommendations.small.maxPositions}\n` +
        `  • Daily Trade Limit: ${rm.accountSizeRecommendations.small.dailyTradeLimit}\n` +
        `  • Pairs: ${rm.accountSizeRecommendations.small.pairsToTrade}\n\n` +
        `Standard Account ($2,000-$10,000):\n` +
        `  • Position Size: ${rm.accountSizeRecommendations.standard.positionSize}\n` +
        `  • Risk Per Trade: ${rm.accountSizeRecommendations.standard.riskPerTrade}\n` +
        `  • Max Positions: ${rm.accountSizeRecommendations.standard.maxPositions}\n` +
        `  • Daily Trade Limit: ${rm.accountSizeRecommendations.standard.dailyTradeLimit}\n` +
        `  • Pairs: ${rm.accountSizeRecommendations.standard.pairsToTrade}`;
    }

    // Gold specific
    if (message.includes('gold') || message.includes('xau') || message.includes('xauusd')) {
      return `Gold/XAUUSD Specific Considerations:\n\n` +
        `Volatility: ${rm.goldSpecific.volatility}\n\n` +
        `Recommended Stop Loss:\n` +
        `  • Scalping: ${rm.goldSpecific.stopLoss.scalping}\n` +
        `  • Swing: ${rm.goldSpecific.stopLoss.swing}\n` +
        `  • Position: ${rm.goldSpecific.stopLoss.position}\n\n` +
        `Take Profit Levels:\n` +
        `  • TP1: ${rm.goldSpecific.takeProfit.tp1}\n` +
        `  • TP2: ${rm.goldSpecific.takeProfit.tp2}\n` +
        `  • TP3: ${rm.goldSpecific.takeProfit.tp3}\n\n` +
        `Best Trading Sessions: ${rm.goldSpecific.bestSessions}`;
    }

    // Critical warnings
    if (message.includes('risk') || message.includes('warning') || message.includes('danger') || message.includes('safe')) {
      return `⚠️ CRITICAL RISK WARNINGS:\n\n` +
        rm.criticalWarnings.map(w => `• ${w}`).join('\n') + `\n\n` +
        `Emergency Procedures:\n\n` +
        `If Account Drops 10%:\n` +
        rm.emergencyProcedures.accountDrop10Percent.map((step, i) => `${i + 1}. ${step}`).join('\n') + `\n\n` +
        `If Consecutive Losses Exceed Threshold:\n` +
        rm.emergencyProcedures.consecutiveLosses.map((step, i) => `${i + 1}. ${step}`).join('\n');
    }

    // Pip values
    if (message.includes('pip value') || message.includes('pip calculation')) {
      return `Pip Value Reference:\n\n` +
        `Standard Forex Pairs:\n` +
        `  • 0.01 lot = ${rm.pipValues.standardPairs["0.01"]}\n` +
        `  • 0.10 lot = ${rm.pipValues.standardPairs["0.10"]}\n` +
        `  • 1.00 lot = ${rm.pipValues.standardPairs["1.00"]}\n\n` +
        `JPY Pairs:\n` +
        `  • 0.01 lot = ${rm.pipValues.jpyPairs["0.01"]}\n` +
        `  • 0.10 lot = ${rm.pipValues.jpyPairs["0.10"]}\n` +
        `  • 1.00 lot = ${rm.pipValues.jpyPairs["1.00"]}\n\n` +
        `Gold (XAUUSD):\n` +
        `  • 0.01 lot = ${rm.pipValues.gold["0.01"]}\n` +
        `  • 0.10 lot = ${rm.pipValues.gold["0.10"]}\n` +
        `  • 1.00 lot = ${rm.pipValues.gold["1.00"]}`;
    }

    return null;
  }

  /**
   * Format position sizing response
   */
  formatPositionSizingResponse(sizingData, pairType) {
    let response = `${pairType} - Position Sizing Guide:\n\n`;
    for (const [balance, settings] of Object.entries(sizingData)) {
      response += `Account Balance: ${balance}\n`;
      response += `  • Conservative: ${settings.conservative}\n`;
      response += `  • Moderate: ${settings.moderate}\n`;
      response += `  • Risk: ${settings.risk}\n`;
      response += `  • Stop Loss: ${settings.stopLoss}\n\n`;
    }
    return response;
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
            content: 'You are an Expert Advisor (EA) specialist assistant with comprehensive knowledge of risk management for automated trading systems. Provide helpful, accurate information about trading EAs, MetaTrader platforms, automated trading, and CRITICALLY important risk management guidelines. Always emphasize proper position sizing, stop losses, and portfolio risk management. Be concise but thorough, and always prioritize trader safety and capital preservation.'
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
    
    // Include comprehensive risk management guidelines
    prompt += `\nIMPORTANT: You have access to comprehensive risk management guidelines for automated trading systems. When answering questions about risk, position sizing, stop losses, or portfolio management, refer to these guidelines:\n\n`;
    prompt += `RISK MANAGEMENT PRINCIPLES:\n`;
    prompt += `- NEVER risk more than 2% per single trade\n`;
    prompt += `- ALWAYS use stop losses on every position\n`;
    prompt += `- For multi-pair trading: Maximum 3-5 simultaneous positions, total portfolio risk 5-10% maximum\n`;
    prompt += `- Position sizing varies by account: $100-$500 accounts use 0.01-0.03 lots, $500-$2,000 use 0.03-0.10 lots, $2,000-$10,000 use 0.10-0.50 lots\n`;
    prompt += `- Stop losses: Major pairs 30-50 pips, JPY pairs 30-50 pips, Gold 50-100 pips (scalping), 150-300 pips (swing), 300-500 pips (position)\n`;
    prompt += `- Daily limits: Conservative (2% max loss, 5-10 trades), Moderate (3-5% max loss, 10-15 trades)\n`;
    prompt += `- Avoid high correlation pairs simultaneously (EUR/USD & GBP/USD, AUD/USD & NZD/USD)\n`;
    prompt += `- Use three-stage take profit: 30-50% at 1:1 R:R, 30-50% remaining at 2:1 R:R, final at 3:1+ R:R\n`;
    prompt += `- Gold trading: Higher volatility, wider stops required, best during London & NY overlap\n\n`;
    
    prompt += `Please provide a helpful answer about Expert Advisors, trading, risk management, or MetaTrader. Always emphasize safety and proper risk management. If the question is about refunds, complaints, or technical issues beyond basic troubleshooting, suggest contacting admin support.`;
    
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
      "How do I install indicators to MT5?",
      "How do I install templates to MT5?",
      "How do I set up SmartAlgos VIX75?",
      "How do I configure EA settings?",
      "What's the difference between scalping and swing trading?",
      "How much should I risk per trade?",
      "What is proper position sizing for my account?",
      "How do I manage risk with multiple pairs?",
      "What stop loss should I use?",
      "What are daily trading limits?",
      "How do I calculate pip values?",
      "What are the risks of automated trading?",
      "How do I optimize my EA settings?",
      "How to trade gold/XAUUSD safely?",
      "What is the three-stage take profit strategy?"
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
        'installation_guides',
        'mt5_setup_instructions',
        'smartalgos_vix75_setup',
        'ea_configuration_guide',
        'comprehensive_risk_management',
        'position_sizing_guide',
        'multi_pair_portfolio_management',
        'admin_escalation',
        'conversation_suggestions'
      ],
      knowledgeBase: {
        faqCount: this.knowledgeBase.faq.length,
        eaTypes: Object.keys(this.knowledgeBase.eaTypes).length,
        technicalIssues: Object.keys(this.knowledgeBase.technicalIssues).length,
        installationGuides: {
          mt5Indicators: 'Available',
          mt5Templates: 'Available',
          mt5EA: 'Available',
          smartAlgosVIX75Setup: 'Available',
          eaConfiguration: 'Available'
        },
        riskManagement: {
          positionSizing: 'Available',
          multiPairGuidelines: 'Available',
          dailyLimits: 'Available',
          goldSpecific: 'Available',
          accountSizeRecommendations: 'Available',
          criticalWarnings: 'Available',
          emergencyProcedures: 'Available'
        }
      }
    };
  }
}

module.exports = new AIEAAssistantService();
