/**
 * Utility functions for device detection
 */

/**
 * Checks if the current device is a mobile device based on screen width
 * @returns boolean True if the device is a mobile device
 */
export function isMobile(): boolean {
  // Use window.innerWidth to determine if we're on a mobile device
  // Standard breakpoint for mobile is typically under 768px
  return window.innerWidth < 768;
} 