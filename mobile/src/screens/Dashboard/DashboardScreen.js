import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card, Title, Paragraph, Button, ActivityIndicator } from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { apiService } from '../../services/apiService';
import { showMessage } from 'react-native-flash-message';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const { user, updateActivity } = useAuth();
  const { 
    isConnected, 
    marketData, 
    portfolio, 
    signals, 
    notifications,
    getLatestSignals,
    getLatestNotifications 
  } = useWebSocket();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    portfolio: {
      totalValue: 0,
      totalGain: 0,
      totalGainPercent: 0,
      assets: [],
    },
    marketOverview: {
      indices: [],
      topGainers: [],
      topLosers: [],
    },
    recentSignals: [],
    recentNotifications: [],
    performance: {
      daily: [],
      weekly: [],
      monthly: [],
    },
  });

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
      updateActivity();
    }, [])
  );

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        portfolioRes,
        marketRes,
        signalsRes,
        notificationsRes,
        performanceRes,
      ] = await Promise.allSettled([
        apiService.getPortfolioSummary(),
        apiService.getMarketOverview(),
        apiService.getSignals({ limit: 5 }),
        apiService.getNotifications({ limit: 5 }),
        apiService.getPortfolioHistory('1M'),
      ]);

      const newData = { ...dashboardData };

      if (portfolioRes.status === 'fulfilled') {
        newData.portfolio = portfolioRes.value.data.data;
      }

      if (marketRes.status === 'fulfilled') {
        newData.marketOverview = marketRes.value.data.data;
      }

      if (signalsRes.status === 'fulfilled') {
        newData.recentSignals = signalsRes.value.data.data;
      }

      if (notificationsRes.status === 'fulfilled') {
        newData.recentNotifications = notificationsRes.value.data.data;
      }

      if (performanceRes.status === 'fulfilled') {
        newData.performance = performanceRes.value.data.data;
      }

      setDashboardData(newData);
    } catch (error) {
      console.error('Dashboard data loading error:', error);
      showMessage({
        message: 'Error',
        description: 'Failed to load dashboard data',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const renderPortfolioCard = () => {
    const { totalValue, totalGain, totalGainPercent } = dashboardData.portfolio;
    const isPositive = totalGain >= 0;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.portfolioHeader}>
            <Title style={styles.cardTitle}>Portfolio Value</Title>
            <TouchableOpacity onPress={() => navigation.navigate('Portfolio')}>
              <Icon name="arrow-forward" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.portfolioValue}>
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
          
          <View style={styles.portfolioChange}>
            <Icon 
              name={isPositive ? "trending-up" : "trending-down"} 
              size={20} 
              color={isPositive ? "#4CAF50" : "#F44336"} 
            />
            <Text style={[
              styles.changeText, 
              { color: isPositive ? "#4CAF50" : "#F44336" }
            ]}>
              {isPositive ? '+' : ''}${totalGain.toFixed(2)} ({totalGainPercent.toFixed(2)}%)
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderMarketOverview = () => {
    const { indices } = dashboardData.marketOverview;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title style={styles.cardTitle}>Market Overview</Title>
            <TouchableOpacity onPress={() => navigation.navigate('Markets')}>
              <Icon name="arrow-forward" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {indices.map((index, idx) => (
              <View key={idx} style={styles.marketIndex}>
                <Text style={styles.indexName}>{index.name}</Text>
                <Text style={styles.indexValue}>{index.value}</Text>
                <Text style={[
                  styles.indexChange,
                  { color: index.change >= 0 ? "#4CAF50" : "#F44336" }
                ]}>
                  {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}%
                </Text>
              </View>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>
    );
  };

  const renderPerformanceChart = () => {
    const { daily } = dashboardData.performance;
    
    if (daily.length === 0) {
      return (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Performance</Title>
            <View style={styles.emptyState}>
              <Icon name="show-chart" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No performance data available</Text>
            </View>
          </Card.Content>
        </Card>
      );
    }

    const chartData = {
      labels: daily.map(item => new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        data: daily.map(item => item.value),
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      }],
    };

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>7-Day Performance</Title>
          <LineChart
            data={chartData}
            width={width - 80}
            height={200}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#8641f4',
              },
            }}
            bezier
            style={styles.chart}
          />
        </Card.Content>
      </Card>
    );
  };

  const renderRecentSignals = () => {
    const recentSignals = getLatestSignals(3);

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title style={styles.cardTitle}>Recent Signals</Title>
            <TouchableOpacity onPress={() => navigation.navigate('Signals')}>
              <Icon name="arrow-forward" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {recentSignals.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="notifications-none" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No recent signals</Text>
            </View>
          ) : (
            recentSignals.map((signal, idx) => (
              <View key={idx} style={styles.signalItem}>
                <View style={styles.signalInfo}>
                  <Text style={styles.signalSymbol}>{signal.symbol}</Text>
                  <Text style={styles.signalType}>{signal.type}</Text>
                </View>
                <View style={styles.signalAction}>
                  <Text style={[
                    styles.signalPrice,
                    { color: signal.action === 'BUY' ? "#4CAF50" : "#F44336" }
                  ]}>
                    {signal.action}
                  </Text>
                  <Text style={styles.signalTime}>
                    {new Date(signal.createdAt).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderQuickActions = () => {
    const actions = [
      {
        title: 'Markets',
        icon: 'trending-up',
        color: '#4CAF50',
        onPress: () => navigation.navigate('Markets'),
      },
      {
        title: 'Signals',
        icon: 'notifications',
        color: '#FF9800',
        onPress: () => navigation.navigate('Signals'),
      },
      {
        title: 'EA Marketplace',
        icon: 'smart-toy',
        color: '#2196F3',
        onPress: () => navigation.navigate('EAMarketplace'),
      },
      {
        title: 'HFT Bots',
        icon: 'speed',
        color: '#9C27B0',
        onPress: () => navigation.navigate('HFTBots'),
      },
    ];

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Quick Actions</Title>
          <View style={styles.quickActions}>
            {actions.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.actionButton}
                onPress={action.onPress}
              >
                <LinearGradient
                  colors={[action.color, `${action.color}CC`]}
                  style={styles.actionGradient}
                >
                  <Icon name={action.icon} size={24} color="white" />
                </LinearGradient>
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderConnectionStatus = () => {
    return (
      <View style={styles.connectionStatus}>
        <View style={[
          styles.statusIndicator,
          { backgroundColor: isConnected ? '#4CAF50' : '#F44336' }
        ]} />
        <Text style={styles.statusText}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8641f4" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {getGreeting()},</Text>
            <Text style={styles.userName}>{user?.firstName || 'User'}</Text>
          </View>
          {renderConnectionStatus()}
        </View>

        {/* Portfolio Card */}
        {renderPortfolioCard()}

        {/* Market Overview */}
        {renderMarketOverview()}

        {/* Performance Chart */}
        {renderPerformanceChart()}

        {/* Recent Signals */}
        {renderRecentSignals()}

        {/* Quick Actions */}
        {renderQuickActions()}
      </ScrollView>
    </View>
  );
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  portfolioChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  marketIndex: {
    alignItems: 'center',
    marginRight: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    minWidth: 80,
  },
  indexName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  indexValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  indexChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  signalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  signalInfo: {
    flex: 1,
  },
  signalSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  signalType: {
    fontSize: 12,
    color: '#666',
  },
  signalAction: {
    alignItems: 'flex-end',
  },
  signalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  signalTime: {
    fontSize: 12,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default DashboardScreen;
