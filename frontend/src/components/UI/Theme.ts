/** Theme Configuration for the Physical AI & Humanoid Robotics Textbook application */
import { mediaQueries, getResponsiveSize, getChatPanelDimensions, getContentLayout } from '../../utils/responsive';

// Define color palette
export const colors = {
  primary: '#2563eb',      // Modern blue
  primaryDark: '#1d4ed8',
  primaryLight: '#3b82f6',
  secondary: '#64748b',    // Gray for secondary elements
  success: '#10b981',      // Green for success states
  warning: '#f59e0b',      // Amber for warnings
  danger: '#ef4444',       // Red for errors
  background: '#ffffff',   // White background
  surface: '#f9fafb',      // Light gray surface
  textPrimary: '#1e293b',  // Dark gray text
  textSecondary: '#64748b', // Medium gray text
  textHint: '#94a3b8',     // Light gray hint text
};

// Define typography
export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",

  // Font sizes with responsive values
  fontSize: {
    xs: getResponsiveSize('0.75rem', '0.75rem', '0.75rem'),   // 12px
    sm: getResponsiveSize('0.875rem', '0.875rem', '0.875rem'), // 14px
    base: getResponsiveSize('1rem', '1rem', '1rem'),           // 16px
    lg: getResponsiveSize('1.125rem', '1.125rem', '1.125rem'), // 18px
    xl: getResponsiveSize('1.25rem', '1.25rem', '1.25rem'),    // 20px
    '2xl': getResponsiveSize('1.5rem', '1.5rem', '1.5rem'),    // 24px
    '3xl': getResponsiveSize('1.875rem', '1.875rem', '1.875rem'), // 30px
    '4xl': getResponsiveSize('2.25rem', '2.25rem', '2.25rem'), // 36px
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

// Define spacing with responsive values
export const spacing = {
  xxxs: getResponsiveSize('0.25rem', '0.25rem', '0.25rem'),   // 4px
  xxs: getResponsiveSize('0.5rem', '0.5rem', '0.5rem'),       // 8px
  xs: getResponsiveSize('0.75rem', '0.75rem', '0.75rem'),     // 12px
  sm: getResponsiveSize('1rem', '1rem', '1rem'),              // 16px
  md: getResponsiveSize('1.5rem', '1.5rem', '1.5rem'),        // 24px
  lg: getResponsiveSize('2rem', '2rem', '2rem'),              // 32px
  xl: getResponsiveSize('2.5rem', '2.5rem', '2.5rem'),        // 40px
  '2xl': getResponsiveSize('3rem', '3rem', '3rem'),           // 48px
  '3xl': getResponsiveSize('4rem', '4rem', '4rem'),           // 64px
};

// Define breakpoints (re-exporting from responsive utils)
export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

// Define component-specific styles
export const components = {
  // Chat panel responsive dimensions
  chatPanel: {
    ...getChatPanelDimensions(),
    borderRadius: getResponsiveSize('8px', '8px', '12px'),
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },

  // Content layout based on screen size
  contentLayout: {
    ...getContentLayout(),
  },

  // Navigation responsive styles
  navigation: {
    width: getResponsiveSize('100%', '100%', '300px'),
    padding: getResponsiveSize(spacing.xs, spacing.sm, spacing.md),
  },

  // Button styles
  button: {
    padding: getResponsiveSize(
      `${spacing.xxs} ${spacing.sm}`,
      `${spacing.xs} ${spacing.md}`,
      `${spacing.sm} ${spacing.lg}`
    ),
    borderRadius: getResponsiveSize('4px', '6px', '8px'),
    fontSize: getResponsiveSize(
      typography.fontSize.sm,
      typography.fontSize.base,
      typography.fontSize.base
    ),
  },
};

// Define theme object
export const theme = {
  colors,
  typography,
  spacing,
  breakpoints,
  components,
  mediaQueries,
};

// Export theme provider component if needed in React
// This is just the configuration; actual provider would be implemented separately
export default theme;