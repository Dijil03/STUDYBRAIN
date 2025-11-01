import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Clock,
  Plus,
  Settings,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Play,
  Pause,
  Target,
  Brain,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Gift,
  Trophy,
  Star,
  Zap,
  Heart,
  PartyPopper
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/axios';
import Navbar from '../components/Navbar';

const MySchedule = () => {
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week', 'day', 'month'
  const [showGenerator, setShowGenerator] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [completingBlock, setCompletingBlock] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);
  const [completedDays, setCompletedDays] = useState(new Set());

  useEffect(() => {
    fetchActiveSchedule();
    fetchStatistics();
  }, []);

  // Also fetch schedule when component becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('📄 Page became visible, refreshing schedule...');
        fetchActiveSchedule();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also listen for focus events
    window.addEventListener('focus', fetchActiveSchedule);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchActiveSchedule);
    };
  }, []);

  const fetchActiveSchedule = async () => {
    try {
      const userId = localStorage.getItem('userId');
      console.log('📋 Fetching active schedule for userId:', userId);
      console.log('📊 userId type:', typeof userId);
      
      if (!userId) {
        console.error('❌ No userId found in localStorage');
        setActiveSchedule(null);
        setLoading(false);
        return;
      }
      
      // Check localStorage first as backup
      const cachedSchedule = localStorage.getItem(`schedule_${userId}`);
      if (cachedSchedule) {
        try {
          const parsed = JSON.parse(cachedSchedule);
          console.log('📦 Found cached schedule in localStorage');
          // Still fetch from server but use cache as fallback
        } catch (e) {
          console.log('⚠️ Failed to parse cached schedule');
        }
      }
      
      const response = await api.get(`/schedule/active?userId=${userId}`);
      console.log('📋 Active schedule response:', response.data);
      console.log('📊 Response structure:', {
        success: response.data.success,
        hasData: !!response.data.data,
        dataType: typeof response.data.data
      });
      
      if (response.data.success && response.data.data) {
        console.log('✅ Active schedule data:', response.data.data);
        console.log('📊 Schedule details:', {
          _id: response.data.data._id,
          userId: response.data.data.userId,
          isActive: response.data.data.isActive,
          startDate: response.data.data.startDate
        });
        setActiveSchedule(response.data.data);
        // Cache the schedule in localStorage
        localStorage.setItem(`schedule_${userId}`, JSON.stringify(response.data.data));
        
        // Set selectedDate to the schedule's start date if available
        if (response.data.data.startDate) {
          setSelectedDate(new Date(response.data.data.startDate));
        }
      } else {
        console.log('⚠️ No active schedule found');
        console.log('📊 Response:', response.data);
        
        // Try using cached schedule as fallback
        if (cachedSchedule) {
          try {
            const parsed = JSON.parse(cachedSchedule);
            console.log('📦 Using cached schedule as fallback');
            setActiveSchedule(parsed);
            if (parsed.startDate) {
              setSelectedDate(new Date(parsed.startDate));
            }
          } catch (e) {
            console.error('❌ Failed to parse cached schedule:', e);
            setActiveSchedule(null);
          }
        } else {
          setActiveSchedule(null);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching schedule:', error);
      console.error('❌ Error details:', error.response?.data);
      
      // Try using cached schedule as fallback
      const userId = localStorage.getItem('userId');
      if (userId) {
        const cachedSchedule = localStorage.getItem(`schedule_${userId}`);
        if (cachedSchedule) {
          try {
            const parsed = JSON.parse(cachedSchedule);
            console.log('📦 Using cached schedule as fallback due to error');
            setActiveSchedule(parsed);
            if (parsed.startDate) {
              setSelectedDate(new Date(parsed.startDate));
            }
            return;
          } catch (e) {
            console.error('❌ Failed to parse cached schedule:', e);
          }
        }
      }
      
      setActiveSchedule(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await api.get(`/schedule/statistics?userId=${userId}&timeRange=30`);
      
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const generateAISchedule = async (preferences) => {
    try {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('username');
      
      console.log('🚀 Generating AI schedule with preferences:', preferences);
      console.log('👤 User info:', { userId, userName });
      
      const response = await api.post('/schedule/generate', {
        userId,
        userName,
        ...preferences
      });

      console.log('📋 Generate schedule response:', response.data);

      if (response.data.success) {
        console.log('✅ Schedule generated successfully, data:', response.data.data);
        
        // Cache the schedule immediately
        if (response.data.data && userId) {
          localStorage.setItem(`schedule_${userId}`, JSON.stringify(response.data.data));
          console.log('💾 Schedule cached in localStorage');
        }
        
        setActiveSchedule(response.data.data);
        // Set selectedDate to the new schedule's start date
        if (response.data.data && response.data.data.startDate) {
          setSelectedDate(new Date(response.data.data.startDate));
        }
        setShowGenerator(false);
        toast.success('AI-optimized schedule generated successfully!');
        
        // Wait a moment then fetch the schedule from server to ensure it's saved
        setTimeout(async () => {
          console.log('🔄 Refreshing schedule after generation...');
          await fetchActiveSchedule();
        }, 500);
        
        // Refresh statistics after generating schedule
        fetchStatistics();
      } else {
        console.error('❌ Schedule generation failed:', response.data.message);
        toast.error(response.data.message || 'Failed to generate schedule');
      }
    } catch (error) {
      console.error('❌ Error generating schedule:', error);
      console.error('❌ Error details:', error.response?.data);
      toast.error('Failed to generate schedule: ' + (error.response?.data?.message || error.message));
    }
  };

  const completeStudyBlock = async (day, blockIndex, notes = '') => {
    if (!activeSchedule) {
      console.log('❌ No active schedule available');
      return;
    }

    console.log('🎯 Completing study block:', { day, blockIndex, notes, scheduleId: activeSchedule._id });
    setCompletingBlock(`${day}-${blockIndex}`);
    
    try {
      const userId = localStorage.getItem('userId');
      console.log('📤 Sending completion request for schedule:', activeSchedule._id);
      
      const response = await api.post(
        `/schedule/${activeSchedule._id}/complete/${day}/${blockIndex}`,
        { userId, notes }
      );

      console.log('📋 Completion response:', response.data);

      if (response.data.success) {
        console.log('✅ Study block completed successfully');
        // Update the local schedule data and cache it
        let nextSchedule;
        setActiveSchedule(prev => {
          const updated = { ...prev };
          updated.weeklySchedule = { ...prev.weeklySchedule };
          updated.weeklySchedule[day] = [...prev.weeklySchedule[day]];
          updated.weeklySchedule[day][blockIndex] = response.data.data.completedBlock;
          updated.statistics = response.data.data.statistics;
          nextSchedule = updated;
          return updated;
        });
        if (nextSchedule && userId) {
          try {
            localStorage.setItem(`schedule_${userId}`, JSON.stringify(nextSchedule));
            console.log('💾 Updated schedule cached after completion');
          } catch (e) {
            console.warn('⚠️ Failed to cache updated schedule:', e);
          }
        }
        
        toast.success('Study session completed! 🎉');
        
        // Check if all tasks for the day are completed
        const daySchedule = (nextSchedule?.weeklySchedule?.[day]) || activeSchedule.weeklySchedule[day] || [];
        const completedTasks = daySchedule.filter((block) => block.isCompleted).length;
        
        if (completedTasks === daySchedule.length && daySchedule.length > 0) {
          // All tasks for the day are completed! Trigger celebration
          triggerCelebration(day, daySchedule);
          
          // Check if the entire week is completed
          setTimeout(() => checkWeekCompletion(), 1000);
        }
        
        fetchStatistics(); // Refresh statistics
      }
    } catch (error) {
      console.error('❌ Error completing study block:', error);
      console.error('❌ Error details:', error.response?.data);
      toast.error('Failed to complete study session');
    } finally {
      setCompletingBlock(null);
    }
  };

  const triggerCelebration = (day, daySchedule, isWeekly = false) => {
    const dayKey = `${day}-${new Date().toDateString()}`;
    
    // Prevent multiple celebrations for the same day (unless it's weekly)
    if (!isWeekly && completedDays.has(dayKey)) return;
    
    const totalMinutes = daySchedule.reduce((sum, block) => sum + block.duration, 0);
    const subjects = [...new Set(daySchedule.map(block => block.subject))];
    
    // Calculate streak
    const streakCount = completedDays.size + 1;
    
    const rewards = isWeekly ? [
      { type: 'badge', name: 'Weekly Champion', icon: Trophy, color: 'text-yellow-400' },
      { type: 'badge', name: 'Study Master', icon: PartyPopper, color: 'text-pink-400' },
      { type: 'points', amount: totalMinutes * 50, icon: Star, color: 'text-purple-400' },
      { type: 'streak', count: streakCount, icon: Zap, color: 'text-orange-400' },
      { type: 'special', name: 'Perfect Week Bonus', icon: Gift, color: 'text-green-400' }
    ] : [
      { type: 'badge', name: 'Day Completionist', icon: Trophy, color: 'text-yellow-400' },
      { type: 'points', amount: totalMinutes * 10, icon: Star, color: 'text-purple-400' },
      { type: 'streak', count: streakCount, icon: Zap, color: 'text-orange-400' }
    ];
    
    const dailyCelebrations = [
      { title: "🎉 Amazing Work!", message: "You've conquered all your tasks for today!" },
      { title: "🏆 Champion!", message: "Every goal achieved, every moment counts!" },
      { title: "⭐ Superstar!", message: "You're unstoppable! What an incredible day!" },
      { title: "🚀 Excellence!", message: "Your dedication is paying off beautifully!" },
      { title: "💫 Brilliant!", message: "You've turned your schedule into success!" }
    ];
    
    const weeklyCelebrations = [
      { title: "🏆 WEEKLY CHAMPION!", message: "Incredible! You've completed your entire week! You're absolutely amazing!" },
      { title: "🎯 PERFECT WEEK!", message: "Outstanding dedication! Every single task completed! You're a true scholar!" },
      { title: "👑 STUDY ROYALTY!", message: "Magnificent achievement! A complete week of success! You're unstoppable!" },
      { title: "🌟 LEGENDARY STATUS!", message: "Phenomenal work! Your commitment is inspiring! What a perfect week!" },
      { title: "🚀 BEYOND AMAZING!", message: "Extraordinary achievement! You've mastered your entire schedule! Incredible!" }
    ];
    
    const celebrations = isWeekly ? weeklyCelebrations : dailyCelebrations;
    const randomCelebration = celebrations[Math.floor(Math.random() * celebrations.length)];
    
    setCelebrationData({
      day: isWeekly ? 'Entire Week' : (day.charAt(0).toUpperCase() + day.slice(1)),
      totalTasks: isWeekly ? Object.values(activeSchedule.weeklySchedule).reduce((sum, dayTasks) => sum + dayTasks.length, 0) : daySchedule.length,
      totalMinutes: isWeekly ? Object.values(activeSchedule.weeklySchedule).reduce((sum, dayTasks) => 
        sum + dayTasks.reduce((daySum, block) => daySum + block.duration, 0), 0) : totalMinutes,
      subjects,
      rewards,
      isWeekly,
      streakCount,
      ...randomCelebration
    });
    
    if (!isWeekly) {
      setCompletedDays(prev => new Set([...prev, dayKey]));
    }
    
    setShowCelebration(true);
    
    // Play celebration sound with different tones for daily vs weekly
    playCelebrationSound(isWeekly);
  };

  const checkWeekCompletion = () => {
    if (!activeSchedule) return;
    
    const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const completedDaysThisWeek = weekDays.filter(day => {
      const daySchedule = activeSchedule.weeklySchedule[day] || [];
      return daySchedule.length > 0 && daySchedule.every(block => block.isCompleted);
    });
    
    const totalScheduledDays = weekDays.filter(day => {
      const daySchedule = activeSchedule.weeklySchedule[day] || [];
      return daySchedule.length > 0;
    });
    
    // If all scheduled days are completed, trigger weekly celebration
    if (completedDaysThisWeek.length === totalScheduledDays.length && totalScheduledDays.length > 0) {
      const weekKey = `week-${new Date().getFullYear()}-${Math.ceil(new Date().getDate() / 7)}`;
      
      // Prevent multiple weekly celebrations
      if (!completedDays.has(weekKey)) {
        setTimeout(() => {
          triggerCelebration('week', [], true);
          setCompletedDays(prev => new Set([...prev, weekKey]));
        }, 2000); // Delay weekly celebration slightly
      }
    }
  };

  const playCelebrationSound = (isWeekly = false) => {
    try {
      // Create different tones for different celebrations
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      const playTone = (frequency, duration, delay = 0) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + duration);
        }, delay);
      };
      
      if (isWeekly) {
        // Weekly celebration: triumphant chord progression
        playTone(523.25, 0.4, 0); // C5
        playTone(659.25, 0.4, 100); // E5
        playTone(783.99, 0.4, 200); // G5
        playTone(1046.50, 0.6, 300); // C6
      } else {
        // Daily celebration: cheerful ascending notes
        playTone(523.25, 0.3, 0); // C5
        playTone(659.25, 0.3, 150); // E5
        playTone(783.99, 0.4, 300); // G5
      }
    } catch (e) {
      // Fallback: try to play audio file
      try {
        const audio = new Audio(isWeekly ? '/weekly-celebration.mp3' : '/celebration.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (e2) {
        console.log('Audio not available');
      }
    }
  };

  const getWeekDays = () => {
    // If there's an active schedule, use its start date to determine the week
    let referenceDate = selectedDate;
    if (activeSchedule && activeSchedule.startDate) {
      referenceDate = new Date(activeSchedule.startDate);
    }
    
    const startOfWeek = new Date(referenceDate);
    const day = startOfWeek.getDay();
    // Adjust to start from Monday (0 = Sunday, 1 = Monday, etc.)
    const diff = day === 0 ? -6 : 1 - day; // If Sunday, go back 6 days; otherwise go to Monday
    startOfWeek.setDate(startOfWeek.getDate() + diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Confetti Animation Component
  const Confetti = () => {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#f97316'][i % 6],
              left: Math.random() * 100 + '%',
            }}
            initial={{ 
              y: -20, 
              rotate: 0,
              opacity: 1 
            }}
            animate={{ 
              y: window.innerHeight + 20,
              rotate: 360,
              opacity: 0
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 2,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    );
  };

  // Celebration Modal Component
  const CelebrationModal = () => {
    if (!showCelebration || !celebrationData) return null;

    const isWeekly = celebrationData.isWeekly;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        >
          <Confetti />
          
          {/* Extra intense confetti for weekly celebrations */}
          {isWeekly && (
            <>
              <Confetti />
              <Confetti />
            </>
          )}
          
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotateY: -180 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              duration: 0.6
            }}
            className={`backdrop-blur-xl rounded-3xl shadow-2xl border p-8 max-w-lg w-full text-center relative overflow-hidden ${
              isWeekly 
                ? 'bg-gradient-to-br from-yellow-900/95 via-orange-900/95 to-red-900/95 border-yellow-500/50 shadow-yellow-500/30' 
                : 'bg-gradient-to-br from-purple-900/95 to-pink-900/95 border-purple-500/30'
            }`}
          >
            {/* Background Animation */}
            <motion.div
              className={`absolute inset-0 rounded-3xl ${
                isWeekly 
                  ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20' 
                  : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20'
              }`}
              animate={{ 
                scale: isWeekly ? [1, 1.1, 1] : [1, 1.05, 1],
                rotate: [0, 1, -1, 0]
              }}
              transition={{ 
                duration: isWeekly ? 1.5 : 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Main Content */}
            <div className="relative z-10">
              {/* Trophy Animation - Enhanced for weekly */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.3,
                  type: "spring",
                  stiffness: 200,
                  damping: 10
                }}
                className="mb-6"
              >
                <div className={`mx-auto rounded-full flex items-center justify-center shadow-lg ${
                  isWeekly 
                    ? 'w-24 h-24 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 shadow-yellow-500/70' 
                    : 'w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 shadow-yellow-500/50'
                }`}>
                  {isWeekly ? (
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <PartyPopper className="w-12 h-12 text-white" />
                    </motion.div>
                  ) : (
                    <Trophy className="w-10 h-10 text-white" />
                  )}
                </div>
                
                {/* Crown for weekly celebration */}
                {isWeekly && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ delay: 0.8, duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                    className="absolute -top-2 left-1/2 transform -translate-x-1/2"
                  >
                    <div className="text-2xl">👑</div>
                  </motion.div>
                )}
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-white mb-2"
              >
                {celebrationData.title}
              </motion.h2>

              {/* Message */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-purple-200 mb-6 text-lg"
              >
                {celebrationData.message}
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-2 gap-4 mb-6"
              >
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                  <div className="text-2xl font-bold text-white">{celebrationData.totalTasks}</div>
                  <div className="text-purple-200 text-sm">Tasks Completed</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
                  <div className="text-2xl font-bold text-white">{celebrationData.totalMinutes}</div>
                  <div className="text-purple-200 text-sm">Minutes Studied</div>
                </div>
              </motion.div>

              {/* Subjects */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mb-6"
              >
                <p className="text-purple-200 text-sm mb-3">Subjects Mastered Today:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {celebrationData.subjects.map((subject, index) => (
                    <motion.span
                      key={subject}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full font-medium"
                    >
                      {subject}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* Rewards */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mb-8"
              >
                <p className="text-purple-200 text-sm mb-4">🎁 Your Rewards:</p>
                <div className="space-y-3">
                  {celebrationData.rewards.map((reward, index) => {
                    const IconComponent = reward.icon;
                    return (
                      <motion.div
                        key={reward.type}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        className="flex items-center justify-center space-x-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20"
                      >
                        <IconComponent className={`w-5 h-5 ${reward.color}`} />
                        <span className="text-white font-medium">
                          {reward.type === 'badge' && reward.name}
                          {reward.type === 'points' && `+${reward.amount} Points!`}
                          {reward.type === 'streak' && `${reward.count} Day Streak!`}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Floating Hearts */}
              <div className="absolute top-4 left-4">
                <motion.div
                  animate={{ 
                    y: [-5, -15, -5],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Heart className="w-6 h-6 text-pink-400 fill-current" />
                </motion.div>
              </div>

              <div className="absolute top-4 right-4">
                <motion.div
                  animate={{ 
                    y: [-3, -13, -3],
                    rotate: [0, -10, 10, 0]
                  }}
                  transition={{ 
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                >
                  <Star className="w-6 h-6 text-yellow-400 fill-current" />
                </motion.div>
              </div>

              {/* Close Button */}
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCelebration(false)}
                className={`font-bold py-3 px-8 rounded-xl transition-all duration-200 shadow-lg ${
                  isWeekly
                    ? 'bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 hover:from-yellow-700 hover:via-orange-700 hover:to-red-700 text-white shadow-yellow-500/25'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-purple-500/25'
                }`}
              >
                {isWeekly ? (
                  <>🏆 LEGENDARY! Ready for More! 🏆</>
                ) : (
                  <>✨ Awesome! Continue Learning ✨</>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const getSubjectColor = (subject) => {
    const colors = {
      'Mathematics': 'from-blue-500 to-blue-600',
      'Science': 'from-green-500 to-green-600',
      'English': 'from-purple-500 to-purple-600',
      'History': 'from-orange-500 to-orange-600',
      'Geography': 'from-teal-500 to-teal-600',
      'Physics': 'from-indigo-500 to-indigo-600',
      'Chemistry': 'from-pink-500 to-pink-600',
      'Biology': 'from-emerald-500 to-emerald-600',
      'Computer Science': 'from-cyan-500 to-cyan-600',
      'Art': 'from-rose-500 to-rose-600',
      'Music': 'from-violet-500 to-violet-600',
      'Physical Education': 'from-red-500 to-red-600',
      'General': 'from-slate-500 to-slate-600'
    };
    return colors[subject] || colors['General'];
  };

  const ScheduleGenerator = () => {
    const [generatorData, setGeneratorData] = useState({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subjects: [],
      dailyHours: 2,
      dailyStartTime: '09:00',
      includeWeekends: false,
      prioritySubjects: []
    });
    const [generating, setGenerating] = useState(false);

    const subjects = [
      'Mathematics', 'Science', 'English', 'History', 'Geography', 
      'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Art', 
      'Music', 'Physical Education', 'General'
    ];

    const handleGenerate = async () => {
      if (generatorData.subjects.length === 0) {
        toast.error('Please select at least one subject');
        return;
      }

      setGenerating(true);
      await generateAISchedule(generatorData);
      setGenerating(false);
    };

    return (
      <>
      <Navbar />
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Brain className="w-6 h-6 text-purple-400 mr-2" />
                <h2 className="text-2xl font-bold text-white">AI Schedule Generator</h2>
              </div>
              <button
                onClick={() => setShowGenerator(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={generatorData.startDate}
                    onChange={(e) => setGeneratorData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={generatorData.endDate}
                    onChange={(e) => setGeneratorData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Select Subjects</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {subjects.map(subject => (
                    <motion.button
                      key={subject}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setGeneratorData(prev => ({
                          ...prev,
                          subjects: prev.subjects.includes(subject)
                            ? prev.subjects.filter(s => s !== subject)
                            : [...prev.subjects, subject]
                        }));
                      }}
                      className={`p-3 rounded-lg border transition-all duration-200 text-sm ${
                        generatorData.subjects.includes(subject)
                          ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                          : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {subject}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Daily Study Hours: {generatorData.dailyHours}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="0.5"
                    value={generatorData.dailyHours}
                    onChange={(e) => setGeneratorData(prev => ({ ...prev, dailyHours: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>1h</span>
                    <span>4h</span>
                    <span>8h</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Daily Start Time</label>
                  <input
                    type="time"
                    value={generatorData.dailyStartTime}
                    onChange={(e) => setGeneratorData(prev => ({ ...prev, dailyStartTime: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeWeekends"
                  checked={generatorData.includeWeekends}
                  onChange={(e) => setGeneratorData(prev => ({ ...prev, includeWeekends: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="includeWeekends" className="ml-3 text-white">
                  Include weekends in schedule
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowGenerator(false)}
                  className="flex-1 px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleGenerate}
                  disabled={generating}
                  whileHover={{ scale: generating ? 1 : 1.02 }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all font-medium"
                >
                  {generating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Schedule
                    </div>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      </>
    );
  };

  const StudyBlockCard = ({ block, day, blockIndex, date }) => {
    const isCompleting = completingBlock === `${day}-${blockIndex}`;
    const isToday = date.toDateString() === new Date().toDateString();
    const currentTime = new Date();
    const blockStartTime = new Date(date);
    const [startHour, startMinute] = block.startTime.split(':');
    blockStartTime.setHours(parseInt(startHour), parseInt(startMinute));
    
    const isCurrentTime = isToday && currentTime >= blockStartTime && 
                         currentTime <= new Date(blockStartTime.getTime() + block.duration * 60000);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-xl border transition-all duration-200 ${
          block.isCompleted 
            ? 'bg-green-500/10 border-green-500/30' 
            : isCurrentTime
            ? 'bg-yellow-500/10 border-yellow-500/30 shadow-lg shadow-yellow-500/20'
            : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getSubjectColor(block.subject)} text-white`}>
                {block.subject}
              </div>
              <div className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-slate-600/50 text-slate-300 border border-slate-500/50">
                📅 {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              {isToday && (
                <div className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Today
                </div>
              )}
            </div>
            <div className="flex items-center text-slate-300 text-sm mb-1">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(block.startTime)} - {formatTime(block.endTime)}
            </div>
            <div className="text-slate-400 text-sm">
              {block.duration} minutes • {block.studyType || 'Study'} • {block.difficulty || 'medium'}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {block.priority === 'high' && (
              <Target className="w-4 h-4 text-red-400" />
            )}
            {isCurrentTime && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-yellow-400 rounded-full"
              />
            )}
          </div>
        </div>

        {block.notes && (
          <div className="text-slate-300 text-sm mb-3 p-2 bg-slate-600/30 rounded-lg">
            {block.notes}
          </div>
        )}

        {!block.isCompleted ? (
          <motion.button
            onClick={() => completeStudyBlock(day, blockIndex)}
            disabled={isCompleting}
            whileHover={{ scale: isCompleting ? 1 : 1.05 }}
            whileTap={{ scale: isCompleting ? 1 : 0.95 }}
            className={`w-full px-4 py-2 rounded-lg transition-all font-medium ${
              isCurrentTime
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isCompleting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Completing...
              </div>
            ) : isCurrentTime ? (
              <div className="flex items-center justify-center">
                <Play className="w-4 h-4 mr-2" />
                Start Session
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Complete
              </div>
            )}
          </motion.button>
        ) : (
          <div className="flex items-center justify-center py-2 text-green-400 font-medium">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Completed
          </div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="p-4">
        {showGenerator && <ScheduleGenerator />}

        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              My Schedule
            </h1>
            <p className="text-slate-400 mt-1">
              {activeSchedule ? 'Your personalized study schedule' : 'Create your first study schedule'}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowGenerator(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              <Brain className="w-4 h-4 mr-2" />
              Generate AI Schedule
            </button>
          </div>
        </div>

        {!activeSchedule ? (
          // No Schedule State
          <div className="text-center py-16">
            <Calendar className="w-24 h-24 text-slate-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">No Active Schedule</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Create your first personalized study schedule using our AI generator. 
              It will optimize your study time based on your preferences and goals.
            </p>
            <motion.button
              onClick={() => setShowGenerator(true)}
              whileHover={{ scale: 1.05 }}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-medium mx-auto"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create Your First Schedule
            </motion.button>
          </div>
        ) : (
          // Schedule View
          <div>
            {/* Statistics Cards */}
            {statistics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Completion Rate</p>
                      <p className="text-2xl font-bold text-white">{Math.round(statistics.averageCompletionRate)}%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-400" />
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Hours Completed</p>
                      <p className="text-2xl font-bold text-white">{statistics.totalCompletedHours.toFixed(1)}</p>
                    </div>
                    <Clock className="w-8 h-8 text-green-400" />
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Schedules</p>
                      <p className="text-2xl font-bold text-white">{statistics.totalSchedules}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-400" />
                  </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Current Week</p>
                      <p className="text-2xl font-bold text-white">{activeSchedule.currentWeekCompletion}%</p>
                    </div>
                    <Target className="w-8 h-8 text-orange-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() - 7);
                    setSelectedDate(newDate);
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <h2 className="text-xl font-bold text-white">
                  {getWeekDays()[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {' '}
                  {getWeekDays()[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                
                <button
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setDate(newDate.getDate() + 7);
                    setSelectedDate(newDate);
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Today
              </button>
            </div>

            {/* Today's Tasks Summary */}
            {(() => {
              const today = new Date();
              const todayName = getDayName(today);
              const todaySchedule = activeSchedule.weeklySchedule[todayName] || [];
              const todayCompleted = todaySchedule.filter(block => block.isCompleted).length;
              
              if (todaySchedule.length > 0) {
                return (
                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-purple-400" />
                      Today's Schedule - {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      <div className="ml-auto text-sm bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
                        {todayCompleted}/{todaySchedule.length} completed
                        {todayCompleted === todaySchedule.length && todaySchedule.length > 0 && (
                          <span className="ml-2">🎉</span>
                        )}
                        {todayCompleted === todaySchedule.length - 1 && todaySchedule.length > 1 && (
                          <span className="ml-2 animate-pulse">🔥 Almost there!</span>
                        )}
                      </div>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {todaySchedule.map((block, blockIndex) => (
                        <div key={blockIndex} className={`p-3 rounded-lg border flex items-center justify-between ${
                          block.isCompleted 
                            ? 'bg-green-500/10 border-green-500/30 text-green-300'
                            : 'bg-slate-700/30 border-slate-600/50 text-slate-300'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${block.isCompleted ? 'bg-green-400' : 'bg-slate-500'}`} />
                            <div>
                              <div className="font-medium text-sm">{block.subject}</div>
                              <div className="text-xs opacity-75">{formatTime(block.startTime)} - {formatTime(block.endTime)}</div>
                            </div>
                          </div>
                          {block.isCompleted && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Weekly Overview */}
            <div className="mb-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                Weekly Overview
                {(() => {
                  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                  const completedDaysThisWeek = weekDays.filter(day => {
                    const daySchedule = activeSchedule.weeklySchedule[day] || [];
                    return daySchedule.length > 0 && daySchedule.every(block => block.isCompleted);
                  });
                  const totalScheduledDays = weekDays.filter(day => {
                    const daySchedule = activeSchedule.weeklySchedule[day] || [];
                    return daySchedule.length > 0;
                  });
                  
                  if (completedDaysThisWeek.length === totalScheduledDays.length && totalScheduledDays.length > 0) {
                    return <span className="ml-auto text-sm bg-green-500/20 text-green-300 px-3 py-1 rounded-full">🏆 Perfect Week!</span>;
                  } else if (completedDaysThisWeek.length === totalScheduledDays.length - 1 && totalScheduledDays.length > 1) {
                    return <span className="ml-auto text-sm bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full animate-pulse">🔥 Almost Perfect!</span>;
                  }
                  return null;
                })()}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
                {getWeekDays().map((date, index) => {
                  const dayName = getDayName(date);
                  const daySchedule = activeSchedule.weeklySchedule[dayName] || [];
                  const isToday = date.toDateString() === new Date().toDateString();
                  const completedTasks = daySchedule.filter(block => block.isCompleted).length;
                  
                  return (
                    <div key={index} className={`p-3 rounded-lg border text-center ${
                      isToday 
                        ? 'bg-purple-500/10 border-purple-500/30' 
                        : 'bg-slate-700/20 border-slate-600/30'
                    }`}>
                      <div className={`text-xs font-medium mb-1 ${isToday ? 'text-purple-300' : 'text-slate-400'}`}>
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className={`text-sm font-bold mb-1 ${isToday ? 'text-purple-200' : 'text-white'}`}>
                        {date.getDate()}
                      </div>
                      <div className="text-xs">
                        {daySchedule.length > 0 ? (
                          <div className={`inline-flex items-center px-2 py-1 rounded-full ${
                            completedTasks === daySchedule.length && daySchedule.length > 0
                              ? 'bg-green-500/20 text-green-300'
                              : completedTasks === daySchedule.length - 1 && daySchedule.length > 1
                              ? 'bg-orange-500/20 text-orange-300 animate-pulse'
                              : 'bg-slate-600/30 text-slate-400'
                          }`}>
                            {completedTasks}/{daySchedule.length}
                            {completedTasks === daySchedule.length && daySchedule.length > 0 && (
                              <span className="ml-1">✨</span>
                            )}
                            {completedTasks === daySchedule.length - 1 && daySchedule.length > 1 && (
                              <span className="ml-1">🔥</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500">No tasks</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Schedule Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
              {getWeekDays().map((date, index) => {
                const dayName = getDayName(date);
                // Only show blocks if the date is on or after the schedule start date
                const scheduleStartDate = activeSchedule.startDate ? new Date(activeSchedule.startDate) : null;
                // Compare dates at midnight (ignore time component)
                const dateAtMidnight = new Date(date);
                dateAtMidnight.setHours(0, 0, 0, 0);
                const startDateAtMidnight = scheduleStartDate ? new Date(scheduleStartDate) : null;
                if (startDateAtMidnight) {
                  startDateAtMidnight.setHours(0, 0, 0, 0);
                }
                const isBeforeStartDate = startDateAtMidnight && dateAtMidnight < startDateAtMidnight;
                const daySchedule = (!isBeforeStartDate && activeSchedule.weeklySchedule[dayName]) ? activeSchedule.weeklySchedule[dayName] : [];
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <div key={index} className="space-y-4">
                    <div className={`text-center p-4 rounded-xl border ${
                      isToday 
                        ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/50 shadow-lg shadow-purple-500/20' 
                        : isBeforeStartDate
                        ? 'bg-slate-800/20 border-slate-700/20 opacity-50'
                        : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50'
                    } transition-all duration-200`}>
                      <div className={`text-xs uppercase tracking-wider font-semibold mb-1 ${isToday ? 'text-purple-300' : isBeforeStartDate ? 'text-slate-600' : 'text-slate-500'}`}>
                        {date.toLocaleDateString('en-US', { weekday: 'long' })}
                      </div>
                      <div className={`text-2xl font-bold mb-1 ${isToday ? 'text-purple-200' : isBeforeStartDate ? 'text-slate-600' : 'text-white'}`}>
                        {date.getDate()}
                      </div>
                      <div className={`text-xs ${isToday ? 'text-purple-400' : isBeforeStartDate ? 'text-slate-600' : 'text-slate-400'}`}>
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                      {isBeforeStartDate && (
                        <div className="mt-2 inline-block px-2 py-1 bg-slate-700/30 text-slate-500 text-xs rounded-full font-medium">
                          Before Start
                        </div>
                      )}
                      {isToday && !isBeforeStartDate && (
                        <div className="mt-2 inline-block px-2 py-1 bg-purple-500/30 text-purple-300 text-xs rounded-full font-medium">
                          Today
                        </div>
                      )}
                      {daySchedule.length > 0 && (
                        <div className="mt-2 text-xs">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full ${
                            daySchedule.filter(block => block.isCompleted).length === daySchedule.length
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : 'bg-slate-600/30 text-slate-400 border border-slate-600/50'
                          }`}>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {daySchedule.filter(block => block.isCompleted).length}/{daySchedule.length}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {isBeforeStartDate ? (
                        <div className="text-center py-8 text-slate-600 text-sm">
                          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Schedule starts {scheduleStartDate ? scheduleStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'later'}</p>
                        </div>
                      ) : daySchedule.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No sessions</p>
                        </div>
                      ) : (
                        daySchedule.map((block, blockIndex) => (
                          <StudyBlockCard
                            key={blockIndex}
                            block={block}
                            day={dayName}
                            blockIndex={blockIndex}
                            date={date}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </div>
      
      {/* Celebration Modal */}
      <CelebrationModal />
    </div>
  );
};

export default MySchedule;
