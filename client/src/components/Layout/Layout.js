import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import LegalFooter from '../Compliance/LegalFooter';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-brand-900 text-gray-900 dark:text-gray-100">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="relative flex-1 flex">
        <div
          className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-brand-900 dark:via-brand-800 dark:to-black"
          aria-hidden="true"
        />
        <div className="relative flex-1 flex flex-col min-h-screen">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-brand-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-brand-600 scroll-smooth p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
          <LegalFooter />
        </div>
      </div>
    </div>
  );
};

export default Layout;


