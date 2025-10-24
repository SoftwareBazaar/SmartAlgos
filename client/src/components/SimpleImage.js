/**
 * Simple Image Component - Direct Display
 * No complex logic, just show the image
 */

import React from 'react';

export const SimpleImage = ({ src, alt, className = '' }) => {
  if (!src) {
    return (
      <div className={`bg-gray-300 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">No Image</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ 
        display: 'block',
        maxWidth: '100%',
        height: 'auto'
      }}
    />
  );
};

export const SimpleEAImage = ({ ea, className = '' }) => {
  // Get image URL - check both possible fields
  const imageUrl = ea.image || ea.image_url;
  
  // Log for debugging
  if (!imageUrl) {
    console.warn('EA has no image:', ea.name, 'ID:', ea.id);
  } else {
    console.log('Displaying EA image:', ea.name, 'URL:', imageUrl.substring(0, 60));
  }
  
  return (
    <SimpleImage
      src={imageUrl}
      alt={ea.name || 'EA Image'}
      className={`w-full h-full object-cover ${className}`}
    />
  );
};

export const SimpleScreenshot = ({ screenshot, className = '' }) => {
  return (
    <SimpleImage
      src={screenshot}
      alt="Screenshot"
      className={className}
    />
  );
};

export default {
  SimpleImage,
  SimpleEAImage,
  SimpleScreenshot
};
