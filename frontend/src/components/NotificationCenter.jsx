import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Clock, 
  Mail,
  AlertCircle,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/axios';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'actionable'

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
      // Refresh full list if panel is open
      if (isOpen) {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Refresh notifications when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.log('No userId found, skipping notification fetch');
        setLoading(false);
        return;
      }

      console.log('Fetching notifications for userId:', userId);
      const response = await api.get('/notifications', {
        params: { userId, limit: 50 }
      });

      console.log('Notifications API response:', response.data);
      
      if (response.data.success) {
        const notifications = response.data.data?.notifications || [];
        const unreadCount = response.data.data?.unreadCount || 0;
        console.log(`Loaded ${notifications.length} notifications, ${unreadCount} unread`);
        setNotifications(notifications);
        setUnreadCount(unreadCount);
      } else {
        console.warn('Notification API returned success: false', response.data);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Set empty state on error instead of failing silently
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const response = await api.get('/notifications/unread-count', {
        params: { userId }
      });

      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Set to 0 on error
      setUnreadCount(0);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const userId = localStorage.getItem('userId');
      await api.post(`/notifications/${notificationId}/read`, { userId });
      
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, status: 'read' }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const userId = localStorage.getItem('userId');
      await api.post('/notifications/mark-all-read', { userId });
      
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, status: 'read' }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleAccept = async (notificationId) => {
    try {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('username');
      
      await api.post(`/notifications/${notificationId}/accept`, {
        userId,
        userName
      });
      
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, status: 'accepted' }
            : notification
        )
      );
      
      toast.success('Invitation accepted successfully!');
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error accepting notification:', error);
      toast.error('Failed to accept invitation');
    }
  };

  const handleDecline = async (notificationId) => {
    try {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('username');
      
      await api.post(`/notifications/${notificationId}/decline`, {
        userId,
        userName
      });
      
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, status: 'declined' }
            : notification
        )
      );
      
      toast.success('Invitation declined');
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error declining notification:', error);
      toast.error('Failed to decline invitation');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const userId = localStorage.getItem('userId');
      await api.delete(`/notifications/${notificationId}`, {
        data: { userId }
      });
      
      setNotifications(prev =>
        prev.filter(notification => notification._id !== notificationId)
      );
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'study_group_invitation':
      case 'study_group_join_request':
        return <Users className="w-4 h-4" />;
      case 'study_group_accepted':
      case 'study_group_rejected':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'study_group_invitation':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'study_group_join_request':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'study_group_accepted':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'study_group_rejected':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      case 'high':
        return <AlertCircle className="w-3 h-3 text-orange-500" />;
      default:
        return null;
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return notification.status === 'pending';
      case 'actionable':
        return notification.actionRequired && notification.status === 'pending';
      default:
        return true;
    }
  });

  return (
    <div className="relative">
      {/* Notification Bell */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.div>
        )}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-96 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-white">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'unread', label: 'Unread' },
                  { key: 'actionable', label: 'Action Required' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      filter === tab.key
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Actions */}
              {unreadCount > 0 && (
                <div className="mt-3">
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
                  <p className="text-slate-400 mt-2">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">
                    {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {filteredNotifications.map(notification => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        notification.status === 'pending'
                          ? 'bg-slate-700/30 border-slate-600/50'
                          : 'bg-slate-700/10 border-slate-700/30 opacity-75'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-semibold text-white truncate">
                              {notification.title}
                            </h4>
                            {getPriorityIcon(notification.priority)}
                            {notification.status === 'pending' && (
                              <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          
                          <p className="text-sm text-slate-300 mb-2 line-clamp-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              <span>{formatTimeAgo(notification.createdAt)}</span>
                            </div>

                            <div className="flex items-center space-x-1">
                              {notification.status === 'pending' && !notification.actionRequired && (
                                <button
                                  onClick={() => markAsRead(notification._id)}
                                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-600/50 rounded transition-colors"
                                  title="Mark as read"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                              )}
                              
                              <button
                                onClick={() => deleteNotification(notification._id)}
                                className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {notification.actionRequired && notification.status === 'pending' && (
                            <div className="flex space-x-2 mt-3">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleAccept(notification._id)}
                                className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Accept</span>
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleDecline(notification._id)}
                                className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-1"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Decline</span>
                              </motion.button>
                            </div>
                          )}

                          {/* Status Badge */}
                          {notification.status !== 'pending' && (
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                notification.status === 'accepted'
                                  ? 'bg-green-500/20 text-green-400'
                                  : notification.status === 'declined'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-slate-500/20 text-slate-400'
                              }`}>
                                {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationCenter;
