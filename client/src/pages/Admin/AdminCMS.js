import React, { useState, useEffect } from 'react';
import { 
  Users, Settings, BarChart3, FileText, Bot, TrendingUp, 
  Plus, Search, Filter, Download, Upload, Eye, Edit, Trash2,
  Shield, Activity, Database, AlertCircle, CheckCircle,
  Save, X, Image, Type, Palette, Layout, Monitor, Smartphone, Tablet,
  Globe, Mail, Phone, MapPin, Calendar, Clock, User, Lock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import apiClient from '../../lib/apiClient';
import toast from 'react-hot-toast';

const AdminCMS = () => {
  const { user, adminLogout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [contentData, setContentData] = useState({});
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Content management state
  const [editingContent, setEditingContent] = useState(null);
  const [showContentEditor, setShowContentEditor] = useState(false);
  const [contentFormData, setContentFormData] = useState({
    title: '',
    content: '',
    type: 'page',
    status: 'published',
    metaTitle: '',
    metaDescription: '',
    tags: '',
    featuredImage: null,
    previewScreenshots: [],
    eaFile: null,
    category: '',
    price: '',
    description: '',
    features: '',
    performance: ''
  });

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'Smart Algos Trading Platform',
    siteDescription: 'Advanced algorithmic trading and investment solutions',
    contactEmail: 'support@smartalgos.com',
    contactPhone: '+1 (555) 123-4567',
    maintenanceMode: false,
    allowRegistration: true,
    maxUsers: 1000,
    sessionTimeout: 30
  });

  useEffect(() => {
    fetchAdminData();
    fetchUsers();
    fetchAuditLogs();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/admin/cms/overview');
      if (response.data.success) {
        setContentData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/api/admin/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await apiClient.get('/api/admin/audit-logs');
      if (response.data.success) {
        setAuditLogs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const handleSaveContent = async () => {
    try {
      setLoading(true);
      
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add all form fields
      Object.keys(contentFormData).forEach(key => {
        if (key === 'previewScreenshots' && Array.isArray(contentFormData[key])) {
          // Handle multiple preview screenshots
          contentFormData[key].forEach((file, index) => {
            formData.append(`previewScreenshots`, file);
          });
        } else if (key === 'featuredImage' && contentFormData[key]) {
          // Handle featured image
          formData.append('featuredImage', contentFormData[key]);
        } else if (key === 'eaFile' && contentFormData[key]) {
          // Handle EA file
          formData.append('eaFile', contentFormData[key]);
        } else if (contentFormData[key] !== null && contentFormData[key] !== undefined) {
          // Handle regular fields
          formData.append(key, contentFormData[key]);
        }
      });

      const response = await apiClient.post('/api/admin/cms/content', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        toast.success('Content saved successfully');
        setShowContentEditor(false);
        fetchAdminData();
        // Reset form
        setContentFormData({
          title: '',
          content: '',
          type: 'page',
          status: 'published',
          metaTitle: '',
          metaDescription: '',
          tags: '',
          featuredImage: null,
          previewScreenshots: [],
          eaFile: null,
          category: '',
          price: '',
          description: '',
          features: '',
          performance: ''
        });
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.put('/api/admin/settings', systemSettings);
      if (response.data.success) {
        toast.success('Settings saved successfully');
        fetchAdminData();
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // File upload handlers
  const handleFileUpload = (field, files) => {
    if (field === 'previewScreenshots') {
      // Handle multiple preview screenshots
      const newFiles = Array.from(files);
      setContentFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), ...newFiles]
      }));
    } else {
      // Handle single file
      setContentFormData(prev => ({
        ...prev,
        [field]: files[0]
      }));
    }
  };

  const removeFile = (field, index = null) => {
    if (field === 'previewScreenshots' && index !== null) {
      setContentFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    } else {
      setContentFormData(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleEditContent = (content) => {
    setEditingContent(content);
    setContentFormData({
      title: content.title || '',
      content: content.content || '',
      type: content.type || 'page',
      status: content.status || 'published',
      metaTitle: content.metaTitle || '',
      metaDescription: content.metaDescription || '',
      tags: content.tags || '',
      featuredImage: null,
      previewScreenshots: [],
      eaFile: null,
      category: content.category || '',
      price: content.price || '',
      description: content.description || '',
      features: content.features || '',
      performance: content.performance || ''
    });
    setShowContentEditor(true);
  };

  const handleUserAction = async (userId, action) => {
    try {
      const response = await apiClient.post(`/api/admin/users/${userId}/${action}`);
      if (response.data.success) {
        toast.success(`User ${action} successful`);
        fetchUsers();
      }
    } catch (error) {
      console.error(`Error ${action} user:`, error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'content', name: 'Content Management', icon: FileText },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'settings', name: 'System Settings', icon: Settings },
    { id: 'audit', name: 'Audit Logs', icon: Activity }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover>
          <Card.Body className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{users.length}</p>
                <p className="text-sm text-green-600 dark:text-green-400">+12% from last month</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card hover>
          <Card.Body className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Content Pages</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{contentData.pages || 0}</p>
                <p className="text-sm text-green-600 dark:text-green-400">+3 this week</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card hover>
          <Card.Body className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{contentData.activeSessions || 0}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Real-time</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card.Body>
        </Card>

        <Card hover>
          <Card.Body className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Health</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">98%</p>
                <p className="text-sm text-green-600 dark:text-green-400">All systems operational</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Users</h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{log.action}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{log.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );

  const renderContentManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Content Management</h2>
        <Button variant="primary" onClick={() => setShowContentEditor(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      <Card>
        <Card.Body>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Modified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {contentData.content?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditContent(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      {/* Content Editor Modal */}
      {showContentEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingContent ? 'Edit Content' : 'Add New Content'}
              </h3>
              <Button variant="outline" onClick={() => setShowContentEditor(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={contentFormData.title}
                    onChange={(e) => setContentFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <select
                    value={contentFormData.type}
                    onChange={(e) => setContentFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="page">Page</option>
                    <option value="post">Blog Post</option>
                    <option value="announcement">Announcement</option>
                    <option value="guide">Guide</option>
                    <option value="ea">Expert Advisor</option>
                    <option value="hft">HFT Bot</option>
                  </select>
                </div>
              </div>

              {/* EA/HFT specific fields */}
              {(contentFormData.type === 'ea' || contentFormData.type === 'hft') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                    <input
                      type="text"
                      value={contentFormData.category}
                      onChange={(e) => setContentFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Forex, Crypto, Stocks"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price ($)</label>
                    <input
                      type="number"
                      value={contentFormData.price}
                      onChange={(e) => setContentFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</label>
                <textarea
                  rows={10}
                  value={contentFormData.content}
                  onChange={(e) => setContentFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your content here..."
                />
              </div>

              {/* File Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Featured Image</label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('featuredImage', e.target.files)}
                      className="hidden"
                      id="featured-image"
                    />
                    <label
                      htmlFor="featured-image"
                      className="cursor-pointer flex flex-col items-center justify-center text-gray-500 dark:text-gray-400"
                    >
                      <Image className="h-8 w-8 mb-2" />
                      <span className="text-sm">Click to upload featured image</span>
                    </label>
                    {contentFormData.featuredImage && (
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {contentFormData.featuredImage.name}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFile('featuredImage')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* EA File Upload */}
                {(contentFormData.type === 'ea' || contentFormData.type === 'hft') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {contentFormData.type === 'ea' ? 'EA File (.ex4)' : 'Bot File (.ex4)'}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                      <input
                        type="file"
                        accept=".ex4,.mq4"
                        onChange={(e) => handleFileUpload('eaFile', e.target.files)}
                        className="hidden"
                        id="ea-file"
                      />
                      <label
                        htmlFor="ea-file"
                        className="cursor-pointer flex flex-col items-center justify-center text-gray-500 dark:text-gray-400"
                      >
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="text-sm">Click to upload {contentFormData.type === 'ea' ? 'EA' : 'Bot'} file</span>
                      </label>
                      {contentFormData.eaFile && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {contentFormData.eaFile.name}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFile('eaFile')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Screenshots */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview Screenshots</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload('previewScreenshots', e.target.files)}
                    className="hidden"
                    id="preview-screenshots"
                  />
                  <label
                    htmlFor="preview-screenshots"
                    className="cursor-pointer flex flex-col items-center justify-center text-gray-500 dark:text-gray-400"
                  >
                    <Image className="h-8 w-8 mb-2" />
                    <span className="text-sm">Click to upload multiple preview screenshots</span>
                  </label>
                  
                  {contentFormData.previewScreenshots && contentFormData.previewScreenshots.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {contentFormData.previewScreenshots.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{file.name}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFile('previewScreenshots', index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meta Title</label>
                  <input
                    type="text"
                    value={contentFormData.metaTitle}
                    onChange={(e) => setContentFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select
                    value={contentFormData.status}
                    onChange={(e) => setContentFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={() => setShowContentEditor(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveContent} loading={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Content
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <Card>
        <Card.Body>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.role !== 'admin' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleUserAction(user.id, user.isActive ? 'deactivate' : 'activate')}
                            className={user.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                          >
                            {user.isActive ? <Lock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">System Settings</h2>
        <Button variant="primary" onClick={handleSaveSettings} loading={loading}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">General Settings</h3>
          </Card.Header>
          <Card.Body className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site Name</label>
              <input
                type="text"
                value={systemSettings.siteName}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site Description</label>
              <textarea
                rows={3}
                value={systemSettings.siteDescription}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Users</label>
              <input
                type="number"
                value={systemSettings.maxUsers}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, maxUsers: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Contact Information</h3>
          </Card.Header>
          <Card.Body className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Email</label>
              <input
                type="email"
                value={systemSettings.contactEmail}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Phone</label>
              <input
                type="tel"
                value={systemSettings.contactPhone}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                value={systemSettings.sessionTimeout}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">System Controls</h3>
          </Card.Header>
          <Card.Body className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Maintenance Mode</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Put the system in maintenance mode</p>
              </div>
              <input
                type="checkbox"
                checked={systemSettings.maintenanceMode}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Registration</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Allow new users to register</p>
              </div>
              <input
                type="checkbox"
                checked={systemSettings.allowRegistration}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, allowRegistration: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Audit Logs</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <Card.Body>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP Address</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{log.userEmail}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{log.userRole}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'content':
        return renderContentManagement();
      case 'users':
        return renderUserManagement();
      case 'settings':
        return renderSystemSettings();
      case 'audit':
        return renderAuditLogs();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                Admin CMS
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
              <Button variant="outline" size="sm" onClick={adminLogout}>
                <Lock className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminCMS;
