import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';
import {
  HomeIcon,
  CreditCardIcon,
  TagIcon,
  ArrowsRightLeftIcon,
  UserIcon,
  ArrowRightEndOnRectangleIcon,
  Bars3Icon,
  ChevronLeftIcon,
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

// Window width at which the sidebar auto-collapses (once — never auto-expands)
const AUTO_COLLAPSE_WIDTH = 900;

export default function DesktopLayout({ children }: DesktopLayoutProps) {
  const location = useLocation();

  // collapsed: sidebar is in icon-only mode
  // overlayOpen: sidebar is expanded but floats over content (small-screen mode)
  const [collapsed, setCollapsed] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  // Tracks whether we are currently in a small-screen context (set by ResizeObserver)
  const isSmallScreen = useRef(false);

  const menuItems = [
    { name: 'Dashboard', path: '/', Icon: HomeIcon, IconSolid: HomeIconSolid },
    { name: 'Transactions', path: '/transactions', Icon: ArrowsRightLeftIcon, IconSolid: ArrowsRightLeftIconSolid },
    { name: 'Accounts', path: '/accounts', Icon: CreditCardIcon, IconSolid: CreditCardIconSolid },
    { name: 'Categories', path: '/categories', Icon: TagIcon, IconSolid: TagIconSolid },
    { name: 'Settings', path: '/settings', Icon: UserIcon, IconSolid: UserIconSolid },
  ];

  // Auto-collapse when window narrows — never auto-expand
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width < AUTO_COLLAPSE_WIDTH) {
          isSmallScreen.current = true;
          setCollapsed(true);
          setOverlayOpen(false);
        } else {
          // Update context so future manual toggles know they can expand normally
          isSmallScreen.current = false;
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleToggle = () => {
    if (overlayOpen) {
      // Close the overlay
      setOverlayOpen(false);
    } else if (collapsed) {
      // Expand — overlay mode on small screen, normal push on large screen
      if (isSmallScreen.current) {
        setOverlayOpen(true);
      } else {
        setCollapsed(false);
      }
    } else {
      // Collapse manually
      setCollapsed(true);
    }
  };

  // Sidebar content is "visible" (labels shown) when expanded OR overlay is open
  const showLabels = !collapsed || overlayOpen;

  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.name : 'Dashboard';
  };

  const sidebarStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, #0d1528 0%, #0a1020 100%)',
    borderRight: '1px solid rgba(255,255,255,0.05)',
    boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
    width: showLabels ? 256 : 64,
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div
        className="h-20 flex items-center shrink-0 overflow-hidden"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: showLabels ? '0 24px' : '0 12px',
          justifyContent: showLabels ? 'flex-start' : 'center',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(48,189,242,0.2) 0%, rgba(48,189,242,0.05) 100%)',
              border: '1px solid rgba(48,189,242,0.25)',
              boxShadow: '0 0 16px rgba(48,189,242,0.12)',
            }}
          >
            <span className="text-base font-black text-[#30BDF2]">₡</span>
          </div>
          {showLabels && (
            <div className="min-w-0">
              <h1
                className="text-xl font-black tracking-tight whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, #30BDF2 0%, #83e0ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Cuan
              </h1>
              <p className="text-gray-500 text-xs leading-none">Money Manager</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 py-5 space-y-1 overflow-y-auto overflow-x-hidden"
        style={{ padding: showLabels ? '20px 12px' : '20px 8px' }}
      >
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = isActive ? item.IconSolid : item.Icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={showLabels ? undefined : item.name}
              onClick={() => overlayOpen && setOverlayOpen(false)}
              className={`flex items-center rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive ? 'text-white nav-item-active' : 'text-gray-400 nav-item-inactive'
              }`}
              style={{
                padding: showLabels ? '10px 12px' : '10px',
                justifyContent: showLabels ? 'flex-start' : 'center',
              }}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${isActive ? 'text-[#30BDF2]' : ''}`}
                style={{ marginRight: showLabels ? '12px' : 0 }}
              />
              {showLabels && (
                <>
                  <span className="whitespace-nowrap">{item.name}</span>
                  {isActive && (
                    <span
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-[#30BDF2]"
                      style={{ boxShadow: '0 0 6px rgba(48,189,242,0.8)' }}
                    />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: showLabels ? '20px 12px' : '20px 8px',
        }}
      >
        <Link
          to="/logout"
          title={showLabels ? undefined : 'Log Out'}
          onClick={() => overlayOpen && setOverlayOpen(false)}
          className="flex items-center rounded-xl text-sm font-medium text-red-400 hover:text-red-300 transition-all duration-150"
          style={{
            padding: showLabels ? '10px 12px' : '10px',
            justifyContent: showLabels ? 'flex-start' : 'center',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <ArrowRightEndOnRectangleIcon
            className="h-5 w-5 shrink-0"
            style={{ marginRight: showLabels ? '12px' : 0 }}
          />
          {showLabels && <span className="whitespace-nowrap">Log Out</span>}
        </Link>
      </div>
    </>
  );

  return (
    <div ref={containerRef} className="flex h-screen" style={{ background: '#0b1120' }}>

      {/* ── Normal in-flow sidebar (large screen) ── */}
      {!overlayOpen && (
        <aside
          className="hidden md:flex flex-col shrink-0 overflow-hidden transition-[width] duration-300"
          style={sidebarStyle}
        >
          <SidebarContent />
        </aside>
      )}

      {/* ── Overlay sidebar (small screen, floats over content) ── */}
      {overlayOpen && (
        <>
          {/* Collapsed placeholder so content doesn't jump */}
          <div className="hidden md:block shrink-0" style={{ width: 64 }} />

          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 hidden md:block"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
            onClick={() => setOverlayOpen(false)}
          />

          {/* Floating sidebar */}
          <aside
            className="hidden md:flex flex-col fixed left-0 top-0 h-screen z-50 overflow-hidden transition-[width] duration-300"
            style={sidebarStyle}
          >
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header
          className="h-16 flex items-center px-6 gap-4 shrink-0"
          style={{
            background: 'linear-gradient(90deg, #0d1528 0%, #0a1020 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}
        >
          <button
            onClick={handleToggle}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-100 transition-colors shrink-0"
            style={{ background: 'rgba(255,255,255,0.04)' }}
            title={showLabels ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {showLabels
              ? <ChevronLeftIcon className="h-5 w-5" />
              : <Bars3Icon className="h-5 w-5" />
            }
          </button>

          <div className="flex items-center gap-3">
            <div
              className="w-1 h-5 rounded-full shrink-0"
              style={{ background: 'linear-gradient(180deg, #30BDF2, #2DAAE0)' }}
            />
            <h1 className="text-lg font-semibold text-gray-100 whitespace-nowrap">{getPageTitle()}</h1>
          </div>
        </header>

        {/* Content */}
        <main
          className="flex-1 overflow-auto p-6"
          style={{ background: 'linear-gradient(135deg, #0b1120 0%, #0d1420 100%)' }}
        >
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
