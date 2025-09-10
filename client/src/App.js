import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

// Layout components
import Layout from './components/Layout/Layout';
import AuthLayout from './components/Layout/AuthLayout';

// Auth pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Main pages
import Dashboard from './pages/Dashboard/Dashboard';
import Markets from './pages/Markets/Markets';
import MarketDetail from './pages/Markets/MarketDetail';
import News from './pages/News/News';
import EAMarketplace from './pages/EAMarketplace/EAMarketplace';
import EADetail from './pages/EAMarketplace/EADetail';
import CreateEA from './pages/EAMarketplace/CreateEA';
import HFTBots from './pages/HFTBots/HFTBots';
import HFTBotDetail from './pages/HFTBots/HFTBotDetail';
import Portfolio from './pages/Portfolio/Portfolio';
import PortfolioDetail from './pages/Portfolio/PortfolioDetail';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import Subscription from './pages/Subscription/Subscription';
import Payments from './pages/Payments/Payments';
import DesktopFeatures from './pages/DesktopFeatures/DesktopFeatures';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Loading component
import LoadingSpinner from './components/UI/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  // Apply theme to document
  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // For development, skip loading and authentication
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (!isDevelopment && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

        {/* Main application routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="markets" element={<Markets />} />
          <Route path="markets/:id" element={<MarketDetail />} />
          <Route path="news" element={<News />} />
          <Route path="ea-marketplace" element={<EAMarketplace />} />
          <Route path="ea-marketplace/:id" element={<EADetail />} />
          <Route path="create-ea" element={<CreateEA />} />
          <Route path="hft-bots" element={<HFTBots />} />
          <Route path="hft-bots/:id" element={<HFTBotDetail />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="portfolio/:id" element={<PortfolioDetail />} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
          <Route path="payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="desktop-features" element={<DesktopFeatures />} />
          <Route path="admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
