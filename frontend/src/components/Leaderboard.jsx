import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Star, 
  TrendingUp,
  Users,
  Zap,
  Coins,
  BookOpen,
  Microscope,
  Palette,
  Music,
  Code,
  Globe
} from 'lucide-react';
import api from '../utils/axios';
import { toast } from 'react-toastify';

const Leaderboard = ({ onClose }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('overall');
  const [skill, setSkill] = useState('mathematics');
  const [timeframe, setTimeframe] = useState('all_time');

  const skills = [
    { id: 'mathematics', name: 'Mathematics', icon: BookOpen, color: 'text-blue-500' },
    { id: 'science', name: 'Science', icon: Microscope, color: 'text-green-500' },
    { id: 'english', name: 'English', icon: BookOpen, color: 'text-purple-500' },
    { id: 'history', name: 'History', icon: Globe, color: 'text-amber-500' },
    { id: 'art', name: 'Art', icon: Palette, color: 'text-pink-500' },
    { id: 'music', name: 'Music', icon: Music, color: 'text-indigo-500' },
    { id: 'coding', name: 'Coding', icon: Code, color: 'text-orange-500' }
  ];

  useEffect(() => {
    fetchLeaderboard();
  }, [type, skill]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('type', type);
      if (type === 'skill') {
        params.append('skill', skill);
      }
      params.append('limit', '20');

      const response = await api.get(`/gamification/leaderboard?${params}`);
      if (response.data.success) {
        setLeaderboard(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 1: return <Trophy className="w-6 h-6 text-gray-400" />;
      case 2: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{index + 1}</span>;
    }
  };

  const getRankColor = (index) => {
    switch (index) {
      case 0: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 1: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 2: return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSkillIcon = (skillId) => {
    const skillData = skills.find(s => s.id === skillId);
    if (skillData) {
      const IconComponent = skillData.icon;
      return <IconComponent className={`w-5 h-5 ${skillData.color}`} />;
    }
    return <Star className="w-5 h-5 text-gray-500" />;
  };

  const getSkillLevel = (user, skillId) => {
    if (type === 'skill' && user.skills && user.skills[skillId]) {
      return user.skills[skillId].level || 0;
    }
    return 0;
  };

  const getSkillXP = (user, skillId) => {
    if (type === 'skill' && user.skills && user.skills[skillId]) {
      return user.skills[skillId].xp || 0;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-center mt-4">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
            <p className="text-gray-600">Top performers in the learning community</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            ×
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Type:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="overall">Overall</option>
              <option value="skill">By Skill</option>
            </select>
          </div>

          {type === 'skill' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Skill:</label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {skills.map(skillOption => (
                  <option key={skillOption.id} value={skillOption.id}>
                    {skillOption.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Time:</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all_time">All Time</option>
              <option value="monthly">This Month</option>
              <option value="weekly">This Week</option>
            </select>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="space-y-3">
          {leaderboard.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No data available yet</p>
            </div>
          ) : (
            leaderboard.map((user, index) => (
              <motion.div
                key={user._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center p-4 rounded-xl ${getRankColor(index)}`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-12">
                  {getRankIcon(index)}
                </div>

                {/* Avatar */}
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl ml-4">
                  {user.userName?.charAt(0)?.toUpperCase() || '?'}
                </div>

                {/* User Info */}
                <div className="flex-1 ml-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{user.userName}</h3>
                    {index < 3 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span className="text-sm">Top {index + 1}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1">
                      <Crown className="w-4 h-4" />
                      <span className="text-sm">Level {user.level}</span>
                    </div>
                    {type === 'overall' ? (
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm">{user.totalXP?.toLocaleString() || 0} XP</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        {getSkillIcon(skill)}
                        <span className="text-sm">
                          Level {getSkillLevel(user, skill)} ({getSkillXP(user, skill).toLocaleString()} XP)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Achievements */}
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {user.achievements?.length || 0}
                  </span>
                </div>

                {/* Trend Indicator */}
                <div className="ml-4">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Total Participants</p>
            <p className="text-2xl font-bold text-blue-600">{leaderboard.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Total XP Earned</p>
            <p className="text-2xl font-bold text-green-600">
              {leaderboard.reduce((sum, user) => sum + (user.totalXP || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Total Achievements</p>
            <p className="text-2xl font-bold text-purple-600">
              {leaderboard.reduce((sum, user) => sum + (user.achievements?.length || 0), 0)}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Leaderboard;
