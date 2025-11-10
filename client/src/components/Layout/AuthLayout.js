import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#050611] text-white">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
