import React from 'react';
import { 
  PieChart, 
  Bell, 
  TrendingUp, 
  Bot, 
  Search,
  LucideIcon 
} from 'lucide-react';
import Button from './Button';

/**
 * Reusable Empty State Component
 * Provides helpful, personalized guidance when no data is available
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
  variant = 'default'
}) => {
  const baseClasses = 'flex flex-col items-center justify-center py-12 px-4 text-center';
  
  const variants = {
    default: 'bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800',
    minimal: 'bg-transparent',
    card: 'bg-gray-50 dark:bg-gray-800/50 rounded-xl p-8 border border-gray-200 dark:border-gray-700'
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}>
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

/**
 * Empty Portfolio State
 */
export const EmptyPortfolio = ({ onCreatePortfolio }) => (
  <EmptyState
    icon={PieChart}
    title="No Portfolios Yet"
    description="Start building your trading portfolio by creating your first portfolio. Track your performance, manage your positions, and analyze your trading results."
    actionLabel="Create Your First Portfolio"
    onAction={onCreatePortfolio}
    variant="card"
  />
);

/**
 * Empty Signals State
 */
export const EmptySignals = ({ onRefresh }) => (
  <EmptyState
    icon={Bell}
    title="No Trading Signals Available"
    description="We're currently analyzing the markets for the best trading opportunities. Check back soon for new signals, or adjust your filter criteria to see more results."
    actionLabel="Refresh Signals"
    onAction={onRefresh}
    variant="card"
  />
);

/**
 * Empty Markets State
 */
export const EmptyMarkets = ({ onExplore }) => (
  <EmptyState
    icon={TrendingUp}
    title="No Market Data Available"
    description="Market data is being updated. Explore our available markets or check back in a moment for the latest trading opportunities."
    actionLabel="Explore Markets"
    onAction={onExplore}
    variant="card"
  />
);

/**
 * Empty EA Marketplace State
 */
export const EmptyEAMarketplace = ({ onBrowse }) => (
  <EmptyState
    icon={Bot}
    title="No Expert Advisors Found"
    description="Browse our collection of professional trading algorithms. Find the perfect EA for your trading strategy and start automating your trades."
    actionLabel="Browse EA Marketplace"
    onAction={onBrowse}
    variant="card"
  />
);

/**
 * Empty Search Results State
 */
export const EmptySearchResults = ({ searchTerm, onClearSearch }) => (
  <EmptyState
    icon={Search}
    title={`No results for "${searchTerm}"`}
    description="We couldn't find anything matching your search. Try different keywords or clear your filters to see all available options."
    actionLabel="Clear Search"
    onAction={onClearSearch}
    variant="card"
  />
);

export default EmptyState;

