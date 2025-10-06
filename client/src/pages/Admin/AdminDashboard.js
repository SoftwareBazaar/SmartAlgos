import React, { useState, useEffect } from "react";

import { motion } from "framer-motion";

import {
  Users,
  Bot,
  Zap,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  Download,
  FileText,
  Save,
  X,
  Image,
  Type,
  Palette,
  Layout,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";

import Card from "../../components/UI/Card";

import Button from "../../components/UI/Button";

import Input from "../../components/UI/Input";

import { useAuth } from "../../contexts/AuthContext";

import { useEA } from "../../contexts/EAContext";

import { useUtilities } from "../../contexts/UtilitiesContext";

import apiClient from "../../lib/apiClient";

const AdminDashboard = () => {
  const { user } = useAuth();

  const { eas, addEA, updateEA, deleteEA } = useEA();

  const { utilities, addUtility, updateUtility, deleteUtility } =
    useUtilities();

  const [activeTab, setActiveTab] = useState("overview");

  const [editingContent, setEditingContent] = useState(null);

  const [selectedPage, setSelectedPage] = useState("login");

  const [previewMode, setPreviewMode] = useState("desktop");

  const [uploadedImages, setUploadedImages] = useState([]);

  // EA Management State

  const [showEAEditor, setShowEAEditor] = useState(false);

  const [editingEA, setEditingEA] = useState(null);

  const [eaImages, setEaImages] = useState([]);

  const [eaFormData, setEaFormData] = useState({
    name: "",

    description: "",

    version: "",

    status: "pending",

    price: "",

    category: "",

    tags: "",

    image: null,

    rentalPeriods: ["monthly", "quarterly", "yearly"],

    currentPeriod: "monthly",
  });

  // Utilities Management State

  const [showUtilityEditor, setShowUtilityEditor] = useState(false);

  const [editingUtility, setEditingUtility] = useState(null);

  const [utilityFormData, setUtilityFormData] = useState({
    name: "",

    description: "",

    category: "",

    features: [],

    imageTimestamp: null,

    downloadUrl: "",

    version: "",

    size: "",

    image: null,

    previews: [],

    guide: {
      title: "",

      steps: [],
    },
  });

  const [contentData, setContentData] = useState({
    homepage: {
      title: "Welcome to Smart Algos Trading Platform",

      subtitle: "Trade smarter with advanced algorithms",

      description:
        "Our platform provides institutional-grade trading tools and automated strategies to help you maximize your trading potential.",

      features: [
        "Real-time market analysis",

        "Automated trading strategies",

        "Risk management tools",

        "Portfolio optimization",
      ],
    },

    about: {
      title: "About Smart Algos",

      description:
        "We are a leading provider of algorithmic trading solutions, helping traders and institutions achieve superior returns through advanced technology and data-driven strategies.",
    },

    contact: {
      title: "Contact Us",

      email: "support@smartalgos.com",

      phone: "+1 (555) 123-4567",

      address: "123 Trading Street, Financial District, NY 10001",
    },
  });

  const [pageData, setPageData] = useState({
    login: {
      title: "Smart Algos",

      subtitle: "Trading and Investment Solutions",

      welcomeText: "WELCOME BACK",

      mainHeading: "Trade smarter with Algosmart",

      description:
        "Manage your automated strategies and stay on top of signals from one clean workspace.",

      backgroundImage: null,

      gradientColors: {
        from: "indigo-600",

        via: "purple-600",

        to: "slate-900",
      },

      formTitle: "Sign in",

      formSubtitle: "Enter your credentials to continue.",

      buttonText: "Sign in",

      footerText: "Need an account?",

      footerLink: "Create your free account",
    },

    dashboard: {
      title: "Dashboard",

      subtitle: "Your Trading Command Center",

      stats: [
        { label: "Portfolio Value", value: "$45,230", change: "+8.2%" },

        { label: "Active Signals", value: "24", change: "+3" },

        { label: "Open Positions", value: "8", change: "+1" },
      ],
    },
  });

  const stats = [
    {
      name: "Total Users",

      value: "1,247",

      change: "+12%",

      changeType: "positive",

      icon: Users,
    },

    {
      name: "Active EAs",

      value: "24",

      change: "+3",

      changeType: "positive",

      icon: Bot,
    },

    {
      name: "HFT Bots",

      value: "8",

      change: "+1",

      changeType: "positive",

      icon: Zap,
    },

    {
      name: "Monthly Revenue",

      value: "$45,230",

      change: "+8.2%",

      changeType: "positive",

      icon: BarChart3,
    },
  ];

  // Fetch recent users from API
  const [recentUsers, setRecentUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchRecentUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await apiClient.get('/api/admin/users/recent?limit=5');
        if (response.data.success) {
          const users = response.data.data.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            joined: new Date(u.createdAt).toLocaleString()
          }));
          setRecentUsers(users);
        }
      } catch (error) {
        console.error('Failed to fetch recent users:', error);
        setRecentUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchRecentUsers();
  }, []);

  const tabs = [
    { id: "overview", name: "Overview", icon: BarChart3 },

    { id: "users", name: "Users", icon: Users },

    { id: "eas", name: "EAs", icon: Bot },

    { id: "utilities", name: "Utilities", icon: Settings },

    { id: "hft", name: "HFT Bots", icon: Zap },

    { id: "content", name: "Content", icon: FileText },

    { id: "page-editor", name: "Page Editor", icon: Layout },

    { id: "settings", name: "Settings", icon: Settings },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card hover>
                <Card.Body className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.name}
                      </p>

                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {stat.value}
                      </p>

                      <p
                        className={`text-sm ${
                          stat.changeType === "positive"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {stat.change}
                      </p>
                    </div>

                    <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                      <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Users
            </h3>
          </Card.Header>

          <Card.Body>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {user.name}
                    </p>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {user.role}
                    </span>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {user.joined}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent EAs
            </h3>
          </Card.Header>

          <Card.Body>
            <div className="space-y-4">
              {eas.map((ea) => (
                <div key={ea.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {ea.name}
                    </p>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {ea.subscribers} subscribers
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ea.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {ea.status}
                    </span>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {ea.revenue}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          User Management
        </h2>

        <Button variant="primary">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <Card.Body>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {recentUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.name}
                        </div>

                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.joined}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
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
    </div>
  );

  const renderEAs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          EA Management
        </h2>

        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import EA
          </Button>

          <Button variant="primary" onClick={handleAddEA}>
            <Plus className="h-4 w-4 mr-2" />
            Add EA
          </Button>
        </div>
      </div>

      <Card>
        <Card.Body>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    EA Image
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    EA Name
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Subscribers
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Revenue
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {eas.map((ea) => (
                  <tr key={ea.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {ea.files?.image ? (
                          <img
                            src={`/api/eas/uploads/ea-images/${ea.files.image.filename}`}
                            alt={ea.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : ea.image ? (
                          <img
                            src={ea.image}
                            alt={ea.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <Bot className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {ea.name}
                        </div>

                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          v{ea.version} • {ea.category}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ea.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {ea.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {ea.subscribers}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {ea.revenue}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditEA(ea)}
                          title="Edit EA"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button size="sm" variant="outline" title="Download">
                          <Download className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteEA(ea.id)}
                          title="Delete EA"
                          className="text-red-600 hover:text-red-700"
                        >
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

      {/* EA Editor Modal */}

      {showEAEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingEA ? "Edit EA" : "Add New EA"}
              </h3>

              <Button variant="outline" onClick={handleCancelEA}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* EA Image Upload */}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  EA Image
                </label>

                <div className="flex items-center space-x-4">
                  {eaFormData.image ? (
                    eaFormData.image instanceof File ? (
                      <img
                        src={URL.createObjectURL(eaFormData.image)}
                        alt="EA Preview"
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    ) : (
                      <img
                        src={eaFormData.image}
                        alt="EA Preview"
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    )
                  ) : (
                    <div className="h-20 w-20 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Bot className="h-8 w-8 text-gray-400" />
                    </div>
                  )}

                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEAImageUpload}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary-50 file:text-primary-700
                        hover:file:bg-primary-100
                        dark:file:bg-primary-900 dark:file:text-primary-300"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              {/* EA File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  EA File
                </label>
                
                <div className="flex items-center space-x-4">
                  {eaFormData.eaFile ? (
                    <div className="flex items-center space-x-2">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {eaFormData.eaFile.name}
                      </span>
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-gray-400" />
                    </div>
                  )}

                  <div>
                    <input
                      type="file"
                      accept=".ex4,.mq4,.mq5,.ex5"
                      onChange={handleEAFileUpload}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary-50 file:text-primary-700
                        hover:file:bg-primary-100
                        dark:file:bg-primary-900 dark:file:text-primary-300"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      .ex4, .mq4, .mq5, .ex5 files up to 50MB
                    </p>
                  </div>
                </div>
              </div>

              {/* EA Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    EA Name
                  </label>
                  <Input
                    value={eaFormData.name}
                    onChange={(e) => setEaFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter EA name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Version
                  </label>
                  <Input
                    value={eaFormData.version}
                    onChange={(e) => setEaFormData(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="e.g., 1.0.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={eaFormData.category}
                    onChange={(e) => setEaFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="">Select category</option>
                    <option value="scalping">Scalping</option>
                    <option value="trend">Trend Following</option>
                    <option value="news">News Trading</option>
                    <option value="grid">Grid Trading</option>
                    <option value="arbitrage">Arbitrage</option>
                    <option value="martingale">Martingale</option>
                    <option value="hedging">Hedging</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price
                  </label>
                  <Input
                    type="number"
                    value={eaFormData.price}
                    onChange={(e) => setEaFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={eaFormData.description}
                  onChange={(e) => setEaFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the EA's strategy and features..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <Input
                  value={eaFormData.tags}
                  onChange={(e) => setEaFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="gold,scalping,mt4 (comma separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={eaFormData.status}
                  onChange={(e) => setEaFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={handleCancelEA}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveEA}>
                  {editingEA ? "Update EA" : "Create EA"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderUtilities = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Utilities Management
        </h2>

        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Utility
          </Button>

          <Button variant="primary" onClick={handleAddUtility}>
            <Plus className="h-4 w-4 mr-2" />
            Add Utility
          </Button>
        </div>
      </div>

      <Card>
        <Card.Body>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Utility Image
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Utility Name
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Version
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Downloads
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {utilities.map((utility) => (
                  <tr key={utility.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {utility.image ? (
                          <img
                            src={utility.image}
                            alt={utility.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <Settings className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {utility.name}
                        </div>

                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {utility.description.substring(0, 50)}...
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {utility.category}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      v{utility.version}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {utility.downloads.toLocaleString()}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUtility(utility)}
                          title="Edit Utility"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button size="sm" variant="outline" title="Download">
                          <Download className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUtility(utility.id)}
                          title="Delete Utility"
                          className="text-red-600 hover:text-red-700"
                        >
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

      {/* Utility Editor Modal */}

      {showUtilityEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingUtility ? "Edit Utility" : "Add New Utility"}
              </h3>

              <Button variant="outline" onClick={handleCancelUtility}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Utility Image Upload */}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Utility Image
                </label>

                <div className="flex items-center space-x-4">
                  {utilityFormData.image ? (
                    <img
                      src={utilityFormData.image}
                      alt="Utility Preview"
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Settings className="h-8 w-8 text-gray-400" />
                    </div>
                  )}

                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUtilityImageUpload}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400































                        file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0































                        file:text-sm file:font-semibold































                        file:bg-primary-50 file:text-primary-700































                        hover:file:bg-primary-100































                        dark:file:bg-primary-900 dark:file:text-primary-300"
                    />

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Upload an image for your utility
                    </p>
                  </div>
                </div>
              </div>

              {/* Basic Information */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Utility Name *
                  </label>

                  <input
                    type="text"
                    value={utilityFormData.name}
                    onChange={(e) =>
                      setUtilityFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter utility name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>

                  <select
                    value={utilityFormData.category}
                    onChange={(e) =>
                      setUtilityFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Category</option>

                    <option value="Risk Management">Risk Management</option>

                    <option value="Market Analysis">Market Analysis</option>

                    <option value="Trading Tools">Trading Tools</option>

                    <option value="EA Tools">EA Tools</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>

                <textarea
                  rows={3}
                  value={utilityFormData.description}
                  onChange={(e) =>
                    setUtilityFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Describe your utility's features and purpose"
                />
              </div>

              {/* Version and Size */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Version *
                  </label>

                  <input
                    type="text"
                    value={utilityFormData.version}
                    onChange={(e) =>
                      setUtilityFormData((prev) => ({
                        ...prev,
                        version: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 1.0, 2.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Size *
                  </label>

                  <input
                    type="text"
                    value={utilityFormData.size}
                    onChange={(e) =>
                      setUtilityFormData((prev) => ({
                        ...prev,
                        size: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 2.3 MB"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Download URL *
                  </label>

                  <input
                    type="text"
                    value={utilityFormData.downloadUrl}
                    onChange={(e) =>
                      setUtilityFormData((prev) => ({
                        ...prev,
                        downloadUrl: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="/downloads/utility.exe"
                  />
                </div>
              </div>

              {/* Features */}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Features (one per line)
                </label>

                <textarea
                  rows={4}
                  value={utilityFormData.features.join("\n")}
                  onChange={(e) =>
                    setUtilityFormData((prev) => ({
                      ...prev,

                      features: e.target.value
                        .split("\n")
                        .filter((f) => f.trim()),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter features, one per line"
                />
              </div>

              {/* Guide */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Guide Title
                  </label>

                  <input
                    type="text"
                    value={utilityFormData.guide.title}
                    onChange={(e) =>
                      setUtilityFormData((prev) => ({
                        ...prev,

                        guide: { ...prev.guide, title: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Guide title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Guide Steps (one per line)
                  </label>

                  <textarea
                    rows={4}
                    value={utilityFormData.guide.steps.join("\n")}
                    onChange={(e) =>
                      setUtilityFormData((prev) => ({
                        ...prev,

                        guide: {
                          ...prev.guide,

                          steps: e.target.value
                            .split("\n")
                            .filter((s) => s.trim()),
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter guide steps, one per line"
                  />
                </div>
              </div>

              {/* Action Buttons */}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="outline" onClick={handleCancelUtility}>
                  Cancel
                </Button>

                <Button variant="primary" onClick={handleSaveUtility}>
                  <Save className="h-4 w-4 mr-2" />

                  {editingUtility ? "Update Utility" : "Create Utility"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const handleEdit = (section) => {
    setEditingContent(section);
  };

  const handleSave = (section, data) => {
    setContentData((prev) => ({
      ...prev,

      [section]: { ...prev[section], ...data },
    }));

    setEditingContent(null);
  };

  const handleCancel = () => {
    setEditingContent(null);
  };

  // EA Management Functions

  const handleAddEA = () => {
    setEditingEA(null);

    setEaFormData({
      name: "",

      description: "",

      version: "",

      status: "pending",

      price: "",

      category: "",

      tags: "",

      image: null,

      rentalPeriods: ["monthly", "quarterly", "yearly"],

      currentPeriod: "monthly",
    });

    setShowEAEditor(true);
  };

  const handleEditEA = (ea) => {
    setEditingEA(ea);

    setEaFormData({
      name: ea.name,

      description: ea.description,

      version: ea.version,

      status: ea.status,

      price: ea.price,

      category: ea.category,

      tags: ea.tags,

      image: ea.image,

      rentalPeriods: ea.rentalPeriods || ["monthly", "quarterly", "yearly"],

      currentPeriod: ea.currentPeriod || "monthly",
    });

    setShowEAEditor(true);
  };

  const handleSaveEA = async () => {
    try {
      if (editingEA) {
        // Update existing EA
        await updateEA(editingEA.id, eaFormData);
      } else {
        // Add new EA
        await addEA(eaFormData);
      }

      setShowEAEditor(false);
      setEditingEA(null);
      
      // Reset form
      setEaFormData({
        name: "",
        description: "",
        version: "",
        status: "pending",
        price: "",
        category: "",
        tags: "",
        image: null,
        eaFile: null,
        rentalPeriods: ["monthly", "quarterly", "yearly"],
        currentPeriod: "monthly",
      });
    } catch (error) {
      console.error('Error saving EA:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  const handleDeleteEA = (eaId) => {
    deleteEA(eaId);
  };

  const handleEAImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      setEaFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const handleEAFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      setEaFormData((prev) => ({
        ...prev,
        eaFile: file,
      }));
    }
  };

  const handleCancelEA = () => {
    setShowEAEditor(false);

    setEditingEA(null);

    setEaFormData({
      name: "",

      description: "",

      version: "",

      status: "pending",

      price: "",

      category: "",

      tags: "",

      image: null,

      rentalPeriods: ["monthly", "quarterly", "yearly"],

      currentPeriod: "monthly",
    });
  };

  // Utilities Management Functions

  const handleAddUtility = () => {
    setEditingUtility(null);

    setUtilityFormData({
      name: "",

      description: "",

      category: "",

      features: [],

      downloadUrl: "",

      version: "",

      size: "",

      image: null,

      previews: [],

      guide: {
        title: "",

        steps: [],
      },
    });

    setShowUtilityEditor(true);
  };

  const handleEditUtility = (utility) => {
    setEditingUtility(utility);

    setUtilityFormData({
      name: utility.name,

      description: utility.description,

      category: utility.category,

      features: utility.features || [],

      imageTimestamp: utility.imageTimestamp || Date.now(),

      downloadUrl: utility.downloadUrl,

      version: utility.version,

      size: utility.size,

      image: utility.image,

      previews: utility.previews || [],

      guide: utility.guide || { title: "", steps: [] },
    });

    setShowUtilityEditor(true);
  };

  const handleSaveUtility = async () => {
    try {
      console.log("Saving utility with form data:", utilityFormData);

      if (editingUtility) {
        await updateUtility(editingUtility.id, utilityFormData);
        console.log("✅ Updated utility ID:", editingUtility.id);
        alert("✅ Utility updated successfully! Changes will sync across devices shortly.");
      } else {
        await addUtility(utilityFormData);
        alert("✅ Utility created successfully!");
      }

      handleCancelUtility();

      setTimeout(() => {
        console.log("Utility update complete");
      }, 100);
    } catch (error) {
      console.error("❌ Failed to save utility:", error);
      alert(`❌ Error: ${error.message || 'Failed to save utility'}\n\nMake sure:\n- You're logged in as admin\n- Server is running\n- Check browser console for details`);
    }
  };

  const handleDeleteUtility = (utilityId) => {
    deleteUtility(utilityId);
  };

  const handleUtilityImageUpload = async (event) => {
    const file = event.target.files[0];

    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }

      // Create preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setUtilityFormData((prev) => ({
          ...prev,
          image: e.target.result, // Keep preview for immediate display
          imageTimestamp: Date.now(),
        }));
      };
      reader.readAsDataURL(file);

      // Upload the file to server
      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await apiClient.post('/api/utilities/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data.success) {
          // Update with server URL for actual storage
          setUtilityFormData((prev) => ({
            ...prev,
            image: response.data.data.imageUrl, // Use server URL for database storage
            imageTimestamp: Date.now(),
          }));
          
          console.log('✅ Image uploaded successfully:', response.data.data.imageUrl);
        } else {
          console.error('Upload failed:', response.data.message);
          alert('Failed to upload image: ' + response.data.message);
        }
      } catch (error) {
        console.error('Upload error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
        alert('Failed to upload image: ' + errorMessage);
      }
    }
  };

  const handleCancelUtility = () => {
    setShowUtilityEditor(false);

    setEditingUtility(null);

    setUtilityFormData({
      name: "",

      description: "",

      category: "",

      features: [],

      imageTimestamp: null,

      downloadUrl: "",

      version: "",

      size: "",

      image: null,

      previews: [],

      guide: {
        title: "",

        steps: [],
      },
    });
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.onload = (e) => {
          const newImage = {
            id: Date.now() + Math.random(),

            name: file.name,

            url: e.target.result,

            size: file.size,

            type: file.type,
          };

          setUploadedImages((prev) => [...prev, newImage]);
        };

        reader.readAsDataURL(file);
      }
    });
  };

  const handlePageDataUpdate = (page, field, value) => {
    setPageData((prev) => ({
      ...prev,

      [page]: {
        ...prev[page],

        [field]: value,
      },
    }));
  };

  const handleGradientColorUpdate = (page, colorType, value) => {
    setPageData((prev) => ({
      ...prev,

      [page]: {
        ...prev[page],

        gradientColors: {
          ...prev[page].gradientColors,

          [colorType]: value,
        },
      },
    }));
  };

  const renderContentManagement = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Content Management
          </h2>

          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add New Content
          </Button>
        </div>

        {/* Homepage Content */}

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Homepage Content
              </h3>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit("homepage")}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </Card.Header>

          <Card.Body>
            {editingContent === "homepage" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>

                  <input
                    type="text"
                    defaultValue={contentData.homepage.title}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                    onChange={(e) =>
                      setContentData((prev) => ({
                        ...prev,

                        homepage: { ...prev.homepage, title: e.target.value },
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subtitle
                  </label>

                  <input
                    type="text"
                    defaultValue={contentData.homepage.subtitle}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                    onChange={(e) =>
                      setContentData((prev) => ({
                        ...prev,

                        homepage: {
                          ...prev.homepage,
                          subtitle: e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>

                  <textarea
                    rows={4}
                    defaultValue={contentData.homepage.description}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                    onChange={(e) =>
                      setContentData((prev) => ({
                        ...prev,

                        homepage: {
                          ...prev.homepage,
                          description: e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleSave("homepage", contentData.homepage)}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>

                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {contentData.homepage.title}
                  </h4>

                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {contentData.homepage.subtitle}
                  </p>

                  <p className="text-gray-700 dark:text-gray-300 mt-2">
                    {contentData.homepage.description}
                  </p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Features:
                  </h5>

                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                    {contentData.homepage.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* About Content */}

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                About Page Content
              </h3>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit("about")}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </Card.Header>

          <Card.Body>
            {editingContent === "about" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>

                  <input
                    type="text"
                    defaultValue={contentData.about.title}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                    onChange={(e) =>
                      setContentData((prev) => ({
                        ...prev,

                        about: { ...prev.about, title: e.target.value },
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>

                  <textarea
                    rows={4}
                    defaultValue={contentData.about.description}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                    onChange={(e) =>
                      setContentData((prev) => ({
                        ...prev,

                        about: { ...prev.about, description: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleSave("about", contentData.about)}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>

                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {contentData.about.title}
                </h4>

                <p className="text-gray-700 dark:text-gray-300">
                  {contentData.about.description}
                </p>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Contact Content */}

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Contact Information
              </h3>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit("contact")}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </Card.Header>

          <Card.Body>
            {editingContent === "contact" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>

                  <input
                    type="text"
                    defaultValue={contentData.contact.title}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                    onChange={(e) =>
                      setContentData((prev) => ({
                        ...prev,

                        contact: { ...prev.contact, title: e.target.value },
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    defaultValue={contentData.contact.email}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                    onChange={(e) =>
                      setContentData((prev) => ({
                        ...prev,

                        contact: { ...prev.contact, email: e.target.value },
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>

                  <input
                    type="text"
                    defaultValue={contentData.contact.phone}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                    onChange={(e) =>
                      setContentData((prev) => ({
                        ...prev,

                        contact: { ...prev.contact, phone: e.target.value },
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>

                  <textarea
                    rows={2}
                    defaultValue={contentData.contact.address}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                    onChange={(e) =>
                      setContentData((prev) => ({
                        ...prev,

                        contact: { ...prev.contact, address: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleSave("contact", contentData.contact)}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>

                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {contentData.contact.title}
                </h4>

                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                  <p>
                    <strong>Email:</strong> {contentData.contact.email}
                  </p>

                  <p>
                    <strong>Phone:</strong> {contentData.contact.phone}
                  </p>

                  <p>
                    <strong>Address:</strong> {contentData.contact.address}
                  </p>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    );
  };

  const renderPageEditor = () => {
    const pages = [
      { id: "login", name: "Login Page", icon: Layout },

      { id: "dashboard", name: "Dashboard", icon: BarChart3 },

      { id: "about", name: "About Page", icon: FileText },

      { id: "contact", name: "Contact Page", icon: Users },
    ];

    const previewModes = [
      { id: "desktop", name: "Desktop", icon: Monitor },

      { id: "tablet", name: "Tablet", icon: Tablet },

      { id: "mobile", name: "Mobile", icon: Smartphone },
    ];

    return (
      <div className="space-y-6">
        {/* Header */}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Page Editor
            </h2>

            <p className="text-gray-600 dark:text-gray-400">
              Edit page content, upload images, and customize layouts
            </p>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>

            <Button variant="primary">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Page Selection & Controls */}

          <div className="lg:col-span-1 space-y-6">
            {/* Page Selection */}

            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Select Page
                </h3>
              </Card.Header>

              <Card.Body>
                <div className="space-y-2">
                  {pages.map((page) => {
                    const Icon = page.icon;

                    return (
                      <button
                        key={page.id}
                        onClick={() => setSelectedPage(page.id)}
                        className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                          selectedPage === page.id
                            ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />

                        {page.name}
                      </button>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>

            {/* Preview Mode */}

            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Preview Mode
                </h3>
              </Card.Header>

              <Card.Body>
                <div className="flex space-x-2">
                  {previewModes.map((mode) => {
                    const Icon = mode.icon;

                    return (
                      <button
                        key={mode.id}
                        onClick={() => setPreviewMode(mode.id)}
                        className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-colors ${
                          previewMode === mode.id
                            ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />

                        {mode.name}
                      </button>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>

            {/* Image Upload */}

            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Image Library
                </h3>
              </Card.Header>

              <Card.Body>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload Images
                    </label>

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Uploaded Images
                      </h4>

                      <div className="grid grid-cols-2 gap-2">
                        {uploadedImages.map((image) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-20 object-cover rounded-lg"
                            />

                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-white"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Right Panel - Page Editor */}

          <div className="lg:col-span-2">
            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Edit {pages.find((p) => p.id === selectedPage)?.name}
                  </h3>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {previewMode === "desktop" && "Desktop View"}

                      {previewMode === "tablet" && "Tablet View"}

                      {previewMode === "mobile" && "Mobile View"}
                    </span>
                  </div>
                </div>
              </Card.Header>

              <Card.Body>
                {selectedPage === "login" && (
                  <div className="space-y-6">
                    {/* Header Content */}

                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 flex items-center">
                        <Type className="h-4 w-4 mr-2" />
                        Header Content
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Page Title
                          </label>

                          <input
                            type="text"
                            value={pageData.login.title}
                            onChange={(e) =>
                              handlePageDataUpdate(
                                "login",
                                "title",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Subtitle
                          </label>

                          <input
                            type="text"
                            value={pageData.login.subtitle}
                            onChange={(e) =>
                              handlePageDataUpdate(
                                "login",
                                "subtitle",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Left Section Content */}

                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 flex items-center">
                        <Layout className="h-4 w-4 mr-2" />
                        Left Section Content
                      </h4>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Welcome Text
                          </label>

                          <input
                            type="text"
                            value={pageData.login.welcomeText}
                            onChange={(e) =>
                              handlePageDataUpdate(
                                "login",
                                "welcomeText",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Main Heading
                          </label>

                          <input
                            type="text"
                            value={pageData.login.mainHeading}
                            onChange={(e) =>
                              handlePageDataUpdate(
                                "login",
                                "mainHeading",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                          </label>

                          <textarea
                            rows={3}
                            value={pageData.login.description}
                            onChange={(e) =>
                              handlePageDataUpdate(
                                "login",
                                "description",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Background Colors */}

                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 flex items-center">
                        <Palette className="h-4 w-4 mr-2" />
                        Background Colors
                      </h4>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            From Color
                          </label>

                          <select
                            value={pageData.login.gradientColors.from}
                            onChange={(e) =>
                              handleGradientColorUpdate(
                                "login",
                                "from",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                          >
                            <option value="indigo-600">Indigo</option>

                            <option value="blue-600">Blue</option>

                            <option value="purple-600">Purple</option>

                            <option value="pink-600">Pink</option>

                            <option value="red-600">Red</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Via Color
                          </label>

                          <select
                            value={pageData.login.gradientColors.via}
                            onChange={(e) =>
                              handleGradientColorUpdate(
                                "login",
                                "via",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                          >
                            <option value="purple-600">Purple</option>

                            <option value="indigo-600">Indigo</option>

                            <option value="blue-600">Blue</option>

                            <option value="pink-600">Pink</option>

                            <option value="red-600">Red</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            To Color
                          </label>

                          <select
                            value={pageData.login.gradientColors.to}
                            onChange={(e) =>
                              handleGradientColorUpdate(
                                "login",
                                "to",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                          >
                            <option value="slate-900">Slate</option>

                            <option value="gray-900">Gray</option>

                            <option value="black">Black</option>

                            <option value="indigo-900">Indigo</option>

                            <option value="purple-900">Purple</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Form Content */}

                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 flex items-center">
                        <Type className="h-4 w-4 mr-2" />
                        Form Content
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Form Title
                          </label>

                          <input
                            type="text"
                            value={pageData.login.formTitle}
                            onChange={(e) =>
                              handlePageDataUpdate(
                                "login",
                                "formTitle",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Form Subtitle
                          </label>

                          <input
                            type="text"
                            value={pageData.login.formSubtitle}
                            onChange={(e) =>
                              handlePageDataUpdate(
                                "login",
                                "formSubtitle",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Button Text
                          </label>

                          <input
                            type="text"
                            value={pageData.login.buttonText}
                            onChange={(e) =>
                              handlePageDataUpdate(
                                "login",
                                "buttonText",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Footer Text
                          </label>

                          <input
                            type="text"
                            value={pageData.login.footerText}
                            onChange={(e) =>
                              handlePageDataUpdate(
                                "login",
                                "footerText",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPage === "dashboard" && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
                        Dashboard Content
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Dashboard Title
                          </label>

                          <input
                            type="text"
                            value={pageData.dashboard.title}
                            onChange={(e) =>
                              handlePageDataUpdate(
                                "dashboard",
                                "title",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Subtitle
                          </label>

                          <input
                            type="text"
                            value={pageData.dashboard.subtitle}
                            onChange={(e) =>
                              handlePageDataUpdate(
                                "dashboard",
                                "subtitle",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();

      case "users":
        return renderUsers();

      case "eas":
        return renderEAs();

      case "utilities":
        return renderUtilities();

      case "hft":
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">HFT Bots management coming soon...</p>
          </div>
        );

      case "content":
        return renderContentManagement();

      case "page-editor":
        return renderPageEditor();

      case "settings":
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Settings coming soon...</p>
          </div>
        );

      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back, {user?.first_name} {user?.last_name}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Admin
          </span>
        </div>
      </div>

      {/* Tabs */}

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />

                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}

      {renderContent()}
    </div>
  );
};

export default AdminDashboard;
