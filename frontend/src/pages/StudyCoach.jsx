import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    Sparkles,
    Target,
    TrendingUp,
    Clock,
    Award,
    Lightbulb,
    MessageCircle,
    Calendar,
    Zap,
    CheckCircle,
    ArrowRight,
    RefreshCw,
    BookOpen,
    Trophy,
    BarChart3,
    Star,
    Heart,
    Rocket
} from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../utils/axios';
import { toast } from 'react-toastify';

const StudyCoach = () => {
    const [coaching, setCoaching] = useState(null);
    const [sessionGuidance, setSessionGuidance] = useState(null);
    const [weeklyReport, setWeeklyReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('daily');
    const [sessionForm, setSessionForm] = useState({
        subject: '',
        duration: 30,
        goal: ''
    });

    useEffect(() => {
        loadDailyCoaching();
    }, []);

    const loadDailyCoaching = async () => {
        try {
            setLoading(true);
            const userId = localStorage.getItem('userId');
            const response = await api.get(`/study-coach/daily/${userId}`);
            
            if (response.data.success) {
                setCoaching(response.data.data);
            }
        } catch (error) {
            console.error('Error loading daily coaching:', error);
            toast.error('Failed to load coaching message');
        } finally {
            setLoading(false);
        }
    };

    const loadWeeklyReport = async () => {
        try {
            setLoading(true);
            const userId = localStorage.getItem('userId');
            const response = await api.get(`/study-coach/weekly/${userId}`);
            
            if (response.data.success) {
                setWeeklyReport(response.data.data);
            }
        } catch (error) {
            console.error('Error loading weekly report:', error);
            toast.error('Failed to load weekly report');
        } finally {
            setLoading(false);
        }
    };

    const getSessionGuidance = async () => {
        if (!sessionForm.subject.trim()) {
            toast.error('Please enter a subject');
            return;
        }

        try {
            setLoading(true);
            const userId = localStorage.getItem('userId');
            const response = await api.post('/study-coach/session-guidance', {
                userId,
                subject: sessionForm.subject,
                duration: sessionForm.duration,
                goal: sessionForm.goal
            });
            
            if (response.data.success) {
                setSessionGuidance(response.data.data.guidance);
                toast.success('Session guidance ready!');
            }
        } catch (error) {
            console.error('Error getting session guidance:', error);
            toast.error('Failed to get session guidance');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !coaching) {
        return (
            <div className="min-h-screen page-bg relative overflow-hidden">
                <Navbar />
                <div className="flex items-center justify-center h-screen relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="relative inline-block">
                            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-pink-500 rounded-full animate-spin mb-4" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                        </div>
                        <p className="text-white text-lg font-medium">Coach Brain is thinking...</p>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen page-bg relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-transparent rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
                <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/20 via-cyan-600/20 to-transparent rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000"></div>
            </div>

            <Navbar />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <motion.div
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50"></div>
                            <div className="relative p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-2xl">
                                <Brain className="w-8 h-8 text-white" />
                            </div>
                        </motion.div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black text-white bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                                Coach Brain
                            </h1>
                            <p className="text-purple-300 text-sm sm:text-base">Your AI-powered study coach</p>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="flex space-x-2 bg-slate-800/50 backdrop-blur-xl rounded-2xl p-2 border border-purple-500/30">
                        {[
                            { id: 'daily', label: 'Daily Coaching', icon: Sparkles },
                            { id: 'session', label: 'Session Guide', icon: Target },
                            { id: 'weekly', label: 'Weekly Report', icon: BarChart3 }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <motion.button
                                    key={tab.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        if (tab.id === 'weekly' && !weeklyReport) {
                                            loadWeeklyReport();
                                        }
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-semibold ${
                                        activeTab === tab.id
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Daily Coaching Tab */}
                {activeTab === 'daily' && coaching && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Main Coaching Card */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 blur-2xl rounded-3xl transition-opacity duration-500"></div>
                            
                            <div className="relative bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-500/30">
                                <div className="flex items-start gap-4 mb-6">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl"
                                    >
                                        <Brain className="w-6 h-6 text-white" />
                                    </motion.div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-black text-white mb-2">{coaching.coaching.greeting}</h2>
                                        <p className="text-purple-200 text-sm">Today's personalized coaching</p>
                                    </div>
                                    <motion.button
                                        whileHover={{ rotate: 180 }}
                                        onClick={loadDailyCoaching}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <RefreshCw className="w-5 h-5 text-white" />
                                    </motion.button>
                                </div>

                                <div className="space-y-4">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="bg-white/5 rounded-xl p-4 border border-white/10"
                                    >
                                        <p className="text-white text-lg leading-relaxed">{coaching.coaching.message}</p>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h3 className="text-yellow-300 font-bold mb-1">Key Insight</h3>
                                                <p className="text-white">{coaching.coaching.insight}</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Target className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h3 className="text-green-300 font-bold mb-1">Today's Tip</h3>
                                                <p className="text-white">{coaching.coaching.tip}</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-xl p-4 border border-pink-500/30"
                                    >
                                        <div className="flex items-start gap-3">
                                            <Heart className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h3 className="text-pink-300 font-bold mb-1">Motivation</h3>
                                                <p className="text-white italic">{coaching.coaching.motivation}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Focus Areas */}
                                {coaching.coaching.focusAreas && coaching.coaching.focusAreas.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="mt-6 pt-6 border-t border-white/10"
                                    >
                                        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                            <Star className="w-5 h-5 text-yellow-400" />
                                            Focus Areas
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {coaching.coaching.focusAreas.map((area, index) => (
                                                <motion.span
                                                    key={index}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.5 + index * 0.1 }}
                                                    className="px-4 py-2 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full text-white text-sm font-semibold border border-purple-500/50"
                                                >
                                                    {area}
                                                </motion.span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Metrics */}
                                {coaching.metrics && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4"
                                    >
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-purple-400">{coaching.metrics.totalStudyTime}</div>
                                            <div className="text-xs text-gray-400">Minutes</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-pink-400">{coaching.metrics.sessionsCount}</div>
                                            <div className="text-xs text-gray-400">Sessions</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-blue-400">{coaching.metrics.avgProductivity}</div>
                                            <div className="text-xs text-gray-400">Productivity</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-green-400">{coaching.metrics.currentStreak}</div>
                                            <div className="text-xs text-gray-400">Day Streak</div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Session Guidance Tab */}
                {activeTab === 'session' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Session Form */}
                        <div className="bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-500/30">
                            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                                <Target className="w-6 h-6 text-blue-400" />
                                Start a Study Session
                            </h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-white font-semibold mb-2">Subject/Topic</label>
                                    <input
                                        type="text"
                                        value={sessionForm.subject}
                                        onChange={(e) => setSessionForm({...sessionForm, subject: e.target.value})}
                                        placeholder="e.g. Mathematics, Biology, History..."
                                        className="w-full bg-slate-800/70 border-2 border-blue-500/30 rounded-xl p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-white font-semibold mb-2">Duration (minutes)</label>
                                        <input
                                            type="number"
                                            value={sessionForm.duration}
                                            onChange={(e) => setSessionForm({...sessionForm, duration: parseInt(e.target.value) || 30})}
                                            min="5"
                                            max="180"
                                            className="w-full bg-slate-800/70 border-2 border-blue-500/30 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-white font-semibold mb-2">Goal</label>
                                        <input
                                            type="text"
                                            value={sessionForm.goal}
                                            onChange={(e) => setSessionForm({...sessionForm, goal: e.target.value})}
                                            placeholder="e.g. Review chapter 5"
                                            className="w-full bg-slate-800/70 border-2 border-blue-500/30 rounded-xl p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                </div>
                                
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={getSessionGuidance}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 rounded-xl shadow-lg hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Getting guidance...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Rocket className="w-5 h-5" />
                                            <span>Get Session Guidance</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>

                        {/* Session Guidance Display */}
                        {sessionGuidance && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-green-500/30"
                            >
                                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-400" />
                                    Your Study Plan
                                </h2>
                                
                                <div className="space-y-4">
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                        <h3 className="text-green-300 font-bold mb-2">Session Plan</h3>
                                        <p className="text-white">{sessionGuidance.sessionPlan}</p>
                                    </div>
                                    
                                    {sessionGuidance.techniques && sessionGuidance.techniques.length > 0 && (
                                        <div>
                                            <h3 className="text-green-300 font-bold mb-3">Recommended Techniques</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {sessionGuidance.techniques.map((technique, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="bg-green-500/20 rounded-xl p-3 border border-green-500/30 text-white text-sm font-semibold text-center"
                                                    >
                                                        {technique}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {sessionGuidance.reminders && sessionGuidance.reminders.length > 0 && (
                                        <div>
                                            <h3 className="text-yellow-300 font-bold mb-3">Reminders</h3>
                                            <ul className="space-y-2">
                                                {sessionGuidance.reminders.map((reminder, index) => (
                                                    <li key={index} className="flex items-start gap-2 text-white">
                                                        <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-1" />
                                                        <span>{reminder}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    
                                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
                                        <p className="text-white italic font-semibold">💪 {sessionGuidance.encouragement}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* Weekly Report Tab */}
                {activeTab === 'weekly' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                            </div>
                        ) : weeklyReport ? (
                            <>
                                <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-purple-500/30">
                                    <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                                        <BarChart3 className="w-6 h-6 text-purple-400" />
                                        Weekly Summary
                                    </h2>
                                    <p className="text-white text-lg leading-relaxed">{weeklyReport.report.summary}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-green-500/30">
                                        <h3 className="text-green-300 font-bold mb-4 flex items-center gap-2">
                                            <Trophy className="w-5 h-5" />
                                            Highlights
                                        </h3>
                                        <ul className="space-y-2">
                                            {weeklyReport.report.highlights?.map((highlight, index) => (
                                                <li key={index} className="flex items-start gap-2 text-white">
                                                    <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-1" />
                                                    <span>{highlight}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-500/30">
                                        <h3 className="text-blue-300 font-bold mb-4 flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5" />
                                            Improvements
                                        </h3>
                                        <ul className="space-y-2">
                                            {weeklyReport.report.improvements?.map((improvement, index) => (
                                                <li key={index} className="flex items-start gap-2 text-white">
                                                    <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0 mt-1" />
                                                    <span>{improvement}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-purple-500/30">
                                        <h3 className="text-purple-300 font-bold mb-4 flex items-center gap-2">
                                            <Target className="w-5 h-5" />
                                            Next Week Goals
                                        </h3>
                                        <ul className="space-y-2">
                                            {weeklyReport.report.nextWeekGoals?.map((goal, index) => (
                                                <li key={index} className="flex items-start gap-2 text-white">
                                                    <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0 mt-1" />
                                                    <span>{goal}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-orange-500/30">
                                        <h3 className="text-orange-300 font-bold mb-4 flex items-center gap-2">
                                            <Lightbulb className="w-5 h-5" />
                                            Recommendations
                                        </h3>
                                        <ul className="space-y-2">
                                            {weeklyReport.report.recommendations?.map((rec, index) => (
                                                <li key={index} className="flex items-start gap-2 text-white">
                                                    <Lightbulb className="w-4 h-4 text-orange-400 flex-shrink-0 mt-1" />
                                                    <span>{rec}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {weeklyReport.metrics && (
                                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-slate-700/50">
                                        <h3 className="text-white font-bold mb-4">Weekly Metrics</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-black text-purple-400">{weeklyReport.metrics.totalStudyTime}</div>
                                                <div className="text-xs text-gray-400">Minutes</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-black text-pink-400">{weeklyReport.metrics.sessionsCount}</div>
                                                <div className="text-xs text-gray-400">Sessions</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-black text-blue-400">{weeklyReport.metrics.homeworkCompleted}/{weeklyReport.metrics.homeworkTotal}</div>
                                                <div className="text-xs text-gray-400">Homework</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-black text-green-400">{weeklyReport.metrics.levelProgress}</div>
                                                <div className="text-xs text-gray-400">Level</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-400">Click to load your weekly report</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default StudyCoach;

