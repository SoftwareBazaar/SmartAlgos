import React, { useEffect, useState } from 'react';
import { StatusBar, Platform, PermissionsAndroid } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FlashMessage from 'react-native-flash-message';
import SplashScreen from 'react-native-splash-screen';
import NetInfo from '@react-native-community/netinfo';
import PushNotification from 'react-native-push-notification';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Context Providers
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { WebSocketProvider } from './src/contexts/WebSocketContext';
import { NotificationProvider } from './src/contexts/NotificationContext';

// Screens
import SplashScreenComponent from './src/screens/SplashScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/Auth/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/Auth/ResetPasswordScreen';
import DashboardScreen from './src/screens/Dashboard/DashboardScreen';
import MarketsScreen from './src/screens/Markets/MarketsScreen';
import SignalsScreen from './src/screens/Signals/SignalsScreen';
import EAMarketplaceScreen from './src/screens/EAMarketplace/EAMarketplaceScreen';
import HFTBotsScreen from './src/screens/HFTBots/HFTBotsScreen';
import PortfolioScreen from './src/screens/Portfolio/PortfolioScreen';
import AnalysisScreen from './src/screens/Analysis/AnalysisScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import SettingsScreen from './src/screens/Settings/SettingsScreen';
import PaymentsScreen from './src/screens/Payments/PaymentsScreen';
import NotificationsScreen from './src/screens/Notifications/NotificationsScreen';

// Components
import CustomDrawerContent from './src/components/Layout/CustomDrawerContent';
import TabBarIcon from './src/components/UI/TabBarIcon';
import LoadingOverlay from './src/components/UI/LoadingOverlay';

// Services
import { initializePushNotifications } from './src/services/notificationService';
import { checkNetworkConnection } from './src/services/networkService';
import { initializeBiometrics } from './src/services/biometricService';

// Utils
import { theme } from './src/utils/theme';
import { requestPermissions } from './src/utils/permissions';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Main Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon route={route} focused={focused} color={color} size={size} />
        ),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.gray,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Markets" 
        component={MarketsScreen}
        options={{ title: 'Markets' }}
      />
      <Tab.Screen 
        name="Signals" 
        component={SignalsScreen}
        options={{ title: 'Signals' }}
      />
      <Tab.Screen 
        name="Portfolio" 
        component={PortfolioScreen}
        options={{ title: 'Portfolio' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Main Drawer Navigator
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.colors.surface,
          width: 280,
        },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.gray,
      }}
    >
      <Drawer.Screen name="MainTabs" component={TabNavigator} />
      <Drawer.Screen name="EAMarketplace" component={EAMarketplaceScreen} />
      <Drawer.Screen name="HFTBots" component={HFTBotsScreen} />
      <Drawer.Screen name="Analysis" component={AnalysisScreen} />
      <Drawer.Screen name="Payments" component={PaymentsScreen} />
      <Drawer.Screen name="Notifications" component={NotificationsScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

// Auth Stack Navigator
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}

// Main App Component
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [networkConnected, setNetworkConnected] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Hide splash screen
      SplashScreen.hide();

      // Request permissions
      await requestPermissions();

      // Initialize push notifications
      await initializePushNotifications();

      // Initialize biometrics
      await initializeBiometrics();

      // Check network connection
      const networkState = await NetInfo.fetch();
      setNetworkConnected(networkState.isConnected);

      // Set up network listener
      const unsubscribe = NetInfo.addEventListener(state => {
        setNetworkConnected(state.isConnected);
        checkNetworkConnection(state.isConnected);
      });

      // Check authentication status
      const token = await AsyncStorage.getItem('authToken');
      setIsAuthenticated(!!token);

      // Get device info
      const deviceInfo = {
        deviceId: await DeviceInfo.getUniqueId(),
        deviceName: await DeviceInfo.getDeviceName(),
        systemVersion: await DeviceInfo.getSystemVersion(),
        appVersion: await DeviceInfo.getVersion(),
        buildNumber: await DeviceInfo.getBuildNumber(),
      };

      await AsyncStorage.setItem('deviceInfo', JSON.stringify(deviceInfo));

      setIsLoading(false);

      return () => unsubscribe();
    } catch (error) {
      console.error('App initialization error:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <SplashScreenComponent />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <ThemeProvider>
            <WebSocketProvider>
              <NotificationProvider>
                <NavigationContainer>
                  <StatusBar
                    barStyle="dark-content"
                    backgroundColor={theme.colors.primary}
                    translucent={false}
                  />
                  
                  {isAuthenticated ? (
                    <DrawerNavigator />
                  ) : (
                    <AuthStack />
                  )}
                  
                  <FlashMessage position="top" />
                  <LoadingOverlay />
                </NavigationContainer>
              </NotificationProvider>
            </WebSocketProvider>
          </ThemeProvider>
        </AuthProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

export default App;
