import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import Login from './components/auth/Login';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './components/dashboard/Dashboard';
import Accounts from './components/accounts/Accounts';
import Categories from './components/categories/Categories';
import Transactions from './components/transactions/Transactions';
import Settings from './components/settings/Settings';
import LogoutHandler from './components/auth/LogoutHandler';
import MobileDetect from './utils/MobileDetect';

export default function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if the device is mobile
    const detectMobile = () => {
      setIsMobile(MobileDetect.isMobile());
    };

    // Initial detection
    detectMobile();

    // Add listener for screen resize
    window.addEventListener('resize', detectMobile);

    // Cleanup
    return () => {
      window.removeEventListener('resize', detectMobile);
    };
  }, []);

  return (
    <Router>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #475569'
          },
          success: {
            iconTheme: {
              primary: '#30BDF2',
              secondary: '#1e293b',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1e293b',
            },
          },
        }}
      />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Money Manager Routes */}
        <Route path="/" element={<MainLayout isMobile={isMobile} />}>
          <Route index element={<Dashboard isMobile={isMobile} />} />
          <Route path="accounts" element={<Accounts isMobile={isMobile} />} />
          <Route path="categories" element={<Categories isMobile={isMobile} />} />
          <Route path="transactions" element={<Transactions isMobile={isMobile} />} />
          <Route path="settings" element={<Settings isMobile={isMobile} />} />
        </Route>
        <Route path="/logout" element={<LogoutHandler />} />
        
        {/* Redirect any unknown routes to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
} 