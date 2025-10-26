import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star, 
  Target, 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  Users, 
  Zap,
  Calendar,
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  User,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../utils/axios';
import FeatureGate from '../components/FeatureGate';
import { FEATURES } from '../utils/featureGate';

const Community = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('totalScore');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      
      // Fetch current user data
      const userResponse = await api.get('/auth/google/success');
      if (userResponse.status === 200) {
        setCurrentUser(userResponse.data.user);
      }

      // Fetch community rankings
      const communityResponse = await api.get('/community/rankings');
      if (communityResponse.status === 200) {
        setUsers(communityResponse.data.users);
      }
    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    if (rank <= 10) return <Star className="w-5 h-5 text-blue-400" />;
    return <Trophy className="w-4 h-4 text-purple-400" />;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-amber-500 to-amber-700';
    if (rank <= 10) return 'from-blue-400 to-blue-600';
    return 'from-purple-400 to-purple-600';
  };

  const getStageBadge = (user) => {
    const totalScore = user.totalScore || 0;
    if (totalScore >= 10000) return { name: 'Master', color: 'from-purple-600 to-pink-600', icon: Crown };
    if (totalScore >= 5000) return { name: 'Expert', color: 'from-blue-600 to-cyan-600', icon: Star };
    if (totalScore >= 2000) return { name: 'Advanced', color: 'from-green-600 to-emerald-600', icon: TrendingUp };
    if (totalScore >= 500) return { name: 'Intermediate', color: 'from-orange-600 to-yellow-600', icon: Target };
    return { name: 'Beginner', color: 'from-gray-500 to-gray-700', icon: BookOpen };
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = selectedFilter === 'all' || 
        (selectedFilter === 'top10' && user.rank <= 10) ||
        (selectedFilter === 'sameStage' && currentUser && getStageBadge(user).name === getStageBadge(currentUser).name);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const aValue = a[sortBy] || 0;
      const bValue = b[sortBy] || 0;
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-4"
            >
              <Trophy className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-yellow-200 to-orange-200 bg-clip-text text-transparent">
              Community Leaderboard
            </h1>
          </div>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Compete with fellow students, track your progress, and climb the rankings!
          </p>
        </motion.div>

        {/* Current User Stats */}
        {currentUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                <User className="w-6 h-6 mr-2 text-blue-400" />
                Your Progress
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{currentUser.rank || 'N/A'}</div>
                  <div className="text-sm text-white/70">Your Rank</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{currentUser.totalScore || 0}</div>
                  <div className="text-sm text-white/70">Total Score</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{currentUser.homeworkCompleted || 0}</div>
                  <div className="text-sm text-white/70">Homework Done</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{currentUser.badgesEarned || 0}</div>
                  <div className="text-sm text-white/70">Badges Earned</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Sort Options */}
              <div className="flex gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="totalScore">Total Score</option>
                  <option value="homeworkCompleted">Homework</option>
                  <option value="badgesEarned">Badges</option>
                  <option value="studyTime">Study Time</option>
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white hover:bg-white/20 transition-colors"
                >
                  {sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>

                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Users</option>
                  <option value="top10">Top 10</option>
                  <option value="sameStage">Same Stage</option>
                </select>

                <button
                  onClick={fetchCommunityData}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <FeatureGate 
          feature={FEATURES.BASIC_ANALYTICS}
          title="Community Leaderboard"
          description="View community rankings and compete with other students."
          icon={Trophy}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="space-y-4"
          >
          {filteredUsers.map((user, index) => {
            const isCurrentUser = currentUser && user.id === currentUser.id;
            const stageBadge = getStageBadge(user);
            const StageIcon = stageBadge.icon;

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative ${
                  isCurrentUser 
                    ? 'ring-2 ring-yellow-400 ring-opacity-50 bg-gradient-to-r from-yellow-500/20 to-orange-500/20' 
                    : 'bg-white/5'
                } backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300`}
              >
                {isCurrentUser && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>YOU</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  {/* Rank and User Info */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getRankColor(user.rank)} flex items-center justify-center`}>
                        {getRankIcon(user.rank)}
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">#{user.rank}</div>
                        <div className="text-sm text-white/70">Rank</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-xl font-semibold text-white">{user.username}</div>
                        <div className="text-sm text-white/70">{user.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Stage Badge */}
                  <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${stageBadge.color} flex items-center space-x-2`}>
                    <StageIcon className="w-4 h-4 text-white" />
                    <span className="text-white font-semibold">{stageBadge.name}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">{user.totalScore || 0}</div>
                      <div className="text-sm text-white/70">Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{user.homeworkCompleted || 0}</div>
                      <div className="text-sm text-white/70">Homework</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{user.badgesEarned || 0}</div>
                      <div className="text-sm text-white/70">Badges</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{user.studyTime || 0}h</div>
                      <div className="text-sm text-white/70">Study Time</div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-white/70 mb-2">
                    <span>Progress to next stage</span>
                    <span>{user.totalScore || 0} / {user.nextStageRequirement || 1000} points</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(((user.totalScore || 0) / (user.nextStageRequirement || 1000)) * 100, 100)}%` }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                      className={`h-2 rounded-full bg-gradient-to-r ${stageBadge.color}`}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
          </motion.div>
        </FeatureGate>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/70 mb-2">No users found</h3>
            <p className="text-white/50">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Community;