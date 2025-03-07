/**
 * Utility for detecting mobile devices
 */
class MobileDetect {
  /**
   * Check if the current device is a mobile device
   * @returns boolean indicating if the device is mobile
   */
  static isMobile(): boolean {
    // Check if window is defined (for SSR)
    if (typeof window === 'undefined') {
      return false;
    }

    // Check for mobile user agent
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    // Regular expression for mobile devices
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    
    // Check if screen width is less than 768px (typical mobile breakpoint)
    const isSmallScreen = window.innerWidth < 768;
    
    return mobileRegex.test(userAgent) || isSmallScreen;
  }

  /**
   * Check if the current device is a tablet
   * @returns boolean indicating if the device is a tablet
   */
  static isTablet(): boolean {
    // Check if window is defined (for SSR)
    if (typeof window === 'undefined') {
      return false;
    }

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    
    // Regular expression for tablets
    const tabletRegex = /iPad|Android(?!.*Mobile)/i;
    
    // Check if screen width is between tablet breakpoints
    const isTabletScreen = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    return tabletRegex.test(userAgent) || isTabletScreen;
  }

  /**
   * Check if the current device is a desktop
   * @returns boolean indicating if the device is a desktop
   */
  static isDesktop(): boolean {
    return !this.isMobile() && !this.isTablet();
  }
}

export default MobileDetect; 