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
import {
  HomeIcon as HomeIconSolid,
  CreditCardIcon as CreditCardIconSolid,
  TagIcon as TagIconSolid,
  ArrowsRightLeftIcon as ArrowsRightLeftIconSolid,
  UserIcon as UserIconSolid,
} from '@heroicons/react/24/solid';

interface MobileLayoutProps {
  children?: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const location = useLocation();

  const menuItems = [
    { name: 'Home', path: '/', Icon: HomeIcon, IconSolid: HomeIconSolid },
    { name: 'Transactions', path: '/transactions', Icon: ArrowsRightLeftIcon, IconSolid: ArrowsRightLeftIconSolid },
    { name: 'Accounts', path: '/accounts', Icon: CreditCardIcon, IconSolid: CreditCardIconSolid },
    { name: 'Categories', path: '/categories', Icon: TagIcon, IconSolid: TagIconSolid },
    { name: 'Settings', path: '/settings', Icon: UserIcon, IconSolid: UserIconSolid },
  ];

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Dashboard';
    const item = menuItems.find(i => i.path === location.pathname);
    return item ? (item.name === 'Home' ? 'Dashboard' : item.name) : 'Cuan';
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0b1120' }}>
      {/* Header */}
      <header className="px-4 py-3 flex justify-between items-center z-10 flex-shrink-0"
        style={{
          background: 'linear-gradient(90deg, #0d1528 0%, #0a1020 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(48,189,242,0.2) 0%, rgba(48,189,242,0.05) 100%)',
              border: '1px solid rgba(48,189,242,0.25)',
            }}
          >
            <span className="text-xs font-black text-[#30BDF2]">₡</span>
          </div>
          <span className="text-base font-semibold text-gray-100">{getPageTitle()}</span>
        </div>
        <Link
          to="/logout"
          className="p-2 rounded-xl text-gray-500 hover:text-red-400 transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <ArrowRightEndOnRectangleIcon className="h-5 w-5" />
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 px-3 py-3 overflow-auto">
        {children || <Outlet />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full z-10 flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, rgba(10,16,32,0.97) 0%, rgba(13,21,40,1) 100%)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.4)'
        }}
      >
        <div className="flex justify-around py-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = isActive ? item.IconSolid : item.Icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center w-full py-1 transition-all duration-200"
              >
                <div className={`relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-200 ${
                  isActive ? 'bottom-nav-item-active' : 'bottom-nav-item-inactive'
                }`}
                  style={isActive ? {
                    background: 'rgba(48,189,242,0.1)',
                  } : {}}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-[#30BDF2]' : 'text-gray-500'}`} />
                  <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-[#30BDF2]' : 'text-gray-500'}`}>
                    {item.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        {/* Safe area padding */}
        <div className="h-safe-bottom" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </nav>

      {/* Bottom spacer */}
      <div className="h-20" />
    </div>
  );
}
