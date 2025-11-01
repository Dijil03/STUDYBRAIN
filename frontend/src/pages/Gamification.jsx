import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Trophy, 
  Award, 
  Star,
  Zap,
  Coins,
  Crown,
  Heart,
  Gift,
  Settings,
  Sparkles,
  TrendingUp,
  BookOpen,
  Microscope,
  Palette,
  Music,
  Code,
  Globe,
  Calendar,
  Clock,
  Target
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/axios';
import Navbar from '../components/Navbar';
import Avatar from '../components/Avatar';
import VirtualCampus from '../components/VirtualCampus';
import Leaderboard from '../components/Leaderboard';
import Achievements from '../components/Achievements';

const Gamification = () => {
  const [userId, setUserId] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [personalSkills, setPersonalSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAvatar, setShowAvatar] = useState(false);
  const [showCampus, setShowCampus] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      fetchAvatar(storedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAvatar = async (userId) => {
    try {
      const response = await api.get(`/gamification/avatar/${userId}`);
      if (response.data.success) {
        setAvatar(response.data.data);
      }
      // Try to fetch personalization profile to get preferred skills
      try {
        const prof = await api.get(`/profile/${userId}`);
        const prefSkills = prof?.data?.data?.preferences?.skills || prof?.data?.preferences?.skills || [];
        if (Array.isArray(prefSkills)) setPersonalSkills(prefSkills);
      } catch (e) {
        // ignore personalization fetch errors
      }
    } catch (error) {
      console.error('Error fetching avatar:', error);
      toast.error('Failed to load avatar data');
    } finally {
      setLoading(false);
    }
  };

  const addXP = async (amount, skill = null) => {
    try {
      const response = await api.post(`/gamification/avatar/${userId}/xp`, {
        amount,
        skill,
        source: 'study_session'
      });
      
      if (response.data.success) {
        const { leveledUp, newLevel, currentXP, newAchievements } = response.data.data;
        
        // Update local avatar state
        setAvatar(prev => ({
          ...prev,
          experience: currentXP,
          level: newLevel || prev.level
        }));

        if (leveledUp) {
          toast.success(`🎉 Level Up! You're now level ${newLevel}!`);
        }

        if (newAchievements && newAchievements.length > 0) {
          newAchievements.forEach(achievement => {
            toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`);
          });
        }
      }
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  };

  const getSkillIcon = (skill) => {
    switch (skill) {
      case 'mathematics': return <BookOpen className="w-5 h-5" />;
      case 'science': return <Microscope className="w-5 h-5" />;
      case 'english': return <BookOpen className="w-5 h-5" />;
      case 'history': return <Globe className="w-5 h-5" />;
      case 'art': return <Palette className="w-5 h-5" />;
      case 'music': return <Music className="w-5 h-5" />;
      case 'coding': return <Code className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const getSkillColor = (skill) => {
    switch (skill) {
      case 'mathematics': return 'text-blue-500';
      case 'science': return 'text-green-500';
      case 'english': return 'text-purple-500';
      case 'history': return 'text-amber-500';
      case 'art': return 'text-pink-500';
      case 'music': return 'text-indigo-500';
      case 'coding': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your gamification data...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please log in to access gamification features</h1>
          <p className="text-gray-600">You need to be logged in to view your avatar and achievements.</p>
        </div>
      </div>
    );
  }

  if (!avatar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Creating your avatar...</h1>
          <p className="text-gray-600">Setting up your virtual learning profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Virtual Learning World</h1>
          <p className="text-gray-600">Explore, learn, and achieve in your personalized virtual campus</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Level</p>
                <p className="text-2xl font-bold text-gray-800">{avatar.level}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total XP</p>
                <p className="text-2xl font-bold text-gray-800">{avatar.totalXP.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Coins</p>
                <p className="text-2xl font-bold text-gray-800">{avatar.coins}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Achievements</p>
                <p className="text-2xl font-bold text-gray-800">{avatar.achievements.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl p-6 shadow-lg cursor-pointer"
            onClick={() => setShowAvatar(true)}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                {avatar.appearance.skinTone === 'light' ? '👤' : 
                 avatar.appearance.skinTone === 'medium' ? '👨' : 
                 avatar.appearance.skinTone === 'dark' ? '👨🏿' : '👨🏽'}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">My Avatar</h3>
              <p className="text-sm text-gray-600">Customize your appearance and view stats</p>
            </div>
          </motion.div>

          {/* Virtual Campus */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl p-6 shadow-lg cursor-pointer"
            onClick={() => setShowCampus(true)}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Virtual Campus</h3>
              <p className="text-sm text-gray-600">Explore different learning spaces</p>
            </div>
          </motion.div>

          {/* Leaderboard */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl p-6 shadow-lg cursor-pointer"
            onClick={() => setShowLeaderboard(true)}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Leaderboard</h3>
              <p className="text-sm text-gray-600">See how you rank against others</p>
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-xl p-6 shadow-lg cursor-pointer"
            onClick={() => setShowAchievements(true)}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Achievements</h3>
              <p className="text-sm text-gray-600">View your earned badges and rewards</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Skills Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-lg mb-8"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Skill Progress</h3>
          {(!personalSkills || personalSkills.length === 0) ? (
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div>
                <p className="text-gray-800 font-medium">No personalized skills set</p>
                <p className="text-gray-600 text-sm">Set up your interests to track the right skills.</p>
              </div>
              <button
                onClick={() => navigate('/profile-setup')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Personalize
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {personalSkills.map((skill) => {
                const data = avatar.skills?.[skill] || { level: 0, xp: 0 };
                return (
                  <div key={skill} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={getSkillColor(skill)}>
                        {getSkillIcon(skill)}
                      </div>
                      <span className="font-medium text-gray-800 capitalize">{skill}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Level {data.level}</span>
                      <span>{data.xp} XP</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(data.xp % 1000) / 10}%` }}
                      ></div>
                    </div>
                    <button
                      onClick={() => addXP(25, skill)}
                      className="w-full px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm"
                    >
                      I done daily
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {avatar.achievements.slice(-6).map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <h4 className="font-bold text-gray-800">{achievement.name}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Test XP Button (for development) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => addXP(50, 'mathematics')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
          >
            Test: Add 50 XP to Mathematics
          </button>
        </motion.div>
      </div>

      {/* Modals */}
      {showAvatar && (
        <Avatar userId={userId} onClose={() => setShowAvatar(false)} />
      )}
      
      {showCampus && (
        <VirtualCampus userId={userId} onClose={() => setShowCampus(false)} />
      )}
      
      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}
      
      {showAchievements && (
        <Achievements userId={userId} onClose={() => setShowAchievements(false)} />
      )}
    </div>
  );
};

export default Gamification;
