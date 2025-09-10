import { DefaultTheme, DarkTheme } from 'react-native-paper';

// Color palette
export const colors = {
  // Primary colors
  primary: '#667eea',
  primaryDark: '#5a6fd8',
  primaryLight: '#7c8ef0',
  
  // Secondary colors
  secondary: '#764ba2',
  secondaryDark: '#6a4190',
  secondaryLight: '#8253aa',
  
  // Accent colors
  accent: '#f093fb',
  accentDark: '#ee7ff9',
  accentLight: '#f2a7fd',
  
  // Status colors
  success: '#4CAF50',
  successDark: '#45a049',
  successLight: '#66bb6a',
  
  warning: '#FF9800',
  warningDark: '#f57c00',
  warningLight: '#ffb74d',
  
  error: '#F44336',
  errorDark: '#d32f2f',
  errorLight: '#ef5350',
  
  info: '#2196F3',
  infoDark: '#1976d2',
  infoLight: '#42a5f5',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: '#9E9E9E',
  grayDark: '#616161',
  grayLight: '#E0E0E0',
  grayLighter: '#F5F5F5',
  
  // Background colors
  background: '#FFFFFF',
  backgroundDark: '#121212',
  surface: '#FFFFFF',
  surfaceDark: '#1E1E1E',
  
  // Text colors
  text: '#212121',
  textDark: '#FFFFFF',
  textSecondary: '#757575',
  textSecondaryDark: '#B0B0B0',
  textDisabled: '#BDBDBD',
  textDisabledDark: '#616161',
  
  // Border colors
  border: '#E0E0E0',
  borderDark: '#333333',
  divider: '#E0E0E0',
  dividerDark: '#333333',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  
  // Chart colors
  chartPrimary: '#667eea',
  chartSecondary: '#764ba2',
  chartSuccess: '#4CAF50',
  chartWarning: '#FF9800',
  chartError: '#F44336',
  chartInfo: '#2196F3',
  
  // Trading colors
  buy: '#4CAF50',
  sell: '#F44336',
  hold: '#FF9800',
  neutral: '#9E9E9E',
  
  // Market colors
  bullish: '#4CAF50',
  bearish: '#F44336',
  sideways: '#FF9800',
  
  // Gradient colors
  gradientPrimary: ['#667eea', '#764ba2'],
  gradientSecondary: ['#f093fb', '#f5576c'],
  gradientSuccess: ['#4CAF50', '#45a049'],
  gradientWarning: ['#FF9800', '#f57c00'],
  gradientError: ['#F44336', '#d32f2f'],
  gradientInfo: ['#2196F3', '#1976d2'],
};

// Typography
export const typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    light: 'System',
    thin: 'System',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  // Font weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line heights
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 40,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

// Border radius
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 50,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};

// Animation durations
export const animation = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Breakpoints
export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

// Light theme
export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    textSecondary: colors.textSecondary,
    disabled: colors.textDisabled,
    placeholder: colors.textSecondary,
    backdrop: colors.overlay,
    onSurface: colors.text,
    notification: colors.error,
  },
  roundness: borderRadius.md,
};

// Dark theme
export const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.backgroundDark,
    surface: colors.surfaceDark,
    text: colors.textDark,
    textSecondary: colors.textSecondaryDark,
    disabled: colors.textDisabledDark,
    placeholder: colors.textSecondaryDark,
    backdrop: colors.overlay,
    onSurface: colors.textDark,
    notification: colors.error,
  },
  roundness: borderRadius.md,
};

// Default theme (light)
export const theme = lightTheme;

// Theme utilities
export const getTheme = (isDark = false) => {
  return isDark ? darkTheme : lightTheme;
};

export const getColor = (colorName, isDark = false) => {
  const theme = getTheme(isDark);
  return theme.colors[colorName] || colors[colorName] || colorName;
};

export const getSpacing = (size) => {
  return spacing[size] || size;
};

export const getBorderRadius = (size) => {
  return borderRadius[size] || size;
};

export const getShadow = (size) => {
  return shadows[size] || shadows.md;
};

export const getFontSize = (size) => {
  return typography.fontSize[size] || size;
};

export const getFontWeight = (weight) => {
  return typography.fontWeight[weight] || weight;
};

// Component-specific themes
export const componentThemes = {
  // Button themes
  button: {
    primary: {
      backgroundColor: colors.primary,
      textColor: colors.white,
    },
    secondary: {
      backgroundColor: colors.secondary,
      textColor: colors.white,
    },
    success: {
      backgroundColor: colors.success,
      textColor: colors.white,
    },
    warning: {
      backgroundColor: colors.warning,
      textColor: colors.white,
    },
    error: {
      backgroundColor: colors.error,
      textColor: colors.white,
    },
    outline: {
      backgroundColor: 'transparent',
      textColor: colors.primary,
      borderColor: colors.primary,
    },
  },
  
  // Card themes
  card: {
    default: {
      backgroundColor: colors.white,
      borderColor: colors.border,
      shadowColor: colors.black,
    },
    elevated: {
      backgroundColor: colors.white,
      shadowColor: colors.black,
      elevation: 4,
    },
  },
  
  // Input themes
  input: {
    default: {
      backgroundColor: colors.white,
      borderColor: colors.border,
      textColor: colors.text,
      placeholderColor: colors.textSecondary,
    },
    focused: {
      borderColor: colors.primary,
      textColor: colors.text,
    },
    error: {
      borderColor: colors.error,
      textColor: colors.error,
    },
  },
  
  // Chart themes
  chart: {
    primary: colors.chartPrimary,
    secondary: colors.chartSecondary,
    success: colors.chartSuccess,
    warning: colors.chartWarning,
    error: colors.chartError,
    info: colors.chartInfo,
  },
  
  // Trading themes
  trading: {
    buy: colors.buy,
    sell: colors.sell,
    hold: colors.hold,
    neutral: colors.neutral,
  },
  
  // Market themes
  market: {
    bullish: colors.bullish,
    bearish: colors.bearish,
    sideways: colors.sideways,
  },
};

export default theme;
