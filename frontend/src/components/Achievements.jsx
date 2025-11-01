import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Lock, 
  Unlock,
  Filter,
  Search,
  Award,
  Crown,
  Zap,
  Coins,
  Gift,
  Eye,
  EyeOff
} from 'lucide-react';
import api from '../utils/axios';
import { toast } from 'react-toastify';

const Achievements = ({ userId, onClose }) => {
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  const categories = [
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'study', name: 'Study', icon: Star },
    { id: 'social', name: 'Social', icon: Zap },
    { id: 'creative', name: 'Creative', icon: Gift },
    { id: 'academic', name: 'Academic', icon: Crown },
    { id: 'special', name: 'Special', icon: Award },
    { id: 'streak', name: 'Streak', icon: Zap }
  ];

  useEffect(() => {
    fetchAchievements();
    fetchUserAchievements();
  }, [userId, showSecret]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== 'all') {
        params.append('category', category);
      }
      if (showSecret) {
        params.append('type', 'secret');
      }

      const response = await api.get(`/gamification/achievements?${params}`);
      if (response.data.success) {
        setAchievements(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAchievements = async () => {
    try {
      const response = await api.get(`/gamification/avatar/${userId}`);
      if (response.data.success) {
        setUserAchievements(response.data.data.achievements || []);
      }
    } catch (error) {
      console.error('Error fetching user achievements:', error);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [category, showSecret]);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-yellow-600 text-white';
      case 'epic': return 'from-purple-500 to-purple-700 text-white';
      case 'rare': return 'from-blue-500 to-blue-700 text-white';
      case 'uncommon': return 'from-green-500 to-green-700 text-white';
      default: return 'from-gray-400 to-gray-600 text-white';
    }
  };

  const getRarityBorder = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400';
      case 'epic': return 'border-purple-500';
      case 'rare': return 'border-blue-500';
      case 'uncommon': return 'border-green-500';
      default: return 'border-gray-400';
    }
  };

  const isEarned = (achievementId) => {
    return userAchievements.some(achievement => achievement.id === achievementId);
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesCategory = category === 'all' || achievement.category === category;
    const matchesSearch = achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const earnedCount = achievements.filter(achievement => isEarned(achievement.id)).length;
  const totalCount = achievements.length;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-center mt-4">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Achievements</h2>
            <p className="text-gray-600">
              {earnedCount} of {totalCount} achievements earned
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round((earnedCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(earnedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search achievements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setShowSecret(!showSecret)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              showSecret ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {showSecret ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showSecret ? 'Hide Secret' : 'Show Secret'}
          </button>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No achievements found</p>
            </div>
          ) : (
            filteredAchievements.map((achievement, index) => {
              const earned = isEarned(achievement.id);
              return (
                <motion.div
                  key={achievement._id || achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-xl p-4 border-2 transition-all duration-300 ${
                    earned 
                      ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} ${getRarityBorder(achievement.rarity)}` 
                      : 'bg-gray-100 border-gray-300 opacity-60'
                  }`}
                >
                  {/* Earned Badge */}
                  {earned && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Unlock className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Achievement Icon */}
                  <div className="text-4xl mb-3 text-center">
                    {achievement.icon}
                  </div>

                  {/* Achievement Info */}
                  <div className="text-center">
                    <h3 className={`font-bold text-lg mb-1 ${earned ? 'text-white' : 'text-gray-800'}`}>
                      {achievement.name}
                    </h3>
                    <p className={`text-sm mb-3 ${earned ? 'text-white/80' : 'text-gray-600'}`}>
                      {achievement.description}
                    </p>

                    {/* Rarity Badge */}
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      earned ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {achievement.rarity.toUpperCase()}
                    </div>

                    {/* Rewards */}
                    {achievement.rewards && (
                      <div className="mt-3 flex justify-center gap-2">
                        {achievement.rewards.xp > 0 && (
                          <div className="flex items-center gap-1 text-xs">
                            <Zap className="w-3 h-3" />
                            <span>{achievement.rewards.xp} XP</span>
                          </div>
                        )}
                        {achievement.rewards.coins > 0 && (
                          <div className="flex items-center gap-1 text-xs">
                            <Coins className="w-3 h-3" />
                            <span>{achievement.rewards.coins}</span>
                          </div>
                        )}
                        {achievement.rewards.gems > 0 && (
                          <div className="flex items-center gap-1 text-xs">
                            <Gift className="w-3 h-3" />
                            <span>{achievement.rewards.gems}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Title Reward */}
                    {achievement.rewards?.title && earned && (
                      <div className="mt-2 text-xs font-medium">
                        Title: {achievement.rewards.title}
                      </div>
                    )}
                  </div>

                  {/* Lock Overlay for Unearned */}
                  {!earned && (
                    <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                      <Lock className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Trophy className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Total Achievements</p>
            <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Earned</p>
            <p className="text-2xl font-bold text-green-600">{earnedCount}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Completion</p>
            <p className="text-2xl font-bold text-purple-600">
              {Math.round((earnedCount / totalCount) * 100)}%
            </p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Rare+</p>
            <p className="text-2xl font-bold text-yellow-600">
              {userAchievements.filter(a => ['rare', 'epic', 'legendary'].includes(a.rarity)).length}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Achievements;
