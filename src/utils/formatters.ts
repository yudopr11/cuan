/**
 * Formats a number with thousand separators
 * @param value Number to format
 * @returns Formatted string with thousand separators
 */
export const formatThousands = (value: number): string => {
  return new Intl.NumberFormat('en-US', { 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Formats a number as a currency
 * @param value Number to format
 * @param currency Currency code (default: 'IDR')
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, currency: string = 'IDR'): string => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Formats a decimal number as a percentage
 * @param value Number to format (0.1 = 10%)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
}; 