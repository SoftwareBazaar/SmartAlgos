import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Filter, Download, Search } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import apiClient from '../../lib/apiClient';
import { toast } from 'react-hot-toast';
import { formatDateTime, formatRelativeTime } from '../../utils/formatting';

const AuditTrail = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    severity: '',
    eventType: '',
    search: '',
    dateRange: '7d'
  });
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    loadAuditTrail();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  const loadAuditTrail = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/security/audit-trail');
      
      if (response.data?.success) {
        setEvents(response.data.data || []);
      } else {
        // Fallback to mock data if endpoint doesn't exist
        setEvents(getMockAuditEvents());
      }
    } catch (error) {
      console.error('Error loading audit trail:', error);
      // Use mock data on error
      setEvents(getMockAuditEvents());
      toast.error('Using sample data. Audit trail endpoint may not be configured.');
    } finally {
      setLoading(false);
    }
  };

  const getMockAuditEvents = () => {
    const now = new Date();
    return [
      {
        id: '1',
        timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
        event: 'successful_login',
        severity: 'LOW',
        details: {
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          location: 'New York, US'
        },
        status: 'success'
      },
      {
        id: '2',
        timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
        event: 'password_changed',
        severity: 'MEDIUM',
        details: {
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        status: 'success'
      },
      {
        id: '3',
        timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(),
        event: 'failed_login',
        severity: 'MEDIUM',
        details: {
          ip: '10.0.0.1',
          userAgent: 'Mozilla/5.0',
          reason: 'invalid_password',
          attempts: 1
        },
        status: 'failed'
      },
      {
        id: '4',
        timestamp: new Date(now.getTime() - 3 * 24 * 3600000).toISOString(),
        event: 'api_key_created',
        severity: 'LOW',
        details: {
          keyName: 'Production API Key',
          ip: '192.168.1.100'
        },
        status: 'success'
      },
      {
        id: '5',
        timestamp: new Date(now.getTime() - 5 * 24 * 3600000).toISOString(),
        event: 'email_verified',
        severity: 'LOW',
        details: {
          ip: '192.168.1.100'
        },
        status: 'success'
      },
      {
        id: '6',
        timestamp: new Date(now.getTime() - 7 * 24 * 3600000).toISOString(),
        event: 'account_created',
        severity: 'LOW',
        details: {
          ip: '192.168.1.100',
          registrationMethod: 'email'
        },
        status: 'success'
      }
    ];
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Filter by severity
    if (filters.severity) {
      filtered = filtered.filter(event => event.severity === filters.severity);
    }

    // Filter by event type
    if (filters.eventType) {
      filtered = filtered.filter(event => event.event === filters.eventType);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(event => 
        event.event.toLowerCase().includes(searchLower) ||
        event.details?.ip?.toLowerCase().includes(searchLower) ||
        JSON.stringify(event.details).toLowerCase().includes(searchLower)
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate;
      switch (filters.dateRange) {
        case '24h':
          cutoffDate = new Date(now.getTime() - 24 * 3600000);
          break;
        case '7d':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 3600000);
          break;
        case '30d':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 3600000);
          break;
        default:
          cutoffDate = null;
      }
      if (cutoffDate) {
        filtered = filtered.filter(event => new Date(event.timestamp) >= cutoffDate);
      }
    }

    setFilteredEvents(filtered);
  };

  const getEventIcon = (event, status) => {
    if (status === 'failed') {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    if (event.includes('login') || event.includes('verify')) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (event.includes('change') || event.includes('update')) {
      return <Shield className="w-5 h-5 text-blue-500" />;
    }
    return <Clock className="w-5 h-5 text-gray-500" />;
  };

  const getEventLabel = (event) => {
    const labels = {
      'successful_login': 'Successful Login',
      'failed_login': 'Failed Login Attempt',
      'password_changed': 'Password Changed',
      'api_key_created': 'API Key Created',
      'api_key_rotated': 'API Key Rotated',
      'api_key_deleted': 'API Key Deleted',
      'email_verified': 'Email Verified',
      'account_created': 'Account Created',
      'two_factor_enabled': 'Two-Factor Authentication Enabled',
      'two_factor_disabled': 'Two-Factor Authentication Disabled',
      'profile_updated': 'Profile Updated',
      'settings_changed': 'Settings Changed'
    };
    return labels[event] || event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'LOW': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'MEDIUM': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'HIGH': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'CRITICAL': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  const exportAuditTrail = () => {
    const csvContent = [
      ['Timestamp', 'Event', 'Severity', 'Status', 'IP Address', 'Details'].join(','),
      ...filteredEvents.map(event => [
        event.timestamp,
        event.event,
        event.severity,
        event.status || 'N/A',
        event.details?.ip || 'N/A',
        JSON.stringify(event.details).replace(/"/g, '""')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Audit trail exported successfully');
  };

  const uniqueEventTypes = [...new Set(events.map(e => e.event))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Trail</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              View your account security events and activity history
            </p>
          </div>
          <Button
            onClick={exportAuditTrail}
            variant="outline"
            disabled={filteredEvents.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <Card>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severity
              </label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">All Severities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Event Type
              </label>
              <select
                value={filters.eventType}
                onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">All Events</option>
                {uniqueEventTypes.map(type => (
                  <option key={type} value={type}>{getEventLabel(type)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Events List */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading audit trail...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No events found matching your filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getEventIcon(event.event, event.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {getEventLabel(event.event)}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(event.severity)}`}>
                            {event.severity}
                          </span>
                          {event.status && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              event.status === 'success' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {event.status}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDateTime(event.timestamp)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatRelativeTime(event.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 space-y-1">
                        {event.details?.ip && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">IP Address:</span> {event.details.ip}
                            {event.details.location && (
                              <span className="ml-2 text-gray-500">({event.details.location})</span>
                            )}
                          </p>
                        )}
                        {event.details?.userAgent && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            <span className="font-medium">User Agent:</span> {event.details.userAgent}
                          </p>
                        )}
                        {event.details?.reason && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Reason:</span> {event.details.reason}
                          </p>
                        )}
                        {event.details?.keyName && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Key Name:</span> {event.details.keyName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AuditTrail;

