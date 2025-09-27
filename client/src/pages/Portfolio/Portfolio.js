import React, { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PieChart, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  Eye, 
  Settings, 
  Star,
  BarChart3,
  Activity,
  Target,
  Shield,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import apiClient from '../../lib/apiClient';

const Portfolio = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCsv, setSelectedCsv] = useState(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const fileInputRef = useRef(null);


  // Mock portfolios data
  const portfolios = [
    {
      id: 1,
      name: "My Trading Portfolio",
      description: "Diversified trading portfolio with forex, crypto, and stock positions",
      total_value: 125000,
      total_invested: 100000,
      total_profit: 25000,
      profit_percentage: 25.0,
      daily_change: 1250,
      daily_change_percentage: 1.01,
      risk_level: "Medium",
      max_drawdown: 8.5,
      sharpe_ratio: 1.8,
      win_rate: 68.5,
      total_trades: 156,
      profitable_trades: 107,
      asset_count: 3,
      is_featured: true,
      created_at: "2023-01-15T10:30:00Z",
      updated_at: "2024-01-15T14:20:00Z"
    },
    {
      id: 2,
      name: "Crypto Growth Fund",
      description: "High-growth cryptocurrency portfolio focused on altcoins",
      total_value: 85000,
      total_invested: 60000,
      total_profit: 25000,
      profit_percentage: 41.7,
      daily_change: -850,
      daily_change_percentage: -0.99,
      risk_level: "High",
      max_drawdown: 15.2,
      sharpe_ratio: 1.4,
      win_rate: 72.3,
      total_trades: 89,
      profitable_trades: 64,
      asset_count: 8,
      is_featured: false,
      created_at: "2023-06-10T09:15:00Z",
      updated_at: "2024-01-15T14:20:00Z"
    },
    {
      id: 3,
      name: "Conservative Income",
      description: "Low-risk portfolio focused on stable income generation",
      total_value: 200000,
      total_invested: 195000,
      total_profit: 5000,
      profit_percentage: 2.6,
      daily_change: 200,
      daily_change_percentage: 0.10,
      risk_level: "Low",
      max_drawdown: 3.2,
      sharpe_ratio: 2.1,
      win_rate: 85.7,
      total_trades: 234,
      profitable_trades: 201,
      asset_count: 12,
      is_featured: false,
      created_at: "2022-11-20T14:45:00Z",
      updated_at: "2024-01-15T14:20:00Z"
    }
  ];

  const filters = [
    { id: 'all', name: 'All Portfolios', count: portfolios.length },
    { id: 'featured', name: 'Featured', count: portfolios.filter(p => p.is_featured).length },
    { id: 'profitable', name: 'Profitable', count: portfolios.filter(p => p.total_profit > 0).length },
    { id: 'high-risk', name: 'High Risk', count: portfolios.filter(p => p.risk_level === 'High').length },
    { id: 'low-risk', name: 'Low Risk', count: portfolios.filter(p => p.risk_level === 'Low').length }
  ];

  const filteredPortfolios = portfolios.filter(portfolio => {
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'featured' && portfolio.is_featured) ||
      (activeFilter === 'profitable' && portfolio.total_profit > 0) ||
      (activeFilter === 'high-risk' && portfolio.risk_level === 'High') ||
      (activeFilter === 'low-risk' && portfolio.risk_level === 'Low');
    
    return matchesFilter;
  });

  const pnlEntries = useMemo(() => ([
    { date: '2024-01-02', pnl: 450 },
    { date: '2024-01-03', pnl: -220 },
    { date: '2024-01-04', pnl: 180 },
    { date: '2024-01-05', pnl: 720 },
    { date: '2024-01-08', pnl: -310 },
    { date: '2024-01-09', pnl: 940 },
    { date: '2024-01-10', pnl: -120 },
    { date: '2024-01-11', pnl: 0 },
    { date: '2024-01-12', pnl: 420 },
    { date: '2024-01-15', pnl: 280 },
    { date: '2024-01-16', pnl: -640 },
    { date: '2024-01-17', pnl: 390 },
    { date: '2024-01-18', pnl: 210 },
    { date: '2024-01-19', pnl: -450 },
    { date: '2024-01-22', pnl: 610 },
    { date: '2024-01-23', pnl: 75 },
    { date: '2024-01-24', pnl: -180 },
    { date: '2024-01-25', pnl: 540 },
    { date: '2024-01-26', pnl: 130 },
    { date: '2024-01-29', pnl: -90 },
    { date: '2024-01-30', pnl: 320 },
    { date: '2024-01-31', pnl: 510 },
  ]), []);

  const pnlByDate = useMemo(() => {
    return pnlEntries.reduce((acc, entry) => {
      acc[entry.date] = entry.pnl;
      return acc;
    }, {});
  }, [pnlEntries]);

  const calendarYear = 2024;
  const calendarMonthIndex = 0;

  const calendarCells = useMemo(() => {
    const firstDay = new Date(calendarYear, calendarMonthIndex, 1);
    const daysInMonth = new Date(calendarYear, calendarMonthIndex + 1, 0).getDate();
    const cells = [];
    const leadingEmpty = firstDay.getDay();

    for (let i = 0; i < leadingEmpty; i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateKey = `${calendarYear}-${String(calendarMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        day,
        dateKey,
        pnl: pnlByDate[dateKey] ?? 0,
      });
    }

    return cells;
  }, [pnlByDate]);

  const totalMonthlyPnL = useMemo(() => {
    return pnlEntries.reduce((sum, entry) => sum + entry.pnl, 0);
  }, [pnlEntries]);

  const formatPnLValue = (value) => {
    if (value > 0) return `+$${value.toLocaleString()}`;
    if (value < 0) return `-$${Math.abs(value).toLocaleString()}`;
    return '$0';
  };

  const pnlColorClass = (value) => {
    if (value > 0) return 'bg-success-500/10 border border-success-500/30 text-success-200';
    if (value < 0) return 'bg-danger-500/10 border border-danger-500/30 text-danger-200';
    return 'bg-brand-900/60 border border-brand-800/70 text-brand-200';
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabel = new Date(calendarYear, calendarMonthIndex).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'High': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const handleSelectCsv = (event) => {
    const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    setSelectedCsv(file);
    setUploadPreview(null);
    setUploadError(null);
  };

  const handleUploadCsv = async () => {
    if (!selectedCsv) {
      setUploadError('Please choose a CSV file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedCsv);

    setUploadingCsv(true);
    setUploadError(null);

    try {
      const { data } = await apiClient.post('/api/portfolio/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadPreview(data);
      setSelectedCsv(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Upload failed. Please try again.';
      setUploadError(message);
    } finally {
      setUploadingCsv(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Portfolio
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track your investments and performance
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Portfolio
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <Card.Body>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === filter.id
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {filter.name}
                  <span className="ml-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* CSV Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Card>
          <Card.Body>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-wide">
                  Upload Portfolio CSV
                </h2>
                <p className="text-sm text-gray-500 dark:text-brand-200 max-w-2xl">
                  Import statements exported from MT4/MT5, Polygon flat files, or other brokers. We'll store the file locally and preview the first few lines so you can confirm the format before processing.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleSelectCsv}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedCsv ? 'Change CSV' : 'Choose CSV'}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleUploadCsv}
                  disabled={!selectedCsv || uploadingCsv}
                >
                  {uploadingCsv ? 'Uploading...' : 'Upload & Preview'}
                </Button>
              </div>
            </div>

            {selectedCsv && (
              <div className="mt-4 text-sm text-gray-500 dark:text-brand-200">
                Selected file: <span className="font-semibold text-gray-900 dark:text-white">{selectedCsv.name}</span> ({(selectedCsv.size / 1024).toFixed(1)} KB)
              </div>
            )}

            {uploadError && (
              <div className="mt-4 rounded-lg border border-danger-500/40 bg-danger-500/10 px-4 py-3 text-sm text-danger-200">
                {uploadError}
              </div>
            )}

            {uploadPreview && (
              <div className="mt-6 rounded-lg border border-brand-800/60 bg-brand-900/40 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-100">Preview (first {uploadPreview.preview.length} lines)</h3>
                  <p className="text-xs text-brand-200">Saved to: {uploadPreview.savedTo}</p>
                </div>
                <pre className="mt-3 max-h-48 overflow-auto rounded bg-black/40 p-3 text-xs text-brand-100">
                  {uploadPreview.preview.length ? uploadPreview.preview.join('\n') : 'No data detected.'}
                    ? uploadPreview.preview.join('\n')

                    : 'No data detected.'}
                </pre>
              </div>
            )}
          </Card.Body>
        </Card>
      </motion.div>

      {/* Monthly PnL Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <Card.Body>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-wide">
                  Monthly PnL
                </h2>
                <p className="text-sm text-gray-500 dark:text-brand-200">
                  {monthLabel} - {formatPnLValue(totalMonthlyPnL)} total
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-brand-200">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-success-500/70" />
                  <span>Gain</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-danger-500/70" />
                  <span>Loss</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-brand-800" />
                  <span>Flat</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-xs">
              {dayLabels.map((label) => (
                <div key={label} className="text-center text-gray-500 dark:text-brand-300 uppercase tracking-widest">
                  {label}
                </div>
              ))}
              {calendarCells.map((cell, index) => {
                if (!cell) {
                  return <div key={`empty-${index}`} className="h-16 rounded-lg bg-transparent" />;
                }

                return (
                  <div
                    key={cell.dateKey}
                    className={`flex flex-col justify-between rounded-lg p-2 h-16 shadow-inner transition-transform duration-200 hover:scale-[1.02] ${pnlColorClass(cell.pnl)}`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span>{cell.day}</span>
                      {cell.pnl !== 0 && (
                        <span>{formatPnLValue(cell.pnl)}</span>
                      )}
                    </div>
                    <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                      {cell.pnl !== 0 && (
                        <div
                          className={`h-full ${cell.pnl > 0 ? 'bg-success-400' : 'bg-danger-500'}`}
                          style={{ width: `${Math.min(Math.abs(cell.pnl) / 1200 * 100, 100)}%` }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-gray-500 dark:text-brand-200">
              Calendar uses mock trade statements. Replace with parsed CSV data once your upload pipeline is ready.
            </p>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Portfolios Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3"
      >
        {filteredPortfolios.map((portfolio, index) => (
          <motion.div
            key={portfolio.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card hover className="h-full">
              <Card.Body>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                      <PieChart className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {portfolio.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {portfolio.asset_count} assets
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {portfolio.is_featured && (
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(portfolio.risk_level)}`}>
                      {portfolio.risk_level}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {portfolio.description}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Value</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      ${portfolio.total_value.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Profit</span>
                    <span className={`text-sm font-medium ${portfolio.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {portfolio.total_profit >= 0 ? '+' : ''}${portfolio.total_profit.toLocaleString()} ({portfolio.profit_percentage >= 0 ? '+' : ''}{portfolio.profit_percentage}%)
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Today's Change</span>
                    <span className={`text-sm font-medium flex items-center ${portfolio.daily_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {portfolio.daily_change >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                      {portfolio.daily_change >= 0 ? '+' : ''}${portfolio.daily_change.toLocaleString()} ({portfolio.daily_change_percentage >= 0 ? '+' : ''}{portfolio.daily_change_percentage}%)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Win Rate</span>
                    <span className="text-sm font-medium text-green-600">
                      {portfolio.win_rate}%
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="primary" 
                    fullWidth
                    onClick={() => navigate(`/portfolio/${portfolio.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Updated {new Date(portfolio.updated_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Activity className="h-3 w-3 mr-1" />
                    {portfolio.total_trades} trades
                  </div>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* No Results */}
      {filteredPortfolios.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12"
        >
          <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No portfolios found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your filter criteria or create a new portfolio
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Portfolio;
