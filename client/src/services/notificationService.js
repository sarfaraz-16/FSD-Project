import api from './api';

const READ_STORAGE_KEY = 'smarterp_read_notifications';
const DISMISSED_STORAGE_KEY = 'smarterp_dismissed_notifications';

export const getReadIds = () => {
  try {
    const saved = localStorage.getItem(READ_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const markAsRead = (id) => {
  try {
    const readIds = new Set(getReadIds());
    readIds.add(id);
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...readIds]));
  } catch (err) {
    console.error('Error saving read notification:', err);
  }
};

export const markAllAsRead = (ids) => {
  try {
    const readIds = new Set([...getReadIds(), ...ids]);
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...readIds]));
  } catch (err) {
    console.error('Error marking all as read:', err);
  }
};

export const getDismissedIds = () => {
  try {
    const saved = localStorage.getItem(DISMISSED_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const dismissNotification = (id) => {
  try {
    const dismissedIds = new Set(getDismissedIds());
    dismissedIds.add(id);
    localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify([...dismissedIds]));
  } catch (err) {
    console.error('Error dismissing notification:', err);
  }
};

export const clearAllNotifications = (ids) => {
  try {
    const dismissedIds = new Set([...getDismissedIds(), ...ids]);
    localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify([...dismissedIds]));
  } catch (err) {
    console.error('Error clearing notifications:', err);
  }
};

export const fetchNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    const { notifications = [], counts = {} } = response.data.data || {};
    
    const readIds = new Set(getReadIds());
    const dismissedIds = new Set(getDismissedIds());

    // Filter out dismissed notifications
    const activeNotifications = notifications.filter(n => !dismissedIds.has(n.id));

    // Calculate unread count
    const unreadCount = activeNotifications.filter(n => !readIds.has(n.id)).length;

    return {
      notifications: activeNotifications,
      unreadCount,
      readIds,
      counts
    };
  } catch (err) {
    console.error('Failed to fetch notifications:', err);
    return {
      notifications: [],
      unreadCount: 0,
      readIds: new Set(),
      counts: {}
    };
  }
};
