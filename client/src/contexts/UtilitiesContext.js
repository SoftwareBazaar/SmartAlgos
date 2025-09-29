import React, { createContext, useContext, useReducer, useEffect } from 'react';

const UtilitiesContext = createContext();

const utilitiesReducer = (state, action) => {
  switch (action.type) {
    case 'SET_UTILITIES':
      return action.payload;
    case 'ADD_UTILITY':
      return [...state, action.payload];
    case 'UPDATE_UTILITY':
      return state.map(utility => 
        utility.id === action.payload.id ? action.payload : utility
      );
    case 'DELETE_UTILITY':
      return state.filter(utility => utility.id !== action.payload);
    default:
      return state;
  }
};

export const UtilitiesProvider = ({ children }) => {
  const [utilities, dispatch] = useReducer(utilitiesReducer, []);

  // Load utilities from localStorage on mount
  useEffect(() => {
    try {
      const savedUtilities = localStorage.getItem('smart-algos-utilities');
      if (savedUtilities) {
        const parsedUtilities = JSON.parse(savedUtilities);
        dispatch({ type: 'SET_UTILITIES', payload: parsedUtilities });
      } else {
        // Initialize with default utilities if none exist
        const defaultUtilities = [
          {
            id: 1,
            name: 'Lot Size Calculator',
            description: 'Calculate optimal position sizes based on risk management rules and account balance',
            category: 'Risk Management',
            features: [
              'Account balance-based calculations',
              'Risk percentage settings',
              'Multiple currency pair support',
              'Real-time market data integration'
            ],
            downloadUrl: '/downloads/lot-size-calculator.exe',
            version: '2.1.0',
            size: '2.3 MB',
            downloads: 15420,
            image: '/api/placeholder/400/300',
            previews: [
              '/api/placeholder/400/300',
              '/api/placeholder/400/300',
              '/api/placeholder/400/300'
            ],
            guide: {
              title: 'Lot Size Calculator Guide',
              steps: [
                'Download and install the calculator',
                'Enter your account balance',
                'Set your risk percentage (1-5% recommended)',
                'Select your currency pair',
                'The calculator will show optimal lot size',
                'Adjust based on market conditions'
              ]
            }
          },
          {
            id: 2,
            name: 'Economic Calendar Tool',
            description: 'Track important economic events and news releases that impact forex markets',
            category: 'Market Analysis',
            features: [
              'Real-time economic events',
              'Impact level indicators',
              'Currency pair filtering',
              'Custom event alerts'
            ],
            downloadUrl: '/downloads/economic-calendar.exe',
            version: '1.8.5',
            size: '1.8 MB',
            downloads: 12350,
            image: '/api/placeholder/400/300',
            previews: [
              '/api/placeholder/400/300',
              '/api/placeholder/400/300'
            ],
            guide: {
              title: 'Economic Calendar Guide',
              steps: [
                'Install the calendar tool',
                'Configure your timezone',
                'Select countries to monitor',
                'Set up custom alerts',
                'Review daily economic events',
                'Plan your trading strategy'
              ]
            }
          },
          {
            id: 3,
            name: 'Profit Calculator',
            description: 'Calculate potential profits and losses for different trading scenarios',
            category: 'Trading Tools',
            features: [
              'Pip value calculations',
              'Profit/loss scenarios',
              'Multiple timeframe analysis',
              'Risk-reward ratios'
            ],
            downloadUrl: '/downloads/profit-calculator.exe',
            version: '1.5.2',
            size: '1.2 MB',
            downloads: 8750,
            image: '/api/placeholder/400/300',
            previews: ['/api/placeholder/400/300'],
            guide: {
              title: 'Profit Calculator Guide',
              steps: [
                'Download the calculator',
                'Enter trade parameters',
                'Set entry and exit prices',
                'Calculate potential profit/loss',
                'Analyze risk-reward ratio'
              ]
            }
          },
          {
            id: 4,
            name: 'Market Hours Tracker',
            description: 'Monitor trading session times and market overlaps for optimal trading opportunities',
            category: 'Market Analysis',
            features: [
              'All major trading sessions',
              'Market overlap indicators',
              'Timezone conversions',
              'Session strength analysis'
            ],
            downloadUrl: '/downloads/market-hours.exe',
            version: '2.0.1',
            size: '1.5 MB',
            downloads: 6890,
            image: '/api/placeholder/400/300',
            previews: ['/api/placeholder/400/300'],
            guide: {
              title: 'Market Hours Guide',
              steps: [
                'Install the tracker',
                'Set your timezone',
                'Monitor session overlaps',
                'Plan trading times',
                'Track session strength'
              ]
            }
          },
          {
            id: 5,
            name: 'Position Size Optimizer',
            description: 'Advanced position sizing tool with Kelly Criterion and risk-adjusted sizing',
            category: 'Risk Management',
            features: [
              'Kelly Criterion calculations',
              'Risk-adjusted position sizing',
              'Portfolio correlation analysis',
              'Dynamic sizing adjustments'
            ],
            downloadUrl: '/downloads/position-optimizer.exe',
            version: '3.2.0',
            size: '3.1 MB',
            downloads: 4560,
            image: '/api/placeholder/400/300',
            previews: ['/api/placeholder/400/300'],
            guide: {
              title: 'Position Optimizer Guide',
              steps: [
                'Download the optimizer',
                'Enter portfolio data',
                'Set risk parameters',
                'Run Kelly Criterion analysis',
                'Apply optimized position sizes'
              ]
            }
          },
          {
            id: 6,
            name: 'EA Settings Optimizer',
            description: 'Optimize Expert Advisor parameters for maximum performance and minimal risk',
            category: 'EA Tools',
            features: [
              'Parameter optimization',
              'Backtesting integration',
              'Risk parameter analysis',
              'Performance metrics'
            ],
            downloadUrl: '/downloads/ea-optimizer.exe',
            version: '1.9.3',
            size: '2.8 MB',
            downloads: 3210,
            image: '/api/placeholder/400/300',
            previews: ['/api/placeholder/400/300'],
            guide: {
              title: 'EA Optimizer Guide',
              steps: [
                'Install the optimizer',
                'Load your EA',
                'Set optimization parameters',
                'Run backtesting',
                'Apply optimized settings'
              ]
            }
          }
        ];
        dispatch({ type: 'SET_UTILITIES', payload: defaultUtilities });
        localStorage.setItem('smart-algos-utilities', JSON.stringify(defaultUtilities));
      }
    } catch (error) {
      console.error('Error loading utilities from storage:', error);
    }
  }, []);

  // Save utilities to localStorage whenever utilities change
  useEffect(() => {
    if (utilities.length > 0) {
      localStorage.setItem('smart-algos-utilities', JSON.stringify(utilities));
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('utilities-updated'));
    }
  }, [utilities]);

  // Listen for localStorage changes to sync utilities across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'smart-algos-utilities' && e.newValue) {
        try {
          const utilities = JSON.parse(e.newValue);
          dispatch({ type: 'SET_UTILITIES', payload: utilities });
        } catch (error) {
          console.error('Error parsing utilities from storage:', error);
        }
      }
    };

    // Listen for custom utilities update events (same tab)
    const handleUtilitiesUpdate = () => {
      try {
        const savedUtilities = localStorage.getItem('smart-algos-utilities');
        if (savedUtilities) {
          const utilities = JSON.parse(savedUtilities);
          dispatch({ type: 'SET_UTILITIES', payload: utilities });
        }
      } catch (error) {
        console.error('Error parsing utilities from storage:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('utilities-updated', handleUtilitiesUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('utilities-updated', handleUtilitiesUpdate);
    };
  }, []);

  const addUtility = (utilityData) => {
    const newUtility = {
      id: Date.now(),
      ...utilityData,
      downloads: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    dispatch({ type: 'ADD_UTILITY', payload: newUtility });
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('utilities-updated'));
  };

  const updateUtility = (utilityId, utilityData) => {
    const updatedUtility = {
      ...utilityData,
      id: utilityId,
      updated_at: new Date().toISOString()
    };
    dispatch({ type: 'UPDATE_UTILITY', payload: updatedUtility });
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('utilities-updated'));
  };

  const deleteUtility = (utilityId) => {
    dispatch({ type: 'DELETE_UTILITY', payload: utilityId });
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('utilities-updated'));
  };

  const refreshUtilities = () => {
    try {
      const savedUtilities = localStorage.getItem('smart-algos-utilities');
      if (savedUtilities) {
        const utilities = JSON.parse(savedUtilities);
        dispatch({ type: 'SET_UTILITIES', payload: utilities });
      }
    } catch (error) {
      console.error('Error refreshing utilities:', error);
    }
  };

  const value = {
    utilities,
    addUtility,
    updateUtility,
    deleteUtility,
    refreshUtilities
  };

  return (
    <UtilitiesContext.Provider value={value}>
      {children}
    </UtilitiesContext.Provider>
  );
};

export const useUtilities = () => {
  const context = useContext(UtilitiesContext);
  if (!context) {
    throw new Error('useUtilities must be used within a UtilitiesProvider');
  }
  return context;
};
