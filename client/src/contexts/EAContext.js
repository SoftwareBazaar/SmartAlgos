import React, { createContext, useContext, useReducer, useEffect } from 'react';

const EAContext = createContext();

// EA reducer
const eaReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_EAS':
      return { ...state, eas: action.payload, loading: false };
    case 'ADD_EA':
      return { ...state, eas: [...state.eas, action.payload] };
    case 'UPDATE_EA':
      return { 
        ...state, 
        eas: state.eas.map(ea => 
          ea.id === action.payload.id ? { ...ea, ...action.payload } : ea
        ) 
      };
    case 'DELETE_EA':
      return { 
        ...state, 
        eas: state.eas.filter(ea => ea.id !== action.payload) 
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  eas: [],
  loading: true,
  error: null,
};

// EA provider component
export const EAProvider = ({ children }) => {
  const [state, dispatch] = useReducer(eaReducer, initialState);

  // Load EAs from localStorage on mount
  useEffect(() => {
    const loadEAs = () => {
      try {
        const savedEAs = localStorage.getItem('smart-algos-eas');
        if (savedEAs) {
          const eas = JSON.parse(savedEAs);
          dispatch({ type: 'SET_EAS', payload: eas });
        } else {
          // Initialize with default EAs
          const defaultEAs = [
            { 
              id: 1, 
              name: 'Gold Scalper Pro v2.0', 
              status: 'active', 
              subscribers: 156, 
              revenue: '$4,680',
              description: 'Advanced scalping EA for gold trading with high win rate',
              version: '2.0',
              price: '$299',
              category: 'Scalping',
              tags: 'gold,scalping,mt4',
              image: null,
              created_at: '2024-01-15',
              updated_at: '2024-01-20'
            },
            { 
              id: 2, 
              name: 'Multi Indicator EA', 
              status: 'active', 
              subscribers: 89, 
              revenue: '$2,670',
              description: 'Multi-timeframe indicator-based EA for trend following',
              version: '1.5',
              price: '$199',
              category: 'Trend Following',
              tags: 'trend,indicators,multi-timeframe',
              image: null,
              created_at: '2024-01-10',
              updated_at: '2024-01-18'
            },
            { 
              id: 3, 
              name: 'Trend Master EA', 
              status: 'pending', 
              subscribers: 0, 
              revenue: '$0',
              description: 'Advanced trend analysis EA with machine learning',
              version: '1.0',
              price: '$399',
              category: 'Machine Learning',
              tags: 'trend,ml,advanced',
              image: null,
              created_at: '2024-01-25',
              updated_at: '2024-01-25'
            },
            { 
              id: 4, 
              name: 'Institutional Trading SCALPER', 
              status: 'active', 
              subscribers: 23, 
              revenue: '$11,500',
              description: 'Professional scalping EA designed for big institutions and hedge funds. Ultra-low latency execution with advanced risk management.',
              version: '3.0',
              price: '$2,999',
              category: 'Institutional',
              tags: 'institutional,hedge-funds,scalping,low-latency',
              image: null,
              created_at: '2024-01-20',
              updated_at: '2024-01-28'
            },
          ];
          dispatch({ type: 'SET_EAS', payload: defaultEAs });
          localStorage.setItem('smart-algos-eas', JSON.stringify(defaultEAs));
        }
      } catch (error) {
        console.error('Error loading EAs:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load EAs' });
      }
    };

    loadEAs();
  }, []);

  // Listen for localStorage changes to sync EA data across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'smart-algos-eas' && e.newValue) {
        try {
          const eas = JSON.parse(e.newValue);
          dispatch({ type: 'SET_EAS', payload: eas });
        } catch (error) {
          console.error('Error parsing EA data from storage:', error);
        }
      }
    };

    // Listen for custom EA update events (same tab)
    const handleEAUpdate = () => {
      try {
        const savedEAs = localStorage.getItem('smart-algos-eas');
        if (savedEAs) {
          const eas = JSON.parse(savedEAs);
          dispatch({ type: 'SET_EAS', payload: eas });
        }
      } catch (error) {
        console.error('Error parsing EA data from storage:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('ea-updated', handleEAUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ea-updated', handleEAUpdate);
    };
  }, []);

  // Save EAs to localStorage whenever they change
  useEffect(() => {
    if (state.eas.length > 0) {
      localStorage.setItem('smart-algos-eas', JSON.stringify(state.eas));
    }
  }, [state.eas]);

  // EA management functions
  const addEA = (eaData) => {
    const newEA = {
      id: Date.now(),
      ...eaData,
      subscribers: 0,
      revenue: '$0',
      rentalPeriods: ['monthly', 'quarterly', 'yearly'],
      currentPeriod: 'monthly',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    dispatch({ type: 'ADD_EA', payload: newEA });
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('ea-updated'));
  };

  const updateEA = (eaId, eaData) => {
    const updatedEA = {
      ...eaData,
      id: eaId,
      updated_at: new Date().toISOString()
    };
    dispatch({ type: 'UPDATE_EA', payload: updatedEA });
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('ea-updated'));
  };

  const deleteEA = (eaId) => {
    dispatch({ type: 'DELETE_EA', payload: eaId });
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('ea-updated'));
  };

  const getActiveEAs = () => {
    return state.eas.filter(ea => ea.status === 'active');
  };

  const getEAsByCategory = (category) => {
    if (category === 'all') return state.eas;
    return state.eas.filter(ea => ea.category === category);
  };

  const searchEAs = (searchTerm) => {
    if (!searchTerm.trim()) return state.eas;
    return state.eas.filter(ea => 
      ea.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ea.tags.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Force refresh EA data from localStorage
  const refreshEAs = () => {
    try {
      const savedEAs = localStorage.getItem('smart-algos-eas');
      if (savedEAs) {
        const eas = JSON.parse(savedEAs);
        dispatch({ type: 'SET_EAS', payload: eas });
      }
    } catch (error) {
      console.error('Error refreshing EA data:', error);
    }
  };

  const value = {
    ...state,
    addEA,
    updateEA,
    deleteEA,
    getActiveEAs,
    getEAsByCategory,
    searchEAs,
    refreshEAs,
  };

  return (
    <EAContext.Provider value={value}>
      {children}
    </EAContext.Provider>
  );
};

// Custom hook to use EA context
export const useEA = () => {
  const context = useContext(EAContext);
  if (!context) {
    throw new Error('useEA must be used within an EAProvider');
  }
  return context;
};

export default EAContext;
