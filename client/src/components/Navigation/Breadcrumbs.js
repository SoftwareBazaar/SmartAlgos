import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumb Navigation Component
 * Provides contextual navigation path for users
 */
const Breadcrumbs = () => {
  const location = useLocation();
  
  // Get path segments
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Route name mapping
  const routeNames = {
    'dashboard': 'Dashboard',
    'markets': 'Markets',
    'news': 'News & Analysis',
    'signals': 'Trading Signals',
    'ea-marketplace': 'EA Marketplace',
    'custom-ea': 'Custom EA Service',
    'utilities': 'Free Utilities',
    'hft-bots': 'HFT Bots',
    'portfolio': 'Portfolio',
    'profile': 'Profile',
    'settings': 'Settings',
    'payments': 'Payments',
    'subscription': 'Subscription',
    'analysis': 'Analysis',
    'pricing': 'Pricing',
    'privacy': 'Privacy Policy',
    'terms': 'Terms of Service',
    'refund': 'Refund Policy',
    'about': 'About Us'
  };

  // Don't show breadcrumbs on home/landing page
  if (location.pathname === '/' || pathSegments.length === 0) {
    return null;
  }

  // Build breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', path: '/dashboard', isActive: false }
  ];

  // Add path segments
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    const name = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    breadcrumbItems.push({
      name,
      path: currentPath,
      isActive: isLast
    });
  });

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4 px-1" aria-label="Breadcrumb">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.path}>
          {index === 0 ? (
            <Link
              to={item.path}
              className="flex items-center hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <Home className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              {item.isActive ? (
                <span className="text-gray-900 dark:text-white font-medium">
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;

