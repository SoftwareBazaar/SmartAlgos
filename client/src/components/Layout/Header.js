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
    <header className="bg-gradient-to-r from-black via-brand-900 to-brand-800/90 border-b border-brand-800/60 shadow-lg backdrop-blur text-gray-100">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-brand-800/60 focus:outline-none focus:ring-2 focus:ring-primary-500/60"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Back button */}
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowLeft className="h-4 w-4" />}
              onClick={handleBack}
              className="ml-2 p-2 text-gray-300 hover:text-white hover:bg-brand-800/60"
            >
              <span className="hidden sm:inline">Back</span>
            </Button>

            {/* Search */}
            <div className="hidden md:block ml-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-brand-300" />
                </div>
                <input
                  type="text"
                  placeholder="Search markets, signals, EAs..."
                  className="block w-72 pl-10 pr-3 py-2 border border-brand-800/80 rounded-lg bg-brand-900/60 text-sm text-gray-100 placeholder-brand-400 focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:border-primary-500/60"
                />
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Connection status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-success-500' : 'bg-danger-500'}`} />
              <span className="text-xs text-brand-200">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              icon={theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              onClick={toggleTheme}
              className="p-2 text-gray-300 hover:text-white hover:bg-brand-800/60"
            />

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                icon={<Bell className="h-4 w-4" />}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 relative text-gray-300 hover:text-white hover:bg-brand-800/60"
              >
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </Button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-brand-900/95 backdrop-blur rounded-xl shadow-xl border border-brand-800/70 text-gray-200 z-50"
                  >
                    <div className="p-4 border-b border-brand-800/70">
                      <h3 className="text-sm font-medium text-gray-100">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="p-4 border-b border-brand-800/70 hover:bg-brand-800/60">
                        <p className="text-sm text-gray-200">
                          New trading signal for AAPL
                        </p>
                        <p className="text-xs text-brand-300 mt-1">
                          2 minutes ago
                        </p>
                      </div>
                      <div className="p-4 border-b border-brand-800/70 hover:bg-brand-800/60">
                        <p className="text-sm text-gray-200">
                          EA performance update
                        </p>
                        <p className="text-xs text-brand-300 mt-1">
                          15 minutes ago
                        </p>
                      </div>
                      <div className="p-4 hover:bg-brand-800/60">
                        <p className="text-sm text-gray-200">
                          Market news: Fed rate decision
                        </p>
                        <p className="text-xs text-brand-300 mt-1">
                          1 hour ago
                        </p>
                      </div>
                    </div>
                    <div className="p-4 border-t border-brand-800/70">
                      <button className="text-sm text-primary-300 hover:text-primary-200">
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
                className="flex items-center space-x-2 p-2 rounded-lg bg-brand-900/40 text-gray-200 hover:text-white hover:bg-brand-800/60 focus:outline-none focus:ring-2 focus:ring-primary-500/60"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shadow-soft">
                  <span className="text-sm font-medium text-white">
                    {userInitials}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-100">
                    {userFullName}
                  </p>
                  <p className="text-xs text-brand-300">
                    {userSubscriptionLabel}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-brand-300" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-52 bg-brand-900/95 backdrop-blur rounded-xl shadow-xl border border-brand-800/70 text-gray-200 z-50"
                  >
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/profile');
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-brand-800/60"
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
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-brand-800/60"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </button>
                      <hr className="my-2 border-brand-800/70" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-brand-800/60"
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

