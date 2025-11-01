import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import PageSEO from '../components/PageSEO';
import LoadingSpinner from '../components/LoadingSpinner';
import CreateGroupModal from '../components/CreateGroupModal';
import StudyGroupCard from '../components/StudyGroupCard';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import FeatureGate from '../components/FeatureGate';
import { useFeatureGate, FEATURES } from '../utils/featureGate';
import {
  Users,
  Plus,
  Search,
  Filter,
  BookOpen,
  Clock,
  TrendingUp,
  Star,
  Globe,
  Lock,
  Shield,
  Sparkles
} from 'lucide-react';

const StudyGroups = () => {
  const [studyGroups, setStudyGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedSchedule, setSelectedSchedule] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'my-groups'
  
  const { canAccess } = useFeatureGate();

  const subjects = [
    'Mathematics', 'Science', 'English', 'History', 'Geography', 
    'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art',
    'Music', 'Physical Education', 'Foreign Language', 'General', 'Other'
  ];

  const difficulties = ['beginner', 'intermediate', 'advanced'];
  const schedules = ['flexible', 'morning', 'afternoon', 'evening', 'weekend', 'weekday'];

  useEffect(() => {
    fetchUserProfile();
    fetchStats();
  }, []);

  useEffect(() => {
    if (user) {
      if (activeTab === 'browse') {
        fetchStudyGroups();
      } else {
        fetchUserGroups();
      }
    }
  }, [user, activeTab, searchTerm, selectedSubject, selectedDifficulty, selectedSchedule, sortBy, currentPage]);

  const fetchUserProfile = async () => {
    try {
      const storedUserId = localStorage.getItem('userId');
      const storedUsername = localStorage.getItem('username');
      
      if (storedUserId) {
        setUser({ 
          id: storedUserId, 
          username: storedUsername || 'User' 
        });
        return;
      }
      
      try {
        const response = await api.get('/auth/google/success');
        if (response.status === 200) {
          const userData = response.data.user;
          setUser(userData);
          localStorage.setItem('userId', userData.id);
          localStorage.setItem('username', userData.username || userData.firstName || 'User');
        }
      } catch (authError) {
        console.log('No authenticated user, continuing with guest mode');
        // Allow users to browse study groups without authentication
        setUser({ id: 'guest', username: 'Guest User' });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const storedUserId = localStorage.getItem('userId');
      const storedUsername = localStorage.getItem('username');
      if (storedUserId) {
        setUser({ 
          id: storedUserId, 
          username: storedUsername || 'User' 
        });
      } else {
        // Fallback to guest mode
        setUser({ id: 'guest', username: 'Guest User' });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/study-groups/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchStudyGroups = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        subject: selectedSubject,
        difficulty: selectedDifficulty,
        studySchedule: selectedSchedule,
        sortBy,
        page: currentPage,
        limit: 12
      });

      const response = await api.get(`/study-groups/browse?${params}`);
      if (response.data.success) {
        setStudyGroups(response.data.groups);
      }
    } catch (error) {
      console.error('Error fetching study groups:', error);
      toast.error('Failed to load study groups');
    }
  };

  const fetchUserGroups = async () => {
    try {
      const response = await api.get(`/study-groups/${user.id}/my-groups`);
      if (response.data.success) {
        setUserGroups(response.data.groups);
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
      toast.error('Failed to load your study groups');
    }
  };

  const handleCreateGroup = async (groupData) => {
    setCreating(true);
    try {
      const response = await api.post(`/study-groups/${user.id}/create`, {
        ...groupData,
        userName: user.username
      });

      if (response.data.success) {
        toast.success('Study group created successfully!');
        setShowCreateModal(false);
        
        if (activeTab === 'my-groups') {
          fetchUserGroups();
        } else {
          fetchStudyGroups();
        }
        
        fetchStats();
      }
    } catch (error) {
      console.error('Error creating study group:', error);
      toast.error(error.response?.data?.error || 'Failed to create study group');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const response = await api.post(`/study-groups/${groupId}/join`, {
        userId: user.id,
        userName: user.username
      });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchStudyGroups();
        fetchUserGroups();
        fetchStats();
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error(error.response?.data?.error || 'Failed to join study group');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSubject('all');
    setSelectedDifficulty('all');
    setSelectedSchedule('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const displayGroups = activeTab === 'browse' ? studyGroups : userGroups;

  return (
    <>
      <PageSEO 
        page="study-groups"
        title="Study Groups - Collaborative Learning"
        description="Join study groups, collaborate with classmates, and enhance your learning experience together."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />

        {/* Background decoration */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
              Study Groups
            </h1>
            <p className="text-xl text-slate-300 mb-6">
              Join forces with classmates and enhance your learning through collaboration
            </p>
          </motion.div>

          {/* Stats Cards */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
                <Users className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{stats.totalGroups}</div>
                <p className="text-slate-400">Active Groups</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{stats.totalMembers}</div>
                <p className="text-slate-400">Total Members</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 text-center">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">{stats.averageMembersPerGroup}</div>
                <p className="text-slate-400">Avg Members/Group</p>
              </div>
            </motion.div>
          )}

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'browse'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Globe className="w-5 h-5 inline mr-2" />
                Browse Groups
              </button>
              <button
                onClick={() => setActiveTab('my-groups')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'my-groups'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                My Groups ({userGroups.length})
              </button>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                  <input
                    type="text"
                    placeholder="Search study groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Create Group Button */}
                {user && (
                  <FeatureGate feature={FEATURES.STUDY_GROUPS}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCreateModal(true)}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg shadow-green-500/25 whitespace-nowrap font-semibold"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Group
                    </motion.button>
                  </FeatureGate>
                )}
              </div>
            </div>

            {/* Filters */}
            {activeTab === 'browse' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject} className="bg-slate-800">{subject}</option>
                  ))}
                </select>

                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Levels</option>
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty} className="bg-slate-800">
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSchedule}
                  onChange={(e) => setSelectedSchedule(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Any Schedule</option>
                  {schedules.map(schedule => (
                    <option key={schedule} value={schedule} className="bg-slate-800">
                      {schedule.charAt(0).toUpperCase() + schedule.slice(1)}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="newest" className="bg-slate-800">Newest</option>
                  <option value="popular" className="bg-slate-800">Most Popular</option>
                  <option value="name" className="bg-slate-800">Name A-Z</option>
                </select>

                <button
                  onClick={resetFilters}
                  className="flex items-center justify-center px-4 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors"
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Reset
                </button>
              </div>
            )}
          </motion.div>

          {/* Study Groups Grid */}
          {displayGroups.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                <Users className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {activeTab === 'my-groups' ? 'No study groups yet' : 'No groups found'}
              </h3>
              <p className="text-purple-200 mb-8 max-w-md mx-auto">
                {activeTab === 'my-groups' 
                  ? 'Join existing groups or create your own to start collaborative learning!'
                  : 'Try adjusting your search criteria or create a new group.'
                }
              </p>
              {user && (
                <FeatureGate feature={FEATURES.STUDY_GROUPS}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center mx-auto px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg shadow-green-500/25 font-semibold"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Your First Group
                  </motion.button>
                </FeatureGate>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {displayGroups.map((group, index) => (
                <StudyGroupCard
                  key={group._id}
                  group={group}
                  user={user}
                  onJoin={handleJoinGroup}
                  delay={index * 0.1}
                  isUserGroup={activeTab === 'my-groups'}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Create Group Modal */}
        {showCreateModal && (
          <CreateGroupModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateGroup}
            creating={creating}
            subjects={subjects}
            difficulties={difficulties}
            schedules={schedules}
          />
        )}

        {/* Styles */}
        <style>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}</style>
      </div>
    </>
  );
};

export default StudyGroups;
