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

interface DesktopLayoutProps {
  children?: React.ReactNode;
}

export default function DesktopLayout({ children }: DesktopLayoutProps) {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', Icon: HomeIcon, IconSolid: HomeIconSolid },
    { name: 'Transactions', path: '/transactions', Icon: ArrowsRightLeftIcon, IconSolid: ArrowsRightLeftIconSolid },
    { name: 'Accounts', path: '/accounts', Icon: CreditCardIcon, IconSolid: CreditCardIconSolid },
    { name: 'Categories', path: '/categories', Icon: TagIcon, IconSolid: TagIconSolid },
    { name: 'Settings', path: '/settings', Icon: UserIcon, IconSolid: UserIconSolid },
  ];

  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.name : 'Dashboard';
  };

  return (
    <div className="flex h-screen" style={{ background: '#0b1120' }}>
      {/* Sidebar */}
      <div className="w-64 hidden md:flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #0d1528 0%, #0a1020 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.4)'
        }}
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-6"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(48,189,242,0.2) 0%, rgba(48,189,242,0.05) 100%)',
                border: '1px solid rgba(48,189,242,0.25)',
                boxShadow: '0 0 16px rgba(48,189,242,0.12)'
              }}
            >
              <span className="text-base font-black text-[#30BDF2]">₡</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #30BDF2 0%, #83e0ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                Cuan
              </h1>
              <p className="text-gray-500 text-xs leading-none">Money Manager</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = isActive ? item.IconSolid : item.Icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-white nav-item-active'
                    : 'text-gray-400 nav-item-inactive'
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 flex-shrink-0 ${isActive ? 'text-[#30BDF2]' : ''}`} />
                <span>{item.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#30BDF2]"
                    style={{ boxShadow: '0 0 6px rgba(48,189,242,0.8)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}
        >
          <Link
            to="/logout"
            className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 transition-all duration-150"
            style={{ ':hover': { background: 'rgba(239,68,68,0.08)' } } as React.CSSProperties}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <ArrowRightEndOnRectangleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
            <span>Log Out</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center px-8 flex-shrink-0"
          style={{
            background: 'linear-gradient(90deg, #0d1528 0%, #0a1020 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full"
              style={{ background: 'linear-gradient(180deg, #30BDF2, #2DAAE0)' }}
            />
            <h1 className="text-lg font-semibold text-gray-100">{getPageTitle()}</h1>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6"
          style={{ background: 'linear-gradient(135deg, #0b1120 0%, #0d1420 100%)' }}
        >
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
