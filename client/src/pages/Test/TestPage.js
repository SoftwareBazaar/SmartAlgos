import React from 'react';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Test Page</h1>
        <p className="text-gray-600 mb-6">
          This is a test page to verify routing is working correctly.
        </p>
        <div className="space-y-4">
          <a 
            href="/test/login" 
            className="block w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
          >
            🧪 Login Test Suite (Debug)
          </a>
          <a 
            href="/login" 
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
          >
            Go to Animated Login
          </a>
          <a 
            href="/auth/secure-login" 
            className="block w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
          >
            Go to Regular Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
