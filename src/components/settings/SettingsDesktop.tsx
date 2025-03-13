import { useState, useEffect } from 'react';

export default function SettingsDesktop() {
  const [activeTab, setActiveTab] = useState('currency');
  const [currency, setCurrency] = useState('IDR');
  
  useEffect(() => {
    // Load saved currency setting from localStorage
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);
  
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {/* No need for title here, it's in the layout */}
      </div>
      
      {/* Settings Tabs */}
      <div className="card-dark rounded-lg shadow overflow-hidden">
        {/* Tab headers */}
        <div className="flex border-b border-gray-700">
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === 'currency'
                ? 'border-b-2 border-indigo-500 text-indigo-400'
                : 'text-gray-300 hover:text-gray-100'
            }`}
            onClick={() => setActiveTab('currency')}
          >
            Currency
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === 'account'
                ? 'border-b-2 border-indigo-500 text-indigo-400'
                : 'text-gray-300 hover:text-gray-100'
            }`}
            onClick={() => setActiveTab('account')}
          >
            Account
          </button>
        </div>
        
        {/* Tab content */}
        <div className="p-4">
          {activeTab === 'currency' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Currency Settings</h3>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-300 mb-1">
                  Display Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  className="w-64 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                  value={currency}
                  onChange={handleCurrencyChange}
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                    backgroundPosition: 'right 0.5rem center', 
                    backgroundRepeat: 'no-repeat', 
                    backgroundSize: '1.5em 1.5em', 
                    paddingRight: '2.5rem' 
                  }}
                >
                  <option value="IDR">IDR (Rp)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="SGD">SGD (S$)</option>
                  <option value="MYR">MYR (RM)</option>
                </select>
                <p className="mt-2 text-sm text-gray-400">
                  This setting only affects how currency is displayed, not the stored values.
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'account' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Account Settings</h3>
              {/* Account settings will go here in the future */}
              <p className="text-gray-400">Account management options will be added in future updates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 