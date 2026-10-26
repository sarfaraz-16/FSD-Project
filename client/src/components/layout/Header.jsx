import React, { useEffect, useState, useCallback } from 'react';
import { Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import GlobalSearchModal from '../common/GlobalSearchModal';
import NotificationDropdown from '../common/NotificationDropdown';
import { fetchNotifications } from '../../services/notificationService';

const Header = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  const title = pathParts.length > 0 ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1) : 'Dashboard';
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasCriticalAlert, setHasCriticalAlert] = useState(false);
  const [showBadge, setShowBadge] = useState(true);

  // Load notification count and check stock settings
  const refreshNotificationStatus = useCallback(async () => {
    try {
      const data = await fetchNotifications();
      setUnreadCount(data.unreadCount || 0);
      setHasCriticalAlert((data.counts?.critical || 0) > 0);

      // Check user preference from Settings
      const savedSettings = localStorage.getItem('smarterp_stock_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setShowBadge(parsed.enableLowStockBadge !== false);
      }
    } catch (err) {
      console.error('Error fetching notification status:', err);
    }
  }, []);

  useEffect(() => {
    refreshNotificationStatus();
  }, [location.pathname, refreshNotificationStatus]);

  // Global keyboard shortcut: Ctrl+K or Cmd+K opens search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-20 bg-background flex items-center justify-between px-6 sm:px-8 border-b border-slate-200/60 sticky top-0 z-30 backdrop-blur-md bg-white/95">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">{title}</h1>
          <div className="text-xs sm:text-sm text-slate-500 mt-0.5 flex items-center space-x-2">
            <span>Home</span>
            {pathParts.length > 0 && (
              <>
                <span>/</span>
                <span className="text-primary capitalize font-medium">{title}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Quick Search Bar Trigger (Expanded on md+, compact on mobile) */}
          <div 
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center gap-2.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 rounded-xl text-slate-400 text-sm cursor-pointer transition-all hover:border-slate-300 w-64 lg:w-80 shadow-2xs group"
            title="Global Search (Ctrl+K)"
          >
            <Search size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
            <span className="truncate flex-1 text-slate-400 group-hover:text-slate-600 text-xs">
              Search products, orders, partners...
            </span>
            <kbd className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs font-mono">
              Ctrl K
            </kbd>
          </div>

          {/* Compact Mobile Search Button */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors"
            title="Global Search"
          >
            <Search size={19} />
          </button>

          {/* Notification Bell Container with Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(prev => !prev)}
              className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
                isNotificationsOpen 
                  ? 'bg-primary/10 border-primary text-primary' 
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary'
              }`}
              title="System Alerts & Notifications"
            >
              <Bell size={19} />
              
              {showBadge && unreadCount > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white shadow-xs">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                  {hasCriticalAlert && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-400 animate-ping opacity-75"></span>
                  )}
                </>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            <NotificationDropdown 
              isOpen={isNotificationsOpen} 
              onClose={() => setIsNotificationsOpen(false)}
              onCountChange={setUnreadCount}
            />
          </div>
        </div>
      </header>

      {/* Global Command Palette / Search Dialog */}
      <GlobalSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
};

export default Header;
