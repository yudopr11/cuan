import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import type { User } from '../../services/api';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { registerSW } from 'virtual:pwa-register';
import toast from 'react-hot-toast';

interface SettingsDesktopProps {
  userInfo: User | null;
  isLoading: boolean;
}

export default function SettingsDesktop({ userInfo, isLoading }: SettingsDesktopProps) {
  const [activeTab, setActiveTab] = useState('currency');
  const [currency, setCurrency] = useState('IDR');
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  
  // Get the updateSW function
  const updateSW = registerSW({
    onNeedRefresh() {},
    onOfflineReady() {}
  });
  
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
  
  // Handle manual update check
  const checkForUpdates = async () => {
    setIsCheckingUpdate(true);
    try {
      await updateSW(true);
      toast.success('App is up to date!');
    } catch (error) {
      console.error('Update check failed:', error);
      toast.error('Failed to check for updates');
    } finally {
      setIsCheckingUpdate(false);
    }
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
          <button
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === 'updates'
                ? 'border-b-2 border-indigo-500 text-indigo-400'
                : 'text-gray-300 hover:text-gray-100'
            }`}
            onClick={() => setActiveTab('updates')}
          >
            Updates
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
                <div className="relative w-64">
                  <select
                    id="currency"
                    name="currency"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 appearance-none pr-10"
                    value={currency}
                    onChange={handleCurrencyChange}
                  >
                    <option value="IDR">IDR (Rp)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="SGD">SGD (S$)</option>
                    <option value="MYR">MYR (RM)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  This setting only affects how currency is displayed, not the stored values.
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'account' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Account Settings</h3>
              
              {isLoading ? (
                <div className="animate-pulse bg-gray-700 h-16 rounded-md"></div>
              ) : userInfo ? (
                <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center">
                    <UserCircleIcon className="h-10 w-10 text-indigo-400 mr-3" />
                    <div>
                      <h4 className="text-white font-medium">{userInfo.username}</h4>
                      <p className="text-gray-400 text-sm">{userInfo.email}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">Unable to load account information</p>
              )}
            </div>
          )}
          
          {activeTab === 'updates' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">App Updates</h3>
              <div className="relative w-48">
                <button
                  onClick={checkForUpdates}
                  disabled={isCheckingUpdate}
                  className="text-center py-3 px-6 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors duration-200 w-full"
                >
                  {!isCheckingUpdate && "Check for Updates"}
                </button>
                
                {isCheckingUpdate && (
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-10 rounded-lg backdrop-blur-sm">
                    <div className="px-6 py-4 bg-gray-800/90 rounded-xl shadow-xl">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#30BDF2]"></div>
                        <p className="text-sm text-gray-200">Updating...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-400">
                Checking for updates will ensure you have the latest version of the app.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 