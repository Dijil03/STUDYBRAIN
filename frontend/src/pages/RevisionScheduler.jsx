import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, isPast, isToday, isTomorrow, parseISO } from 'date-fns';
import Navbar from '../components/Navbar';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import {
  Brain,
  Plus,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  BookOpen,
  Target,
  Zap,
  RefreshCw,
  Edit,
  Trash2,
  Bell,
  BellOff,
  Settings,
  BarChart3,
  Filter,
  Search,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const RevisionScheduler = () => {
  const { theme } = useTheme();
  const userId = localStorage.getItem('userId');
  
  const [revisions, setRevisions] = useState([]);
  const [dueItems, setDueItems] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('due'); // 'due', 'all', 'statistics'
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reviewQuality, setReviewQuality] = useState(4);
  const [filterSubject, setFilterSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const [newRevision, setNewRevision] = useState({
    title: '',
    content: '',
    subject: 'General',
    tags: [],
    syncToCalendar: false
  });

  useEffect(() => {
    if (userId) {
      fetchRevisions();
      fetchStatistics();
      checkNotificationPermission();
    }
  }, [userId]);

  useEffect(() => {
    if (revisions.length > 0) {
      fetchDueItems();
    }
  }, [revisions]);

  useEffect(() => {
    if (notificationsEnabled && dueItems.length > 0) {
      setupNotifications();
    }
  }, [notificationsEnabled, dueItems]);

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

  const setupNotifications = () => {
    // Check for due items and send notifications
    const now = new Date();
    dueItems.forEach(item => {
      const reviewDate = new Date(item.nextReview);
      const timeUntilReview = reviewDate.getTime() - now.getTime();
      
      // Notify if review is due or within 1 hour
      if (timeUntilReview <= 0 || (timeUntilReview > 0 && timeUntilReview <= 60 * 60 * 1000)) {
        if (Notification.permission === 'granted') {
          new Notification(`📚 Revision Due: ${item.title}`, {
            body: `Time to review: ${item.content.substring(0, 100)}...`,
            icon: '/favicon.ico',
            tag: `revision-${item._id}`
          });
        }
      }
    });
  };

  const fetchRevisions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/revisions/${userId}/revisions`);
      if (response.data.success) {
        setRevisions(response.data.revisions);
      }
    } catch (error) {
      console.error('Error fetching revisions:', error);
      toast.error('Failed to load revisions');
    } finally {
      setLoading(false);
    }
  };

  const fetchDueItems = async () => {
    try {
      const response = await api.get(`/api/revisions/${userId}/revisions/due`);
      if (response.data.success) {
        setDueItems(response.data.dueItems);
      }
    } catch (error) {
      console.error('Error fetching due items:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get(`/api/revisions/${userId}/revisions/statistics`);
      if (response.data.success) {
        setStatistics(response.data.statistics);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleCreateRevision = async () => {
    try {
      if (!newRevision.title || !newRevision.content) {
        toast.error('Title and content are required');
        return;
      }

      const response = await api.post(`/api/revisions/${userId}/revisions`, newRevision);
      if (response.data.success) {
        toast.success('Revision item created successfully');
        setShowCreateModal(false);
        setNewRevision({
          title: '',
          content: '',
          subject: 'General',
          tags: [],
          syncToCalendar: false
        });
        fetchRevisions();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error creating revision:', error);
      toast.error('Failed to create revision item');
    }
  };

  const handleReview = async () => {
    try {
      const response = await api.post(
        `/api/revisions/${userId}/revisions/${selectedRevision._id}/review`,
        { quality: reviewQuality }
      );
      
      if (response.data.success) {
        toast.success('Review completed! Next review scheduled.');
        setShowReviewModal(false);
        setSelectedRevision(null);
        fetchRevisions();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error reviewing item:', error);
      toast.error('Failed to complete review');
    }
  };

  const handleDelete = async (revisionId) => {
    if (!window.confirm('Are you sure you want to delete this revision item?')) {
      return;
    }

    try {
      const response = await api.delete(`/api/revisions/${userId}/revisions/${revisionId}`);
      if (response.data.success) {
        toast.success('Revision item deleted');
        fetchRevisions();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error deleting revision:', error);
      toast.error('Failed to delete revision item');
    }
  };

  const syncAllToCalendar = async () => {
    try {
      const response = await api.post(`/api/revisions/${userId}/revisions/sync-calendar`);
      if (response.data.success) {
        toast.success(`Synced ${response.data.synced} revisions to Google Calendar`);
        fetchRevisions();
      }
    } catch (error) {
      console.error('Error syncing to calendar:', error);
      toast.error('Failed to sync to calendar. Make sure Google Calendar is connected.');
    }
  };

  const getQualityLabel = (quality) => {
    const labels = {
      0: 'Complete blackout',
      1: 'Incorrect, but remembered',
      2: 'Incorrect, with difficulty',
      3: 'Correct, with difficulty',
      4: 'Correct, after hesitation',
      5: 'Perfect recall'
    };
    return labels[quality] || 'Unknown';
  };

  const getDueStatus = (nextReview) => {
    const reviewDate = new Date(nextReview);
    if (isPast(reviewDate) && !isToday(reviewDate)) {
      return { status: 'overdue', label: 'Overdue', color: 'text-red-400' };
    } else if (isToday(reviewDate)) {
      return { status: 'today', label: 'Due Today', color: 'text-orange-400' };
    } else if (isTomorrow(reviewDate)) {
      return { status: 'tomorrow', label: 'Due Tomorrow', color: 'text-yellow-400' };
    } else {
      return { status: 'upcoming', label: `Due ${format(reviewDate, 'MMM d')}`, color: 'text-blue-400' };
    }
  };

  const filteredRevisions = revisions.filter(revision => {
    const matchesSubject = filterSubject === 'all' || revision.subject === filterSubject;
    const matchesSearch = !searchQuery || 
      revision.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      revision.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const subjects = ['all', ...new Set(revisions.map(r => r.subject))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-8 h-8 text-purple-400" />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Brain className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Smart Revision Scheduler</h1>
                <p className="text-gray-400 mt-1">Advanced spaced repetition for optimal learning</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={syncAllToCalendar}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Sync to Calendar</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Revision</span>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Due Today</p>
                    <p className="text-2xl font-bold text-orange-400">{statistics.dueToday}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-400" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Items</p>
                    <p className="text-2xl font-bold text-blue-400">{statistics.active}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-400" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Mastered</p>
                    <p className="text-2xl font-bold text-green-400">{statistics.mastered}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg Mastery</p>
                    <p className="text-2xl font-bold text-purple-400">{statistics.averageMastery}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('due')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'due'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800/50 text-gray-400 hover:text-white'
            }`}
          >
            Due Items ({dueItems.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800/50 text-gray-400 hover:text-white'
            }`}
          >
            All Revisions ({revisions.length})
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'statistics'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800/50 text-gray-400 hover:text-white'
            }`}
          >
            Statistics
          </button>
        </div>

        {/* Filters */}
        {(activeTab === 'all' || activeTab === 'due') && (
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search revisions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject === 'all' ? 'All Subjects' : subject}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'due' && (
            <motion.div
              key="due"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {dueItems.length === 0 ? (
                <div className="bg-slate-800/50 rounded-xl p-12 text-center border border-slate-700/50">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">All caught up!</h3>
                  <p className="text-gray-400">No items due for review right now.</p>
                </div>
              ) : (
                dueItems.map((item) => {
                  const dueStatus = getDueStatus(item.nextReview);
                  return (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                            <span className={`text-sm font-medium ${dueStatus.color}`}>
                              {dueStatus.label}
                            </span>
                            {item.syncedToCalendar && (
                              <Calendar className="w-4 h-4 text-blue-400" />
                            )}
                          </div>
                          <p className="text-gray-400 mb-3">{item.content.substring(0, 200)}...</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-400">Subject: <span className="text-white">{item.subject}</span></span>
                            <span className="text-gray-400">Mastery: <span className="text-purple-400">{item.masteryLevel}%</span></span>
                            <span className="text-gray-400">Next: <span className="text-white">{format(new Date(item.nextReview), 'MMM d, yyyy')}</span></span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRevision(item);
                              setShowReviewModal(true);
                            }}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {activeTab === 'all' && (
            <motion.div
              key="all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredRevisions.length === 0 ? (
                <div className="col-span-full bg-slate-800/50 rounded-xl p-12 text-center border border-slate-700/50">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No revisions found</h3>
                  <p className="text-gray-400">Create your first revision item to get started.</p>
                </div>
              ) : (
                filteredRevisions.map((item) => {
                  const dueStatus = getDueStatus(item.nextReview);
                  return (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white flex-1">{item.title}</h3>
                        <span className={`text-xs font-medium ${dueStatus.color}`}>
                          {dueStatus.label}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">{item.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-xs text-gray-400">
                          <span>{item.subject}</span>
                          <span>•</span>
                          <span>{item.masteryLevel}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRevision(item);
                              setShowReviewModal(true);
                            }}
                            className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
                            title="Review"
                          >
                            <Zap className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {activeTab === 'statistics' && statistics && (
            <motion.div
              key="statistics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4">Overview</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Items</span>
                      <span className="text-white font-semibold">{statistics.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Active</span>
                      <span className="text-blue-400 font-semibold">{statistics.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mastered</span>
                      <span className="text-green-400 font-semibold">{statistics.mastered}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Due This Week</span>
                      <span className="text-orange-400 font-semibold">{statistics.dueThisWeek}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <h3 className="text-xl font-semibold text-white mb-4">Study Time</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estimated Time (Today)</span>
                      <span className="text-white font-semibold">{statistics.estimatedStudyTime} min</span>
                    </div>
                    <div className="mt-4">
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (statistics.dueToday / Math.max(statistics.active, 1)) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {statistics.dueToday} of {statistics.active} items due
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Review Modal */}
        <AnimatePresence>
          {showReviewModal && selectedRevision && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowReviewModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-slate-700"
              >
                <h2 className="text-2xl font-bold text-white mb-4">{selectedRevision.title}</h2>
                <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedRevision.content}</p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-white mb-3">How well did you remember this?</label>
                  <div className="flex items-center space-x-2 mb-4">
                    {[0, 1, 2, 3, 4, 5].map((quality) => (
                      <button
                        key={quality}
                        onClick={() => setReviewQuality(quality)}
                        className={`flex-1 py-3 rounded-lg transition-colors ${
                          reviewQuality === quality
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                        }`}
                      >
                        <div className="text-2xl font-bold">{quality}</div>
                        <div className="text-xs mt-1">{getQualityLabel(quality)}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReview}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Complete Review
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full border border-slate-700"
              >
                <h2 className="text-2xl font-bold text-white mb-4">Create Revision Item</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">Title</label>
                    <input
                      type="text"
                      value={newRevision.title}
                      onChange={(e) => setNewRevision({ ...newRevision, title: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Photosynthesis process"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Content</label>
                    <textarea
                      value={newRevision.content}
                      onChange={(e) => setNewRevision({ ...newRevision, content: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter the content you want to memorize..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2">Subject</label>
                      <input
                        type="text"
                        value={newRevision.subject}
                        onChange={(e) => setNewRevision({ ...newRevision, subject: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., Biology"
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <label className="flex items-center space-x-2 text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newRevision.syncToCalendar}
                          onChange={(e) => setNewRevision({ ...newRevision, syncToCalendar: e.target.checked })}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span>Sync to Calendar</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateRevision}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Create
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RevisionScheduler;

