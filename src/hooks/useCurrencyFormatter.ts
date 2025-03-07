import { useState, useEffect, useCallback } from 'react';

export default function useCurrencyFormatter() {
  const [currency, setCurrency] = useState('IDR');

  useEffect(() => {
    // Load currency setting on mount
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }

    // Listen for storage events (in case currency is changed in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currency' && e.newValue) {
        setCurrency(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    // Get current currency configuration
    const currentCurrency = localStorage.getItem('currency') || currency;

    // Define currency symbols and formatting options
    const currencyConfig: Record<string, { symbol: string, position: 'before' | 'after', space: boolean, decimalPlaces: number }> = {
      IDR: { symbol: 'Rp', position: 'before', space: true, decimalPlaces: 2 },
      USD: { symbol: '$', position: 'before', space: false, decimalPlaces: 2 },
      EUR: { symbol: '€', position: 'after', space: true, decimalPlaces: 2 },
      GBP: { symbol: '£', position: 'before', space: false, decimalPlaces: 2 },
      JPY: { symbol: '¥', position: 'before', space: false, decimalPlaces: 2 },
      SGD: { symbol: 'S$', position: 'before', space: false, decimalPlaces: 2 },
      MYR: { symbol: 'RM', position: 'before', space: false, decimalPlaces: 2 },
    };

    // Default to IDR if currency is not found
    const config = currencyConfig[currentCurrency] || currencyConfig.IDR;

    // Format the number according to locale
    let formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: config.decimalPlaces,
      maximumFractionDigits: config.decimalPlaces,
    }).format(amount);

    // Apply symbol according to configuration
    if (config.position === 'before') {
      return `${config.symbol}${config.space ? ' ' : ''}${formattedAmount}`;
    } else {
      return `${formattedAmount}${config.space ? ' ' : ''}${config.symbol}`;
    }
  }, [currency]);

  return { currency, formatCurrency };
} 