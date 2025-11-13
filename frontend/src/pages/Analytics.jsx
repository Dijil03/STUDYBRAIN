import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Target,
    Clock,
    BookOpen,
    Award,
    Brain,
    Zap,
    Activity,
    Calendar,
    Download,
    RefreshCw,
    Eye,
    Filter,
    Settings,
    ChevronDown,
    ChevronUp,
    Star,
    AlertCircle,
    CheckCircle,
    Info
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import FeatureGate from '../components/FeatureGate';
import { useFeatureGate, FEATURES } from '../utils/featureGate';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Analytics = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [insights, setInsights] = useState([]);
    const [predictions, setPredictions] = useState(null);
    const [trendData, setTrendData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    
    const { canAccess, hasEnterprise } = useFeatureGate();

    useEffect(() => {
        loadAnalyticsData();
    }, [timeRange, selectedSubject]);

    const loadAnalyticsData = async () => {
        try {
            setLoading(true);
            const userId = localStorage.getItem('userId');
            
            const [dashboardResponse, insightsResponse, predictionsResponse] = await Promise.all([
                api.get(`/analytics/dashboard/${userId}?timeRange=${timeRange}`),
                api.get(`/analytics/insights/${userId}?subject=${selectedSubject}&timeRange=${timeRange}`),
                api.get(`/analytics/predictions/${userId}?predictionType=exam_success`)
            ]);

            if (dashboardResponse.data.success) {
                setDashboardData(dashboardResponse.data.data);
            }

            if (insightsResponse.data.success) {
                setInsights(insightsResponse.data.data.insights || []);
            }

            if (predictionsResponse.data.success) {
                setPredictions(predictionsResponse.data.data.predictions);
            }

            // Load trend data
            await loadTrendData();
        } catch (error) {
            console.error('Error loading analytics data:', error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const loadTrendData = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await api.get(`/analytics/trends/${userId}?timeRange=${timeRange}`);
            
            if (response.data.success) {
                setTrendData(response.data.data);
            }
        } catch (error) {
            console.error('Error loading trend data:', error);
            // Generate mock trend data if API fails
            generateMockTrendData();
        }
    };

    const generateMockTrendData = () => {
        // Generate mock data based on timeRange
        const days = timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 30;
        const labels = [];
        const performanceData = [];
        const studyTimeData = [];
        const productivityData = [];
        
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            // Generate realistic mock data with some variation
            performanceData.push(Math.floor(Math.random() * 20) + 70 + (days - i) * 0.5);
            studyTimeData.push(Math.floor(Math.random() * 60) + 30 + (days - i) * 2);
            productivityData.push(Math.floor(Math.random() * 2) + 6 + (days - i) * 0.1);
        }
        
        setTrendData({
            performance: { labels, data: performanceData },
            studyTime: { labels, data: studyTimeData },
            productivity: { labels, data: productivityData }
        });
    };

    const generateReport = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await api.post('/analytics/report/generate', {
                userId,
                reportType: timeRange,
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                endDate: new Date().toISOString()
            });

            if (response.data.success) {
                toast.success('Analytics report generated successfully!');
                // Here you could download the report or show it in a modal
            }
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report');
        }
    };

    const StatCard = ({ title, value, change, icon: Icon, color, trend }) => {
        const colorMap = {
            'bg-blue-500': 'from-blue-500 via-cyan-500 to-blue-600',
            'bg-green-500': 'from-emerald-500 via-green-500 to-teal-600',
            'bg-purple-500': 'from-purple-500 via-pink-500 to-violet-600',
            'bg-orange-500': 'from-orange-500 via-red-500 to-rose-600'
        };
        const gradient = colorMap[color] || 'from-blue-500 to-cyan-500';
        
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.05, y: -8 }}
                className="relative group"
            >
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-20 blur-xl rounded-2xl transition-opacity duration-500`}></div>
                
                <div className={`relative bg-gradient-to-br ${gradient}/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 ring-1 ring-white/30 overflow-hidden`}>
                    {/* Animated background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient}/5 opacity-50`}></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <motion.div
                                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                                className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-lg relative overflow-hidden`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                <Icon className="w-6 h-6 text-white relative z-10" />
                            </motion.div>
                            {trend && (
                                <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded-lg backdrop-blur-sm ${
                                    trend === 'up' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 
                                    trend === 'down' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 
                                    'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                }`}>
                                    {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : 
                                     trend === 'down' ? <TrendingDown className="w-4 h-4" /> : 
                                     <Activity className="w-4 h-4" />}
                                    {change && `${change}%`}
                                </div>
                            )}
                        </div>
                        <h3 className="text-3xl sm:text-4xl font-black text-white mb-2">{value}</h3>
                        <p className="text-gray-300 text-sm font-medium">{title}</p>
                    </div>
                </div>
            </motion.div>
        );
    };

    const InsightCard = ({ insight, index }) => {
        const colorMap = {
            'positive': 'from-emerald-500/20 to-green-500/10 border-emerald-500/30',
            'negative': 'from-red-500/20 to-rose-500/10 border-red-500/30',
            'warning': 'from-yellow-500/20 to-orange-500/10 border-yellow-500/30',
            'default': 'from-blue-500/20 to-cyan-500/10 border-blue-500/30'
        };
        const colors = colorMap[insight.type] || colorMap['default'];
        
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                className={`relative group p-4 rounded-xl border-l-4 bg-gradient-to-r ${colors} backdrop-blur-sm shadow-lg`}
            >
                <div className="flex items-start gap-3">
                    <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className={`p-2 rounded-full flex-shrink-0 ${
                            insight.type === 'positive' ? 'bg-emerald-500/30' :
                            insight.type === 'negative' ? 'bg-red-500/30' :
                            insight.type === 'warning' ? 'bg-yellow-500/30' :
                            'bg-blue-500/30'
                        }`}
                    >
                        {insight.type === 'positive' ? <CheckCircle className="w-5 h-5 text-emerald-300" /> :
                         insight.type === 'negative' ? <AlertCircle className="w-5 h-5 text-red-300" /> :
                         insight.type === 'warning' ? <AlertCircle className="w-5 h-5 text-yellow-300" /> :
                         <Info className="w-5 h-5 text-blue-300" />}
                    </motion.div>
                    <div className="flex-1">
                        <h4 className="font-bold text-white mb-1">{insight.title}</h4>
                        <p className="text-gray-300 text-sm mb-2">{insight.description}</p>
                        {insight.recommendation && (
                            <p className="text-sm text-white font-medium bg-white/10 px-3 py-1 rounded-lg inline-block">{insight.recommendation}</p>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    const PredictionCard = ({ prediction }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="relative group"
        >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 blur-2xl rounded-3xl transition-opacity duration-500"></div>
            
            <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-violet-600 rounded-3xl p-6 text-white shadow-2xl overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-pink-600/20 opacity-50"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                            className="p-3 bg-white/20 rounded-xl backdrop-blur-sm relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <Brain className="w-6 h-6 relative z-10" />
                        </motion.div>
                        <h3 className="text-xl sm:text-2xl font-black">AI Predictions</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-purple-100 font-medium">Exam Success Probability</span>
                            <span className="text-3xl sm:text-4xl font-black">
                                {prediction?.successProbability || 0}%
                            </span>
                        </div>
                        
                        <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${prediction?.successProbability || 0}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="bg-white rounded-full h-3 shadow-lg"
                            ></motion.div>
                        </div>
                        
                        <div className="text-sm text-purple-100 space-y-1">
                            <p>Confidence: <span className="font-bold">{Math.round((prediction?.confidence || 0) * 100)}%</span></p>
                            <p>Key Factors: <span className="font-semibold">{prediction?.keyFactors?.join(', ') || 'N/A'}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const ChartCard = ({ title, children, className = "" }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className={`relative group ${className}`}
        >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 blur-2xl rounded-3xl transition-opacity duration-500"></div>
            
            <div className="relative bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-blue-500/30 ring-1 ring-blue-500/20 overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 opacity-50"></div>
                
                <div className="relative z-10">
                    <h3 className="text-xl sm:text-2xl font-black text-white mb-4 bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                        {title}
                    </h3>
                    {children}
                </div>
            </div>
        </motion.div>
    );

    if (loading) {
        return (
            <div className="min-h-screen page-bg relative overflow-hidden">
                {/* Enhanced Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/20 via-cyan-600/20 to-transparent rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
                    <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-transparent rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000"></div>
                </div>
                
                <Navbar />
                <div className="flex items-center justify-center h-screen relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="relative inline-block">
                            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin mb-4" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                        </div>
                        <p className="text-white text-lg font-medium">Loading analytics data...</p>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <FeatureGate feature={FEATURES.STUDY_ANALYTICS}>
            <div className="min-h-screen page-bg relative overflow-hidden">
                {/* Enhanced Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Animated gradient orbs */}
                    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/20 via-cyan-600/20 to-transparent rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
                    <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-transparent rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-0 left-1/4 w-[550px] h-[550px] bg-gradient-to-br from-indigo-600/20 via-blue-600/20 to-transparent rounded-full mix-blend-screen filter blur-[110px] animate-blob animation-delay-4000"></div>
                    
                    {/* Animated mesh gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-purple-900/5 opacity-60"></div>
                    
                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-30"></div>
                </div>
                
                <Navbar />
                
                {/* Enhanced Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 mb-8"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                        <div className="relative group">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 blur-2xl rounded-3xl transition-opacity duration-500"></div>
                            
                            <div className="relative bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-blue-500/30 ring-1 ring-blue-500/20 overflow-hidden">
                                {/* Animated background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 opacity-50"></div>
                                
                                <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <motion.div
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.6 }}
                                            className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-violet-600 rounded-xl shadow-xl relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                            <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-white relative z-10" />
                                        </motion.div>
                                        <div>
                                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                                                Learning Analytics
                                            </h1>
                                            <p className="text-blue-300 text-sm sm:text-base mt-1">AI-powered insights and performance tracking</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowFilters(!showFilters)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-xl hover:bg-blue-500/30 transition-all duration-300 backdrop-blur-sm font-medium"
                                        >
                                            <Filter className="w-4 h-4" />
                                            Filters
                                            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </motion.button>
                                        
                                        <motion.button
                                            whileHover={{ scale: 1.05, rotate: 180 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={loadAnalyticsData}
                                            className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </motion.button>
                                        
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={generateReport}
                                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg font-bold"
                                        >
                                            <Download className="w-4 h-4" />
                                            Generate Report
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

            {/* Enhanced Filters */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="relative mb-8 z-10"
                    >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="relative group">
                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 blur-2xl rounded-3xl transition-opacity duration-500"></div>
                                
                                <div className="relative bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent backdrop-blur-xl border border-blue-500/30 rounded-3xl shadow-2xl overflow-hidden">
                                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-blue-200 mb-2 uppercase tracking-wide">Time Range</label>
                                                <select
                                                    value={timeRange}
                                                    onChange={(e) => setTimeRange(e.target.value)}
                                                    className="w-full p-3 bg-slate-800/70 border-2 border-blue-500/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm"
                                                >
                                                    <option value="day">Last 24 Hours</option>
                                                    <option value="week">Last 7 Days</option>
                                                    <option value="month">Last 30 Days</option>
                                                </select>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-bold text-blue-200 mb-2 uppercase tracking-wide">Subject</label>
                                                <select
                                                    value={selectedSubject}
                                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                                    className="w-full p-3 bg-slate-800/70 border-2 border-blue-500/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm"
                                                >
                                                    <option value="all">All Subjects</option>
                                                    <option value="mathematics">Mathematics</option>
                                                    <option value="science">Science</option>
                                                    <option value="english">English</option>
                                                    <option value="history">History</option>
                                                </select>
                                            </div>
                                            
                                            <div className="flex items-end">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={loadAnalyticsData}
                                                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-bold shadow-lg"
                                                >
                                                    Apply Filters
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Enhanced Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group mb-8"
                >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 blur-2xl rounded-2xl transition-opacity duration-500"></div>
                    
                    <div className="relative bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent backdrop-blur-xl rounded-2xl p-2 border border-purple-500/30 shadow-xl">
                        <div className="flex space-x-2 flex-wrap">
                            {[
                                { id: 'overview', label: 'Overview', icon: BarChart3 },
                                { id: 'insights', label: 'AI Insights', icon: Brain },
                                { id: 'predictions', label: 'Predictions', icon: Target },
                                { id: 'trends', label: 'Trends', icon: TrendingUp }
                            ].map((tab) => (
                                <motion.button
                                    key={tab.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-bold ${
                                        activeTab === tab.id
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                            : 'text-gray-300 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Overview Tab */}
                {activeTab === 'overview' && dashboardData && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Total Study Time"
                                value={`${Math.round(dashboardData.overview?.totalStudyTime || 0)} min`}
                                change={12}
                                trend="up"
                                icon={Clock}
                                color="bg-blue-500"
                            />
                            <StatCard
                                title="Sessions Completed"
                                value={dashboardData.overview?.sessionsCompleted || 0}
                                change={8}
                                trend="up"
                                icon={BookOpen}
                                color="bg-green-500"
                            />
                            <StatCard
                                title="Average Performance"
                                value={`${Math.round(dashboardData.performance?.averageAccuracy || 0)}%`}
                                change={5}
                                trend="up"
                                icon={Target}
                                color="bg-purple-500"
                            />
                            <StatCard
                                title="Current Streak"
                                value={`${dashboardData.overview?.currentStreak || 0} days`}
                                change={2}
                                trend="up"
                                icon={Zap}
                                color="bg-orange-500"
                            />
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ChartCard title="Weekly Progress">
                                <div className="h-64 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Weekly progress chart would be here</p>
                                    </div>
                                </div>
                            </ChartCard>
                            
                            <ChartCard title="Subject Performance">
                                <div className="h-64 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Subject performance chart would be here</p>
                                    </div>
                                </div>
                            </ChartCard>
                        </div>

                        {/* Real-time Status */}
                        {dashboardData.realTime && (
                            <ChartCard title="Current Status">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${
                                            dashboardData.realTime.currentActivity === 'studying' ? 'bg-green-500' : 'bg-gray-400'
                                        }`}></div>
                                        <span className="text-sm text-gray-600">
                                            {dashboardData.realTime.currentActivity === 'studying' ? 'Currently Studying' : 'Not Active'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {dashboardData.realTime.currentSubject && `Subject: ${dashboardData.realTime.currentSubject}`}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Focus Level: {dashboardData.realTime.focusLevel}/10
                                    </div>
                                </div>
                            </ChartCard>
                        )}
                    </div>
                )}

                {/* AI Insights Tab */}
                {activeTab === 'insights' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {insights.map((insight, index) => (
                                <InsightCard key={index} insight={insight} index={index} />
                            ))}
                        </div>
                        
                        {insights.length === 0 && (
                            <div className="text-center py-12">
                                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-600 mb-2">No Insights Available</h3>
                                <p className="text-gray-500">Start studying to generate AI-powered insights!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Predictions Tab */}
                {activeTab === 'predictions' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {predictions && <PredictionCard prediction={predictions} />}
                            
                            <ChartCard title="Learning Trajectory">
                                <div className="h-64 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Learning trajectory chart would be here</p>
                                    </div>
                                </div>
                            </ChartCard>
                        </div>
                        
                        {!predictions && (
                            <div className="text-center py-12">
                                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-600 mb-2">No Predictions Available</h3>
                                <p className="text-gray-500">More study data needed to generate predictions</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Trends Tab */}
                {activeTab === 'trends' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ChartCard title="Performance Trends">
                                {trendData?.performance ? (
                                    <div className="h-64">
                                        <Line
                                            data={{
                                                labels: trendData.performance.labels,
                                                datasets: [
                                                    {
                                                        label: 'Performance Score (%)',
                                                        data: trendData.performance.data,
                                                        borderColor: 'rgb(59, 130, 246)',
                                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                        borderWidth: 3,
                                                        fill: true,
                                                        tension: 0.4,
                                                        pointRadius: 4,
                                                        pointHoverRadius: 6,
                                                        pointBackgroundColor: 'rgb(59, 130, 246)',
                                                        pointBorderColor: '#fff',
                                                        pointBorderWidth: 2,
                                                        pointHoverBackgroundColor: '#fff',
                                                        pointHoverBorderColor: 'rgb(59, 130, 246)',
                                                        pointHoverBorderWidth: 3,
                                                    }
                                                ]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        display: true,
                                                        position: 'top',
                                                        labels: {
                                                            color: '#cbd5e1',
                                                            font: {
                                                                size: 12,
                                                                weight: 'bold'
                                                            },
                                                            padding: 15,
                                                            usePointStyle: true,
                                                        }
                                                    },
                                                    tooltip: {
                                                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                                        titleColor: '#f8fafc',
                                                        bodyColor: '#cbd5e1',
                                                        borderColor: 'rgba(59, 130, 246, 0.5)',
                                                        borderWidth: 1,
                                                        borderRadius: 8,
                                                        padding: 12,
                                                        displayColors: true,
                                                        callbacks: {
                                                            label: function(context) {
                                                                return `Score: ${context.parsed.y}%`;
                                                            }
                                                        }
                                                    }
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: false,
                                                        min: 50,
                                                        max: 100,
                                                        ticks: {
                                                            color: '#94a3b8',
                                                            font: { size: 11 },
                                                            callback: function(value) {
                                                                return value + '%';
                                                            }
                                                        },
                                                        grid: {
                                                            color: 'rgba(148, 163, 184, 0.1)',
                                                            borderDash: [5, 5]
                                                        }
                                                    },
                                                    x: {
                                                        ticks: {
                                                            color: '#94a3b8',
                                                            font: { size: 11 },
                                                            maxRotation: 45,
                                                            minRotation: 45
                                                        },
                                                        grid: {
                                                            color: 'rgba(148, 163, 184, 0.1)',
                                                            display: false
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-gray-500">
                                        <div className="text-center">
                                            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>Loading performance trends...</p>
                                        </div>
                                    </div>
                                )}
                            </ChartCard>
                            
                            <ChartCard title="Study Time Trends">
                                {trendData?.studyTime ? (
                                    <div className="h-64">
                                        <Line
                                            data={{
                                                labels: trendData.studyTime.labels,
                                                datasets: [
                                                    {
                                                        label: 'Study Time (minutes)',
                                                        data: trendData.studyTime.data,
                                                        borderColor: 'rgb(16, 185, 129)',
                                                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                        borderWidth: 3,
                                                        fill: true,
                                                        tension: 0.4,
                                                        pointRadius: 4,
                                                        pointHoverRadius: 6,
                                                        pointBackgroundColor: 'rgb(16, 185, 129)',
                                                        pointBorderColor: '#fff',
                                                        pointBorderWidth: 2,
                                                        pointHoverBackgroundColor: '#fff',
                                                        pointHoverBorderColor: 'rgb(16, 185, 129)',
                                                        pointHoverBorderWidth: 3,
                                                    }
                                                ]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        display: true,
                                                        position: 'top',
                                                        labels: {
                                                            color: '#cbd5e1',
                                                            font: {
                                                                size: 12,
                                                                weight: 'bold'
                                                            },
                                                            padding: 15,
                                                            usePointStyle: true,
                                                        }
                                                    },
                                                    tooltip: {
                                                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                                        titleColor: '#f8fafc',
                                                        bodyColor: '#cbd5e1',
                                                        borderColor: 'rgba(16, 185, 129, 0.5)',
                                                        borderWidth: 1,
                                                        borderRadius: 8,
                                                        padding: 12,
                                                        displayColors: true,
                                                        callbacks: {
                                                            label: function(context) {
                                                                return `Time: ${context.parsed.y} min`;
                                                            }
                                                        }
                                                    }
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        ticks: {
                                                            color: '#94a3b8',
                                                            font: { size: 11 },
                                                            callback: function(value) {
                                                                return value + ' min';
                                                            }
                                                        },
                                                        grid: {
                                                            color: 'rgba(148, 163, 184, 0.1)',
                                                            borderDash: [5, 5]
                                                        }
                                                    },
                                                    x: {
                                                        ticks: {
                                                            color: '#94a3b8',
                                                            font: { size: 11 },
                                                            maxRotation: 45,
                                                            minRotation: 45
                                                        },
                                                        grid: {
                                                            color: 'rgba(148, 163, 184, 0.1)',
                                                            display: false
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-gray-500">
                                        <div className="text-center">
                                            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>Loading study time trends...</p>
                                        </div>
                                    </div>
                                )}
                            </ChartCard>
                        </div>
                        
                        <ChartCard title="Productivity & Study Habits Analysis">
                            {trendData?.productivity ? (
                                <div className="h-80">
                                    <Line
                                        data={{
                                            labels: trendData.productivity.labels,
                                            datasets: [
                                                {
                                                    label: 'Productivity Rating',
                                                    data: trendData.productivity.data,
                                                    borderColor: 'rgb(168, 85, 247)',
                                                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                                                    borderWidth: 3,
                                                    fill: true,
                                                    tension: 0.4,
                                                    pointRadius: 4,
                                                    pointHoverRadius: 6,
                                                    pointBackgroundColor: 'rgb(168, 85, 247)',
                                                    pointBorderColor: '#fff',
                                                    pointBorderWidth: 2,
                                                    pointHoverBackgroundColor: '#fff',
                                                    pointHoverBorderColor: 'rgb(168, 85, 247)',
                                                    pointHoverBorderWidth: 3,
                                                }
                                            ]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    display: true,
                                                    position: 'top',
                                                    labels: {
                                                        color: '#cbd5e1',
                                                        font: {
                                                            size: 12,
                                                            weight: 'bold'
                                                        },
                                                        padding: 15,
                                                        usePointStyle: true,
                                                    }
                                                },
                                                tooltip: {
                                                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                                    titleColor: '#f8fafc',
                                                    bodyColor: '#cbd5e1',
                                                    borderColor: 'rgba(168, 85, 247, 0.5)',
                                                    borderWidth: 1,
                                                    borderRadius: 8,
                                                    padding: 12,
                                                    displayColors: true,
                                                    callbacks: {
                                                        label: function(context) {
                                                            return `Rating: ${context.parsed.y.toFixed(1)}/10`;
                                                        }
                                                    }
                                                }
                                            },
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    max: 10,
                                                    ticks: {
                                                        color: '#94a3b8',
                                                        font: { size: 11 },
                                                        stepSize: 1,
                                                        callback: function(value) {
                                                            return value + '/10';
                                                        }
                                                    },
                                                    grid: {
                                                        color: 'rgba(148, 163, 184, 0.1)',
                                                        borderDash: [5, 5]
                                                    }
                                                },
                                                x: {
                                                    ticks: {
                                                        color: '#94a3b8',
                                                        font: { size: 11 },
                                                        maxRotation: 45,
                                                        minRotation: 45
                                                    },
                                                    grid: {
                                                        color: 'rgba(148, 163, 184, 0.1)',
                                                        display: false
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="h-80 flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>Loading productivity trends...</p>
                                    </div>
                                </div>
                            )}
                        </ChartCard>
                    </div>
                )}
            </div>
        </div>
        </FeatureGate>
    );
};

export default Analytics;
