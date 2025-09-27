import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { WebSocketProvider } from './contexts/WebSocketContext';

// Layout Components
import Layout from './components/Layout/Layout';
import AuthLayout from './components/Layout/AuthLayout';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import AdminLogin from './pages/Auth/AdminLogin';
import AdminRegister from './pages/Auth/AdminRegister';

// Main Pages
import Dashboard from './pages/Dashboard/Dashboard';
import SimpleDashboard from './pages/Dashboard/SimpleDashboard';
import Markets from './pages/Markets/Markets';
import MarketDetail from './pages/Markets/MarketDetail';
import News from './pages/News/News';
import Signals from './pages/Signals/Signals';
import SignalDetail from './pages/Signals/SignalDetail';
import EAMarketplace from './pages/EAMarketplace/EAMarketplace';
import EADetail from './pages/EAMarketplace/EADetail';
import CreateEA from './pages/EAMarketplace/CreateEA';
import HFTBots from './pages/HFTBots/HFTBots';
import HFTBotDetail from './pages/HFTBots/HFTBotDetail';
import Portfolio from './pages/Portfolio/Portfolio';
import PortfolioDetail from './pages/Portfolio/PortfolioDetail';
import Analysis from './pages/Analysis/Analysis';
import AnalysisDetail from './pages/Analysis/AnalysisDetail';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import Subscription from './pages/Subscription/Subscription';
import Payments from './pages/Payments/Payments';
import DesktopFeatures from './pages/DesktopFeatures/DesktopFeatures';
import EscrowDashboard from './pages/Escrow/EscrowDashboard';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminPanel from './pages/Admin/AdminPanel';

// Test Pages
import TestPage from './pages/Test/TestPage';
import LoginTest from './pages/Test/LoginTest';
import SimpleTest from './pages/Test/SimpleTest';

// Demo Pages
import VismeDemo from './pages/Demo/VismeDemo';

// Landing Page
import LandingPage from './pages/Landing/LandingPage';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <WebSocketProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Routes>
                {/* Auth Routes */}
                <Route path="/auth" element={<AuthLayout />}>
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password" element={<ResetPassword />} />
                  <Route path="admin/login" element={<AdminLogin />} />
                  <Route path="admin/register" element={<AdminRegister />} />
                </Route>

                {/* Main Application Routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<SimpleDashboard />} />
                  
                  {/* Markets */}
                  <Route path="markets" element={<Markets />} />
                  <Route path="markets/:id" element={<MarketDetail />} />
                  
                  {/* News & Analysis */}
                  <Route path="news" element={<News />} />
                  <Route path="analysis" element={<Analysis />} />
                  <Route path="analysis/:id" element={<AnalysisDetail />} />
                  
                  {/* Trading Signals */}
                  <Route path="signals" element={<Signals />} />
                  <Route path="signals/:id" element={<SignalDetail />} />
                  
                  {/* EA Marketplace */}
                  <Route path="ea-marketplace" element={<EAMarketplace />} />
                  <Route path="ea-marketplace/:id" element={<EADetail />} />
                  <Route path="create-ea" element={<CreateEA />} />
                  
                  {/* HFT Bots */}
                  <Route path="hft-bots" element={<HFTBots />} />
                  <Route path="hft-bots/:id" element={<HFTBotDetail />} />
                  
                  {/* Portfolio */}
                  <Route path="portfolio" element={<Portfolio />} />
                  <Route path="portfolio/:id" element={<PortfolioDetail />} />
                  
                  {/* User Management */}
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="subscription" element={<Subscription />} />
                  <Route path="payments" element={<Payments />} />
                  <Route path="desktop-features" element={<DesktopFeatures />} />
                  
                  {/* Escrow */}
                  <Route path="escrow" element={<EscrowDashboard />} />
                  
                  {/* Admin Routes */}
                  <Route path="admin" element={<AdminDashboard />} />
                  <Route path="admin/panel" element={<AdminPanel />} />
                  
                  {/* Test Routes */}
                  <Route path="test" element={<TestPage />} />
                  <Route path="test/login" element={<LoginTest />} />
                  <Route path="test/simple" element={<SimpleTest />} />
                  
                  {/* Demo Routes */}
                  <Route path="demo/visme" element={<VismeDemo />} />
                </Route>

                {/* Landing page - accessible via /landing */}
                <Route path="/landing" element={<LandingPage />} />
              </Routes>
              
              {/* Toast notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#4ade80',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </WebSocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;