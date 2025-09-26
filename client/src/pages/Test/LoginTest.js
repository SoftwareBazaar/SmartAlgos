import React, { useState } from 'react';
import axios from 'axios';

const LoginTest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [testCredentials, setTestCredentials] = useState({
    email: 'test@algosmart.com',
    password: 'Test123!'
  });

  const runTest = async (testName, testFn) => {
    setLoading(true);
    try {
      const result = await testFn();
      setResults(prev => ({
        ...prev,
        [testName]: { success: true, data: result }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [testName]: { 
          success: false, 
          error: error.response?.data || error.message 
        }
      }));
    }
    setLoading(false);
  };

  const testBackendHealth = async () => {
    const response = await axios.get('http://localhost:5000/api/health');
    return response.data;
  };

  const testDatabaseConnection = async () => {
    const response = await axios.get('http://localhost:5000/api/test/db-test');
    return response.data;
  };

  const createTestUser = async () => {
    const response = await axios.post('http://localhost:5000/api/test/create-test-user');
    return response.data;
  };

  const testLogin = async () => {
    const response = await axios.post('http://localhost:5000/api/test/test-login', testCredentials);
    return response.data;
  };

  const testActualLogin = async () => {
    const response = await axios.post('http://localhost:5000/api/auth/login', testCredentials);
    return response.data;
  };

  const TestResult = ({ testName, result }) => {
    if (!result) return null;

    return (
      <div className={`p-4 rounded-lg mb-4 ${result.success ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'} border`}>
        <h3 className={`font-bold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
          {testName}: {result.success ? '✅ PASS' : '❌ FAIL'}
        </h3>
        <pre className="mt-2 text-sm overflow-auto">
          {JSON.stringify(result.success ? result.data : result.error, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🧪 Login System Test Suite</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Credentials</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={testCredentials.email}
                onChange={(e) => setTestCredentials(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={testCredentials.password}
                onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={() => runTest('Backend Health', testBackendHealth)}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
            >
              Test Backend
            </button>
            <button
              onClick={() => runTest('Database Connection', testDatabaseConnection)}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
            >
              Test Database
            </button>
            <button
              onClick={() => runTest('Create Test User', createTestUser)}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
            >
              Create Test User
            </button>
            <button
              onClick={() => runTest('Test Login Logic', testLogin)}
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
            >
              Test Login Logic
            </button>
            <button
              onClick={() => runTest('Actual Login API', testActualLogin)}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
            >
              Test Actual Login
            </button>
            <button
              onClick={() => setResults({})}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Clear Results
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Running test...</p>
            </div>
          )}
          
          {Object.keys(results).length === 0 && !loading && (
            <p className="text-gray-500 text-center py-8">No tests run yet. Click a test button above to start.</p>
          )}

          {Object.entries(results).map(([testName, result]) => (
            <TestResult key={testName} testName={testName} result={result} />
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">🔍 Debugging Steps</h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-1">
            <li>First, test if the backend is running (Test Backend)</li>
            <li>Check if database connection works (Test Database)</li>
            <li>Create a test user with known credentials (Create Test User)</li>
            <li>Test the login logic step by step (Test Login Logic)</li>
            <li>Finally, test the actual login API (Actual Login API)</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default LoginTest;
