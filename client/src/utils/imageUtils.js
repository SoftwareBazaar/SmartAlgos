/**
 * Image Utilities for Smart Algos
 * Handles image display, error handling, and fallbacks
 */

// Image error handler with fallback
export const handleImageError = (e, fallbackType = 'ea') => {
  console.log('Image failed to load:', e.target.src);
  e.target.src = `/api/images/fallback/${fallbackType}`;
  e.target.onerror = null; // Prevent infinite loop
};

// Enhanced image component with error handling
export const ImageWithFallback = ({ 
  src, 
  alt, 
  className = '', 
  fallbackType = 'ea',
  onLoad = null,
  onError = null
}) => {
  const handleError = (e) => {
    console.log('Image error for:', src);
    // Don't use non-existent endpoint - just hide the broken image
    e.target.style.display = 'none';
    e.target.onerror = null; // Prevent infinite loop
    if (onError) onError(e);
  };

  const handleLoad = (e) => {
    console.log('Image loaded successfully:', src);
    if (onLoad) onLoad(e);
  };

  // Don't render if no src or invalid URL
  if (!src || typeof src !== 'string' || src.includes('undefined') || src.trim() === '') {
    return null;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
    />
  );
};

// Check if image URL is valid
export const isValidImageUrl = (url) => {
  if (!url) return false;
  
  // Check if it's a Supabase Storage URL
  if (url.includes('supabase.co/storage')) {
    return true;
  }
  
  // Check if it's a local upload
  if (url.startsWith('/uploads/')) {
    return true;
  }
  
  // Check if it's a data URL
  if (url.startsWith('data:')) {
    return true;
  }
  
  return false;
};

// Get fallback image URL
export const getFallbackImageUrl = (type = 'ea') => {
  return `/api/images/fallback/${type}`;
};

// Preload images
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

// Batch preload images
export const preloadImages = async (urls) => {
  const promises = urls.map(url => preloadImage(url).catch(err => {
    console.warn('Failed to preload image:', url, err);
    return null;
  }));
  
  const results = await Promise.all(promises);
  return results.filter(Boolean);
};

// Get image proxy URL for CORS issues
export const getImageProxyUrl = (originalUrl) => {
  if (!originalUrl) return getFallbackImageUrl();
  
  // If it's already a proxy URL, return as is
  if (originalUrl.includes('/api/images/proxy')) {
    return originalUrl;
  }
  
  // If it's a Supabase Storage URL, use proxy
  if (originalUrl.includes('supabase.co/storage')) {
    return `/api/images/proxy?url=${encodeURIComponent(originalUrl)}`;
  }
  
  // For local uploads, return as is
  if (originalUrl.startsWith('/uploads/')) {
    return originalUrl;
  }
  
  return originalUrl;
};

// Enhanced EA image display
export const EACardImage = ({ ea, className = '' }) => {
  const imageUrl = ea.image || ea.image_url;
  const proxyUrl = getImageProxyUrl(imageUrl);
  
  return (
    <ImageWithFallback
      src={proxyUrl}
      alt={ea.name}
      className={`w-full h-48 object-cover rounded-lg ${className}`}
      fallbackType="ea"
      onLoad={() => console.log('EA image loaded:', ea.name)}
      onError={() => console.log('EA image failed:', ea.name)}
    />
  );
};

// Enhanced screenshot display
export const ScreenshotGrid = ({ screenshots, className = '' }) => {
  if (!screenshots || screenshots.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No screenshots available
      </div>
    );
  }
  
  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      {screenshots.map((screenshot, index) => (
        <div key={index} className="relative group">
          <ImageWithFallback
            src={getImageProxyUrl(screenshot)}
            alt={`Screenshot ${index + 1}`}
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
            fallbackType="screenshot"
            onLoad={() => console.log(`Screenshot ${index + 1} loaded`)}
            onError={() => console.log(`Screenshot ${index + 1} failed`)}
          />
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            {index + 1}
          </div>
        </div>
      ))}
    </div>
  );
};

export default {
  handleImageError,
  ImageWithFallback,
  isValidImageUrl,
  getFallbackImageUrl,
  preloadImage,
  preloadImages,
  getImageProxyUrl,
  EACardImage,
  ScreenshotGrid
};
