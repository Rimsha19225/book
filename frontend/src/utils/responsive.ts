/** Responsive Utility Functions for the Physical AI & Humanoid Robotics Textbook application */

// Define breakpoints
export const BREAKPOINTS = {
  xs: 0,      // Extra small devices (portrait phones, less than 576px)
  sm: 576,    // Small devices (landscape phones, 576px and up)
  md: 768,    // Medium devices (tablets, 768px and up)
  lg: 992,    // Large devices (desktops, 992px and up)
  xl: 1200,   // Extra large devices (large desktops, 1200px and up)
  xxl: 1400   // Extra extra large devices (larger desktops, 1400px and up)
};

// Media query functions
export const mediaQueries = {
  xs: `(min-width: ${BREAKPOINTS.xs}px)`,
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
  xxl: `(min-width: ${BREAKPOINTS.xxl}px)`,

  // Max width queries
  xsMax: `(max-width: ${BREAKPOINTS.sm - 1}px)`,
  smMax: `(max-width: ${BREAKPOINTS.md - 1}px)`,
  mdMax: `(max-width: ${BREAKPOINTS.lg - 1}px)`,
  lgMax: `(max-width: ${BREAKPOINTS.xl - 1}px)`,
  xlMax: `(max-width: ${BREAKPOINTS.xxl - 1}px)`,

  // Device-specific queries
  mobile: `(max-width: ${BREAKPOINTS.md - 1}px)`,
  tablet: `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
  desktop: `(min-width: ${BREAKPOINTS.lg}px)`,
};

// Hook to check current device type (if used in React components)
export const getDeviceType = (width: number) => {
  if (width < BREAKPOINTS.md) {
    return 'mobile';
  } else if (width < BREAKPOINTS.lg) {
    return 'tablet';
  } else {
    return 'desktop';
  }
};

// Function to check if current screen size is mobile
export const isMobile = (width: number): boolean => {
  return width < BREAKPOINTS.md;
};

// Function to check if current screen size is tablet
export const isTablet = (width: number): boolean => {
  return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
};

// Function to check if current screen size is desktop
export const isDesktop = (width: number): boolean => {
  return width >= BREAKPOINTS.lg;
};

// Function to get appropriate component size based on screen width
export const getResponsiveSize = (
  mobileSize: number | string,
  tabletSize?: number | string,
  desktopSize?: number | string
): number | string => {
  const width = typeof window !== 'undefined' ? window.innerWidth : 0;

  if (isMobile(width)) {
    return mobileSize;
  } else if (isTablet(width) && tabletSize !== undefined) {
    return tabletSize;
  } else if (desktopSize !== undefined) {
    return desktopSize;
  } else {
    // If no desktop size provided, use tablet size or mobile size as fallback
    return tabletSize !== undefined ? tabletSize : mobileSize;
  }
};

// Function to get appropriate chat panel dimensions based on screen size
export const getChatPanelDimensions = () => {
  const width = typeof window !== 'undefined' ? window.innerWidth : 0;

  if (isMobile(width)) {
    return {
      width: '90vw',  // Use 90% of viewport width on mobile
      height: '60vh', // Use 60% of viewport height on mobile
      maxHeight: '400px', // Max height to prevent taking too much space
      maxWidth: '100%',
    };
  } else if (isTablet(width)) {
    return {
      width: '400px',
      height: '500px',
      maxHeight: '600px',
      maxWidth: '90vw',
    };
  } else {
    return {
      width: '400px',
      height: '600px',
      maxHeight: '70vh',
      maxWidth: '600px',
    };
  }
};

// Function to get appropriate content layout based on screen size
export const getContentLayout = () => {
  const width = typeof window !== 'undefined' ? window.innerWidth : 0;

  if (isMobile(width)) {
    return {
      flexDirection: 'column' as const,
      navigationWidth: '100%',
      contentWidth: '100%',
    };
  } else {
    return {
      flexDirection: 'row' as const,
      navigationWidth: '300px',
      contentWidth: 'calc(100% - 320px)', // Account for navigation width + margin
    };
  }
};

// Function to get appropriate font sizes based on screen size
export const getResponsiveFontSize = (
  mobileSize: string,
  tabletSize: string,
  desktopSize: string
): string => {
  const width = typeof window !== 'undefined' ? window.innerWidth : 0;

  if (isMobile(width)) {
    return mobileSize;
  } else if (isTablet(width)) {
    return tabletSize;
  } else {
    return desktopSize;
  }
};

// Function to get appropriate spacing based on screen size
export const getResponsiveSpacing = (
  mobileSpacing: number,
  tabletSpacing: number,
  desktopSpacing: number
): number => {
  const width = typeof window !== 'undefined' ? window.innerWidth : 0;

  if (isMobile(width)) {
    return mobileSpacing;
  } else if (isTablet(width)) {
    return tabletSpacing;
  } else {
    return desktopSpacing;
  }
};

// Function to check if touch events are supported
export const isTouchDevice = (): boolean => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
};

// Function to get appropriate interaction mode
export const getInteractionMode = (): 'touch' | 'mouse' => {
  return isTouchDevice() ? 'touch' : 'mouse';
};