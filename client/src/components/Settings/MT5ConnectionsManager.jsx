import React, { useEffect, useState } from 'react';
import { Server, Plus, RefreshCw, Shield, Trash2, DownloadCloud } from 'lucide-react';
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

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api/mt5/connections');
      setConnections(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load MT5 connections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openCreateForm = () => {
    setFormData(EMPTY_FORM);
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
      await apiClient.post('/api/mt5/connections', payload);
      await fetchConnections();
      setFormVisible(false);
      setFormData(EMPTY_FORM);
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
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Server className="h-4 w-4 text-primary-500" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {connection.label || connection.server}
                    </span>
                    {connection.isDemo && (
                      <span className="text-xs font-semibold uppercase tracking-wide bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
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
                  {connection.timezone && (
                    <p className="text-xs text-gray-400">Timezone: {connection.timezone}</p>
                  )}
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
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
            ))}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      label="Server"
                      name="server"
                      value={formData.server}
                      onChange={handleInputChange}
                      placeholder="Broker server name"
                      required
                    />
                    <Input
                      label="Login"
                      name="login"
                      value={formData.login}
                      onChange={handleInputChange}
                      placeholder="MT5 login"
                      required
                    />
                    <Input
                      label="Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={formData.id ? 'Leave blank to keep existing' : 'MT5 password'}
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
