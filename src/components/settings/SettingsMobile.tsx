import { useState, useEffect } from 'react';
import { ChevronRightIcon, CheckIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import type { User } from '../../services/api';
import toast from 'react-hot-toast';
import { updateSW } from './Settings';
import { CURRENCY_OPTIONS, TIMEZONE_OPTIONS } from '../../utils/settingsOptions';

interface SettingsMobileProps {
  userInfo: User | null;
  isLoading: boolean;
}

export default function SettingsMobile({ userInfo, isLoading }: SettingsMobileProps) {
  const [currency, setCurrency] = useState('IDR');
  const [timezone, setTimezone] = useState('UTC');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showTimezonePicker, setShowTimezonePicker] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) setCurrency(savedCurrency);

    const savedTimezone = localStorage.getItem('timezone');
    if (savedTimezone) setTimezone(savedTimezone);
  }, []);

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    localStorage.setItem('currency', value);
    setShowCurrencyPicker(false);
  };

  const handleTimezoneChange = (value: string) => {
    setTimezone(value);
    localStorage.setItem('timezone', value);
    setShowTimezonePicker(false);
  };

  // Find the current currency label
  const currentCurrencyLabel = CURRENCY_OPTIONS.find(
    option => option.value === currency
  )?.label || 'IDR (Rp)';

  // Find the current timezone label (show short version)
  const currentTimezoneLabel = TIMEZONE_OPTIONS.find(
    option => option.value === timezone
  )?.label.split(' – ')[1] || timezone;
  
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
    <div className="space-y-5 px-1 pb-16">
      
      {/* Account Section */}
      <div className="card-dark rounded-xl shadow-lg overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 mx-2">
        <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
          <h2 className="text-base font-semibold text-white">Account</h2>
        </div>
        
        {isLoading ? (
          <div className="p-4">
            <div className="bg-gray-800/30 rounded-xl p-4">
              <div className="animate-pulse flex items-center">
                <div className="rounded-full bg-gray-700 h-10 w-10 mr-3"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        ) : userInfo ? (
          <div className="p-4">
            <div className="bg-gray-800/30 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <UserCircleIcon className="h-10 w-10 text-indigo-400 mr-3" />
                <div>
                  <h3 className="text-white font-medium">{userInfo.username}</h3>
                  <p className="text-gray-400 text-xs">{userInfo.email}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="bg-gray-800/30 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm">
                Failed to load user information
              </p>
            </div>
          </div>
        )}
      </div>
      
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
            <ChevronRightIcon 
              className={`h-5 w-5 ml-2 transition-transform duration-200 ${showCurrencyPicker ? 'rotate-90' : ''}`}
              aria-hidden="true"
            />
          </div>
        </div>
        
        {/* Currency options */}
        {showCurrencyPicker && (
          <div className="border-t border-gray-700/50 animate-fadeIn">
            {CURRENCY_OPTIONS.map((option) => (
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
                  <CheckIcon className="h-4 w-4" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Timezone selector */}
        <div
          className="flex items-center justify-between px-5 py-4 border-t border-gray-700/50 hover:bg-gray-700/30 active:bg-gray-700/50 transition-colors duration-150"
          onClick={() => setShowTimezonePicker(!showTimezonePicker)}
        >
          <span className="text-sm text-white font-medium">Timezone</span>
          <div className="flex items-center text-gray-300">
            <span className="text-sm truncate max-w-36">{currentTimezoneLabel}</span>
            <ChevronRightIcon
              className={`h-5 w-5 ml-2 flex-shrink-0 transition-transform duration-200 ${showTimezonePicker ? 'rotate-90' : ''}`}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Timezone options */}
        {showTimezonePicker && (
          <div className="border-t border-gray-700/50 animate-fadeIn">
            {TIMEZONE_OPTIONS.map((option) => (
              <div
                key={option.value}
                className={`px-5 py-3 flex items-center justify-between transition-colors duration-150 ${
                  timezone === option.value
                    ? 'bg-[#30BDF2] text-white'
                    : 'text-gray-300 hover:bg-gray-700/30 active:bg-gray-700/50'
                }`}
                onClick={() => handleTimezoneChange(option.value)}
              >
                <span className="text-xs">{option.label}</span>
                {timezone === option.value && (
                  <CheckIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* App Updates Section */}
      <div className="card-dark rounded-xl shadow-lg overflow-hidden bg-gradient-to-b from-gray-800 to-gray-900 mx-2">
        <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
          <h2 className="text-base font-semibold text-white">App Updates</h2>
        </div>
        
        <div className="p-4 relative">
          <button
            onClick={checkForUpdates}
            disabled={isCheckingUpdate}
            className="w-full text-center py-3 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            {!isCheckingUpdate && "Check for Updates"}
          </button>
          
          {isCheckingUpdate && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 rounded-lg backdrop-blur-sm">
              <div className="px-6 py-4 bg-gray-800/90 rounded-xl shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#30BDF2]"></div>
                  <p className="text-sm text-gray-200">Updating...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* App info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">Cuan App v1.0.3</p>
      </div>
    </div>
  );
} 