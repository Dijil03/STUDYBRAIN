import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Zap, Calendar, CreditCard, CheckCircle, Trophy, Award, Flame, Heart, Sparkles, Target, Rocket } from 'lucide-react';
import Navbar from '../components/Navbar';
import AvatarManager from '../components/AvatarManager';
import MotivationalMessage from '../components/MotivationalMessage';
import api from '../utils/axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [managingSubscription, setManagingSubscription] = useState(false);
  const [stripeData, setStripeData] = useState(null);
  const [loadingStripeData, setLoadingStripeData] = useState(false);
  
  // Gamification state
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Motivational message state
  const [showMotivationalMessage, setShowMotivationalMessage] = useState(false);
  const [motivationalData, setMotivationalData] = useState({ duration: '', subject: '', type: 'success' });

  useEffect(() => {
    fetchUserProfile();
    // Load avatar from localStorage
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
      setCurrentAvatar(savedAvatar);
    }

    // Listen for storage changes (when subscription is updated)
    const handleStorageChange = (e) => {
      if (e.key === 'userSubscription' || e.key === 'subscriptionUpdated') {
        fetchUserProfile();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for subscription updates every 5 seconds
    const interval = setInterval(() => {
      fetchUserProfile();
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Fetch Stripe data when user is loaded and has a subscription
  useEffect(() => {
    if (user?._id && user?.subscription?.stripeSubscriptionId) {
      fetchStripeData();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/google/success');
      
      if (response.status === 200) {
        const data = response.data;
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planName) => {
    switch (planName) {
      case 'Study Pro':
        return <Star className="w-6 h-6 text-purple-400" />;
      case 'Study Master':
        return <Crown className="w-6 h-6 text-amber-400" />;
      default:
        return <Zap className="w-6 h-6 text-blue-400" />;
    }
  };

  const getPlanColor = (planName) => {
    switch (planName) {
      case 'Study Pro':
        return 'from-purple-500 to-pink-500';
      case 'Study Master':
        return 'from-amber-500 to-orange-500';
      default:
        return 'from-blue-500 to-cyan-500';
    }
  };

  const handleAvatarUpdate = (newAvatar) => {
    setCurrentAvatar(newAvatar);
    // Update user object if needed
    if (user) {
      setUser({ ...user, profilePicture: newAvatar });
    }
    
    // Gamification: Award XP for updating avatar
    const newXp = xp + 10;
    setXp(newXp);
    
    // Check for level up
    const newLevel = Math.floor(newXp / 100) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
    
    // Show motivational message
    setMotivationalData({
      duration: 'Avatar Update',
      subject: 'Profile',
      type: 'success'
    });
    setShowMotivationalMessage(true);
  };

  const refreshProfile = () => {
    fetchUserProfile();
  };

  // Gamification functions
  const closeMotivationalMessage = () => {
    setShowMotivationalMessage(false);
  };

  // Daily motivation quotes
  const dailyQuotes = {
    Monday: "🚀 Start your week with energy and determination!",
    Tuesday: "💪 You're building momentum - keep going!",
    Wednesday: "🎯 Midweek focus - you're halfway there!",
    Thursday: "⚡ Push through - the weekend is almost here!",
    Friday: "🎉 Finish strong - TGIF energy!",
    Saturday: "🌟 Weekend productivity - you're unstoppable!",
    Sunday: "🔄 Reflect, recharge, and prepare for greatness!"
  };

  const getCurrentDayQuote = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return dailyQuotes[today] || "✨ Every day is a chance to be amazing!";
  };

  // Calculate user stats based on account age
  const calculateUserStats = () => {
    if (!user) return { level: 1, xp: 0, streak: 0, achievements: [] };
    
    const accountAge = Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
    const baseXp = Math.min(accountAge * 2, 200); // 2 XP per day, max 200
    const calculatedLevel = Math.floor(baseXp / 100) + 1;
    const calculatedStreak = Math.min(accountAge, 30); // Max 30 day streak
    
    const userAchievements = [];
    if (accountAge >= 7) userAchievements.push('Week Warrior');
    if (accountAge >= 30) userAchievements.push('Monthly Master');
    if (accountAge >= 100) userAchievements.push('Century Scholar');
    if (user.subscription && user.subscription.plan !== 'free') userAchievements.push('Premium Member');
    if (user.isGoogleUser) userAchievements.push('Google Guru');
    
    return {
      level: calculatedLevel,
      xp: baseXp,
      streak: calculatedStreak,
      achievements: userAchievements
    };
  };

  // Update gamification stats when user loads
  useEffect(() => {
    if (user) {
      const stats = calculateUserStats();
      setLevel(stats.level);
      setXp(stats.xp);
      setStreak(stats.streak);
      setAchievements(stats.achievements);
    }
  }, [user]);

  // Fetch real subscription data from Stripe
  const fetchStripeData = async () => {
    if (!user?._id) return;
    
    try {
      setLoadingStripeData(true);
      const response = await api.get(`/stripe/${user._id}/stripe-data`);
      if (response.data.success) {
        setStripeData(response.data.subscription);
        console.log('Fetched Stripe data:', response.data.subscription);
      }
    } catch (error) {
      console.error('Error fetching Stripe data:', error);
      // Don't show error to user, just log it
    } finally {
      setLoadingStripeData(false);
    }
  };


  // Handle subscription management
  const handleManageSubscription = async () => {
    if (!user?.subscription?.stripeCustomerId) {
      alert('No active subscription found. Please subscribe first.');
      return;
    }

    try {
      setManagingSubscription(true);
      
      // Create portal session for subscription management
      const response = await api.post(`/stripe/${user._id}/portal`, {
        customerId: user.subscription.stripeCustomerId
      });

      if (response.data.success && response.data.url) {
        // Redirect to Stripe Customer Portal
        window.open(response.data.url, '_blank');
      } else {
        alert('Failed to open subscription management. Please try again.');
      }
    } catch (error) {
      console.error('Error opening subscription management:', error);
      alert('Error opening subscription management: ' + (error.response?.data?.message || error.message));
    } finally {
      setManagingSubscription(false);
    }
  };

  // Cancel subscription function
  const handleCancelSubscription = async () => {
    if (!user?.subscription?.stripeSubscriptionId) {
      alert('No active subscription found. Please subscribe first to manage your subscription.');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.'
    );

    if (!confirmed) return;

    try {
      setManagingSubscription(true);
      
      // Call backend to cancel subscription
      const response = await api.post(`/stripe/${user._id}/cancel-subscription`, {
        subscriptionId: user.subscription.stripeSubscriptionId
      });

      if (response.data.success) {
        // Redirect to cancellation success page
        window.location.href = '/cancellation-success';
      } else {
        alert('Failed to cancel subscription. Please try again or contact support.');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      
      let errorMessage = 'Error cancelling subscription: ';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error occurred';
      }
      
      alert(errorMessage);
    } finally {
      setManagingSubscription(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Not Authenticated</h2>
            <p className="text-white/70">Please log in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      <Navbar />
      
      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating geometric shapes */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20"
        />
        <motion.div
          animate={{ 
            y: [0, 30, 0],
            rotate: [360, 180, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg opacity-20"
        />
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, -180, -360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
          className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-20"
        />
        <motion.div
          animate={{ 
            y: [0, 25, 0],
            rotate: [360, 0, -360],
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-20 right-1/3 w-14 h-14 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg opacity-20"
        />
        
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
            className="absolute w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
        
        {/* Floating emojis */}
        {['🎯', '⭐', '🚀', '💪', '🎉', '🔥', '✨', '🌟'].map((emoji, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -80, 0],
              rotate: [0, 360, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
            className="absolute text-2xl opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl"
        >
          {/* Profile Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center mb-4"
            >
              <AvatarManager
                currentAvatar={currentAvatar || user.profilePicture}
                username={user.username}
                userId={user.id}
                onAvatarUpdate={handleAvatarUpdate}
                size="2xl"
              />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl font-bold text-white mb-2"
            >
              {user.username}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-white/70"
            >
              {user.email}
            </motion.p>
          </div>

          {/* Gamification Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-8 bg-white/5 rounded-xl p-6 border border-white/10"
          >
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white ml-3">Your Progress Level</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Level Display */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-white font-bold text-2xl">{level}</span>
                </div>
                <h3 className="text-xl font-bold text-white">Level</h3>
                <p className="text-white/70">Your current level</p>
              </div>

              {/* XP Progress */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-white font-bold text-lg">{xp}</span>
                </div>
                <h3 className="text-xl font-bold text-white">Experience</h3>
                <p className="text-white/70">{xp % 100}/100 XP</p>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(xp % 100)}%` }}
                  />
                </div>
              </div>

              {/* Streak */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-white font-bold text-lg">{streak}</span>
                </div>
                <h3 className="text-xl font-bold text-white">Streak</h3>
                <p className="text-white/70">Days active</p>
              </div>

              {/* Daily Quote */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Heart className="w-8 h-8 text-white fill-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Today's Quote</h3>
                <p className="text-white/70 text-sm italic">{getCurrentDayQuote()}</p>
              </div>
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center space-x-2 mb-4">
                  <Award className="w-5 h-5 text-purple-400" />
                  <h4 className="text-lg font-semibold text-white">Achievements</h4>
                  <span className="text-purple-400 font-bold text-sm">({achievements.length})</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      {achievement}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Account Type</h3>
                <p className="text-white/70">
                  {user.isGoogleUser ? 'Google Account' : 'Email Account'}
                </p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Member Since</h3>
                <p className="text-white/70">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-2">User ID</h3>
                <p className="text-white/70 text-sm font-mono">
                  {user.id}
                </p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-2">Status</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                  Active
                </span>
              </div>
            </div>
          </motion.div>

          {/* Subscription Information */}
          {user.subscription && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8 bg-white/5 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Subscription</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={refreshProfile}
                    className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                  >
                    Refresh
                  </button>
                  {user?.subscription?.stripeSubscriptionId && (
                    <button
                      onClick={fetchStripeData}
                      disabled={loadingStripeData}
                      className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg text-sm hover:bg-green-500/30 transition-colors disabled:opacity-50"
                    >
                      {loadingStripeData ? 'Loading...' : 'Refresh Stripe Data'}
                    </button>
                  )}
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                    user.subscription.status === 'active' 
                      ? user.subscription.cancel_at_period_end
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        : 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                  }`}>
                    {user.subscription.cancel_at_period_end ? 'Cancelled' : user.subscription.status}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Plan Info */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${getPlanColor(user.subscription.planName)}`}>
                      {getPlanIcon(user.subscription.planName)}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{user.subscription.planName}</h4>
                      <p className="text-white/70 capitalize">
                        {user.subscription.plan === 'free' ? 'Free Plan' : 
                         user.subscription.plan === 'premium' ? 'Premium Plan' : 
                         user.subscription.plan === 'enterprise' ? 'Enterprise Plan' : 
                         'Subscription Plan'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-white/50" />
                      <div>
                        <p className="text-sm text-white/70">Next billing date</p>
                        <p className="font-medium text-white">
                          {stripeData?.currentPeriodEnd ? 
                            new Date(stripeData.currentPeriodEnd).toLocaleDateString() : 
                            user.subscription.currentPeriodEnd ? 
                              new Date(user.subscription.currentPeriodEnd).toLocaleDateString() : 
                              'N/A'
                          }
                        </p>
                        {stripeData?.daysRemaining && (
                          <p className="text-xs text-white/50">
                            {stripeData.daysRemaining} days remaining
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-white/50" />
                      <div>
                        <p className="text-sm text-white/70">Plan Type</p>
                        <p className="font-medium text-white capitalize">
                          {user.subscription.plan === 'free' ? 'Free Plan' : 
                           user.subscription.plan === 'premium' ? 'Premium Plan' : 
                           user.subscription.plan === 'enterprise' ? 'Enterprise Plan' : 
                           user.subscription.plan}
                        </p>
                        {user.subscription.plan !== 'free' && user.subscription.billingCycle && (
                          <p className="text-xs text-white/50 capitalize">
                            {user.subscription.billingCycle} billing
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h5 className="text-lg font-semibold text-white mb-4">What's included:</h5>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-white/70">Unlimited documents</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-white/70">Advanced AI assistance</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-white/70">Priority support</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-white/70">Study groups</span>
                    </li>
                    {user.subscription.planName === 'Study Master' && (
                      <>
                        <li className="flex items-center space-x-3">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-white/70">Unlimited storage</span>
                        </li>
                        <li className="flex items-center space-x-3">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-white/70">API access</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {/* Subscription Management Buttons */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h5 className="text-lg font-semibold text-white mb-4">Manage Subscription</h5>
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleManageSubscription}
                    disabled={managingSubscription}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {managingSubscription ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Opening...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Manage Billing
                      </>
                    )}
                  </motion.button>
                  
                  {/* Only show cancel button for active subscriptions */}
                  {user?.subscription?.status === 'active' && !user?.subscription?.cancel_at_period_end && (
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCancelSubscription}
                      disabled={managingSubscription}
                      className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel Subscription
                    </motion.button>
                  )}
                  
                  {/* Show reactivation button for cancelled subscriptions */}
                  {user?.subscription?.cancel_at_period_end && (
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => window.location.href = '/pricing'}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reactivate Subscription
                    </motion.button>
                  )}
                </div>
                
                
                {/* Cancellation notice for cancelled subscriptions */}
                {user?.subscription?.cancel_at_period_end && (
                  <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-yellow-300 font-semibold">Subscription Cancelled</p>
                    </div>
                    <p className="text-yellow-200 text-sm">
                      Your subscription will end on {stripeData?.currentPeriodEnd ? 
                        new Date(stripeData.currentPeriodEnd).toLocaleDateString() : 
                        user.subscription.currentPeriodEnd ? 
                          new Date(user.subscription.currentPeriodEnd).toLocaleDateString() : 
                          'the end of your billing period'
                      }. 
                      You can reactivate anytime before then.
                    </p>
                  </div>
                )}
                
                {/* Regular notice for active subscriptions */}
                {!user?.subscription?.cancel_at_period_end && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-300 text-sm">
                      <strong>Note:</strong> Cancelling your subscription will end your access to premium features at the end of your current billing period. You can reactivate anytime.
                    </p>
                  </div>
                )}

                {/* Additional Stripe Data Display */}
                {stripeData && (
                  <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h4 className="text-blue-300 font-semibold mb-3 flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Live Stripe Data
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-blue-200 font-medium">Subscription ID</p>
                        <p className="text-blue-100 font-mono text-xs">{stripeData.id}</p>
                      </div>
                      <div>
                        <p className="text-blue-200 font-medium">Amount</p>
                        <p className="text-blue-100">${(stripeData.amount / 100).toFixed(2)} {stripeData.currency?.toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-blue-200 font-medium">Billing Cycle</p>
                        <p className="text-blue-100 capitalize">{stripeData.interval}ly</p>
                      </div>
                      <div>
                        <p className="text-blue-200 font-medium">Status</p>
                        <p className="text-blue-100 capitalize">{stripeData.status}</p>
                      </div>
                      {stripeData.daysRemaining && (
                        <div className="md:col-span-2">
                          <p className="text-blue-200 font-medium">Days Remaining</p>
                          <p className="text-blue-100">{stripeData.daysRemaining} days until next billing</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* No Subscription or Free Plan */}
          {(!user.subscription || user.subscription.plan === 'free' || user.subscription.status === 'inactive') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-8 bg-white/5 rounded-xl p-6 text-center"
            >
              <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Free Plan</h3>
              <p className="text-white/70 mb-4">You're currently on the free plan with basic features.</p>
              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/pricing'}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center mx-auto"
              >
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Premium
              </motion.button>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchUserProfile}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Refresh Profile
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <Target className="w-4 h-4 mr-2" />
              Edit Profile
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center justify-center"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Change Password
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Level Up Celebration */}
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 0.5,
              repeat: 3
            }}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-8 rounded-3xl text-center shadow-2xl"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold mb-2">Level Up!</h2>
            <p className="text-xl">You've reached Level {level}!</p>
          </motion.div>
        </motion.div>
      )}
      
      {/* Motivational Message */}
      {showMotivationalMessage && (
        <MotivationalMessage
          isVisible={showMotivationalMessage}
          onClose={closeMotivationalMessage}
          duration={motivationalData.duration}
          subject={motivationalData.subject}
          type={motivationalData.type}
        />
      )}
    </div>
  );
};

export default Profile;