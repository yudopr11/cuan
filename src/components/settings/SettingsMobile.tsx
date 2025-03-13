import { useState, useEffect } from 'react';

export default function SettingsMobile() {
  const [currency, setCurrency] = useState('IDR');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  
  useEffect(() => {
    // Load saved currency setting from localStorage
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    localStorage.setItem('currency', value);
    setShowCurrencyPicker(false);
  };

  // Currency options with symbols
  const currencyOptions = [
    { value: 'IDR', label: 'IDR (Rp)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'JPY', label: 'JPY (¥)' },
    { value: 'SGD', label: 'SGD (S$)' },
    { value: 'MYR', label: 'MYR (RM)' },
  ];

  // Find the current currency label
  const currentCurrencyLabel = currencyOptions.find(
    option => option.value === currency
  )?.label || 'IDR (Rp)';
  
  return (
    <div className="space-y-5 px-1 pb-16">
      
      {/* Display Section */}
      <div className="card-dark rounded-xl shadow-lg overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 mx-2">
        <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
          <h2 className="text-base font-semibold text-white">Display</h2>
        </div>
        
        {/* Currency selector */}
        <div 
          className="flex items-center justify-between px-5 py-4 hover:bg-gray-700/30 active:bg-gray-700/50 transition-colors duration-150"
          onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
        >
          <span className="text-sm text-white font-medium">Currency</span>
          <div className="flex items-center text-gray-300">
            <span className="text-sm">{currentCurrencyLabel}</span>
            <svg 
              className={`h-5 w-5 ml-2 transition-transform duration-200 ${showCurrencyPicker ? 'rotate-90' : ''}`} 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {/* Currency options */}
        {showCurrencyPicker && (
          <div className="border-t border-gray-700/50 animate-fadeIn">
            {currencyOptions.map((option) => (
              <div 
                key={option.value}
                className={`px-5 py-3 flex items-center justify-between transition-colors duration-150 ${
                  currency === option.value 
                    ? 'bg-[#30BDF2] text-white' 
                    : 'text-gray-300 hover:bg-gray-700/30 active:bg-gray-700/50'
                }`}
                onClick={() => handleCurrencyChange(option.value)}
              >
                <span className="text-xs">{option.label}</span>
                {currency === option.value && (
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Account Section */}
      <div className="card-dark rounded-xl shadow-lg overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 mx-2">
        <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
          <h2 className="text-base font-semibold text-white">Account</h2>
        </div>
        
        <div className="p-4">
          <div className="bg-gray-800/30 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">
              Account settings will be available soon
            </p>
          </div>
        </div>
      </div>
      
      {/* App info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">Cuan App v1.0.0</p>
      </div>
    </div>
  );
} 