import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DesktopLayout from './DesktopLayout';
import MobileLayout from './MobileLayout';
// import { isMobile } from '../../utils/deviceDetection';

interface MainLayoutProps {
  children?: React.ReactNode;
  isMobile: boolean;
}

export default function MainLayout({ children, isMobile }: MainLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  if (!isAuthenticated) {
    return null; // Don't render anything until authentication check is complete
  }

  // Render layout based on device type
  return isMobile ? 
    <MobileLayout children={children} /> : 
    <DesktopLayout children={children} />;
} 