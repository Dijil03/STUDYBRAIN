import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import api from '../utils/axios';
import AvatarManager from './AvatarManager';
import { 
  Brain, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Home, 
  BookOpen, 
  Calendar, 
  Target, 
  Zap, 
  Trophy, 
  Heart,
  Sparkles,
  ChevronDown,
  CreditCard,
  FileText,
  Folder,
  FolderOpen,
  Edit3,
  Clock,
  Award,
  Users,
  BarChart3,
  Settings,
  TestTube,
  Star,
  Crown,
  Book,
  Sun,
  Moon,
  Bell,
  Search,
  Globe,
  Layers,
  Activity,
  TrendingUp,
  Shield,
  Rocket,
  Lightbulb,
  Palette,
  Wand2,
  Gem,
  Crown as CrownIcon,
  Flame,
  Star as StarIcon,
  Zap as ZapIcon,
  Sparkles as SparklesIcon,
  GraduationCap,
  Leaf,
} from 'lucide-react';
import SimpleMusicPlayer from './SimpleMusicPlayer';

const Navbar = () => {
  const { theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuthStatus();
    // Load avatar from localStorage
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) {
      setCurrentAvatar(savedAvatar);
    }

    // Scroll tracking
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      
      // Don't close if clicking on navbar elements
      if (target.closest('[data-navbar]') || 
          target.closest('[data-menu]') || 
          target.closest('[data-user-menu]') || 
          target.closest('[data-tools-menu]')) {
        return;
      }
      
      // Close menus if clicking outside
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
      if (isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
      if (isToolsOpen) {
        setIsToolsOpen(false);
      }
    };

    // Only add listener if any menu is open
    if (isMenuOpen || isUserMenuOpen || isToolsOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen, isUserMenuOpen, isToolsOpen]);

  const checkAuthStatus = async () => {
    try {
      // First check localStorage for userId (faster, works even if API is down)
      const userId = localStorage.getItem('userId');
      const username = localStorage.getItem('username');
      
      if (userId && username) {
        // Set user from localStorage immediately for faster UI
        setUser({
          id: userId,
          username: username,
          email: localStorage.getItem('userEmail') || '',
          profilePicture: localStorage.getItem('userAvatar') || ''
        });
        setLoading(false);
      }
      
      // Then verify with API (if available)
      try {
        const response = await api.get('/auth/google/success');
        if (response.status === 200 && response.data.user) {
          // Update with full user data from API
          setUser(response.data.user);
          // Save to localStorage
          localStorage.setItem('userId', response.data.user.id);
          localStorage.setItem('username', response.data.user.username || response.data.user.firstName || 'User');
          if (response.data.user.email) {
            localStorage.setItem('userEmail', response.data.user.email);
          }
        }
      } catch (apiError) {
        // API check failed, but we already have localStorage data
        console.log('API auth check failed, using localStorage:', apiError.message);
        // Keep user from localStorage if we have it
        if (!userId) {
          setUser(null);
        }
      }
    } catch (error) {
      console.log('Auth check error:', error);
      // Fallback to localStorage
      const userId = localStorage.getItem('userId');
      const username = localStorage.getItem('username');
      if (userId && username) {
        setUser({
          id: userId,
          username: username,
          email: localStorage.getItem('userEmail') || '',
          profilePicture: localStorage.getItem('userAvatar') || ''
        });
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear session on backend
      try {
        await api.post('/auth/logout');
      } catch (apiError) {
        console.log('API logout call failed, proceeding with client-side cleanup');
      }
      
      // Clear all user data from localStorage
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userAvatar');
      
      // Clear state
      setUser(null);
      setCurrentAvatar(null);
      setIsUserMenuOpen(false);
      setIsToolsOpen(false);
      setIsMenuOpen(false);
      
      // Navigate to login
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear localStorage even if API call fails
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userAvatar');
      setUser(null);
      navigate('/login');
    }
  };

  const handleAvatarUpdate = (newAvatar) => {
    setCurrentAvatar(newAvatar);
    // Update user object if needed
    if (user) {
      setUser({ ...user, profilePicture: newAvatar });
    }
  };

  // Define navigation links
  const mainNavLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home, color: 'text-blue-400' },
    { name: 'AI Assistant', path: '/ai', icon: Sparkles, color: 'text-indigo-400' },
    { name: 'Study Time', path: '/study-time', icon: BookOpen, color: 'text-green-400' },
    { name: 'Homework', path: '/homework', icon: Target, color: 'text-orange-400' },
    { name: 'Week Plan', path: '/week-plan', icon: Calendar, color: 'text-purple-400' },
    { name: 'Study Group', path: '/study-groups', icon: Users, color: 'text-teal-400' },
    { name: 'My World', path: '/myworld', icon: Trophy, color: 'text-pink-400' },
    { name: 'Pricing', path: '/pricing', icon: CreditCard, color: 'text-yellow-400' },
  ];

  // Debug: Verify Pricing is in the array
  useEffect(() => {
    console.log('🔍 Navbar mainNavLinks:', mainNavLinks.map(l => l.name));
    console.log('🔍 Pricing exists?', mainNavLinks.some(l => l.name === 'Pricing'));
    console.log('🔍 Pricing link details:', mainNavLinks.find(l => l.name === 'Pricing'));
    console.log('🔍 Total nav links:', mainNavLinks.length);
    // Check if Pricing is rendered
    const pricingElement = document.querySelector('[href="/pricing"]');
    console.log('🔍 Pricing DOM element found?', !!pricingElement);
    if (pricingElement) {
      console.log('🔍 Pricing element styles:', window.getComputedStyle(pricingElement));
      console.log('🔍 Pricing element visible?', pricingElement.offsetParent !== null);
    }
  }, []);

  const toolsDropdown = [
    { name: 'AI Tutor', path: '/ai-tutor', icon: Sparkles, color: 'text-indigo-400' },
    { name: 'Flashcards', path: '/flashcard', icon: Zap, color: 'text-yellow-400' },
    { name: 'Flashcard Generator', path: '/flashcards', icon: Edit3, color: 'text-yellow-500' },
    { name: 'Flashcard Viewer', path: '/flashcard-viewer', icon: BookOpen, color: 'text-yellow-600' },
    { name: 'Study Timer', path: '/study-timer', icon: Clock, color: 'text-green-500' },
    { name: 'Goals', path: '/goals', icon: Target, color: 'text-cyan-400' },
    { name: 'Motivation', path: '/motivation', icon: Heart, color: 'text-red-400' },
    { name: 'Badges', path: '/badges', icon: Award, color: 'text-amber-400' },
    { name: 'Assessments', path: '/assessments', icon: TestTube, color: 'text-purple-500' },
    { name: 'Study Journal', path: '/study-journal', icon: Book, color: 'text-indigo-400' },
    { name: 'Google Classroom', path: '/google-classroom', icon: GraduationCap, color: 'text-blue-400' },
    { name: 'Documents', path: '/documents', icon: Folder, color: 'text-blue-500' },
    { name: 'Folder Manager', path: '/folder-manager', icon: FolderOpen, color: 'text-blue-600' },
    { name: 'Community', path: '/community', icon: Users, color: 'text-teal-400' },
    { name: 'Weekly Homework Log', path: '/weekly-homework-log', icon: BarChart3, color: 'text-orange-500' },
    { name: 'Exam Time', path: '/exam-time', icon: Clock, color: 'text-red-500' },
    { name: 'Note', path: '/note', icon: FileText, color: 'text-gray-400' },
    { name: 'Calendar', path: '/calendar', icon: Calendar, color: 'text-blue-400' },
    { name: 'Revision Scheduler', path: '/revisions', icon: Brain, color: 'text-purple-400' },
    { name: 'Concept Mastery Map', path: '/concept-map', icon: Globe, color: 'text-cyan-300' },
    { name: 'Focus Garden', path: '/focus-garden', icon: Leaf, color: 'text-emerald-300' }
  ];

  const isActive = (path) => location.pathname === path;

  if (loading) {
    return (
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl"
      >
        <div className="max-w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20 min-h-[4rem] sm:min-h-[5rem]">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl"
              >
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl sm:rounded-2xl blur-sm"
                />
                <Brain className="w-5 h-5 sm:w-7 sm:h-7 text-white relative z-10" />
              </motion.div>
              <div className="space-y-1 sm:space-y-2">
                <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gradient-to-r from-white/20 to-white/10 rounded-lg animate-pulse"></div>
                <div className="h-2 sm:h-3 w-16 sm:w-24 bg-gradient-to-r from-white/10 to-white/5 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>
    );
  }

  if (!user) {
    return (
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-slate-900/95 backdrop-blur-2xl border-b border-white/20 shadow-2xl' 
            : 'bg-slate-900/80 backdrop-blur-xl border-b border-white/10'
        }`}
        data-navbar
      >
        <div className="max-w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20 min-h-[4rem] sm:min-h-[5rem]">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-4 group">
              <motion.div
                whileHover={{ 
                  rotate: 360, 
                  scale: 1.15,
                  boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)"
                }}
                transition={{ duration: 0.6 }}
                className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-purple-500/50"
              >
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl sm:rounded-2xl blur-sm"
                />
                <Brain className="w-5 h-5 sm:w-7 sm:h-7 text-white relative z-10" />
              </motion.div>
              <motion.span 
                className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                StudyBrain
              </motion.span>
            </Link>
            
            <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className="text-white/80 hover:text-white transition-all duration-300 font-semibold hover:scale-105 px-3 sm:px-4 py-2 rounded-xl hover:bg-white/10 text-sm sm:text-base"
                >
                  Sign In
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(168, 85, 247, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/signup"
                  className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center space-x-2 sm:space-x-3 overflow-hidden group text-sm sm:text-base"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="relative z-10"
                  >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.div>
                  <span className="relative z-10 hidden sm:inline">Get Started</span>
                  <span className="relative z-10 sm:hidden">Start</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>
    );
  }

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-slate-900/95 backdrop-blur-2xl border-b border-white/20 shadow-2xl' 
          : 'bg-slate-900/80 backdrop-blur-xl border-b border-white/10'
      }`}
      data-navbar
    >
      <div className="max-w-full mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16 sm:h-20 min-h-[4rem] sm:min-h-[5rem] gap-2 sm:gap-4">
          {/* Enhanced Logo - Responsive */}
          <Link to="/dashboard" className="flex items-center space-x-2 sm:space-x-4 group flex-shrink-0" data-navbar>
            <motion.div
              whileHover={{ 
                rotate: 360, 
                scale: 1.15,
                boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)"
              }}
              transition={{ duration: 0.6 }}
              className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-purple-500/50"
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl sm:rounded-2xl blur-sm"
              />
              <Brain className="w-5 h-5 sm:w-7 sm:h-7 text-white relative z-10" />
            </motion.div>
            <motion.span 
              className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent whitespace-nowrap"
              whileHover={{ scale: 1.05 }}
            >
              StudyBrain
            </motion.span>
          </Link>

          {/* Enhanced Desktop Navigation - Better responsive */}
          <div className="hidden lg:flex items-center space-x-0.5 lg:space-x-1 xl:space-x-2 flex-1 justify-center mx-1 lg:mx-2 xl:mx-4 flex-wrap gap-1">
            {mainNavLinks.map((link, index) => {
              const Icon = link.icon;
              // Highlight Pricing link to make it more visible
              const isPricing = link.name === 'Pricing';
              return (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -3, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0"
                  style={{ display: 'block', visibility: 'visible' }} // Force display and visibility
                >
                  <Link
                    to={link.path}
                    className={`relative flex items-center space-x-1 lg:space-x-1.5 xl:space-x-2 2xl:space-x-3 px-1.5 lg:px-2 xl:px-3 2xl:px-4 py-1.5 lg:py-2 xl:py-2.5 2xl:py-3 rounded-lg xl:rounded-xl 2xl:rounded-2xl font-semibold transition-all duration-300 group overflow-hidden flex-shrink-0 ${
                      isActive(link.path)
                        ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white shadow-2xl border border-white/20'
                        : isPricing 
                        ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 hover:text-yellow-200 hover:bg-yellow-500/20 hover:shadow-lg border-2 border-yellow-500/50 shadow-yellow-500/20'
                        : 'text-white/70 hover:text-white hover:bg-white/10 hover:shadow-lg'
                    }`}
                    style={{ 
                      minWidth: isPricing ? 'auto' : 'auto',
                      zIndex: isPricing ? 10 : 1 
                    }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: isActive(link.path) ? [0, 5, -5, 0] : (isPricing ? [0, 5, -5, 0] : 0),
                        scale: isActive(link.path) ? [1, 1.1, 1] : (isPricing ? [1, 1.05, 1] : 1)
                      }}
                      transition={{ duration: 2, repeat: (isActive(link.path) || isPricing) ? Infinity : 0 }}
                    >
                      <Icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 ${isActive(link.path) ? 'text-white' : (isPricing ? 'text-yellow-300' : link.color)} group-hover:scale-110 transition-transform`} />
                    </motion.div>
                    <span className={`text-[10px] lg:text-xs xl:text-sm font-medium whitespace-nowrap ${isPricing ? 'font-bold text-yellow-300' : ''}`}>{link.name}</span>
                    
                    {isActive(link.path) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl xl:rounded-2xl border border-white/30"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    
                    {isPricing && !isActive(link.path) && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-lg xl:rounded-xl"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </Link>
                </motion.div>
              );
            })}

            {/* Lofi Music Player - Desktop */}
            <div className="hidden xl:block ml-2">
              <SimpleMusicPlayer />
            </div>

            {/* Enhanced Tools Dropdown */}
            <div className="relative flex-shrink-0" data-tools-menu onClick={(e) => e.stopPropagation()}>
              <motion.button
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsToolsOpen(!isToolsOpen);
                }}
                className={`relative flex items-center space-x-2 xl:space-x-3 px-3 xl:px-4 py-2 xl:py-3 rounded-xl xl:rounded-2xl font-semibold transition-all duration-300 group overflow-hidden ${
                  isToolsOpen
                    ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white shadow-2xl border border-white/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10 hover:shadow-lg'
                }`}
              >
                <motion.div
                  animate={{ 
                    rotate: isToolsOpen ? [0, 5, -5, 0] : 0,
                    scale: isToolsOpen ? [1, 1.1, 1] : 1
                  }}
                  transition={{ duration: 2, repeat: isToolsOpen ? Infinity : 0 }}
                >
                  <Settings className="w-4 h-4 xl:w-5 xl:h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                </motion.div>
                <span className="text-xs xl:text-sm font-medium hidden xl:inline">Tools</span>
                <motion.div
                  animate={{ rotate: isToolsOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-3 h-3 xl:w-4 xl:h-4" />
                </motion.div>
                
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </motion.button>

              {/* Enhanced Tools Dropdown Menu */}
              <AnimatePresence>
                {isToolsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute top-full right-0 mt-3 w-80 bg-slate-800/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl z-[100] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"
                    />
                    <div className="p-4 max-h-96 overflow-y-auto relative z-10 custom-scrollbar">
                      <div className="grid grid-cols-1 gap-2">
                        {toolsDropdown.map((tool, index) => {
                          const Icon = tool.icon;
                          return (
                            <motion.div
                              key={tool.name}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ x: 6, scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Link
                                to={tool.path}
                                onClick={() => setIsToolsOpen(false)}
                                className={`group flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                                  isActive(tool.path)
                                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-white/20'
                                    : 'text-white/70 hover:text-white hover:bg-white/10 hover:shadow-lg'
                                }`}
                              >
                                <motion.div
                                  animate={{ 
                                    rotate: isActive(tool.path) ? [0, 5, -5, 0] : 0,
                                    scale: isActive(tool.path) ? [1, 1.1, 1] : 1
                                  }}
                                  transition={{ duration: 2, repeat: isActive(tool.path) ? Infinity : 0 }}
                                >
                                  <Icon className={`w-5 h-5 ${tool.color} group-hover:scale-110 transition-transform`} />
                                </motion.div>
                                <span className="text-sm font-semibold">{tool.name}</span>
                                {isActive(tool.path) && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-2 h-2 bg-purple-400 rounded-full ml-auto"
                                  />
                                )}
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Enhanced User Menu - Better responsive */}
          <div className="flex items-center space-x-2 sm:space-x-3 xl:space-x-4 flex-shrink-0">
            {/* Enhanced User Avatar & Menu */}
            <div className="relative" data-user-menu>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUserMenuOpen(!isUserMenuOpen);
                }}
                className="group flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 rounded-xl sm:rounded-2xl px-2 sm:px-3 md:px-4 py-2 sm:py-3 transition-all duration-300 border border-white/20 hover:border-white/30 hover:shadow-2xl"
              >
                <motion.div
                  animate={{ 
                    scale: isUserMenuOpen ? [1, 1.1, 1] : 1,
                    rotate: isUserMenuOpen ? [0, 5, -5, 0] : 0
                  }}
                  transition={{ duration: 2, repeat: isUserMenuOpen ? Infinity : 0 }}
                >
                  <AvatarManager
                    currentAvatar={currentAvatar || user.profilePicture}
                    username={user.username}
                    userId={user.id}
                    onAvatarUpdate={handleAvatarUpdate}
                    size="sm"
                  />
                </motion.div>
                <div className="hidden md:block text-left">
                  <p className="text-white font-bold text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[120px]">{user.username}</p>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full"
                    />
                    <p className="text-white/60 text-xs">Online</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="hidden lg:block"
                >
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
                </motion.div>
                
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl sm:rounded-2xl"
                />
              </motion.button>

              {/* Enhanced User Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-72 sm:w-80 bg-slate-800/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden z-[100]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"
                    />
                    <div className="p-4 sm:p-6 border-b border-white/10 relative z-10">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <AvatarManager
                            currentAvatar={currentAvatar || user.profilePicture}
                            username={user.username}
                            userId={user.id}
                            onAvatarUpdate={handleAvatarUpdate}
                            size="lg"
                          />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-base sm:text-lg truncate">{user.username}</p>
                          <p className="text-white/60 text-xs sm:text-sm truncate">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-2 h-2 bg-green-400 rounded-full"
                            />
                            <span className="text-green-400 text-xs font-semibold">Online</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 relative z-10">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Link
                          to="/profile"
                          className="group flex items-center space-x-3 sm:space-x-4 px-3 sm:px-4 py-2 sm:py-3 text-white/80 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 rounded-xl transition-all duration-300 mb-2"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <User className="w-5 h-5 text-purple-400" />
                          </motion.div>
                          <span className="font-semibold text-sm sm:text-base">Profile</span>
                        </Link>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsUserMenuOpen(false);
                          }}
                          className="group w-full flex items-center space-x-3 sm:space-x-4 px-3 sm:px-4 py-2 sm:py-3 text-red-400 hover:text-red-300 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-500/5 rounded-xl transition-all duration-300"
                        >
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <LogOut className="w-5 h-5" />
                          </motion.div>
                          <span className="font-semibold text-sm sm:text-base">Logout</span>
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Enhanced Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="lg:hidden text-white/70 hover:text-white transition-all duration-300 p-2 sm:p-3 rounded-xl hover:bg-white/10 hover:shadow-lg flex-shrink-0 z-50 relative"
              aria-label="Toggle menu"
              data-navbar
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Rebuilt Mobile Menu - Full Screen Slide-in */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[55] lg:hidden"
                onClick={() => setIsMenuOpen(false)}
              />
              
              {/* Menu Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-slate-900 shadow-2xl z-[60] lg:hidden overflow-y-auto"
                data-menu
                style={{ height: '100vh' }}
              >
                {/* Menu Header */}
                <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 p-4 flex items-center justify-between z-10 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">Menu</span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Menu Content */}
                <div className="p-4 space-y-6 pb-8 relative z-0">
                  {/* Main Navigation */}
                  <div className="relative z-10">
                    <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3 px-2">
                      Navigation
                    </h3>
                    <div className="space-y-2">
                      {mainNavLinks.map((link, index) => {
                        const Icon = link.icon;
                        const active = isActive(link.path);
                        const isPricing = link.name === 'Pricing';
                        return (
                          <motion.div
                            key={link.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            style={{ display: 'block', visibility: 'visible' }}
                          >
                            <Link
                              to={link.path}
                              onClick={() => setIsMenuOpen(false)}
                              className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group relative z-20 ${
                                active
                                  ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border border-white/20'
                                  : isPricing
                                  ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 border-2 border-yellow-500/50 hover:bg-yellow-500/30'
                                  : 'text-white/80 hover:text-white hover:bg-white/10'
                              }`}
                              style={{ visibility: 'visible', display: 'flex' }}
                            >
                              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : (isPricing ? 'text-yellow-300' : link.color)} transition-transform group-hover:scale-110`} />
                              <span className={`flex-1 ${isPricing ? 'text-yellow-300 font-bold' : 'text-white'}`}>{link.name}</span>
                              {active && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"
                                />
                              )}
                              {isPricing && !active && (
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                  className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"
                                />
                              )}
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Music Player */}
                  <div className="pt-4 border-t border-white/10">
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 px-2">
                      Music
                    </h3>
                    <div className="px-2">
                      <SimpleMusicPlayer />
                    </div>
                  </div>

                  {/* Tools Section */}
                  <div className="pt-4 border-t border-white/10 relative z-10">
                    <div className="flex items-center space-x-3 mb-3 px-2">
                      <Settings className="w-5 h-5 text-purple-400" />
                      <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                        Tools
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {toolsDropdown.map((tool, index) => {
                        const Icon = tool.icon;
                        const active = isActive(tool.path);
                        return (
                          <motion.div
                            key={tool.name}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (mainNavLinks.length + index) * 0.03 }}
                          >
                            <Link
                              to={tool.path}
                              onClick={() => setIsMenuOpen(false)}
                              className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative z-20 ${
                                active
                                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-white/20'
                                  : 'text-white/80 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              <Icon className={`w-4 h-4 flex-shrink-0 ${tool.color} transition-transform group-hover:scale-110`} />
                              <span className="flex-1 text-white">{tool.name}</span>
                              {active && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"
                                />
                              )}
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* User Actions - Mobile */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="space-y-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 group"
                      >
                        <User className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Profile</span>
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 group w-full text-left"
                      >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

    </motion.nav>
  );
};

export default Navbar;
