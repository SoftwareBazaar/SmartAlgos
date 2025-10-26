import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
// import { useWebSocket } from '../../contexts/WebSocketContext';
import Button from '../UI/Button';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const fallbackUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    subscription: { type: 'Premium' }
  };
  const rawUser = user || fallbackUser;
  const userInitials = ([rawUser.firstName, rawUser.lastName]
    .map((value) => (value ? value.charAt(0) : ''))
    .join('')
    .toUpperCase() || rawUser.email?.slice(0, 2)?.toUpperCase() || 'SA');
  const userFullName = rawUser.fullName
    || [rawUser.firstName, rawUser.lastName].filter(Boolean).join(' ')
    || rawUser.email
    || 'Smart Algos User';
  const userSubscriptionLabel = rawUser.subscription?.type || 'Member';
  const { theme, toggleTheme } = useTheme();
  // const { connected } = useWebSocket();
  const connected = true; // Temporary fallback
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white/80 dark:bg-gradient-to-r dark:from-slate-900/95 dark:via-indigo-900/95 dark:to-purple-900/90 border-b border-gray-200/50 dark:border-white/10 shadow-xl backdrop-blur-xl">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/60 transition-all"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Back button */}
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowLeft className="h-4 w-4" />}
              onClick={handleBack}
              className="ml-2 p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10"
            >
              <span className="hidden sm:inline">Back</span>
            </Button>

            {/* Search */}
            <div className="hidden md:block ml-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search markets, signals, EAs..."
                  className="block w-72 pl-10 pr-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-white dark:bg-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:border-primary-500/60 backdrop-blur-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Connection status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success-500' : 'bg-danger-500'}`} />
              <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              icon={theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              onClick={toggleTheme}
              className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-white dark:hover:bg-brand-800/60"
            />

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                icon={<Bell className="h-4 w-4" />}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 relative text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10"
              >
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full text-xs text-white flex items-center justify-center shadow-lg">
                  3
                </span>
              </Button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 z-50"
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-white/10">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="p-4 border-b border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          New trading signal for AAPL
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          2 minutes ago
                        </p>
                      </div>
                      <div className="p-4 border-b border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          EA performance update
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          15 minutes ago
                        </p>
                      </div>
                      <div className="p-4 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          Market news: Fed rate decision
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          1 hour ago
                        </p>
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-200 dark:border-white/10">
                      <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold">
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-primary-500/60 transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/20">
                  <span className="text-sm font-bold text-white drop-shadow-lg">
                    {userInitials}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {userFullName}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                    {userSubscriptionLabel}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-52 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 z-50"
                  >
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/profile');
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors font-medium"
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/settings');
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors font-medium"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </button>
                      <hr className="my-2 border-gray-200 dark:border-white/10" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors font-medium"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

