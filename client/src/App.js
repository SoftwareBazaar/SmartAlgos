import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { EAProvider } from './contexts/EAContext';
import { UtilitiesProvider } from './contexts/UtilitiesContext';
import SessionTimeoutWarning from './components/Security/SessionTimeoutWarning';

// Layout Components
import Layout from './components/Layout/Layout';
import AuthLayout from './components/Layout/AuthLayout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import AdminLogin from './pages/Auth/AdminLogin';
import AdminRegister from './pages/Auth/AdminRegister';

// Main Pages
import Dashboard from './pages/Dashboard/Dashboard';
// import SimpleDashboard from './pages/Dashboard/SimpleDashboard';
import Markets from './pages/Markets/Markets';
import MarketDetail from './pages/Markets/MarketDetail';
import News from './pages/News/News';
import Signals from './pages/Signals/Signals';
import SignalDetail from './pages/Signals/SignalDetail';
import EAMarketplace from './pages/EAMarketplace/PublicEAMarketplace';
import EADetail from './pages/EAMarketplace/PublicEADetail';
import CreateEA from './pages/EAMarketplace/CreateEA';
import EditEA from './pages/EAMarketplace/EditEA';
import UtilitiesPage from './pages/Utilities/UtilitiesPage';
import HFTBots from './pages/HFTBots/HFTBots';
import HFTBotDetail from './pages/HFTBots/HFTBotDetail';
import Portfolio from './pages/Portfolio/Portfolio';
import PortfolioDetail from './pages/Portfolio/PortfolioDetail';
import Analysis from './pages/Analysis/Analysis';
import AnalysisDetail from './pages/Analysis/AnalysisDetail';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import AuditTrail from './pages/Security/AuditTrail';
import Subscription from './pages/Subscription/Subscription';
import Payments from './pages/Payments/Payments';
import DesktopFeatures from './pages/DesktopFeatures/DesktopFeatures';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import EscrowDashboard from './pages/Escrow/EscrowDashboard';
import CustomEA from './pages/CustomEA/CustomEA';
import CustomEAManagement from './pages/Admin/CustomEAManagement';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminPanel from './pages/Admin/AdminPanel';
import AdminCMS from './pages/Admin/AdminCMS';
import AdminAccess from './pages/Admin/AdminAccess';
import SimpleAdminLogin from './pages/Admin/SimpleAdminLogin';

// Test Pages
import TestPage from './pages/Test/TestPage';
import LoginTest from './pages/Test/LoginTest';
import SimpleTest from './pages/Test/SimpleTest';

// Demo Pages
import VismeDemo from './pages/Demo/VismeDemo';

// Landing Page
import LandingPage from './pages/Landing/LandingPage';

// Booking Page
import BookConsultation from './pages/BookConsultation/BookConsultation';

