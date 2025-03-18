import { useEffect, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import SettingsDesktop from './SettingsDesktop';
import SettingsMobile from './SettingsMobile';
import { getUserInfo, type User } from '../../services/api';
import toast from 'react-hot-toast';

interface SettingsProps {
  isMobile: boolean;
}

export default function Settings({ isMobile }: SettingsProps) {
  usePageTitle('Settings');
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Load saved currency setting from localStorage if it doesn't exist
    const savedCurrency = localStorage.getItem('currency');
    if (!savedCurrency) {
      // Set default to IDR if not saved yet
      localStorage.setItem('currency', 'IDR');
    }
    
    // Fetch user info
    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        const userData = await getUserInfo();
        setUserInfo(userData);
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        toast.error('Failed to load user information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserInfo();
  }, []);
  
  return isMobile ? 
    <SettingsMobile userInfo={userInfo} isLoading={isLoading} /> : 
    <SettingsDesktop userInfo={userInfo} isLoading={isLoading} />;
} 