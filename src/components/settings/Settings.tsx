import { useEffect } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import SettingsDesktop from './SettingsDesktop';
import SettingsMobile from './SettingsMobile';

interface SettingsProps {
  isMobile: boolean;
}

export default function Settings({ isMobile }: SettingsProps) {
  usePageTitle('Settings');
  
  useEffect(() => {
    // Load saved currency setting from localStorage if it doesn't exist
    const savedCurrency = localStorage.getItem('currency');
    if (!savedCurrency) {
      // Set default to IDR if not saved yet
      localStorage.setItem('currency', 'IDR');
    }
  }, []);
  
  return isMobile ? <SettingsMobile /> : <SettingsDesktop />;
} 