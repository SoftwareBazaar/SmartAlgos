import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, Checkbox } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { initializeBiometrics } from '../../services/biometricService';
import { showMessage } from 'react-native-flash-message';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { login, isLoading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
    useBiometric: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState(null);

  useEffect(() => {
    checkBiometricAvailability();
    clearError();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const result = await initializeBiometrics();
      if (result.success) {
        setBiometricAvailable(true);
        setBiometricType(result.type);
      }
    } catch (error) {
      console.log('Biometric not available:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      showMessage({
        message: 'Validation Error',
        description: 'Please enter your email address',
        type: 'warning',
      });
      return false;
    }

    if (!formData.email.includes('@')) {
      showMessage({
        message: 'Validation Error',
        description: 'Please enter a valid email address',
        type: 'warning',
      });
      return false;
    }

    if (!formData.password.trim()) {
      showMessage({
        message: 'Validation Error',
        description: 'Please enter your password',
        type: 'warning',
      });
      return false;
    }

    if (formData.password.length < 6) {
      showMessage({
        message: 'Validation Error',
        description: 'Password must be at least 6 characters long',
        type: 'warning',
      });
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const result = await login(
        formData.email.trim().toLowerCase(),
        formData.password,
        formData.useBiometric
      );

      if (result.success) {
        // Navigation will be handled by the auth state change
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await initializeBiometrics();
      if (result.success) {
        // In a real app, you would retrieve stored credentials and login
        showMessage({
          message: 'Biometric Login',
          description: 'Biometric authentication successful',
          type: 'success',
        });
      } else {
        showMessage({
          message: 'Biometric Login Failed',
          description: result.error || 'Biometric authentication failed',
          type: 'danger',
        });
      }
    } catch (error) {
      showMessage({
        message: 'Biometric Error',
        description: 'Biometric authentication is not available',
        type: 'danger',
      });
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const getBiometricIcon = () => {
    switch (biometricType) {
      case 'TouchID':
        return 'fingerprint';
      case 'FaceID':
        return 'face';
      default:
        return 'security';
    }
  };

  const getBiometricText = () => {
    switch (biometricType) {
      case 'TouchID':
        return 'Use Touch ID';
      case 'FaceID':
        return 'Use Face ID';
      default:
        return 'Use Biometric';
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Icon name="trending-up" size={60} color="white" />
            </View>
            <Title style={styles.title}>Smart Algos</Title>
            <Paragraph style={styles.subtitle}>
              Your Gateway to Intelligent Trading
            </Paragraph>
          </View>

          {/* Login Form */}
          <Card style={styles.formCard}>
            <Card.Content style={styles.formContent}>
              <Title style={styles.formTitle}>Welcome Back</Title>
              <Paragraph style={styles.formSubtitle}>
                Sign in to your account
              </Paragraph>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  label="Email Address"
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  left={<TextInput.Icon icon="email" />}
                  style={styles.input}
                  theme={{
                    colors: {
                      primary: '#667eea',
                    },
                  }}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  label="Password"
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  style={styles.input}
                  theme={{
                    colors: {
                      primary: '#667eea',
                    },
                  }}
                />
              </View>

              {/* Remember Me & Biometric */}
              <View style={styles.optionsContainer}>
                <View style={styles.checkboxContainer}>
                  <Checkbox
                    status={formData.rememberMe ? 'checked' : 'unchecked'}
                    onPress={() => handleInputChange('rememberMe', !formData.rememberMe)}
                    color="#667eea"
                  />
                  <Text style={styles.checkboxLabel}>Remember me</Text>
                </View>

                {biometricAvailable && (
                  <View style={styles.checkboxContainer}>
                    <Checkbox
                      status={formData.useBiometric ? 'checked' : 'unchecked'}
                      onPress={() => handleInputChange('useBiometric', !formData.useBiometric)}
                      color="#667eea"
                    />
                    <Text style={styles.checkboxLabel}>Enable biometric</Text>
                  </View>
                )}
              </View>

              {/* Login Button */}
              <Button
                mode="contained"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                style={styles.loginButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>

              {/* Biometric Login Button */}
              {biometricAvailable && (
                <TouchableOpacity
                  style={styles.biometricButton}
                  onPress={handleBiometricLogin}
                >
                  <Icon name={getBiometricIcon()} size={24} color="#667eea" />
                  <Text style={styles.biometricText}>{getBiometricText()}</Text>
                </TouchableOpacity>
              )}

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Register Link */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={handleRegister}>
                  <Text style={styles.registerLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formCard: {
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  formContent: {
    padding: 30,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  loginButton: {
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#667eea',
    marginBottom: 20,
  },
  biometricText: {
    fontSize: 16,
    color: '#667eea',
    marginLeft: 8,
    fontWeight: '600',
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 20,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default LoginScreen;
