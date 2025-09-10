import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Minimize as MinimizeIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon
} from '@mui/icons-material';

const DesktopWidget = ({ onClose, onMinimize, onSettings }) => {
  const [marketData, setMarketData] = useState({
    portfolio: {
      totalValue: 125000,
      dailyChange: 2500,
      dailyChangePercent: 2.04
    },
    activeEAs: [
      { name: 'Gold Scalper EA', status: 'running', profit: 1250 },
      { name: 'Multi Indicator EA', status: 'running', profit: 890 }
    ],
    activeBots: [
      { name: 'HFT Scalping Bot', status: 'running', profit: 2100 }
    ],
    topGainers: [
      { symbol: 'AAPL', price: 175.50, change: 2.50, changePercent: 1.45 },
      { symbol: 'SCOM', price: 18.50, change: 0.85, changePercent: 4.82 }
    ],
    topLosers: [
      { symbol: 'TSLA', price: 245.30, change: -5.20, changePercent: -2.08 }
    ],
    notifications: [
      { id: 1, message: 'Price alert: AAPL above $175', time: '2 min ago', type: 'price' },
      { id: 2, message: 'EA: Gold Scalper EA made profit', time: '5 min ago', type: 'ea' }
    ]
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    const electronCheck = window.electronAPI !== undefined;
    setIsElectron(electronCheck);

    // Start auto-refresh
    const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update data (in real app, this would fetch from your API)
      setMarketData(prev => ({
        ...prev,
        portfolio: {
          ...prev.portfolio,
          totalValue: prev.portfolio.totalValue + (Math.random() - 0.5) * 1000,
          dailyChange: prev.portfolio.dailyChange + (Math.random() - 0.5) * 100
        }
      }));
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'success';
      case 'stopped': return 'error';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'price': return '💰';
      case 'ea': return '🤖';
      case 'bot': return '⚡';
      case 'news': return '📰';
      default: return '🔔';
    }
  };

  if (!isElectron) {
    return null; // Only show in desktop app
  }

  return (
    <Card 
      sx={{ 
        width: 350, 
        maxHeight: 600, 
        overflow: 'auto',
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6" component="div">
          Smart Algos Widget
        </Typography>
        <Box>
          <Tooltip title="Settings">
            <IconButton size="small" onClick={onSettings}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Minimize">
            <IconButton size="small" onClick={onMinimize}>
              <MinimizeIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <CardContent sx={{ p: 2 }}>
        {/* Portfolio Summary */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Portfolio Value
          </Typography>
          <Typography variant="h5" gutterBottom>
            {formatCurrency(marketData.portfolio.totalValue)}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              icon={marketData.portfolio.dailyChange >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`${formatCurrency(marketData.portfolio.dailyChange)} (${formatPercent(marketData.portfolio.dailyChangePercent)})`}
              color={marketData.portfolio.dailyChange >= 0 ? 'success' : 'error'}
              size="small"
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Active EAs */}
        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle2">
              Active EAs ({marketData.activeEAs.length})
            </Typography>
            <IconButton size="small" onClick={refreshData} disabled={isRefreshing}>
              <RefreshIcon />
            </IconButton>
          </Box>
          
          {isRefreshing && <LinearProgress sx={{ mb: 1 }} />}
          
          <List dense>
            {marketData.activeEAs.map((ea, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                    🤖
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={ea.name}
                  secondary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={ea.status}
                        color={getStatusColor(ea.status)}
                        size="small"
                      />
                      <Typography variant="caption" color="success.main">
                        +{formatCurrency(ea.profit)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Active Bots */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Active Bots ({marketData.activeBots.length})
          </Typography>
          
          <List dense>
            {marketData.activeBots.map((bot, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'secondary.main' }}>
                    ⚡
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={bot.name}
                  secondary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={bot.status}
                        color={getStatusColor(bot.status)}
                        size="small"
                      />
                      <Typography variant="caption" color="success.main">
                        +{formatCurrency(bot.profit)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Top Movers */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" gutterBottom color="success.main">
              Top Gainers
            </Typography>
            {marketData.topGainers.map((stock, index) => (
              <Box key={index} display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption">{stock.symbol}</Typography>
                <Typography variant="caption" color="success.main">
                  {formatPercent(stock.changePercent)}
                </Typography>
              </Box>
            ))}
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="subtitle2" gutterBottom color="error.main">
              Top Losers
            </Typography>
            {marketData.topLosers.map((stock, index) => (
              <Box key={index} display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption">{stock.symbol}</Typography>
                <Typography variant="caption" color="error.main">
                  {formatPercent(stock.changePercent)}
                </Typography>
              </Box>
            ))}
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Recent Notifications */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Recent Alerts
          </Typography>
          
          <List dense>
            {marketData.notifications.slice(0, 3).map((notification) => (
              <ListItem key={notification.id} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'grey.200' }}>
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={notification.message}
                  secondary={notification.time}
                  primaryTypographyProps={{ variant: 'caption' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DesktopWidget;
