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

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/google/success');
      
      if (response.status === 200) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      setCurrentAvatar(null);
      localStorage.removeItem('userAvatar');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAvatarUpdate = (newAvatar) => {
    setCurrentAvatar(newAvatar);
    // Update user object if needed
    if (user) {
      setUser({ ...user, profilePicture: newAvatar });
    }
  };

  const mainNavLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home, color: 'text-blue-400' },
    { name: 'Study Time', path: '/study-time', icon: BookOpen, color: 'text-green-400' },
    { name: 'Homework', path: '/homework', icon: Target, color: 'text-orange-400' },
    { name: 'Week Plan', path: '/week-plan', icon: Calendar, color: 'text-purple-400' },
    { name: 'My World', path: '/myworld', icon: Trophy, color: 'text-pink-400' },
    { name: 'Profile', path: '/profile', icon: User, color: 'text-purple-400' },
    { name: 'Pricing', path: '/pricing', icon: CreditCard, color: 'text-red-400' }
  ];

  const toolsDropdown = [
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
    { name: 'Note', path: '/note', icon: FileText, color: 'text-gray-400' }
  ];

  const isActive = (path) => location.pathname === path;

  if (loading) {
    return (
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-2xl border-b border-white/10 shadow-2xl"
      >
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex justify-between items-center h-20 min-h-[5rem]">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="relative w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl"
              >
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-sm"
                />
                <Brain className="w-7 h-7 text-white relative z-10" />
              </motion.div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gradient-to-r from-white/20 to-white/10 rounded-lg animate-pulse"></div>
                <div className="h-3 w-24 bg-gradient-to-r from-white/10 to-white/5 rounded-lg animate-pulse"></div>
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
      >

        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
          <div className="flex justify-between items-center h-20 min-h-[5rem]">
            <Link to="/" className="flex items-center space-x-4 group">
              <motion.div
                whileHover={{ 
                  rotate: 360, 
                  scale: 1.15,
                  boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)"
                }}
                transition={{ duration: 0.6 }}
                className="relative w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-purple-500/50"
              >
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-sm"
                />
                <Brain className="w-7 h-7 text-white relative z-10" />
              </motion.div>
              <motion.span 
                className="text-3xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                StudyBrain
              </motion.span>
            </Link>
            
            <div className="flex items-center space-x-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className="text-white/80 hover:text-white transition-all duration-300 font-semibold hover:scale-105 px-4 py-2 rounded-xl hover:bg-white/10"
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
                  className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-bold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center space-x-3 overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="relative z-10"
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  <span className="relative z-10">Get Started</span>
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
      className={`sticky top-0 z-40 transition-all duration-500 ${
        isScrolled 
          ? 'bg-slate-900/95 backdrop-blur-2xl border-b border-white/20 shadow-2xl' 
          : 'bg-slate-900/80 backdrop-blur-xl border-b border-white/10'
      }`}
    >

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        <div className="flex justify-between items-center h-20 min-h-[5rem]">
          {/* Enhanced Logo */}
          <Link to="/dashboard" className="flex items-center space-x-4 group">
            <motion.div
              whileHover={{ 
                rotate: 360, 
                scale: 1.15,
                boxShadow: "0 0 30px rgba(168, 85, 247, 0.4)"
              }}
              transition={{ duration: 0.6 }}
              className="relative w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-purple-500/50"
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur-sm"
              />
              <Brain className="w-7 h-7 text-white relative z-10" />
            </motion.div>
            <motion.span 
              className="text-3xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              StudyBrain
            </motion.span>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
            {mainNavLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -3, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={link.path}
                    className={`relative flex items-center space-x-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-300 group overflow-hidden ${
                      isActive(link.path)
                        ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white shadow-2xl border border-white/20'
                        : 'text-white/70 hover:text-white hover:bg-white/10 hover:shadow-lg'
                    }`}
                  >
                    <motion.div
                      animate={{ 
                        rotate: isActive(link.path) ? [0, 5, -5, 0] : 0,
                        scale: isActive(link.path) ? [1, 1.1, 1] : 1
                      }}
                      transition={{ duration: 2, repeat: isActive(link.path) ? Infinity : 0 }}
                    >
                      <Icon className={`w-5 h-5 ${isActive(link.path) ? 'text-white' : link.color} group-hover:scale-110 transition-transform`} />
                    </motion.div>
                    <span className="text-sm xl:text-base font-medium">{link.name}</span>
                    
                    {isActive(link.path) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-white/30"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </Link>
                </motion.div>
              );
            })}

            {/* Lofi Music Player */}
            <SimpleMusicPlayer />

            {/* Enhanced Tools Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className={`relative flex items-center space-x-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-300 group overflow-hidden ${
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
                  <Settings className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                </motion.div>
                <span className="text-sm xl:text-base font-medium">Tools</span>
                <motion.div
                  animate={{ rotate: isToolsOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-4 h-4" />
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
                    className="absolute top-full left-0 mt-3 w-96 bg-slate-800/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"
                    />
                    <div className="p-4 max-h-96 overflow-y-auto relative z-10">
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
                                    className="w-2 h-2 bg-purple-400 rounded-full"
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

          {/* Enhanced User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4 xl:space-x-6">
            {/* Enhanced User Avatar & Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="group flex items-center space-x-2 sm:space-x-4 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 rounded-2xl px-3 sm:px-4 py-3 transition-all duration-300 border border-white/20 hover:border-white/30 hover:shadow-2xl"
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
                <div className="hidden sm:block text-left">
                  <p className="text-white font-bold text-sm">{user.username}</p>
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-green-400 rounded-full"
                    />
                    <p className="text-white/60 text-xs">Online</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-4 h-4 text-white/60" />
                </motion.div>
                
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
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
                    className="absolute right-0 mt-3 w-80 bg-slate-800/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"
                    />
                    <div className="p-6 border-b border-white/10 relative z-10">
                      <div className="flex items-center space-x-4">
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
                        <div>
                          <p className="text-white font-bold text-lg">{user.username}</p>
                          <p className="text-white/60 text-sm">{user.email}</p>
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
                    <div className="p-4 relative z-10">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Link
                          to="/profile"
                          className="group flex items-center space-x-4 px-4 py-3 text-white/80 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 rounded-xl transition-all duration-300"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <User className="w-5 h-5 text-purple-400" />
                          </motion.div>
                          <span className="font-semibold">Profile</span>
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
                          className="group w-full flex items-center space-x-4 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-500/5 rounded-xl transition-all duration-300"
                        >
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <LogOut className="w-5 h-5" />
                          </motion.div>
                          <span className="font-semibold">Logout</span>
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
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white/70 hover:text-white transition-all duration-300 p-3 rounded-2xl hover:bg-white/10 hover:shadow-lg ml-2"
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="lg:hidden border-t border-white/10 bg-slate-800/80 backdrop-blur-2xl relative z-10"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5"
              />
              <div className="px-6 py-8 space-y-3 relative z-10">
                {/* Main Navigation Links */}
                {mainNavLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <div key={link.name} className="mb-2">
                      <button
                        className={`flex items-center space-x-4 px-5 py-4 rounded-2xl font-semibold w-full text-left ${
                          isActive(link.path)
                            ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border border-white/20'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                        onClick={() => {
                          navigate(link.path);
                          setIsMenuOpen(false);
                        }}
                      >
                        <Icon className={`w-6 h-6 ${isActive(link.path) ? 'text-white' : link.color}`} />
                        <span className="text-lg">{link.name}</span>
                        {isActive(link.path) && (
                          <div className="w-2 h-2 bg-purple-400 rounded-full ml-auto" />
                        )}
                      </button>
                    </div>
                  );
                })}

                {/* Enhanced Music Player Section */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: mainNavLinks.length * 0.1 }}
                  className="pt-6 border-t border-white/10"
                >
                  <div className="px-5 py-4">
                    <SimpleMusicPlayer />
                  </div>
                </motion.div>

                {/* Enhanced Tools Section */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (mainNavLinks.length + 1) * 0.1 }}
                  className="pt-6 border-t border-white/10"
                >
                  <div className="flex items-center space-x-4 px-5 py-4 text-white/70">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Settings className="w-6 h-6 text-purple-400" />
                    </motion.div>
                    <span className="font-bold text-lg">Tools</span>
                  </div>
                  <div className="pl-5 space-y-2">
                    {toolsDropdown.map((tool, index) => {
                      const Icon = tool.icon;
                      return (
                        <div key={tool.name} className="mb-1">
                          <button
                            className={`flex items-center space-x-4 px-5 py-3 rounded-xl font-semibold w-full text-left ${
                              isActive(tool.path)
                                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-white/20'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                            onClick={() => {
                              navigate(tool.path);
                              setIsMenuOpen(false);
                            }}
                          >
                            <Icon className={`w-5 h-5 ${tool.color}`} />
                            <span className="text-base">{tool.name}</span>
                            {isActive(tool.path) && (
                              <div className="w-2 h-2 bg-purple-400 rounded-full ml-auto" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside to close menus */}
      {(isMenuOpen || isUserMenuOpen || isToolsOpen) && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => {
            setIsMenuOpen(false);
            setIsUserMenuOpen(false);
            setIsToolsOpen(false);
          }}
        />
      )}
    </motion.nav>
  );
};

export default Navbar;