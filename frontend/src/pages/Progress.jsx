import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import api from '../utils/axios';
import {
  Trophy,
  Flame,
  TrendingUp,
  Calendar, 
  Target,
  Award,
  Clock,
  Zap,
  Star
} from 'lucide-react';
import { toast } from 'react-toastify';

const Progress = () => {
  const userId = localStorage.getItem('userId');
  const [streak, setStreak] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('🔄 Fetching progress data for userId:', userId);
      
      // Fetch each endpoint individually to identify which one is failing
      const results = await Promise.allSettled([
        api.get(`/progress/streak/${userId}`).then(res => ({ type: 'streak', data: res.data })),
        api.get(`/progress/${userId}`).then(res => ({ type: 'progress', data: res.data })),
        api.get(`/schedule/statistics?userId=${userId}`).then(res => ({ type: 'schedule', data: res.data }))
      ]);
      
      let streakData = null;
      let progressData = null;
      let scheduleStatsData = null;
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { type, data } = result.value;
          console.log(`✅ Successfully fetched ${type} data`);
          
          if (type === 'streak') streakData = data;
          else if (type === 'progress') progressData = data;
          else if (type === 'schedule') scheduleStatsData = data;
        } else {
          const endpoints = ['streak', 'progress', 'schedule statistics'];
          console.error(`❌ Failed to fetch ${endpoints[index]}:`, result.reason);
          
          // Show specific error for failed endpoint but don't fail the whole page
          if (result.reason?.response?.status === 500) {
            console.error(`Server error (500) for ${endpoints[index]} endpoint`);
          }
        }
      });
      
      // Set data even if some requests failed
      if (streakData) {
        setStreak(streakData);
      }
      
      if (progressData) {
        setProgress({
          ...progressData,
          scheduleStats: scheduleStatsData?.data || {}
        });
      }
      
      // Only show error if all requests failed
      const failedCount = results.filter(r => r.status === 'rejected').length;
      if (failedCount === results.length) {
        toast.error('Failed to load progress data');
      } else if (failedCount > 0) {
        toast.warn(`Some progress data may be incomplete (${failedCount} of ${results.length} requests failed)`);
      } else {
        console.log('✅ All progress data loaded successfully');
      }
      
    } catch (error) {
      console.error('❌ Unexpected error loading progress data:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const getLevelProgress = () => {
    if (!progress) return { current: 0, next: 0, percentage: 0 };
    const currentLevelXp = (progress.level - 1) * 100;
    const nextLevelXp = progress.level * 100;
    const progressInLevel = progress.xp - currentLevelXp;
    const xpNeeded = nextLevelXp - currentLevelXp;
    return {
      current: progressInLevel,
      next: xpNeeded,
      percentage: (progressInLevel / xpNeeded) * 100
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-white text-xl">Loading progress...</div>
        </div>
      </div>
    );
  }

  const levelProgress = getLevelProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📊 My Progress</h1>
          <p className="text-gray-300">Track your study journey</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Streak Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-lg rounded-2xl p-8 border border-orange-500/20"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <Flame className="w-8 h-8 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Current Streak</h2>
                  <p className="text-gray-300 text-sm">Keep it going!</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-orange-400">
                  {streak?.currentStreak || 0}
                </div>
                <p className="text-gray-300 text-sm">days</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <Calendar className="w-6 h-6 text-blue-400 mb-2" />
                <div className="text-2xl font-bold text-white">{streak?.totalDaysStudied || 0}</div>
                <p className="text-gray-400 text-sm">Total Days</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <Trophy className="w-6 h-6 text-yellow-400 mb-2" />
                <div className="text-2xl font-bold text-white">{streak?.longestStreak || 0}</div>
                <p className="text-gray-400 text-sm">Longest</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
                <div className="text-2xl font-bold text-white">
                  {streak?.lastActivityDate 
                    ? new Date(streak.lastActivityDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'N/A'
                  }
                </div>
                <p className="text-gray-400 text-sm">Last Activity</p>
              </div>
            </div>
          </motion.div>

          {/* Level Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/20"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Level</h2>
                <p className="text-gray-300 text-sm">Your progress</p>
              </div>
              <div className="text-5xl font-bold text-blue-400">
                {progress?.level || 1}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">XP Progress</span>
                <span className="text-white font-semibold">
                  {levelProgress.current} / {levelProgress.next} XP
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress.percentage}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                />
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <Zap className="w-6 h-6 text-yellow-400 mb-2" />
              <div className="text-2xl font-bold text-white">{progress?.xp || 0}</div>
              <p className="text-gray-400 text-sm">Total XP</p>
            </div>
          </motion.div>

          {/* Study Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Study Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/20">
                <Clock className="w-8 h-8 text-green-400 mb-4" />
                <div className="text-3xl font-bold text-white mb-1">
                  {Math.floor((progress?.totalStudyTime || 0) / 60)}h
                </div>
                <div className="text-lg text-gray-300 mb-2">
                  {(progress?.totalStudyTime || 0) % 60}m
                </div>
                <p className="text-gray-400 text-sm">Total Study Time</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/20">
                <Target className="w-8 h-8 text-purple-400 mb-4" />
                <div className="text-3xl font-bold text-white mb-2">
                  {progress?.tasksCompleted || 0}
                </div>
                <p className="text-gray-400 text-sm">Tasks Completed</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-500/20">
                <Award className="w-8 h-8 text-blue-400 mb-4" />
                <div className="text-3xl font-bold text-white mb-2">
                  {progress?.goalsCompleted || 0}
                </div>
                <p className="text-gray-400 text-sm">Goals Completed</p>
              </div>
            </div>
          </motion.div>

          {/* Schedule Progress */}
          {progress?.scheduleStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-lg rounded-2xl p-8 border border-indigo-500/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-3 text-indigo-400" />
                Schedule Performance
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-xl p-6 border border-indigo-500/20">
                  <Trophy className="w-8 h-8 text-indigo-400 mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">
                    {progress.scheduleStats.totalSchedules || 0}
                  </div>
                  <p className="text-gray-400 text-sm">Schedules Created</p>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/20">
                  <Target className="w-8 h-8 text-green-400 mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">
                    {progress.scheduleStats.completedSessions || 0}
                  </div>
                  <p className="text-gray-400 text-sm">Study Sessions Completed</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-500/20">
                  <Flame className="w-8 h-8 text-orange-400 mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">
                    {Math.round((progress.scheduleStats.completionRate || 0) * 100)}%
                  </div>
                  <p className="text-gray-400 text-sm">Completion Rate</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/20">
                  <Star className="w-8 h-8 text-purple-400 mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">
                    {progress.scheduleStats.averageRating ? progress.scheduleStats.averageRating.toFixed(1) : 'N/A'}
                  </div>
                  <p className="text-gray-400 text-sm">Average Rating</p>
                </div>
              </div>

              {/* Subject Breakdown */}
              {progress.subjects && progress.subjects.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-white mb-4">Subject Progress</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {progress.subjects.map((subject, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-white">{subject.name}</h4>
                          <div className="text-sm text-gray-400">
                            {Math.floor(subject.studyTime / 60)}h {subject.studyTime % 60}m
                          </div>
                        </div>
                        <div className="text-sm text-gray-300 mb-2">
                          {subject.tasksCompleted} tasks completed
                        </div>
                        <div className="text-xs text-gray-400">
                          Last studied: {subject.lastStudied ? new Date(subject.lastStudied).toLocaleDateString() : 'Never'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Achievements */}
          {progress?.achievements && progress.achievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Recent Achievements</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {progress.achievements.slice(0, 3).map((achievement, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-500/20"
                  >
                    <Star className="w-8 h-8 text-yellow-400 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">{achievement.name}</h3>
                    <p className="text-gray-400 text-sm">{achievement.description}</p>
                    <p className="text-gray-500 text-xs mt-2">
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Motivation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/20 text-center"
          >
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              {streak?.currentStreak && streak.currentStreak >= 7 
                ? "🔥 Amazing! You're on fire!"
                : streak?.currentStreak && streak.currentStreak >= 3
                ? "💪 Keep up the great work!"
                : "🌟 Every journey starts with a single step!"
              }
            </h2>
            <p className="text-gray-300">
              {streak?.currentStreak && streak.currentStreak >= 7
                ? "Your consistency is incredible! Keep studying to maintain your streak."
                : streak?.currentStreak && streak.currentStreak >= 3
                ? "You're building great habits! Keep going to reach higher levels."
                : "Start studying today to begin your streak!"
              }
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
