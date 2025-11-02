import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import api from "../utils/axios";
import {
  Award, Lock, Loader2, Star, Trophy, Zap, Target, Flame, Crown, Sparkles, CheckCircle, Rocket, Shield, Heart, BookOpen, Clock, Eye as EyeIcon, Maximize, Diamond, TrendingUp, Filter
} from "lucide-react";
import { toast } from "react-toastify";

// Icon mapping for backend icons
const ICON_MAP = {
  'rocket': Rocket,
  'target': Target,
  'shield': Shield,
  'star': Star,
  'trophy': Trophy,
  'flame': Flame,
  'crown': Crown,
  'clock': Clock,
  'zap': Zap,
  'sparkles': Sparkles,
  'award': Award,
  'book': BookOpen,
  'heart': Heart,
  'maximize': Maximize,
  'diamond': Diamond,
  'trending': TrendingUp
};

// --- Helper Components ---

/**
 * Stunning Badge Card Component with Advanced Animations
 * @param {object} badge - Badge data from the catalog.
 * @param {boolean} earned - Whether the user has earned the badge.
 * @param {number} progress - The user's current progress towards the badge threshold.
 * @param {number} index - Index for staggered animation delay.
 */
const BadgeCard = ({ badge, earned, progress = 0, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Icon mapping - using backend icon names
  const getBadgeIcon = (badgeData) => {
    if (badgeData.icon && ICON_MAP[badgeData.icon]) {
      return ICON_MAP[badgeData.icon];
    }
    return Award; // Default icon
  };

  // Get unique badge shape based on badge ID - kept the original complex logic
  const getUniqueBadgeShape = (badgeId, rarity) => {
    const uniqueShapes = {
      // Homework badges
      'first_homework': 'rounded-3xl',
      'homework_count_10': 'rounded-2xl',
      'homework_count_50': 'rounded-full',
      'homework_count_100': 'rounded-none transform rotate-12',
      // Streak badges
      'homework_streak_3': 'rounded-xl',
      'homework_streak_7': 'rounded-2xl transform rotate-6',
      'homework_streak_30': 'rounded-full',
      'homework_streak_90': 'rounded-none transform rotate-45',
      // Study time badges
      'study_time_1h': 'rounded-2xl',
      'study_time_5h': 'rounded-3xl',
      'study_time_50h': 'rounded-full',
      // Special achievement badges
      'perfect_week': 'rounded-none transform rotate-45 scale-90',
      'legend_master': 'rounded-2xl border-4 border-white/50 border-double' // Special shape for legendary
    };
    // Fallback to simpler rarity shapes if no unique ID shape is found
    const rarityShapes = {
      'common': 'rounded-2xl',
      'uncommon': 'rounded-full',
      'rare': 'rounded-xl border-2 border-dashed',
      'epic': 'rounded-2xl transform rotate-3',
      'legendary': 'rounded-2xl transform rotate-45 scale-75'
    };
    return uniqueShapes[badgeId] || rarityShapes[rarity] || 'rounded-2xl';
  };

  // Get badge size based on rarity
  const getBadgeSize = (rarity) => {
    const sizes = {
      'common': 'w-16 h-16',
      'uncommon': 'w-18 h-18',
      'rare': 'w-20 h-20',
      'epic': 'w-22 h-22',
      'legendary': 'w-24 h-24'
    };
    return sizes[rarity] || 'w-16 h-16';
  };

  // Get shadow effect based on rarity
  const getShadowEffect = (rarity) => {
    const shadows = {
      'common': 'shadow-lg',
      'uncommon': 'shadow-xl',
      'rare': 'shadow-2xl',
      'epic': 'shadow-3xl',
      'legendary': 'shadow-4xl'
    };
    return shadows[rarity] || 'shadow-lg';
  };

  const IconComponent = getBadgeIcon(badge);
  // Calculate progress percentage, ensuring it doesn't exceed 100%
  const progressPercentage = Math.min((progress / badge.threshold) * 100, 100);
  const badgeShape = getUniqueBadgeShape(badge.id, badge.rarity || 'common');
  const badgeSize = getBadgeSize(badge.rarity || 'common');
  const shadowEffect = getShadowEffect(badge.rarity || 'common');

  // Render the icon component properly
  const renderIcon = (className) => {
    const Icon = IconComponent;
    return <Icon className={className} />;
  };

  // Helper to determine gradient colors for styling
  const getRarityGradient = (rarity) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-300 via-yellow-500 to-amber-600'; // More gold-like
      case 'epic': return 'from-red-500 via-pink-600 to-purple-700';
      case 'rare': return 'from-purple-500 to-indigo-600';
      case 'uncommon': return 'from-blue-500 to-cyan-500';
      default: return 'from-green-500 to-emerald-500';
    }
  };
  
  const rarityGradient = getRarityGradient(badge.rarity);
  
  // Custom box-shadow color based on rarity for the icon's glow
  const getGlowColor = (rarity) => {
    switch (rarity) {
        case 'legendary': return '#fcd34d'; // Amber-300
        case 'epic': return '#f472b6';     // Pink-400
        case 'rare': return '#a78bfa';     // Violet-400
        case 'uncommon': return '#60a5fa';  // Blue-400
        default: return '#34d399';         // Emerald-400
    }
  }
  const glowColor = getGlowColor(badge.rarity);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.1, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.05, y: -8, zIndex: 10, rotate: earned ? 1 : 0 }} // Subtle lift and tilt
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group cursor-pointer h-full"
    >
      {/* Animated Background Blur - Enhanced for a stronger hover effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${rarityGradient} rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500`}></div>

      {/* Main Card */}
      <div className={`relative p-8 rounded-3xl transition-all duration-300 overflow-hidden h-full flex flex-col ${
        earned
          ? 'bg-white/95 backdrop-blur-xl border-4 border-white/50 shadow-2xl hover:shadow-4xl' // Glass-morphism earned card
          : 'bg-gray-50/70 backdrop-blur-md border border-gray-200 shadow-md hover:shadow-xl' // Softer locked card
      }`}>
        
        {/* ENHANCEMENT: Gradient Border for Earned Badges */}
        {earned && (
          <motion.div 
            className="absolute inset-0 z-0 rounded-3xl p-[3px] opacity-100" // Increased padding for a thicker border
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{ 
              background: `linear-gradient(to right, ${glowColor} 0%, rgba(255,255,255,0) 50%, ${glowColor} 100%)` 
            }}
          >
             {/* Inner white background to create the border effect */}
             <div className="bg-white/95 backdrop-blur-xl rounded-[calc(1.5rem-3px)] h-full"></div> 
          </motion.div>
        )}

        <div className="relative z-10 flex-1 flex flex-col">
          {/* Badge Preview Button */}
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 bg-white/40 backdrop-blur-sm rounded-full hover:bg-white/60 transition-all duration-200 shadow-lg text-gray-700 hover:text-gray-900"
              title="Preview Badge"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Badge Preview Modal - Using a dedicated component structure for better visibility */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
                onClick={() => setShowPreview(false)}
              >
                <motion.div
                  initial={{ scale: 0.5, rotate: -90 }}
                  animate={{ scale: 1.5, rotate: 0 }} // Much larger preview
                  transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                  className={`w-32 h-32 flex items-center justify-center ${badgeShape} ${
                    earned
                      ? `bg-gradient-to-br ${rarityGradient} text-white ${shadowEffect} p-2`
                      : 'bg-gray-400 text-gray-700 p-2'
                  }`}
                  style={{
                    boxShadow: earned ? `0 0 50px ${glowColor}, 0 0 100px rgba(255,255,255,0.5)` : 'none', // Super intense glow on preview
                  }}
                  onClick={(e) => e.stopPropagation()} 
                >
                  {earned ? (
                    renderIcon("w-20 h-20") // Larger icon in preview
                  ) : (
                    <Lock className="w-12 h-12" />
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Icon Section with Dynamic Shape and Shadow */}
          <div className="flex justify-center mb-6 mt-4">
            <motion.div
              animate={{
                rotate: isHovered && earned ? [0, 5, -5, 0] : 0, // Quick subtle rotation on hover for earned
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ duration: 0.6 }}
              className={`${badgeSize} flex items-center justify-center ${badgeShape} ${
                earned
                  ? `bg-gradient-to-br ${rarityGradient} text-white ${shadowEffect}`
                  : 'bg-gray-200 text-gray-400 shadow-md'
              }`}
              style={{
                boxShadow: earned ? `0 0 15px ${glowColor}` : 'none' // Icon glow
              }}
            >
              {earned ? (
                renderIcon("w-8 h-8")
              ) : (
                <Lock className="w-6 h-6" />
              )}
            </motion.div>
          </div>

          {/* Badge Title with Rarity Styling */}
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-2xl font-black text-center mb-3 ${
              earned
                ? `bg-gradient-to-r ${rarityGradient} bg-clip-text text-transparent`
                : 'text-gray-800' // Darker text for better contrast on light card
            }`}
          >
            {badge.title}
          </motion.h3>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 text-center mb-6 leading-relaxed min-h-[48px] flex-1"
          >
            {badge.description}
          </motion.p>

          {/* Progress Bar for Locked Badges - Enhanced colors and animation */}
          {!earned && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-500">Progress</span>
                <span className="text-sm font-bold text-gray-800">
                  {progress < badge.threshold ? `${progress} / ${badge.threshold}` : "Complete!"}
                </span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  className="bg-gradient-to-r from-teal-400 to-green-500 h-3 rounded-full" // High-contrast progress bar
                  style={{
                      boxShadow: '0 0 5px rgba(52, 211, 153, 0.7)' // Subtle green glow on progress
                  }}
                />
              </div>
            </motion.div>
          )}

          {/* Rarity Indicator - Made bolder and more stylish */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center mb-3"
          >
            <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-extrabold tracking-widest uppercase ${
              `bg-gradient-to-r ${rarityGradient} text-white shadow-md` // Rarity gradient background
            }`}>
              {badge.rarity?.toUpperCase() || 'COMMON'}
            </div>
          </motion.div>

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-auto"
          >
            {earned ? (
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-lime-100 text-green-700 rounded-full font-bold shadow-xl border border-green-300">
                <CheckCircle className="w-4 h-4 mr-2" />
                Earned
              </div>
            ) : (
              <div className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-500 rounded-full font-medium shadow-sm">
                <Lock className="w-4 h-4 mr-2" />
                Locked
              </div>
            )}
          </motion.div>
        </div>

        {/* Enhanced Sparkle Animation for Earned Badges */}
        {earned && (
          <div className="absolute inset-0 pointer-events-none opacity-50">
            {/* Multiple sparkles based on rarity */}
            {Array.from({ length: badge.rarity === 'legendary' ? 8 : badge.rarity === 'epic' ? 6 : 4 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  rotate: [0, 360],
                  scale: [0.8, 1.5, 0.8], // More dramatic scale change
                  opacity: [0, 1, 0] // Fade in and out
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.6 + (Math.random() * 2) // Staggered and randomized initial delay
                }}
                className={`absolute w-1.5 h-1.5 rounded-full ${
                  badge.rarity === 'legendary'
                    ? 'bg-white shadow-xl' // White sparkle for legendary
                    : 'bg-yellow-300'
                }`}
                style={{
                  top: `${Math.random() * 80 + 10}%`,
                  left: `${Math.random() * 80 + 10}%`,
                  filter: 'blur(1px)', 
                }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// --- Main Component ---

const Badges = () => {
  const [badgeCatalog, setBadgeCatalog] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showNewBadges, setShowNewBadges] = useState(false);
  
  const userId = localStorage.getItem('userId');

  // Fetch badge data from backend
  useEffect(() => {
    const fetchBadgeData = async () => {
      if (!userId) {
        setError('Please log in to view your badges');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch badge catalog
        try {
          const catalogResponse = await api.get('/badges/catalog');
          console.log('Badge catalog response:', catalogResponse.data);
          setBadgeCatalog(Array.isArray(catalogResponse.data) ? catalogResponse.data : []);
        } catch (catalogErr) {
          console.warn('Badge catalog endpoint not available:', catalogErr);
          setBadgeCatalog([]);
        }

        // Fetch user's earned badges
        try {
          const userBadgesResponse = await api.get(`/badges/${userId}`);
          console.log('User badges response:', userBadgesResponse.data);
          setUserBadges(Array.isArray(userBadgesResponse.data) ? userBadgesResponse.data : []);
        } catch (badgesErr) {
          console.warn('User badges endpoint not available:', badgesErr);
          setUserBadges([]);
        }

        // Fetch user's badge progress
        try {
          const progressResponse = await api.get(`/badges/${userId}/progress`);
          console.log('User progress response:', progressResponse.data);
          setUserProgress(progressResponse.data || {});
        } catch (progressErr) {
          console.warn('User progress endpoint not available:', progressErr);
          setUserProgress({});
        }

        // Compute new badges (optional)
        try {
          await api.post(`/badges/${userId}/compute`);
        } catch (computeErr) {
          console.warn('Badge compute endpoint not available:', computeErr);
        }
        
      } catch (err) {
        console.error('Error fetching badge data:', err);
        setError('Failed to load badge data');
        toast.error('Failed to load badge data');
      } finally {
        setLoading(false);
      }
    };

    fetchBadgeData();
  }, [userId]);

  // Function to refresh badges
  const refreshBadges = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      await api.post(`/badges/${userId}/compute`);
      
      // Refetch user badges after computing
      const userBadgesResponse = await api.get(`/badges/${userId}`);
      setUserBadges(Array.isArray(userBadgesResponse.data) ? userBadgesResponse.data : []);
      
      toast.success('Badges updated!');
    } catch (err) {
      console.error('Error refreshing badges:', err);
      toast.error('Failed to refresh badges');
    } finally {
      setLoading(false);
    }
  };

  // Get earned badge IDs - with proper error handling
  const earnedIds = Array.isArray(userBadges) 
    ? userBadges.map(badge => badge.badgeId || badge.id)
    : [];
  
  // Debug logging
  console.log('Debug - userBadges:', userBadges);
  console.log('Debug - earnedIds:', earnedIds);
  console.log('Debug - badgeCatalog:', badgeCatalog);
  console.log('Debug - userProgress:', userProgress);
  
  // Get total completed tasks from progress
  const totalCompleted = userProgress.totalCompleted || 0;

  // Check if a badge is earned
  const isEarned = (badge) => earnedIds.includes(badge.id);

  // Calculate progress for each badge
  const getProgress = (badge) => {
    if (isEarned(badge)) {
      return badge.threshold;
    }

    // Get progress from userProgress object (keyed by badge ID)
    const progressData = userProgress[badge.id];
    if (progressData && typeof progressData === 'object') {
      return progressData.progress || 0;
    }
    return progressData || 0;
  };

  // Memoize the sorting and filtering for performance and stable list order
  const sortedCatalog = useMemo(() => {
    let allBadges = badgeCatalog.map(badge => ({
      ...badge,
      isEarned: isEarned(badge),
      progress: getProgress(badge)
    }));

    if (filter === 'earned') {
        allBadges = allBadges.filter(b => b.isEarned);
    } else if (filter === 'locked') {
        allBadges = allBadges.filter(b => !b.isEarned);
    }

    const earnedBadges = allBadges.filter(b => b.isEarned);
    const lockedBadges = allBadges.filter(b => !b.isEarned);

    const sortByRarity = (a, b) => {
      const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
      return (rarityOrder[b.rarity] || 1) - (rarityOrder[a.rarity] || 1);
    };
    
    const sortedEarned = earnedBadges.sort(sortByRarity);
    const sortedLocked = lockedBadges.sort((a, b) => {
        const progressA = (a.progress / a.threshold) * 100;
        const progressB = (b.progress / b.threshold) * 100;
        return progressB - progressA;
    });

    return [...sortedEarned, ...sortedLocked];
  }, [badgeCatalog, earnedIds, userProgress, filter]);

  const earnedCount = earnedIds.length;
  const totalCount = badgeCatalog.length;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-zinc-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading badges...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-zinc-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-white mb-3">Error Loading Badges</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No badges available state
  if (!loading && badgeCatalog.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-zinc-900 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-purple-400 text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-white mb-3">No Badges Available</h3>
            <p className="text-gray-400 mb-6">Badge system is not set up yet. Please contact your administrator.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Stunning Background with Animated Elements */}
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-zinc-900 to-gray-900 relative overflow-hidden">
        {/* Animated Background Elements - Made Subtle and darker */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <motion.div
            animate={{ x: [0, 150, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-60 -right-60 w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          ></motion.div>
          <motion.div
            animate={{ y: [0, 150, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-60 -left-60 w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          ></motion.div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-5"
          ></motion.div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
          
          {/* Stunning Header - Enhanced Glass-Morphism */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-4xl mb-12"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="flex items-center space-x-6 mb-8 lg:mb-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-red-500 rounded-2xl blur-lg opacity-80"></div>
                  <div className="relative bg-gradient-to-r from-yellow-400 to-red-500 p-5 rounded-2xl shadow-xl">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-6xl font-extrabold text-white mb-2 tracking-tighter bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                    Achievement Hall
                  </h1>
                  <p className="text-yellow-100/80 text-lg font-medium">
                    Showcasing your dedication and mastery.
                  </p>
                </div>
              </div>
              
              {/* Stats Display */}
              <div className="flex items-center space-x-8">
                <div className="text-center bg-white/5 p-6 rounded-xl border border-white/10 shadow-lg min-w-[120px]">
                  <div className="text-5xl font-extrabold text-white mb-3">{earnedCount}</div>
                  <div className="text-white/70 text-sm">Badges Earned</div>
                </div>
                <div className="text-center bg-white/5 p-6 rounded-xl border border-white/10 shadow-lg min-w-[120px]">
                  <div className="text-5xl font-extrabold text-green-400 mb-3">{totalCompleted}</div>
                  <div className="text-white/70 text-sm">Tasks Completed</div>
                </div>
                <div className="text-center bg-white/5 p-6 rounded-xl border border-white/10 shadow-lg hidden sm:block min-w-[120px]">
                  <div className="text-5xl font-extrabold text-blue-400 mb-3">{totalCount}</div>
                  <div className="text-white/70 text-sm">Total Badges</div>
                </div>
                <button
                  onClick={refreshBadges}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Filter/Sort Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="flex justify-end mb-8 space-x-4"
            >
                <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 flex items-center border border-white/10 shadow-lg">
                    <Filter className="w-5 h-5 text-white/70 mr-3 ml-2" />
                    {['all', 'earned', 'locked'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1 rounded-full text-sm font-semibold transition-all duration-300 capitalize ${
                                filter === f
                                    ? 'bg-purple-600 text-white shadow-xl'
                                    : 'text-white/60 hover:text-white/90'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </motion.div>


          {/* Badge Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch"
          >
            <AnimatePresence>
              {sortedCatalog.length > 0 ? (
                sortedCatalog.map((badge, index) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    earned={badge.isEarned}
                    progress={badge.progress}
                    index={index}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="col-span-full text-center py-16 bg-white/5 rounded-2xl border border-white/10"
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">No Badges Found</h3>
                  <p className="text-white/60 text-lg">
                    {filter === 'earned' ? "You haven't earned any badges yet!" : filter === 'locked' ? "All badges have been earned!" : "No badges are available in the catalog."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Badges;