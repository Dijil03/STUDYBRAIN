import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Flame, 
  Target, 
  Zap, 
  Crown, 
  Award, 
  Medal,
  TrendingUp,
  Calendar,
  Clock,
  BookOpen,
  Brain,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Gift,
  Rocket,
  Shield,
  Sword,
  Heart,
  Lightning
} from 'lucide-react';

const GamificationSystem = ({ userId, onAchievementUnlocked }) => {
  const [userStats, setUserStats] = useState({
    level: 1,
    experience: 0,
    streak: 0,
    totalStudyTime: 0,
    cardsStudied: 0,
    tasksCompleted: 0,
    badges: [],
    achievements: [],
    points: 0,
    rank: 'Beginner'
  });

  const [recentAchievements, setRecentAchievements] = useState([]);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);

  // Achievement definitions
  const achievements = useMemo(() => [
    {
      id: 'first_study',
      name: 'First Steps',
      description: 'Complete your first study session',
      icon: BookOpen,
      points: 10,
      requirement: { type: 'study_sessions', count: 1 },
      rarity: 'common',
      category: 'study'
    },
    {
      id: 'streak_7',
      name: 'Week Warrior',
      description: 'Study for 7 consecutive days',
      icon: Flame,
      points: 50,
      requirement: { type: 'streak', count: 7 },
      rarity: 'uncommon',
      category: 'streak'
    },
    {
      id: 'cards_100',
      name: 'Card Master',
      description: 'Study 100 flashcards',
      icon: Brain,
      points: 100,
      requirement: { type: 'cards_studied', count: 100 },
      rarity: 'rare',
      category: 'study'
    },
    {
      id: 'time_10h',
      name: 'Time Keeper',
      description: 'Study for 10 hours total',
      icon: Clock,
      points: 200,
      requirement: { type: 'total_time', count: 36000 }, // 10 hours in seconds
      rarity: 'epic',
      category: 'time'
    },
    {
      id: 'perfect_week',
      name: 'Perfect Week',
      description: 'Complete all tasks in a week',
      icon: Target,
      points: 150,
      requirement: { type: 'perfect_week', count: 1 },
      rarity: 'epic',
      category: 'completion'
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Complete 10 flashcards in under 2 minutes',
      icon: Zap,
      points: 75,
      requirement: { type: 'speed_study', count: 1 },
      rarity: 'rare',
      category: 'speed'
    },
    {
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Study after 10 PM',
      icon: Calendar,
      points: 25,
      requirement: { type: 'night_study', count: 1 },
      rarity: 'uncommon',
      category: 'time'
    },
    {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Study before 6 AM',
      icon: Calendar,
      points: 25,
      requirement: { type: 'early_study', count: 1 },
      rarity: 'uncommon',
      category: 'time'
    },
    {
      id: 'streak_30',
      name: 'Month Master',
      description: 'Study for 30 consecutive days',
      icon: Crown,
      points: 500,
      requirement: { type: 'streak', count: 30 },
      rarity: 'legendary',
      category: 'streak'
    },
    {
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Get 100% accuracy on 50 flashcards',
      icon: Star,
      points: 300,
      requirement: { type: 'perfect_accuracy', count: 50 },
      rarity: 'legendary',
      category: 'accuracy'
    }
  ], []);

  // Badge definitions
  const badges = useMemo(() => [
    {
      id: 'bronze_student',
      name: 'Bronze Student',
      description: 'Complete 10 study sessions',
      icon: Medal,
      color: '#cd7f32',
      requirement: { type: 'study_sessions', count: 10 },
      tier: 'bronze'
    },
    {
      id: 'silver_scholar',
      name: 'Silver Scholar',
      description: 'Complete 50 study sessions',
      icon: Medal,
      color: '#c0c0c0',
      requirement: { type: 'study_sessions', count: 50 },
      tier: 'silver'
    },
    {
      id: 'gold_genius',
      name: 'Gold Genius',
      description: 'Complete 100 study sessions',
      icon: Medal,
      color: '#ffd700',
      requirement: { type: 'study_sessions', count: 100 },
      tier: 'gold'
    },
    {
      id: 'streak_master',
      name: 'Streak Master',
      description: 'Maintain a 14-day study streak',
      icon: Flame,
      color: '#ff6b35',
      requirement: { type: 'streak', count: 14 },
      tier: 'special'
    },
    {
      id: 'speed_king',
      name: 'Speed King',
      description: 'Complete flashcards at lightning speed',
      icon: Lightning,
      color: '#9d4edd',
      requirement: { type: 'speed_study', count: 5 },
      tier: 'special'
    }
  ], []);

  // Level system
  const levelThresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000];

  const getLevel = (experience) => {
    for (let i = levelThresholds.length - 1; i >= 0; i--) {
      if (experience >= levelThresholds[i]) {
        return i + 1;
      }
    }
    return 1;
  };

  const getExperienceToNextLevel = (experience) => {
    const currentLevel = getLevel(experience);
    const nextLevelThreshold = levelThresholds[currentLevel] || levelThresholds[levelThresholds.length - 1];
    return nextLevelThreshold - experience;
  };

  const getRank = (level) => {
    if (level >= 20) return 'Legend';
    if (level >= 15) return 'Master';
    if (level >= 10) return 'Expert';
    if (level >= 5) return 'Advanced';
    return 'Beginner';
  };

  // Check for new achievements
  const checkAchievements = (stats) => {
    const newAchievements = [];
    
    achievements.forEach(achievement => {
      if (stats.achievements.includes(achievement.id)) return;
      
      let unlocked = false;
      const req = achievement.requirement;
      
      switch (req.type) {
        case 'study_sessions':
          unlocked = stats.totalStudySessions >= req.count;
          break;
        case 'streak':
          unlocked = stats.streak >= req.count;
          break;
        case 'cards_studied':
          unlocked = stats.cardsStudied >= req.count;
          break;
        case 'total_time':
          unlocked = stats.totalStudyTime >= req.count;
          break;
        case 'perfect_week':
          unlocked = stats.perfectWeeks >= req.count;
          break;
        case 'speed_study':
          unlocked = stats.speedStudySessions >= req.count;
          break;
        case 'night_study':
          unlocked = stats.nightStudySessions >= req.count;
          break;
        case 'early_study':
          unlocked = stats.earlyStudySessions >= req.count;
          break;
        case 'perfect_accuracy':
          unlocked = stats.perfectAccuracySessions >= req.count;
          break;
      }
      
      if (unlocked) {
        newAchievements.push(achievement);
      }
    });
    
    return newAchievements;
  };

  // Check for new badges
  const checkBadges = (stats) => {
    const newBadges = [];
    
    badges.forEach(badge => {
      if (stats.badges.includes(badge.id)) return;
      
      let unlocked = false;
      const req = badge.requirement;
      
      switch (req.type) {
        case 'study_sessions':
          unlocked = stats.totalStudySessions >= req.count;
          break;
        case 'streak':
          unlocked = stats.streak >= req.count;
          break;
        case 'speed_study':
          unlocked = stats.speedStudySessions >= req.count;
          break;
      }
      
      if (unlocked) {
        newBadges.push(badge);
      }
    });
    
    return newBadges;
  };

  // Award points for actions
  const awardPoints = (action, data = {}) => {
    let points = 0;
    
    switch (action) {
      case 'study_session':
        points = Math.min(50, Math.floor(data.duration / 60) * 5); // 5 points per minute, max 50
        break;
      case 'card_studied':
        points = 1;
        break;
      case 'task_completed':
        points = data.priority === 'High' ? 10 : data.priority === 'Medium' ? 5 : 2;
        break;
      case 'streak_bonus':
        points = Math.min(100, stats.streak * 2); // 2 points per streak day, max 100
        break;
      case 'perfect_accuracy':
        points = 20;
        break;
      case 'speed_study':
        points = 15;
        break;
    }
    
    return points;
  };

  // Update stats
  const updateStats = (action, data = {}) => {
    setUserStats(prevStats => {
      const newStats = { ...prevStats };
      const points = awardPoints(action, data);
      
      newStats.points += points;
      newStats.experience += points;
      newStats.level = getLevel(newStats.experience);
      newStats.rank = getRank(newStats.level);
      
      // Update specific stats based on action
      switch (action) {
        case 'study_session':
          newStats.totalStudyTime += data.duration || 0;
          newStats.totalStudySessions = (newStats.totalStudySessions || 0) + 1;
          break;
        case 'card_studied':
          newStats.cardsStudied += 1;
          break;
        case 'task_completed':
          newStats.tasksCompleted += 1;
          break;
        case 'streak_updated':
          newStats.streak = data.streak || 0;
          break;
      }
      
      // Check for new achievements and badges
      const newAchievements = checkAchievements(newStats);
      const newBadges = checkBadges(newStats);
      
      if (newAchievements.length > 0) {
        newStats.achievements = [...newStats.achievements, ...newAchievements.map(a => a.id)];
        setRecentAchievements(prev => [...prev, ...newAchievements]);
        
        // Show achievement notification
        if (newAchievements.length === 1) {
          setCurrentAchievement(newAchievements[0]);
          setShowAchievement(true);
          onAchievementUnlocked?.(newAchievements[0]);
        }
      }
      
      if (newBadges.length > 0) {
        newStats.badges = [...newStats.badges, ...newBadges.map(b => b.id)];
      }
      
      return newStats;
    });
  };

  // Get rarity color
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#6b7280';
      case 'uncommon': return '#10b981';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  // Get tier color
  const getTierColor = (tier) => {
    switch (tier) {
      case 'bronze': return '#cd7f32';
      case 'silver': return '#c0c0c0';
      case 'gold': return '#ffd700';
      case 'special': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const experienceToNext = getExperienceToNextLevel(userStats.experience);
  const progressPercentage = (userStats.experience - levelThresholds[userStats.level - 2] || 0) / 
    (levelThresholds[userStats.level - 1] - (levelThresholds[userStats.level - 2] || 0)) * 100;

  return (
    <div className="space-y-6">
      {/* Level and Experience */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Level {userStats.level}</h3>
            <p className="text-gray-400 capitalize">{userStats.rank}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-400">{userStats.points}</div>
            <div className="text-sm text-gray-400">Points</div>
          </div>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Experience</span>
            <span>{userStats.experience} / {levelThresholds[userStats.level - 1] || '∞'}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        {experienceToNext > 0 && (
          <p className="text-sm text-gray-400">
            {experienceToNext} XP to next level
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{userStats.streak}</div>
          <div className="text-sm text-gray-400">Day Streak</div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {Math.floor(userStats.totalStudyTime / 3600)}h
          </div>
          <div className="text-sm text-gray-400">Study Time</div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{userStats.cardsStudied}</div>
          <div className="text-sm text-gray-400">Cards Studied</div>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{userStats.tasksCompleted}</div>
          <div className="text-sm text-gray-400">Tasks Done</div>
        </div>
      </div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
            Recent Achievements
          </h3>
          <div className="space-y-3">
            {recentAchievements.slice(-3).map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center p-3 bg-slate-700/50 rounded-lg"
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                  style={{ backgroundColor: getRarityColor(achievement.rarity) + '20' }}
                >
                  <achievement.icon className="w-5 h-5" style={{ color: getRarityColor(achievement.rarity) }} />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{achievement.name}</div>
                  <div className="text-sm text-gray-400">{achievement.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 font-bold">+{achievement.points}</div>
                  <div className="text-xs text-gray-400 capitalize">{achievement.rarity}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Notification */}
      <AnimatePresence>
        {showAchievement && currentAchievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
          >
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 shadow-2xl border border-white/20">
              <div className="flex items-center mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                  style={{ backgroundColor: getRarityColor(currentAchievement.rarity) + '30' }}
                >
                  <currentAchievement.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">Achievement Unlocked!</div>
                  <div className="text-purple-200 text-sm">+{currentAchievement.points} XP</div>
                </div>
              </div>
              
              <div className="text-white font-semibold mb-2">{currentAchievement.name}</div>
              <div className="text-purple-200 text-sm mb-4">{currentAchievement.description}</div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-purple-300 capitalize">
                  {currentAchievement.rarity} • {currentAchievement.category}
                </div>
                <button
                  onClick={() => setShowAchievement(false)}
                  className="text-white hover:text-purple-200 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamificationSystem;
