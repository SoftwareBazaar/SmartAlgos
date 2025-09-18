/**
 * Smart Algos Trading Platform - Admin Panel Frontend
 * Modern React admin interface with comprehensive content management
 */

import React, { useState, useEffect } from 'react';
import { 
    Users, Settings, BarChart3, FileText, Bot, TrendingUp, 
    Plus, Search, Filter, Download, Upload, Eye, Edit, Trash2,
    Shield, Activity, Database, AlertCircle, CheckCircle,
    XCircle, Clock, DollarSign, Target, Zap
} from 'lucide-react';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});

    // Fetch admin data
    useEffect(() => {
        fetchAdminData();
    }, [activeTab]);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/${activeTab}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Dashboard component
    const Dashboard = () => (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Users" 
                    value={data.stats?.users?.total || 0}
                    change={`+${data.stats?.users?.newThisMonth || 0} this month`}
                    icon={<Users className="w-6 h-6" />}
                    color="blue"
                />
                <StatCard 
                    title="Active EAs" 
                    value={data.stats?.eas?.active || 0}
                    change={`${data.stats?.eas?.featured || 0} featured`}
                    icon={<Bot className="w-6 h-6" />}
                    color="green"
                />
                <StatCard 
                    title="Total Revenue" 
                    value={`$${(data.stats?.subscriptions?.revenue?.[0]?.total || 0).toLocaleString()}`}
                    change={`${data.stats?.subscriptions?.active || 0} active subscriptions`}
                    icon={<DollarSign className="w-6 h-6" />}
                    color="purple"
                />
                <StatCard 
                    title="Trading Signals" 
                    value={data.stats?.signals?.total || 0}
                    change={`${Math.round((data.stats?.signals?.accuracy?.[0]?.avgConfidence || 0) * 100)}% avg confidence`}
                    icon={<TrendingUp className="w-6 h-6" />}
                    color="orange"
                />
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {data.recentActivity?.map((activity, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Activity className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{activity.details}</p>
                                    <p className="text-xs text-gray-500">
                                        by {activity.user?.name} • {new Date(activity.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                    <div className="space-y-4">
                        <StatusItem label="Database" status="healthy" />
                        <StatusItem label="API Services" status="healthy" />
                        <StatusItem label="WebSocket" status="healthy" />
                        <StatusItem label="Payment Gateway" status="healthy" />
                        <StatusItem label="Market Data" status="warning" />
                        <StatusItem label="Backup System" status="healthy" />
                    </div>
                </div>
            </div>
        </div>
    );

    // Users Management component
    const UsersManagement = () => {
        const [users, setUsers] = useState([]);
        const [selectedUser, setSelectedUser] = useState(null);
        const [showUserModal, setShowUserModal] = useState(false);

        useEffect(() => {
            if (data.users) {
                setUsers(data.users);
            }
        }, [data]);

        const handleUpdateUser = async (userId, updates) => {
            try {
                const response = await fetch(`/api/admin/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(updates)
                });
                
                if (response.ok) {
                    fetchAdminData();
                    setShowUserModal(false);
                }
            } catch (error) {
                console.error('Error updating user:', error);
            }
        };

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>Add User</span>
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="flex space-x-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">All Roles</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                    </select>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-medium">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                            user.role === 'moderator' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowUserModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="text-red-600 hover:text-red-900">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Content Management component
    const ContentManagement = () => {
        const [content, setContent] = useState([]);
        const [showContentModal, setShowContentModal] = useState(false);
        const [selectedContent, setSelectedContent] = useState(null);

        const handleCreateContent = async (contentData) => {
            try {
                const formData = new FormData();
                Object.keys(contentData).forEach(key => {
                    formData.append(key, contentData[key]);
                });

                const response = await fetch('/api/admin/content', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                if (response.ok) {
                    fetchAdminData();
                    setShowContentModal(false);
                }
            } catch (error) {
                console.error('Error creating content:', error);
            }
        };

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
                    <button 
                        onClick={() => setShowContentModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Content</span>
                    </button>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.content?.map((item) => (
                        <div key={item._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {item.image && (
                                <img 
                                    src={`/uploads/admin/${item.image}`} 
                                    alt={item.title}
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        item.type === 'news' ? 'bg-blue-100 text-blue-800' :
                                        item.type === 'blog' ? 'bg-green-100 text-green-800' :
                                        item.type === 'guide' ? 'bg-purple-100 text-purple-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {item.type}
                                    </span>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        item.status === 'published' ? 'bg-green-100 text-green-800' :
                                        item.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {item.status}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{item.content}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                    <div className="flex space-x-2">
                                        <button className="text-blue-600 hover:text-blue-900">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="text-green-600 hover:text-green-900">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="text-red-600 hover:text-red-900">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // System Settings component
    const SystemSettings = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                defaultValue="Smart Algos Trading Platform"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                defaultValue="Advanced algorithmic trading and investment solutions"
                            />
                        </div>
                        <div className="flex items-center space-x-3">
                            <input type="checkbox" id="maintenance" className="rounded" />
                            <label htmlFor="maintenance" className="text-sm font-medium text-gray-700">
                                Maintenance Mode
                            </label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input type="checkbox" id="registration" className="rounded" defaultChecked />
                            <label htmlFor="registration" className="text-sm font-medium text-gray-700">
                                Allow New Registrations
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                defaultValue="30"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                defaultValue="5"
                            />
                        </div>
                        <div className="flex items-center space-x-3">
                            <input type="checkbox" id="2fa" className="rounded" />
                            <label htmlFor="2fa" className="text-sm font-medium text-gray-700">
                                Require Two-Factor Authentication
                            </label>
                        </div>
                        <div className="flex items-center space-x-3">
                            <input type="checkbox" id="email-verification" className="rounded" defaultChecked />
                            <label htmlFor="email-verification" className="text-sm font-medium text-gray-700">
                                Require Email Verification
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-4">
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Cancel
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Save Changes
                </button>
            </div>
        </div>
    );

    // Helper components
    const StatCard = ({ title, value, change, icon, color }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    <p className="text-sm text-gray-500 mt-1">{change}</p>
                </div>
                <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center text-${color}-600`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    const StatusItem = ({ label, status }) => (
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <div className="flex items-center space-x-2">
                {status === 'healthy' && <CheckCircle className="w-4 h-4 text-green-500" />}
                {status === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                {status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                <span className={`text-xs font-medium ${
                    status === 'healthy' ? 'text-green-600' :
                    status === 'warning' ? 'text-yellow-600' :
                    'text-red-600'
                }`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            </div>
        </div>
    );

    // Navigation tabs
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'eas', label: 'EAs', icon: Bot },
        { id: 'hft-bots', label: 'HFT Bots', icon: Zap },
        { id: 'signals', label: 'Signals', icon: TrendingUp },
        { id: 'content', label: 'Content', icon: FileText },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'activity', label: 'Activity', icon: Activity },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <Shield className="w-8 h-8 text-blue-600" />
                            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                                <Database className="w-5 h-5" />
                            </button>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                                <Download className="w-4 h-4" />
                                <span>Export Data</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'dashboard' && <Dashboard />}
                        {activeTab === 'users' && <UsersManagement />}
                        {activeTab === 'content' && <ContentManagement />}
                        {activeTab === 'settings' && <SystemSettings />}
                        {/* Add other tab components as needed */}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
