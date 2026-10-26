import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Check, CheckCheck, Trash2, AlertTriangle, AlertCircle, 
  ShoppingCart, ExternalLink, RefreshCw, X 
} from 'lucide-react';
import { 
  fetchNotifications, markAsRead, markAllAsRead, 
  dismissNotification, clearAllNotifications 
} from '../../services/notificationService';

const NotificationDropdown = ({ isOpen, onClose, onCountChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readIds, setReadIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setReadIds(data.readIds || new Set());
      if (onCountChange) {
        onCountChange(data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleMarkAsRead = (id, e) => {
    e?.stopPropagation();
    markAsRead(id);
    const updated = new Set(readIds);
    updated.add(id);
    setReadIds(updated);
    const newUnread = notifications.filter(n => !updated.has(n.id)).length;
    setUnreadCount(newUnread);
    if (onCountChange) onCountChange(newUnread);
  };

  const handleMarkAllRead = () => {
    const allIds = notifications.map(n => n.id);
    markAllAsRead(allIds);
    const updated = new Set([...readIds, ...allIds]);
    setReadIds(updated);
    setUnreadCount(0);
    if (onCountChange) onCountChange(0);
  };

  const handleDismiss = (id, e) => {
    e?.stopPropagation();
    dismissNotification(id);
    const remaining = notifications.filter(n => n.id !== id);
    setNotifications(remaining);
    const newUnread = remaining.filter(n => !readIds.has(n.id)).length;
    setUnreadCount(newUnread);
    if (onCountChange) onCountChange(newUnread);
  };

  const handleClearAll = () => {
    const allIds = notifications.map(n => n.id);
    clearAllNotifications(allIds);
    setNotifications([]);
    setUnreadCount(0);
    if (onCountChange) onCountChange(0);
  };

  const handleItemClick = (notification) => {
    handleMarkAsRead(notification.id);
    onClose();
    if (notification.link) {
      navigate(notification.link);
    }
  };

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'inventory') return item.category === 'inventory';
    if (activeTab === 'orders') return item.category === 'orders';
    return item.category === activeTab;
  });

  const inventoryCount = notifications.filter(n => n.category === 'inventory').length;
  const ordersCount = notifications.filter(n => n.category === 'orders').length;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-12 w-96 max-w-[92vw] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 flex flex-col max-h-[80vh] animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-primary" />
          <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={loadData}
            title="Refresh alerts"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              title="Mark all as read"
              className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
            >
              <CheckCheck size={16} />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-100 px-3 bg-white text-xs font-medium gap-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-2 px-3 border-b-2 transition-colors ${
            activeTab === 'all' 
              ? 'border-primary text-primary font-semibold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-2 px-3 border-b-2 transition-colors ${
            activeTab === 'inventory' 
              ? 'border-primary text-primary font-semibold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Inventory ({inventoryCount})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2 px-3 border-b-2 transition-colors ${
            activeTab === 'orders' 
              ? 'border-primary text-primary font-semibold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Orders ({ordersCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {loading && notifications.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs">Checking alerts...</span>
          </div>
        )}

        {!loading && filteredNotifications.length === 0 && (
          <div className="py-12 px-6 text-center text-slate-500">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check size={24} />
            </div>
            <p className="font-semibold text-slate-800 text-sm">All caught up!</p>
            <p className="text-xs text-slate-400 mt-1">No alerts in this category right now.</p>
          </div>
        )}

        {!loading && filteredNotifications.map((item) => {
          const isRead = readIds.has(item.id);
          const isCritical = item.severity === 'critical';
          const isWarning = item.severity === 'warning';

          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`p-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer flex gap-3 relative ${
                !isRead ? 'bg-primary/5' : ''
              }`}
            >
              {/* Unread indicator */}
              {!isRead && (
                <span className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-primary"></span>
              )}

              {/* Icon badge */}
              <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${
                isCritical 
                  ? 'bg-red-100 text-red-600' 
                  : isWarning 
                  ? 'bg-amber-100 text-amber-600' 
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {item.category === 'inventory' ? (
                  isCritical ? <AlertCircle size={18} /> : <AlertTriangle size={18} />
                ) : (
                  <ShoppingCart size={18} />
                )}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`text-xs font-semibold truncate ${!isRead ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleDismiss(item.id, e)}
                      title="Dismiss"
                      className="p-1 text-slate-300 hover:text-slate-600 hover:bg-slate-200/50 rounded transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                  {item.message}
                </p>

                {/* Action CTA & status */}
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/60">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-hover transition-colors"
                  >
                    <span>{item.actionLabel || 'View Details'}</span>
                    <ExternalLink size={11} />
                  </button>

                  {!isRead ? (
                    <button
                      onClick={(e) => handleMarkAsRead(item.id, e)}
                      title="Mark as read"
                      className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Mark read
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">Read</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{notifications.length} total alert(s)</span>
          <button
            onClick={handleClearAll}
            className="text-red-500 hover:text-red-700 font-medium transition-colors flex items-center gap-1"
          >
            <Trash2 size={12} />
            <span>Clear all</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
