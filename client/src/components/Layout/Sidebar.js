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
  Settings,
  CreditCard,
  DollarSign,
  Monitor,
  X
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
    { name: 'HFT Bots', href: '/hft-bots', icon: Zap },
    { name: 'Portfolio', href: '/portfolio', icon: PieChart },
  ];

  const userNavigation = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Desktop Features', href: '/desktop-features', icon: Monitor },
    { name: 'Create Custom EA', href: '/create-ea', icon: Bot },
    { name: 'Subscription', href: '/subscription', icon: CreditCard },
    { name: 'Payments', href: '/payments', icon: DollarSign },
  ];

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const linkClassNames = (href) => {
    return `group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 border ${
      isActive(href)
        ? 'bg-primary-500/20 text-primary-100 border-primary-500/60 shadow-soft backdrop-blur'
        : 'text-gray-300 border-transparent hover:text-white hover:bg-brand-800/60 hover:border-primary-500/20'
    }`;
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-black via-brand-900 to-black border-b border-brand-800/70 shadow-lg">
        <h1 className="text-xl font-semibold text-primary-200 tracking-wide">
          Smart Algos
        </h1>
        <button
          onClick={onClose}
          className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-brand-800/60 focus:outline-none focus:ring-2 focus:ring-primary-500/60 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="mt-6 flex-1 px-3 pb-6 space-y-8">
        <div className="space-y-1">
          <p className="px-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
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
          <p className="px-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
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

        {user?.role === 'admin' && (
          <div>
            <p className="px-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
              Admin
            </p>
            <div className="mt-3 space-y-1">
              <NavLink
                to="/admin"
                onClick={onClose}
                className={linkClassNames('/admin')}
              >
                <Settings className="mr-3 h-5 w-5" />
                <span>Admin Dashboard</span>
              </NavLink>
              <NavLink
                to="/admin/panel"
                onClick={onClose}
                className={linkClassNames('/admin/panel')}
              >
                <Monitor className="mr-3 h-5 w-5" />
                <span>Control Panel</span>
              </NavLink>
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-brand-800/70 bg-brand-900/80 backdrop-blur">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center shadow-hard">
            <span className="text-sm font-semibold text-white">
              {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || 'S'}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">
              {user?.fullName || 'User'}
            </p>
            <p className="text-xs text-brand-300">
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

      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-black via-brand-900 to-brand-800/95 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {sidebarContent}
        </div>
      </div>

      <div className="hidden lg:flex lg:w-64 xl:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-black via-brand-900 to-brand-800/90 border-r border-brand-800/70 shadow-xl">
          <div className="flex flex-col h-full">
            {sidebarContent}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

