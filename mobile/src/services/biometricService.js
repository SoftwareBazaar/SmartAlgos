import ReactNativeBiometrics from 'react-native-biometrics';
import TouchID from 'react-native-touch-id';
import { Platform, Alert } from 'react-native';

class BiometricService {
  constructor() {
    this.rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });
    this.isAvailable = false;
    this.biometricType = null;
  }

  // Check if biometric authentication is available
  async checkAvailability() {
    try {
      if (Platform.OS === 'ios') {
        // Use TouchID for iOS
        const available = await TouchID.isSupported();
        if (available) {
          this.isAvailable = true;
          this.biometricType = 'TouchID';
          return {
            success: true,
            available: true,
            type: 'TouchID',
          };
        }
      } else if (Platform.OS === 'android') {
        // Use ReactNativeBiometrics for Android
        const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
        if (available) {
          this.isAvailable = true;
          this.biometricType = biometryType;
          return {
            success: true,
            available: true,
            type: biometryType,
          };
        }
      }

      return {
        success: true,
        available: false,
        type: null,
      };
    } catch (error) {
      console.error('Biometric availability check error:', error);
      return {
        success: false,
        available: false,
        type: null,
        error: error.message,
      };
    }
  }

  // Initialize biometric authentication
  async initialize() {
    try {
      const availability = await this.checkAvailability();
      
      if (!availability.success || !availability.available) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device',
        };
      }

      // Create biometric key if it doesn't exist
      const { keysExist } = await this.rnBiometrics.biometricKeysExist();
      
      if (!keysExist) {
        const { publicKey } = await this.rnBiometrics.createKeys();
        console.log('Biometric keys created:', publicKey);
      }

      return {
        success: true,
        type: availability.type,
        message: 'Biometric authentication initialized successfully',
      };
    } catch (error) {
      console.error('Biometric initialization error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Authenticate using biometrics
  async authenticate(reason = 'Authenticate to continue') {
    try {
      if (!this.isAvailable) {
        const availability = await this.checkAvailability();
        if (!availability.available) {
          return {
            success: false,
            error: 'Biometric authentication is not available',
          };
        }
      }

      if (Platform.OS === 'ios') {
        // Use TouchID for iOS
        const result = await TouchID.authenticate(reason, {
          title: 'Biometric Authentication',
          subTitle: 'Use your biometric to authenticate',
          description: reason,
          fallbackLabel: 'Use Passcode',
          cancelLabel: 'Cancel',
        });

        return {
          success: true,
          message: 'Authentication successful',
        };
      } else if (Platform.OS === 'android') {
        // Use ReactNativeBiometrics for Android
        const { success } = await this.rnBiometrics.simplePrompt({
          promptMessage: reason,
          cancelButtonText: 'Cancel',
        });

        if (success) {
          return {
            success: true,
            message: 'Authentication successful',
          };
        } else {
          return {
            success: false,
            error: 'Authentication cancelled or failed',
          };
        }
      }

      return {
        success: false,
        error: 'Unsupported platform',
      };
    } catch (error) {
      console.error('Biometric authentication error:', error);
      
      // Handle specific error types
      if (error.code === 'AUTHENTICATION_CANCELLED') {
        return {
          success: false,
          error: 'Authentication was cancelled',
          cancelled: true,
        };
      } else if (error.code === 'AUTHENTICATION_FAILED') {
        return {
          success: false,
          error: 'Authentication failed',
        };
      } else if (error.code === 'AUTHENTICATION_NOT_AVAILABLE') {
        return {
          success: false,
          error: 'Biometric authentication is not available',
        };
      }

      return {
        success: false,
        error: error.message || 'Authentication failed',
      };
    }
  }

  // Store sensitive data with biometric protection
  async storeSecureData(key, data) {
    try {
      if (!this.isAvailable) {
        const availability = await this.checkAvailability();
        if (!availability.available) {
          return {
            success: false,
            error: 'Biometric authentication is not available',
          };
        }
      }

      const { success } = await this.rnBiometrics.createSignature({
        promptMessage: 'Authenticate to store data',
        payload: JSON.stringify(data),
      });

      if (success) {
        // In a real app, you would store the signature and use it to verify later
        return {
          success: true,
          message: 'Data stored securely',
        };
      } else {
        return {
          success: false,
          error: 'Failed to store data securely',
        };
      }
    } catch (error) {
      console.error('Store secure data error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Retrieve sensitive data with biometric protection
  async retrieveSecureData(key) {
    try {
      if (!this.isAvailable) {
        const availability = await this.checkAvailability();
        if (!availability.available) {
          return {
            success: false,
            error: 'Biometric authentication is not available',
          };
        }
      }

      const { success, signature } = await this.rnBiometrics.createSignature({
        promptMessage: 'Authenticate to retrieve data',
        payload: key,
      });

      if (success) {
        // In a real app, you would verify the signature and retrieve the data
        return {
          success: true,
          data: signature,
          message: 'Data retrieved successfully',
        };
      } else {
        return {
          success: false,
          error: 'Failed to retrieve data',
        };
      }
    } catch (error) {
      console.error('Retrieve secure data error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Delete biometric keys
  async deleteKeys() {
    try {
      const { keysDeleted } = await this.rnBiometrics.deleteKeys();
      
      if (keysDeleted) {
        this.isAvailable = false;
        this.biometricType = null;
        return {
          success: true,
          message: 'Biometric keys deleted successfully',
        };
      } else {
        return {
          success: false,
          error: 'Failed to delete biometric keys',
        };
      }
    } catch (error) {
      console.error('Delete biometric keys error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get biometric type
  getBiometricType() {
    return this.biometricType;
  }

  // Check if biometric is available
  isBiometricAvailable() {
    return this.isAvailable;
  }

  // Show biometric setup prompt
  async showSetupPrompt() {
    return new Promise((resolve) => {
      Alert.alert(
        'Enable Biometric Authentication',
        'Would you like to enable biometric authentication for faster and more secure access to your account?',
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: () => resolve({ success: false, cancelled: true }),
          },
          {
            text: 'Enable',
            onPress: async () => {
              const result = await this.initialize();
              resolve(result);
            },
          },
        ],
        { cancelable: false }
      );
    });
  }

  // Show biometric authentication prompt
  async showAuthPrompt(reason = 'Authenticate to continue') {
    return new Promise((resolve) => {
      Alert.alert(
        'Biometric Authentication',
        reason,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve({ success: false, cancelled: true }),
          },
          {
            text: 'Authenticate',
            onPress: async () => {
              const result = await this.authenticate(reason);
              resolve(result);
            },
          },
        ],
        { cancelable: false }
      );
    });
  }
}

// Create singleton instance
const biometricService = new BiometricService();

// Export functions for easy use
export const initializeBiometrics = () => biometricService.initialize();
export const authenticateBiometric = (reason) => biometricService.authenticate(reason);
export const storeSecureData = (key, data) => biometricService.storeSecureData(key, data);
export const retrieveSecureData = (key) => biometricService.retrieveSecureData(key);
export const deleteBiometricKeys = () => biometricService.deleteKeys();
export const getBiometricType = () => biometricService.getBiometricType();
export const isBiometricAvailable = () => biometricService.isBiometricAvailable();
export const showBiometricSetupPrompt = () => biometricService.showSetupPrompt();
export const showBiometricAuthPrompt = (reason) => biometricService.showAuthPrompt(reason);

export default biometricService;
