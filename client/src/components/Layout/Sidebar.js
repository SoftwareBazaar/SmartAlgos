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
    return `group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 border ${
      isActive(href)
        ? 'bg-primary-500/30 text-white dark:text-white border-primary-400/40 shadow-lg backdrop-blur-lg'
        : 'text-gray-700 dark:text-gray-200 border-transparent hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/10 hover:border-primary-400/20'
    }`;
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-primary-600 via-primary-500 to-brand-600 border-b border-white/10 shadow-2xl">
        <h1 className="text-xl font-bold text-white tracking-wide drop-shadow-lg">
          Smart Algos
        </h1>
        <button
          onClick={onClose}
          className="p-2 rounded-md text-white/80 hover:text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 lg:hidden transition-all"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="mt-6 flex-1 px-3 pb-6 space-y-8 overflow-y-auto scrollbar-thin scrollbar-thumb-primary-500 scrollbar-track-transparent hover:scrollbar-thumb-primary-400 scroll-smooth">
        <div className="space-y-1">
          <p className="px-1 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
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
          <p className="px-1 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
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

      <div className="p-4 border-t border-white/10 bg-gradient-to-r from-primary-600/20 to-brand-600/20 backdrop-blur-lg">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-2xl ring-2 ring-white/20">
            <span className="text-sm font-bold text-white drop-shadow-lg">
              {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || 'S'}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {user?.fullName || 'User'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
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

      <div className={`fixed inset-y-0 left-0 z-50 w-64 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)'
      }}>
        <div className="dark:bg-gradient-to-b dark:from-slate-900/95 dark:via-indigo-900/95 dark:to-purple-900/90 dark:backdrop-blur-xl flex flex-col h-full">
          {sidebarContent}
        </div>
      </div>

      <div className="hidden lg:flex lg:w-64 xl:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow border-r border-gray-200/50 dark:border-white/10 shadow-2xl bg-white/95 dark:bg-gradient-to-b dark:from-slate-900/95 dark:via-indigo-900/95 dark:to-purple-900/90 backdrop-blur-xl">
          <div className="flex flex-col h-full">
            {sidebarContent}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

