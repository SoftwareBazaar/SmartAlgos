import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  TrendingUp,
  Newspaper,
  Bot,
  Zap,
  PieChart,
  User,
  Settings as SettingsIcon,
  CreditCard,
  DollarSign,
  Monitor,
  X,
  Wrench,
  Code
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();
  

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Markets', href: '/markets', icon: TrendingUp },
    { name: 'News & Analysis', href: '/news', icon: Newspaper },
    { name: 'EA Marketplace', href: '/ea-marketplace', icon: Bot },
    { name: 'Custom EA Service', href: '/custom-ea', icon: Code },
    { name: 'Free Utilities', href: '/utilities', icon: Wrench },
    { name: 'HFT Bots', href: '/hft-bots', icon: Zap },
    { name: 'Portfolio', href: '/portfolio', icon: PieChart },
  ];

  const userNavigation = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
    { name: 'Desktop Features', href: '/desktop-features', icon: Monitor },
    { name: 'Subscription', href: '/subscription', icon: CreditCard },
    { name: 'Payments', href: '/payments', icon: DollarSign },
  ];

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const linkClassNames = (href) => {
    const active = isActive(href);
    return `group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative ${
      active
        ? 'bg-primary-500/15 dark:bg-primary-500/20 text-primary-700 dark:text-primary-100 font-semibold shadow-md border-l-4 border-primary-600 dark:border-primary-400'
        : 'text-gray-700 dark:text-gray-300 border-l-4 border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:border-l-primary-400 dark:hover:border-l-primary-500'
    }`;
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between h-16 px-4 bg-white dark:bg-gradient-to-r dark:from-black dark:via-brand-900 dark:to-black border-b border-gray-200 dark:border-brand-800/70 shadow-lg">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img 
            src="/logo.png" 
            alt="Smart Algos Trading Platform" 
            className="h-14 w-auto object-contain transition-transform hover:scale-105"
            style={{ 
              filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
              maxWidth: '160px',
              height: 'auto'
            }}
            onError={(e) => {
              console.error('Sidebar logo failed to load from /logo.png');
              e.target.style.display = 'none';
            }}
          />
        </div>
        
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-brand-800/60 focus:outline-none focus:ring-2 focus:ring-primary-500/60 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="mt-6 flex-1 px-3 pb-6 space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-brand-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-brand-600 scroll-smooth">
        <div className="space-y-1">
          <p className="px-1 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-brand-300">
            Navigation
          </p>
          <div className="mt-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={linkClassNames(item.href)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-1 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-brand-300">
            Account
          </p>
          <div className="mt-3 space-y-1">
            {userNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={linkClassNames(item.href)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-brand-800/70 bg-gray-50 dark:bg-brand-900/80 backdrop-blur">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center shadow-hard">
            <span className="text-sm font-semibold text-white">
              {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || 'S'}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.fullName || 'User'}
            </p>
            <p className="text-xs text-gray-600 dark:text-brand-300">
              {user?.subscription?.type || 'Free'}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gradient-to-b dark:from-black dark:via-brand-900 dark:to-brand-800/95 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {sidebarContent}
        </div>
      </div>

      <div className="hidden lg:flex lg:w-64 xl:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gradient-to-b dark:from-black dark:via-brand-900 dark:to-brand-800/90 border-r border-gray-200 dark:border-brand-800/70 shadow-xl">
          <div className="flex flex-col h-full">
            {sidebarContent}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

