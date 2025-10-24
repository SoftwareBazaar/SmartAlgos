/**
 * Image Display Component with Error Handling
 * Handles Supabase Storage images with proper fallbacks
 */

import React, { useState } from 'react';

export const ImageDisplay = ({ 
  src, 
  alt, 
  className = '', 
  fallback = null,
  onError = null,
  onLoad = null 
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = (e) => {
    console.log('Image failed to load:', src);
    setError(true);
    setLoading(false);
    if (onError) onError(e);
  };

  const handleLoad = (e) => {
    console.log('Image loaded successfully:', src);
    setLoading(false);
    if (onLoad) onLoad(e);
  };

  // Show loading state
  if (loading) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center ${className}`}>
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show error fallback
  if (error) {
    if (fallback) {
      return fallback;
    }
    
    return (
      <div className={`bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center ${className}`}>
        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      crossOrigin="anonymous"
      loading="lazy"
    />
  );
};

export const ScreenshotDisplay = ({ screenshots, className = '' }) => {
  if (!screenshots || screenshots.length === 0) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center py-8">
          <svg className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">No screenshots available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {screenshots.map((screenshot, index) => (
        <div key={index} className="relative group">
          <ImageDisplay
            src={screenshot}
            alt={`Screenshot ${index + 1}`}
            className="h-24 w-full rounded-lg object-cover"
            fallback={
              <div className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-500">Screenshot {index + 1}</span>
              </div>
            }
          />
        </div>
      ))}
    </div>
  );
};

export const EAImageDisplay = ({ ea, className = '' }) => {
  const imageUrl = ea.image || ea.image_url;
  
  if (!imageUrl) {
    return (
      <div className={`bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center ${className}`}>
        <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  }

  return (
    <ImageDisplay
      src={imageUrl}
      alt={ea.name}
      className={`w-full h-full object-cover ${className}`}
      fallback={
        <div className={`bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center ${className}`}>
          <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      }
    />
  );
};

export default {
  ImageDisplay,
  ScreenshotDisplay,
  EAImageDisplay
};
