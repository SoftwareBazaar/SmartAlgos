import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiClient from '../lib/apiClient';

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

  // Load EAs from API on mount
  useEffect(() => {
    const loadEAs = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        console.log('[EAContext] 🔄 Loading EAs from API...');
        
        // Always load from API first (ignore localStorage initially)
        const response = await apiClient.get('/api/eas');
        if (response.data.success) {
          console.log('[EAContext] ✅ Loaded', response.data.data.length, 'EAs from API');
          console.log('[EAContext] Sample EA data:', response.data.data[0]);
          dispatch({ type: 'SET_EAS', payload: response.data.data });
          // Save to localStorage for offline fallback only
          localStorage.setItem('smart-algos-eas', JSON.stringify(response.data.data));
        } else {
          throw new Error('Failed to load EAs from API');
        }
      } catch (error) {
        console.error('[EAContext] ⚠️ Error loading EAs from API:', error);
        // Fallback to localStorage for offline mode
        try {
          const savedEAs = localStorage.getItem('smart-algos-eas');
          if (savedEAs) {
            const eas = JSON.parse(savedEAs);
            console.log('[EAContext] 📦 Loaded EAs from localStorage:', eas.length, 'EAs');
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
                image: '/uploads/ea-images/gold-scalper.svg',
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
                image: '/uploads/ea-images/multi-indicator.svg',
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
                image: '/uploads/ea-images/trend-master.svg',
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
                image: '/uploads/ea-images/institutional.svg',
                created_at: '2024-01-20',
                updated_at: '2024-01-28'
              },
            ];
            dispatch({ type: 'SET_EAS', payload: defaultEAs });
            localStorage.setItem('smart-algos-eas', JSON.stringify(defaultEAs));
          }
        } catch (localError) {
          console.error('Error loading EAs from localStorage:', localError);
          dispatch({ type: 'SET_ERROR', payload: 'Failed to load EAs' });
        }
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
  const addEA = async (eaData) => {
    try {
      const formData = new FormData();
      
      // Append all EA data to FormData
      Object.keys(eaData).forEach(key => {
        if (key === 'image' && eaData[key] && eaData[key] instanceof File) {
          formData.append('image', eaData[key]);
        } else if (key === 'eaFile' && eaData[key] && eaData[key] instanceof File) {
          formData.append('eaFile', eaData[key]);
        } else if (eaData[key] !== null && eaData[key] !== undefined) {
          formData.append(key, eaData[key]);
        }
      });

      const response = await apiClient.post('/api/eas', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const newEA = response.data.data;
        console.log('[EAContext] ✅ EA created successfully:', newEA);
        
        // Add EA to state immediately (don't wait for refresh which might timeout)
        dispatch({ type: 'ADD_EA', payload: newEA });
        
        // Refresh in background (non-blocking)
        refreshEAs().catch(err => console.warn('[EAContext] Background refresh failed:', err));
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('ea-updated'));
        return newEA;
      }
    } catch (error) {
      console.error('Error adding EA:', error);
      throw error;
    }
  };

  const updateEA = async (eaId, eaData) => {
    try {
      console.log('[EAContext] 🔄 Updating EA:', eaId);
      console.log('[EAContext] EA data type:', eaData.constructor.name);
      
      let formData;
      
      // Check if eaData is already a FormData object
      if (eaData instanceof FormData) {
        console.log('[EAContext] 📋 Using existing FormData object');
        formData = eaData;
        
        // Log FormData contents for debugging
        console.log('[EAContext] FormData entries:');
        for (let [key, value] of formData.entries()) {
          console.log(`  ${key}:`, value);
        }
      } else {
        console.log('[EAContext] 📝 Creating new FormData object');
        console.log('[EAContext] EA data keys:', Object.keys(eaData));
        
        formData = new FormData();
        
        // Append all EA data to FormData
        Object.keys(eaData).forEach(key => {
          if (key === 'image' && eaData[key] && eaData[key] instanceof File) {
            console.log('[EAContext] 📸 Appending image file:', eaData[key].name);
            formData.append('image', eaData[key]);
          } else if (key === 'eaFile' && eaData[key] && eaData[key] instanceof File) {
            console.log('[EAContext] 📦 Appending EA file:', eaData[key].name);
            formData.append('eaFile', eaData[key]);
          } else if (key === 'specifications' && eaData[key]) {
            // Handle specifications object
            Object.keys(eaData[key]).forEach(specKey => {
              formData.append(`specifications.${specKey}`, eaData[key][specKey] || '');
            });
          } else if (key === 'features' && Array.isArray(eaData[key])) {
            // Handle features array
            eaData[key].forEach((feature, index) => {
              formData.append(`features[${index}]`, feature);
            });
          } else if (key === 'screenshots' && Array.isArray(eaData[key])) {
            // Handle screenshots array
            eaData[key].forEach((screenshot, index) => {
              formData.append(`screenshots[${index}]`, screenshot);
            });
          } else if (eaData[key] !== null && eaData[key] !== undefined && key !== 'image' && key !== 'eaFile') {
            formData.append(key, eaData[key]);
          }
        });
      }

      console.log('[EAContext] 📤 Sending PUT request...');
      
      const response = await apiClient.put(`/api/eas/${eaId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('[EAContext] ✅ Update response received:', response.data.success);

      if (response.data.success) {
        const updatedEA = response.data.data;
        console.log('[EAContext] ✅ EA updated with data:', updatedEA);
        
        // Update state immediately
        dispatch({ type: 'UPDATE_EA', payload: { id: parseInt(eaId), ...updatedEA } });
        
        // Refresh in background (non-blocking)
        refreshEAs().catch(err => console.warn('[EAContext] Background refresh failed:', err));
        
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('ea-updated'));
        
        return updatedEA;
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      console.error('[EAContext] ❌ Error updating EA:', error);
      console.error('[EAContext] Error details:', error.response?.data);
      throw error;
    }
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

  // Force refresh EA data from API
  const refreshEAs = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiClient.get('/api/eas');
      if (response.data.success) {
        dispatch({ type: 'SET_EAS', payload: response.data.data });
      } else {
        throw new Error('Failed to refresh EAs from API');
      }
    } catch (error) {
      console.error('Error refreshing EAs from API:', error);
      // Fallback to localStorage
      try {
        const savedEAs = localStorage.getItem('smart-algos-eas');
        if (savedEAs) {
          const eas = JSON.parse(savedEAs);
          dispatch({ type: 'SET_EAS', payload: eas });
        }
      } catch (localError) {
        console.error('Error refreshing EA data from localStorage:', localError);
      }
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
