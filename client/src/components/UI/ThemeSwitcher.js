import React, { useState } from 'react';
import { Moon, Sun, Monitor, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeSwitcher = ({ variant = 'button' }) => {
  const { theme, setTheme, isDark } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'auto', label: 'System', icon: Monitor },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[1];
  const CurrentIcon = currentTheme.icon;

  if (variant === 'button') {
    return (
      <div className="relative">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Theme selector"
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentTheme.label}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
              {themes.map((themeOption) => {
                const Icon = themeOption.icon;
                const isActive = theme === themeOption.value;
                return (
                  <button
                    key={themeOption.value}
                    onClick={() => {
                      setTheme(themeOption.value);
                      setShowDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{themeOption.label}</span>
                    {isActive && (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // Switch variant (like iOS toggle)
  return (
    <div className="flex items-center gap-3">
      <Sun className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
          isDark ? 'bg-purple-600' : 'bg-gray-300'
        }`}
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle dark mode"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isDark ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <Moon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
    </div>
  );
};

export default ThemeSwitcher;