// Documentation Pages
import AboutMe from './pages/Documentation/AboutMe';
import PrivacyPolicy from './pages/Documentation/PrivacyPolicy';
import RefundPolicy from './pages/Documentation/RefundPolicy';
import TermsOfService from './pages/Documentation/TermsOfService';
import SecurityPolicy from './pages/Documentation/SecurityPolicy';
import Disclaimers from './pages/Documentation/Disclaimers';
import Pricing from './pages/Pricing/Pricing';
import PaymentCallback from './pages/PaymentCallback/PaymentCallback';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <AuthProvider>
          <WebSocketProvider>
            <EAProvider>
              <UtilitiesProvider>
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                  <SessionTimeoutWarning />
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

                    {/* Direct Admin Access - Outside Layout */}
                    <Route path="/admin" element={<SimpleAdminLogin />} />
                    <Route path="/admin-login" element={<SimpleAdminLogin />} />
                    <Route path="/admin-access" element={<AdminAccess />} />

                    {/* Direct Admin Dashboard - Protected */}
                    <Route path="/admin-dashboard" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />

                    {/* Admin CMS - Protected */}
                    <Route path="/admin-cms" element={<ProtectedRoute requireAdmin={true}><AdminCMS /></ProtectedRoute>} />

                    {/* Landing Page - Public */}
                    <Route index element={<LandingPage />} />

                    {/* Booking Page - Public */}
                    <Route path="book-consultation" element={<BookConsultation />} />

                    {/* Custom EA Service - Public */}
                    <Route path="custom-ea" element={<CustomEA />} />

                    {/* EA Marketplace - Public (No Login Required) */}
                    <Route path="ea-marketplace" element={<EAMarketplace />} />
                    <Route path="ea-marketplace/:id" element={<EADetail />} />

                    {/* Documentation Pages - Public */}
                    <Route path="about" element={<AboutMe />} />
                    <Route path="privacy" element={<PrivacyPolicy />} />
                    <Route path="terms" element={<TermsOfService />} />
                    <Route path="refund" element={<RefundPolicy />} />
                    <Route path="security" element={<SecurityPolicy />} />
                    <Route path="disclaimers" element={<Disclaimers />} />
                    <Route path="pricing" element={<Pricing />} />

                    {/* Main Application Routes - Protected */}
                    <Route path="/" element={<Layout />}>
                      {/* TEMPORARY: Removed ProtectedRoute to test React Error #31 */}
                      <Route path="dashboard" element={<Dashboard />} />

                      {/* Markets */}
                      <Route path="markets" element={<ProtectedRoute><Markets /></ProtectedRoute>} />
                      <Route path="markets/:id" element={<ProtectedRoute><MarketDetail /></ProtectedRoute>} />

                      {/* News & Analysis */}
                      <Route path="news" element={<ProtectedRoute><News /></ProtectedRoute>} />
                      <Route path="analysis" element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
                      <Route path="analysis/:id" element={<ProtectedRoute><AnalysisDetail /></ProtectedRoute>} />

                      {/* Trading Signals */}
                      <Route path="signals" element={<ProtectedRoute><Signals /></ProtectedRoute>} />
                      <Route path="signals/:id" element={<ProtectedRoute><SignalDetail /></ProtectedRoute>} />

  
                      <Route path="create-ea" element={<ProtectedRoute requireAdmin={true}><ErrorBoundary><CreateEA /></ErrorBoundary></ProtectedRoute>} />
                      <Route path="edit-ea/:id" element={<ProtectedRoute requireAdmin={true}><ErrorBoundary><EditEA /></ErrorBoundary></ProtectedRoute>} />

                      {/* Free Utilities */}
                      <Route path="utilities" element={<ProtectedRoute><UtilitiesPage /></ProtectedRoute>} />

                      {/* HFT Bots */}
                      <Route path="hft-bots" element={<ProtectedRoute><HFTBots /></ProtectedRoute>} />
                      <Route path="hft-bots/:id" element={<ProtectedRoute><HFTBotDetail /></ProtectedRoute>} />

                      {/* Portfolio */}
                      <Route path="portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
                      <Route path="portfolio/:id" element={<ProtectedRoute><PortfolioDetail /></ProtectedRoute>} />

                      {/* User Management */}
                      <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                      <Route path="audit-trail" element={<ProtectedRoute><AuditTrail /></ProtectedRoute>} />
                      <Route path="subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
                      <Route path="payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
                      <Route path="payment-callback" element={<ProtectedRoute><PaymentCallback /></ProtectedRoute>} />
                      <Route path="desktop-features" element={<ProtectedRoute><ErrorBoundary><DesktopFeatures /></ErrorBoundary></ProtectedRoute>} />

                      {/* Escrow */}
                      <Route path="escrow" element={<ProtectedRoute><EscrowDashboard /></ProtectedRoute>} />

                      {/* Admin Routes */}
                      <Route path="admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
                      <Route path="admin/panel" element={<ProtectedRoute requireAdmin={true}><AdminPanel /></ProtectedRoute>} />
                      <Route path="admin/custom-ea" element={<ProtectedRoute requireAdmin={true}><CustomEAManagement /></ProtectedRoute>} />

                      {/* Test Routes - For Development */}
                      <Route path="test" element={<TestPage />} />
                      <Route path="test/login" element={<LoginTest />} />
                      <Route path="test/simple" element={<SimpleTest />} />

                      {/* Demo Routes */}
                      <Route path="demo/visme" element={<VismeDemo />} />
                    </Route>
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
              </UtilitiesProvider>
            </EAProvider>
          </WebSocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;


