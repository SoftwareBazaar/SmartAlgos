import React, { useEffect, useState } from 'react';
import { Server, Plus, RefreshCw, Shield, Trash2, DownloadCloud, Eye, EyeOff, DollarSign } from 'lucide-react';
import apiClient from '../../lib/apiClient';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Input from '../UI/Input';

const EMPTY_FORM = {
  id: null,
  label: '',
  broker: '',
  server: '',
  login: '',
  password: '',
  accountType: 'demo',
  leverage: '',
  timezone: '',
  isDemo: true
};

// Pre-filled demo account form for quick setup
const DEMO_FORM = {
  id: null,
  label: 'MetaQuotes Demo Account',
  broker: 'MetaQuotes Software',
  server: 'MetaQuotes-Demo',
  login: '5040707296',
  password: 'CeD!5uIm',
  accountType: 'demo',
  leverage: '',
  timezone: '',
  isDemo: true
};

const accountTypeOptions = [
  { value: 'demo', label: 'Demo' },
  { value: 'live', label: 'Live' },
  { value: 'prop', label: 'Prop Firm' }
];

const MT5ConnectionsManager = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [manifest, setManifest] = useState(null);
  const [accountDetails, setAccountDetails] = useState({}); // connectionId -> account info
  const [loadingAccounts, setLoadingAccounts] = useState({}); // connectionId -> loading state
  const [expandedConnections, setExpandedConnections] = useState({}); // connectionId -> expanded state

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api/mt5/connections');
      const fetchedConnections = response.data?.data || [];
      console.log('[MT5 Manager] Fetched connections:', fetchedConnections.length);
      setConnections(fetchedConnections);
      
      // If connections exist but weren't showing, log them
      if (fetchedConnections.length > 0) {
        console.log('[MT5 Manager] Connections:', fetchedConnections.map(c => ({
          id: c.id,
          label: c.label,
          server: c.server,
          login: c.login
        })));
      }
    } catch (err) {
      console.error('[MT5 Manager] Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load MT5 connections');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAccountDetails = async (connection) => {
    const connectionKey = `${connection.login}@${connection.server}`;
    
    try {
      setLoadingAccounts(prev => ({ ...prev, [connection.id]: true }));
      setError(null);
      
      // First, connect to MT5
      await apiClient.post('/api/mt5/connect', {
        login: connection.login,
        password: '', // Password should be stored encrypted, fetch from connection
        server: connection.server
      });
      
      // Then get account info
      const accountResponse = await apiClient.get(`/api/mt5/account/${connectionKey}`);
      const balanceResponse = await apiClient.get(`/api/mt5/balance/${connectionKey}`);
      
      setAccountDetails(prev => ({
        ...prev,
        [connection.id]: {
          account: accountResponse.data?.data,
          balance: balanceResponse.data?.data
        }
      }));
      
      setExpandedConnections(prev => ({ ...prev, [connection.id]: true }));
    } catch (err) {
      console.error('[MT5 Manager] Account fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch account details');
      
      // If connection fails, try to get password from connection and retry
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication failed. Please check your MT5 credentials.');
      }
    } finally {
      setLoadingAccounts(prev => ({ ...prev, [connection.id]: false }));
    }
  };
  
  const toggleAccountDetails = (connectionId) => {
    setExpandedConnections(prev => ({
      ...prev,
      [connectionId]: !prev[connectionId]
    }));
    
    // If expanding and we don't have account details, fetch them
    if (!expandedConnections[connectionId] && !accountDetails[connectionId]) {
      const connection = connections.find(c => c.id === connectionId);
      if (connection) {
        fetchAccountDetails(connection);
      }
    }
  };

  // Auto-save demo connection on mount if it doesn't exist
  useEffect(() => {
    const autoSaveDemoConnection = async () => {
      try {
        const response = await apiClient.get('/api/mt5/connections');
        const existingConnections = response.data?.data || [];
        
        // Check if demo connection already exists
        const demoExists = existingConnections.some(
          conn => conn.login === '5040707296' && conn.server === 'MetaQuotes-Demo'
        );
        
        if (!demoExists) {
          // Auto-save the demo connection
          const demoConnection = {
            label: 'MetaQuotes Demo Account',
            broker: 'MetaQuotes Software',
            server: 'MetaQuotes-Demo',
            login: '5040707296',
            password: 'CeD!5uIm',
            accountType: 'demo',
            leverage: '',
            timezone: '',
            isDemo: true,
            metadata: {
              broker: 'MetaQuotes Software',
              timezone: ''
            }
          };
          
          await apiClient.post('/api/mt5/connections', demoConnection);
          console.log('[MT5] ✅ Auto-saved demo connection');
        }
      } catch (error) {
        console.warn('[MT5] Could not auto-save demo connection:', error.message);
      } finally {
        // Fetch connections after auto-save attempt
        fetchConnections();
      }
    };
    
    autoSaveDemoConnection();
  }, []);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openCreateForm = () => {
    // Pre-fill with demo account for quick setup
    setFormData(DEMO_FORM);
    setFormVisible(true);
    setManifest(null);
  };

  const openEditForm = (connection) => {
    setFormData({
      id: connection.id,
      label: connection.label || '',
      broker: connection.broker || '',
      server: connection.server || '',
      login: connection.login || '',
      password: '',
      accountType: connection.accountType || (connection.isDemo ? 'demo' : 'live'),
      leverage: connection.leverage || '',
      timezone: connection.timezone || '',
      isDemo: connection.isDemo
    });
    setFormVisible(true);
    setManifest(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        password: formData.password || undefined,
        metadata: {
          broker: formData.broker,
          timezone: formData.timezone
        }
      };
      const response = await apiClient.post('/api/mt5/connections', payload);
      console.log('[MT5 Manager] Save response:', response.data);
      
      // Refresh connections list
      await fetchConnections();
      
      setFormVisible(false);
      setFormData(EMPTY_FORM);
      
      // Show success message
      if (response.data?.success) {
        console.log('[MT5 Manager] ✅ Connection saved successfully');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save MT5 connection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this MT5 connection?')) {
      return;
    }
    try {
      await apiClient.delete(`/api/mt5/connections/${id}`);
      await fetchConnections();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete connection');
    }
  };

  const handleGenerateManifest = async (connectionId) => {
    const eaId = window.prompt('Enter the EA ID to prepare for deployment:');
    if (!eaId) {
      return;
    }

    try {
      setError(null);
      const response = await apiClient.post('/api/mt5/deploy', {
        connectionId,
        eaId
      });
      setManifest(response.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create deployment manifest');
    }
  };

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">MT5 Connections</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Securely manage brokers and terminals used for automated deployments.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="subtle" onClick={fetchConnections} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="primary" onClick={openCreateForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Connection
            </Button>
          </div>
        </div>
      </Card.Header>
      <Card.Body>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">Loading connections...</div>
        ) : connections.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            <Server className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            No MT5 connections yet. Create your first connection to enable automated deployments.
          </div>
        ) : (
          <div className="space-y-4">
            {connections.map((connection) => {
              const isExpanded = expandedConnections[connection.id];
              const accountInfo = accountDetails[connection.id];
              const isLoadingAccount = loadingAccounts[connection.id];
              
              return (
                <div
                  key={connection.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <Server className="h-4 w-4 text-primary-500" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {connection.label || connection.server}
                        </span>
                        {connection.isDemo && (
                          <span className="text-xs font-semibold uppercase tracking-wide bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded">
                            Demo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Login {connection.login} • {connection.server}
                      </p>
                      {connection.broker && (
                        <p className="text-xs text-gray-400">Broker: {connection.broker}</p>
                      )}
                      {accountInfo?.account && (
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-sm font-semibold">
                              Balance: ${accountInfo.account.balance?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                          {accountInfo.account.equity && (
                            <span className="text-xs text-gray-500">
                              Equity: ${accountInfo.account.equity.toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3 flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => toggleAccountDetails(connection.id)}
                        disabled={isLoadingAccount}
                      >
                        {isLoadingAccount ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : isExpanded ? (
                          <EyeOff className="h-4 w-4 mr-2" />
                        ) : (
                          <Eye className="h-4 w-4 mr-2" />
                        )}
                        {isLoadingAccount ? 'Loading...' : isExpanded ? 'Hide Details' : 'View Details'}
                      </Button>
                      <Button variant="outline" onClick={() => openEditForm(connection)}>
                        Edit
                      </Button>
                      <Button variant="outline" onClick={() => handleGenerateManifest(connection.id)}>
                        <DownloadCloud className="h-4 w-4 mr-2" />
                        Prepare Download
                      </Button>
                      <Button variant="ghost" onClick={() => handleDelete(connection.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Expanded Account Details */}
                  {isExpanded && accountInfo && (
                    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
                      {isLoadingAccount ? (
                        <div className="text-center py-4 text-gray-500">Loading account details...</div>
                      ) : accountInfo.account ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              Balance
                            </label>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              ${accountInfo.account.balance?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              Equity
                            </label>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              ${accountInfo.account.equity?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              Margin
                            </label>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              ${accountInfo.account.margin?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              Free Margin
                            </label>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              ${accountInfo.account.margin_free?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              Margin Level
                            </label>
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {accountInfo.account.margin_level?.toFixed(2) || '0.00'}%
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                              Profit
                            </label>
                            <p className={`text-lg font-semibold ${
                              (accountInfo.account.profit || 0) >= 0 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              ${accountInfo.account.profit?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                          {accountInfo.account.currency && (
                            <div>
                              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Currency
                              </label>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {accountInfo.account.currency}
                              </p>
                            </div>
                          )}
                          {accountInfo.account.leverage && (
                            <div>
                              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Leverage
                              </label>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                1:{accountInfo.account.leverage}
                              </p>
                            </div>
                          )}
                          {accountInfo.account.server && (
                            <div>
                              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                Server
                              </label>
                              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                {accountInfo.account.server}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          Unable to fetch account details. Please check your connection credentials.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {manifest && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/40">
            <div className="flex items-center space-x-2 text-green-800 dark:text-green-200">
              <Shield className="h-4 w-4" />
              <span className="font-semibold">Deployment manifest is ready</span>
            </div>
            <div className="mt-3 space-y-2 text-sm text-green-900 dark:text-green-100">
              <p>EA: {manifest.ea?.name} (version {manifest.ea?.version})</p>
              {manifest.ea?.downloadUrl ? (
                <p>
                  Download URL: <a href={manifest.ea.downloadUrl} className="underline" target="_blank" rel="noreferrer">{manifest.ea.downloadUrl}</a>
                </p>
              ) : (
                <p>No direct download URL available. Use the fallback path or contact support.</p>
              )}
              {manifest.ea?.localFallback && (
                <p>Local path: {manifest.ea.localFallback}</p>
              )}
              <div>
                <p className="font-medium">Deployment Steps</p>
                <ul className="list-disc list-inside">
                  {manifest.steps?.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {formVisible && (
          <div className="mt-8">
            <Card>
              <Card.Header>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  {formData.id ? 'Update MT5 Connection' : 'Create MT5 Connection'}
                </h4>
              </Card.Header>
              <Card.Body>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {/* Essential Fields - Always Visible */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Server *"
                        name="server"
                        value={formData.server}
                        onChange={handleInputChange}
                        placeholder="MetaQuotes-Demo"
                        required
                      />
                      <Input
                        label="Login *"
                        name="login"
                        value={formData.login}
                        onChange={handleInputChange}
                        placeholder="Your MT5 login number"
                        required
                      />
                      <Input
                        label="Password *"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="MT5 password"
                        required={!formData.id}
                        className="md:col-span-2"
                      />
                    </div>

                    {/* Optional Fields - Collapsible */}
                    <details className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                        Advanced Settings (Optional)
                      </summary>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Display Name"
                          name="label"
                          value={formData.label}
                          onChange={handleInputChange}
                          placeholder="Primary MT5 Terminal"
                        />
                        <Input
                          label="Broker"
                          name="broker"
                          value={formData.broker}
                          onChange={handleInputChange}
                          placeholder="Broker name"
                        />
                        <Input
                          label="Leverage"
                          name="leverage"
                          value={formData.leverage}
                          onChange={handleInputChange}
                          placeholder="e.g., 1:500"
                        />
                        <Input
                          label="Timezone"
                          name="timezone"
                          value={formData.timezone}
                          onChange={handleInputChange}
                          placeholder="e.g., GMT+3"
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Type</label>
                          <select
                            name="accountType"
                            value={formData.accountType}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 focus:border-primary-500 focus:ring-primary-500"
                          >
                            {accountTypeOptions.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                          <label className="mt-2 inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <input
                              type="checkbox"
                              name="isDemo"
                              checked={formData.isDemo}
                              onChange={handleInputChange}
                            />
                            <span>Demo account</span>
                          </label>
                        </div>
                      </div>
                    </details>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={() => setFormVisible(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={submitting}>
                      {submitting ? 'Saving...' : formData.id ? 'Update Connection' : 'Create Connection'}
                    </Button>
                  </div>
                </form>
              </Card.Body>
            </Card>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default MT5ConnectionsManager;
