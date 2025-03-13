import React from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';
import {
  HomeIcon,
  CreditCardIcon,
  TagIcon,
  ArrowsRightLeftIcon,
  UserIcon,
  ArrowRightEndOnRectangleIcon 
} from '@heroicons/react/24/outline';

interface MobileLayoutProps {
  children?: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const location = useLocation();

  // Define menu items
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: HomeIcon },
    { name: 'Transactions', path: '/transactions', icon: ArrowsRightLeftIcon },
    { name: 'Accounts', path: '/accounts', icon: CreditCardIcon },
    { name: 'Categories', path: '/categories', icon: TagIcon },
    { name: 'Settings', path: '/settings', icon: UserIcon },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      {/* Mobile Header - Simplified, native-like header */}
      <header className="bg-[#0f172a] px-4 py-3 flex justify-between items-center z-10 shadow-sm">
        <h1 className="text-xl font-semibold text-[#30BDF2]">
          Cuan
        </h1>
        <Link
          to="/logout"
          className="text-red-400 p-2"
        >
          <ArrowRightEndOnRectangleIcon  className="h-5 w-5" />
        </Link>
      </header>

      {/* Main Content - Clean padding for content */}
      <main className="flex-1 px-3 py-3 overflow-auto">
        {children || <Outlet />}
      </main>

      {/* Mobile Bottom Navigation - More native-like tab bar */}
      <nav className="bg-[#0f172a] border-t border-gray-800 fixed bottom-0 w-full z-10">
        <div className="flex justify-around">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="py-2 flex flex-col items-center justify-center w-full"
              >
                <div className={`flex flex-col items-center ${isActive ? 'text-[#30BDF2]' : 'text-gray-400'}`}>
                  <Icon className={`h-6 w-6 ${isActive ? 'text-[#30BDF2]' : ''}`} />
                  <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Bottom Padding to prevent content from hiding behind the navigation bar */}
      <div className="h-16"></div>
    </div>
  );
} 