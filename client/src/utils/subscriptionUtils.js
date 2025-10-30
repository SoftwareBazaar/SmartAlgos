/**
 * Subscription Utilities for Smart Algos
 * Handles subscription creation, error handling, and retry logic
 */

import apiClient from '../lib/apiClient';

// Enhanced subscription creation with retry logic
export const createSubscriptionWithRetry = async (subscriptionData, maxRetries = 3) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Creating subscription (attempt ${i + 1}/${maxRetries})...`);
      console.log('📤 Subscription data being sent:', subscriptionData);
      
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subscriptionData)
      });
      
      const result = await response.json();
      console.log('📥 Server response:', result);
      
      if (response.ok && result.success) {
        console.log('✅ Subscription created successfully:', result.data);
        return result;
      }
      
      // Handle specific error cases
      if (result.message === 'You already have an active subscription to this EA') {
        throw new Error('You already have an active subscription to this EA');
      }
      
      if (result.message === 'EA not found') {
        throw new Error('The selected EA is no longer available');
      }
      
      if (result.message === 'EA is not available for subscription') {
        throw new Error('This EA is currently not available for subscription');
      }
      
      console.error(`Attempt ${i + 1} failed:`, result);
      
      if (i === maxRetries - 1) {
        throw new Error(result.message || 'Failed to create subscription');
      }
      
      // Wait before retry (exponential backoff)
      const delay = 1000 * Math.pow(2, i);
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
    } catch (error) {
      console.error(`Subscription creation attempt ${i + 1} failed:`, error);
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Wait before retry
      const delay = 1000 * (i + 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Get download links for subscription
export const getSubscriptionDownloadLinks = async (subscriptionId) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(`/api/subscriptions/${subscriptionId}/files`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      return result.data;
    }
    
    throw new Error(result.message || 'Failed to get download links');
  } catch (error) {
    console.error('Error getting download links:', error);
    throw error;
  }
};

// Enhanced download with persistence
export const downloadWithPersistence = async (subscriptionId, eaId, fileType) => {
  try {
    // Get download links
    const downloadData = await getSubscriptionDownloadLinks(subscriptionId);
    
    if (!downloadData.files || !downloadData.files[fileType]) {
      throw new Error(`Download link not available for ${fileType}`);
    }
    
    const downloadUrl = downloadData.files[fileType];
    
    // Store download info in localStorage
    const downloadInfo = {
      subscriptionId,
      eaId,
      fileType,
      url: downloadUrl,
      timestamp: Date.now(),
      expiresAt: downloadData.tokenExpiresAt
    };
    
    // Get existing downloads
    const existingDownloads = JSON.parse(localStorage.getItem('downloads') || '[]');
    
    // Add new download
    existingDownloads.push(downloadInfo);
    
    // Keep only last 10 downloads
    if (existingDownloads.length > 10) {
      existingDownloads.splice(0, existingDownloads.length - 10);
    }
    
    // Save to localStorage
    localStorage.setItem('downloads', JSON.stringify(existingDownloads));
    
    // Trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${eaId}_${fileType}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ Download initiated:', fileType);
    return true;
    
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

// Restore downloads from localStorage
export const restoreDownloads = () => {
  try {
    const downloads = JSON.parse(localStorage.getItem('downloads') || '[]');
    const now = Date.now();
    
    // Filter out expired downloads
    const validDownloads = downloads.filter(d => {
      const expiresAt = new Date(d.expiresAt).getTime();
      return expiresAt > now;
    });
    
    // Update localStorage if any downloads were removed
    if (validDownloads.length !== downloads.length) {
      localStorage.setItem('downloads', JSON.stringify(validDownloads));
    }
    
    return validDownloads;
  } catch (error) {
    console.error('Error restoring downloads:', error);
    return [];
  }
};

// Get user's active subscriptions
export const getUserSubscriptions = async () => {
  try {
    const response = await apiClient.get('/api/payments/subscriptions');
    if (response.data?.success) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    return [];
  }
};

// Check if user has access to EA
export const checkEAAccess = async (eaId) => {
  try {
    const subscriptions = await getUserSubscriptions();
    
    return subscriptions.some(sub => 
      sub.ea_id === parseInt(eaId) && 
      sub.status === 'active' && 
      sub.payment_status === 'completed'
    );
  } catch (error) {
    console.error('Error checking EA access:', error);
    return false;
  }
};

// Enhanced subscription flow - REQUIRES PAYMENT FIRST
// This should NOT create subscription directly - payment must be completed first
export const subscribeAndDownload = async (eaId, subscriptionType, paymentMethod) => {
  throw new Error('Direct subscription creation is disabled. Please complete payment first.');
  
  // This function is deprecated - payment must be initiated first
  // The flow should be:
  // 1. Show payment method selection
  // 2. Complete payment (M-Pesa, Crypto, Card)
  // 3. Backend creates subscription automatically after payment confirmation
  // 4. Then fetch download links
};

// Error message mapping
export const getErrorMessage = (error) => {
  const errorMessages = {
    'You already have an active subscription to this EA': 'You already have an active subscription to this EA',
    'EA not found': 'The selected EA is no longer available',
    'EA is not available for subscription': 'This EA is currently not available for subscription',
    'Authentication required': 'Please log in to continue',
    'Failed to create subscription': 'There was an issue creating your subscription. Please try again.',
    'Network error': 'Please check your internet connection and try again.'
  };
  
  return errorMessages[error.message] || error.message || 'Something went wrong. Please try again.';
};

export default {
  createSubscriptionWithRetry,
  getSubscriptionDownloadLinks,
  downloadWithPersistence,
  restoreDownloads,
  getUserSubscriptions,
  checkEAAccess,
  subscribeAndDownload,
  getErrorMessage
};
