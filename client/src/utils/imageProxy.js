/**
 * Image Proxy Utility
 * Handles image display with proxy for CORS issues
 */

// Get image proxy URL
export const getImageProxyUrl = (originalUrl) => {
  if (!originalUrl) return '/api/images/fallback/ea';
  
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

// Enhanced image component with proxy
export const ProxyImage = ({ src, alt, className = '', fallback = '/api/images/fallback/ea' }) => {
  const proxyUrl = getImageProxyUrl(src);
  
  const handleError = (e) => {
    console.log('Image failed to load:', src);
    e.target.src = fallback;
    e.target.onerror = null; // Prevent infinite loop
  };
  
  const handleLoad = (e) => {
    console.log('Image loaded successfully:', src);
  };
  
  return (
    <img
      src={proxyUrl}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
    />
  );
};

// EA Card Image with proxy
export const EACardImageProxy = ({ ea, className = '' }) => {
  const imageUrl = ea.image || ea.image_url;
  
  return (
    <ProxyImage
      src={imageUrl}
      alt={ea.name}
      className={`w-full h-full object-cover ${className}`}
      fallback="/api/images/fallback/ea"
    />
  );
};

export default {
  getImageProxyUrl,
  ProxyImage,
  EACardImageProxy
};
