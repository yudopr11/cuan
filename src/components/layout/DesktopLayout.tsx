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

interface DesktopLayoutProps {
  children?: React.ReactNode;
}

export default function DesktopLayout({ children }: DesktopLayoutProps) {
  const location = useLocation();

  // Define menu items
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: HomeIcon },
    { name: 'Transactions', path: '/transactions', icon: ArrowsRightLeftIcon },
    { name: 'Accounts', path: '/accounts', icon: CreditCardIcon },
    { name: 'Categories', path: '/categories', icon: TagIcon },
    { name: 'Settings', path: '/settings', icon: UserIcon },
    { name: 'Logout', path: '/logout', icon: ArrowRightEndOnRectangleIcon  }
  ];

  // Get current page title
  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.name : 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-[#0f172a] shadow-md hidden md:block">
        <div className="h-20 flex items-center justify-start px-4 border-b border-gray-700">
          <div>
            <h1 className="text-3xl font-bold text-[#30BDF2] tracking-wide">
              Cuan
            </h1>
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-md ${
                      location.pathname === item.path
                        ? 'bg-[#1e3a8a] border-l-4 border-[#30BDF2] text-white font-medium hover:bg-[#1e3a8a] hover:text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mr-3 ${location.pathname === item.path ? 'text-[#30BDF2]' : ''}`} />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          
          <div className="mt-8 pt-6 border-t border-gray-700">
            <Link
              to="/logout"
              className="flex items-center px-4 py-3 rounded-md text-red-400 hover:bg-gray-800 hover:text-red-400"
            >
              <ArrowRightEndOnRectangleIcon  className="h-5 w-5 mr-3" />
              <span>Log Out</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#0f172a] shadow-sm h-16 flex items-center px-6">
          <h1 className="text-xl font-semibold text-gray-100">{getPageTitle()}</h1>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
} 