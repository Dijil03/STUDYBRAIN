import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import PageSEO from "../components/PageSEO";
import DemoVideo from "../components/DemoVideo";
import {
  BookOpen,
  Brain,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle,
  BarChart3,
  Calendar,
  Timer,
  NotebookPen,
  Lightbulb,
  Heart,
  Shield,
  Rocket,
  Star,
  Users,
  Target,
  Trophy,
  Zap,
  Clock,
  Sun,
  Moon,
  Menu,
  X,
  TrendingUp,
  Award,
  MessageSquare, 
  Send,
  Globe,
  Layers,
  Activity,
  ChevronDown,
  ExternalLink,
  Download,
  Share2,
  Bookmark,
  ThumbsUp
} from "lucide-react";

const Welcome = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, -50]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    // Handle email submission
    console.log("Email submitted:", email);
  };

  const features = [
    {
      icon: BookOpen,
      title: "Smart Study Planner",
      description: "Smart study schedules that adapt to your learning style and pace",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Brain,
      title: "Intelligent Flashcards",
      description: "Spaced repetition system that optimizes your memory retention",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Detailed insights into your learning patterns and achievements",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Timer,
      title: "Focus Timer",
      description: "Pomodoro technique with customizable study and break sessions",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set and monitor your academic and personal development goals",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: Trophy,
      title: "Achievement System",
      description: "Earn badges and rewards for consistent study habits and milestones",
      color: "from-yellow-500 to-amber-500"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Students", icon: Users },
    { number: "95%", label: "Success Rate", icon: CheckCircle },
    { number: "2.5M+", label: "Study Hours", icon: Clock },
    { number: "4.9/5", label: "User Rating", icon: Star }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Computer Science Student",
      content: "This platform transformed my study habits. I went from struggling to maintain focus to achieving consistent 4.0 GPAs.",
      avatar: "SC"
    },
    {
      name: "Marcus Johnson",
      role: "Medical Student",
      content: "The spaced repetition system is incredible. I've never retained information this effectively before.",
      avatar: "MJ"
    },
    {
      name: "Emily Rodriguez",
      role: "Engineering Student",
      content: "The goal tracking feature keeps me motivated. I've achieved more in one semester than I did in two years.",
      avatar: "ER"
    }
  ];

  return (
    <>
      <PageSEO page="home" />
      <div className={`min-h-screen transition-all duration-700 ${isDarkMode ? 'dark bg-slate-900' : 'bg-gradient-to-br from-indigo-50 via-white to-cyan-50'}`}>
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient background */}
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900' : 'bg-gradient-to-br from-indigo-50 via-white to-cyan-50'}`}></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 ${isDarkMode ? 'bg-purple-400' : 'bg-indigo-300'} rounded-full opacity-60`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Mouse-following glow effect */}
        <motion.div
          className="absolute w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            background: isDarkMode 
              ? 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Animated geometric shapes */}
        <div className="absolute inset-0">
          <motion.div
            className={`absolute top-20 left-20 w-32 h-32 ${isDarkMode ? 'bg-purple-500/10' : 'bg-indigo-500/10'} rounded-full`}
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className={`absolute top-40 right-32 w-24 h-24 ${isDarkMode ? 'bg-pink-500/10' : 'bg-cyan-500/10'} rounded-lg`}
            animate={{
              rotate: -360,
              y: [0, -10, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className={`absolute bottom-32 left-1/4 w-20 h-20 ${isDarkMode ? 'bg-blue-500/10' : 'bg-purple-500/10'} rounded-full`}
            animate={{
              rotate: 180,
              x: [0, 20, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Pattern overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: isDarkMode 
            ? `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A855F7' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            : `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      {/* Enhanced Navigation */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ y }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? `${isDarkMode ? 'bg-slate-900/95 backdrop-blur-2xl border-slate-700 shadow-2xl' : 'bg-white/95 backdrop-blur-2xl border-gray-200 shadow-2xl'} border-b` 
            : `${isDarkMode ? 'bg-transparent' : 'bg-transparent'}`
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className={`p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500`}>
                <Brain className="h-8 w-8 text-white" />
              </div>
              <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                StudyBrain
              </span>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Features</a>
              <a href="#testimonials" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Testimonials</a>
              <a href="#pricing" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Pricing</a>
        <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-gray-100 text-gray-600'} transition-all duration-300`}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => window.location.href = '/login'}
        >
          Get Started
              </motion.button>
            </div>

        <button
              className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-slate-800"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      </div>
      </motion.nav>

      {/* Enhanced Hero Section */}
      <section className="relative py-20 px-6 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl px-6 py-3 rounded-full border border-purple-200/30 mb-8 shadow-lg"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-5 w-5 text-purple-500" />
              </motion.div>
              <span className="text-purple-600 dark:text-purple-400 font-semibold text-lg">Smart Learning Platform</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={`text-6xl md:text-8xl font-black mb-6 leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              <motion.span
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="block"
              >
                Transform Your
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent block relative"
              >
                Study Experience
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 blur-xl"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className={`text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              The ultimate productivity platform for students. Track progress, manage tasks, 
              and achieve your academic goals with intelligent study tools powered by AI.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-8"
            >
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 25px 50px -12px rgba(168, 85, 247, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                className="group relative bg-gradient-to-r from-purple-500 to-pink-500 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center space-x-3 overflow-hidden"
                onClick={() => window.location.href = '/signup'}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <div className="relative z-10">
                  <Rocket className="h-6 w-6" />
                </div>
                <span className="relative z-10">Start Learning Free</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="relative z-10"
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.div>
              </motion.button>

              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: isDarkMode 
                    ? "0 25px 50px -12px rgba(0, 0, 0, 0.4)"
                    : "0 25px 50px -12px rgba(0, 0, 0, 0.1)"
                }}
                whileTap={{ scale: 0.95 }}
                className={`group relative ${isDarkMode ? 'bg-slate-800/80 backdrop-blur-xl text-white border-slate-700' : 'bg-white/80 backdrop-blur-xl text-gray-900 border-gray-200'} border-2 px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-3`}
                onClick={() => setIsDemoOpen(true)}
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Play className="h-6 w-6" />
                </motion.div>
                <span>Watch Demo</span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Enhanced Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.5 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  boxShadow: isDarkMode 
                    ? "0 25px 50px -12px rgba(0, 0, 0, 0.3)"
                    : "0 25px 50px -12px rgba(0, 0, 0, 0.1)"
                }}
                className={`group text-center p-8 rounded-3xl ${isDarkMode ? 'bg-slate-800/60 backdrop-blur-2xl border-slate-700' : 'bg-white/60 backdrop-blur-2xl border-gray-200'} border shadow-xl hover:shadow-2xl transition-all duration-300`}
              >
                <motion.div 
                  className="flex justify-center mb-6"
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    >
                      <stat.icon className="h-8 w-8 text-white" />
                    </motion.div>
                  </div>
                </motion.div>
                <motion.div 
                  className={`text-4xl font-black mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.8 + index * 0.1 }}
                >
                  {stat.number}
                </motion.div>
                <div className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-6 py-3 rounded-full border border-purple-200/20 mb-8"
            >
              <Sparkles className="h-5 w-5 text-purple-500" />
              <span className="text-purple-600 dark:text-purple-400 font-semibold">Features</span>
            </motion.div>
            
            <h2 className={`text-5xl md:text-6xl font-black mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Powerful Features for
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent block">
                Modern Students
              </span>
            </h2>
            <p className={`text-xl max-w-4xl mx-auto leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Everything you need to excel in your academic journey, powered by smart technology and designed for productivity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -15,
                  boxShadow: isDarkMode 
                    ? "0 25px 50px -12px rgba(0, 0, 0, 0.3)"
                    : "0 25px 50px -12px rgba(0, 0, 0, 0.1)"
                }}
                className={`group relative p-10 rounded-3xl ${isDarkMode ? 'bg-slate-800/60 backdrop-blur-2xl border-slate-700' : 'bg-white/60 backdrop-blur-2xl border-gray-200'} border shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden`}
              >
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />
                
                <motion.div 
                  className={`p-5 rounded-2xl bg-gradient-to-r ${feature.color} mb-8 w-fit shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                  >
                    <feature.icon className="h-10 w-10 text-white" />
                  </motion.div>
                </motion.div>
                
                <h3 className={`text-2xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'} group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300`}>
                  {feature.title}
                </h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed text-lg`}>
                  {feature.description}
                </p>
                
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Enhanced Testimonials Section */}
      <section id="testimonials" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-6 py-3 rounded-full border border-purple-200/20 mb-8"
            >
              <Heart className="h-5 w-5 text-purple-500" />
              <span className="text-purple-600 dark:text-purple-400 font-semibold">Testimonials</span>
            </motion.div>
            
            <h2 className={`text-5xl md:text-6xl font-black mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Loved by Students
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent block">
                Worldwide
              </span>
            </h2>
            <p className={`text-xl max-w-4xl mx-auto leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              See how StudyBrain is transforming the way students learn and achieve their goals.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  boxShadow: isDarkMode 
                    ? "0 25px 50px -12px rgba(0, 0, 0, 0.3)"
                    : "0 25px 50px -12px rgba(0, 0, 0, 0.1)"
                }}
                className={`group relative p-10 rounded-3xl ${isDarkMode ? 'bg-slate-800/60 backdrop-blur-2xl border-slate-700' : 'bg-white/60 backdrop-blur-2xl border-gray-200'} border shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden`}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                
                <div className="flex items-center mb-8">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-black text-xl mr-6 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {testimonial.avatar}
                  </motion.div>
                  <div>
                    <h4 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'} group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300`}>
                      {testimonial.name}
                    </h4>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                
                <div className="flex mb-6">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    </motion.div>
                  ))}
                </div>
                
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed text-lg italic`}>
                  "{testimonial.content}"
                </p>
                
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className={`relative p-16 rounded-3xl ${isDarkMode ? 'bg-gradient-to-r from-slate-800/80 to-slate-900/80 border-slate-700' : 'bg-gradient-to-r from-purple-50/80 to-pink-50/80 border-gray-200'} border shadow-2xl backdrop-blur-xl overflow-hidden`}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl px-6 py-3 rounded-full border border-purple-200/30 mb-8"
            >
              <Rocket className="h-5 w-5 text-purple-500" />
              <span className="text-purple-600 dark:text-purple-400 font-semibold">Get Started</span>
            </motion.div>
            
            <h2 className={`text-5xl md:text-6xl font-black mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Ready to Transform
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent block">
                Your Learning?
              </span>
            </h2>
            <p className={`text-xl mb-12 max-w-3xl mx-auto leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Join thousands of students who are already achieving their academic goals with StudyBrain.
            </p>
            
            <motion.form 
              onSubmit={handleEmailSubmit} 
              className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-6 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <motion.input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className={`flex-1 max-w-lg px-8 py-5 rounded-2xl border-2 ${isDarkMode ? 'bg-slate-700/80 border-slate-600 text-white placeholder-gray-400' : 'bg-white/80 border-gray-200 text-gray-900 placeholder-gray-500'} focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-lg backdrop-blur-xl`}
                required
                whileFocus={{ scale: 1.02 }}
              />
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 25px 50px -12px rgba(168, 85, 247, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center space-x-3"
              >
                <div>
                  <Send className="h-6 w-6" />
                </div>
                <span>Get Started Free</span>
              </motion.button>
            </motion.form>

            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-12 text-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="flex items-center space-x-3 text-green-600"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </motion.div>
                <span className="font-semibold">Free forever</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-3 text-green-600"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </motion.div>
                <span className="font-semibold">No credit card required</span>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-3 text-green-600"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </motion.div>
                <span className="font-semibold">Setup in 2 minutes</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className={`py-16 px-6 ${isDarkMode ? 'bg-slate-900/80 backdrop-blur-xl border-t border-slate-700' : 'bg-gray-50/80 backdrop-blur-xl border-t border-gray-200'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="md:col-span-2"
            >
              <div className="flex items-center space-x-3 mb-6">
                <motion.div 
                  className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Brain className="h-8 w-8 text-white" />
                </motion.div>
                <span className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  StudyBrain
                </span>
              </div>
              <p className={`text-lg leading-relaxed max-w-md ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                The ultimate productivity platform for students. Transform your learning experience with intelligent study tools.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Product</h3>
              <div className="space-y-4">
                {['Features', 'Pricing', 'API', 'Documentation'].map((item, index) => (
                  <motion.a
                    key={item}
                    href="#"
                    className={`block ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-300`}
                    whileHover={{ x: 5 }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {item}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Support</h3>
              <div className="space-y-4">
                {['Help Center', 'Community', 'Contact', 'Status'].map((item, index) => (
                  <motion.a
                    key={item}
                    href="#"
                    className={`block ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-300`}
                    whileHover={{ x: 5 }}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {item}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-200 dark:border-slate-700"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 md:mb-0`}>
              © 2024 StudyBrain. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              {['Privacy', 'Terms', 'Cookies'].map((item, index) => (
                <motion.a
                  key={item}
                  href="#"
                  className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-300`}
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
    
    {/* Demo Video Modal */}
    <DemoVideo isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </>
  );
};

export default Welcome;