import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Brain, 
  Clock, 
  Target, 
  Award, 
  BarChart3, 
  PieChart, 
  Calendar,
  Zap,
  BookOpen,
  Trophy,
  Activity,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { analyzeStudyPatterns, getPersonalizedSchedule } from '../utils/aiStudyRecommendations';

const StudyAnalytics = ({ userId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [selectedMetric, setSelectedMetric] = useState('performance');

  useEffect(() => {
    fetchAnalytics();
  }, [userId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      // Simulate API call - replace with actual API
      const mockData = {
        studySessions: generateMockSessions(),
        performance: generateMockPerformance(),
        preferences: {
          flashcards: true,
          music: false,
          notes: true
        }
      };

      const analysis = analyzeStudyPatterns(mockData);
      const schedule = getPersonalizedSchedule(analysis, mockData.preferences);
      
      setAnalytics({ analysis, schedule, rawData: mockData });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockSessions = () => {
    const sessions = [];
    const now = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      sessions.push({
        id: i,
        startTime: new Date(date.getTime() + (Math.random() * 12 + 8) * 60 * 60 * 1000).toISOString(),
        duration: Math.random() * 60 + 30,
        accuracy: Math.random() * 40 + 60,
        subject: ['Math', 'Science', 'English', 'History'][Math.floor(Math.random() * 4)],
        technique: ['flashcards', 'notes', 'practice', 'review'][Math.floor(Math.random() * 4)]
      });
    }
    
    return sessions;
  };

  const generateMockPerformance = () => {
    const performance = [];
    for (let i = 0; i < 14; i++) {
      performance.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        accuracy: Math.random() * 30 + 70,
        visual: Math.random() * 5,
        audio: Math.random() * 5,
        handsOn: Math.random() * 5,
        reading: Math.random() * 5
      });
    }
    return performance;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">No analytics data available</p>
      </div>
    );
  }

  const { analysis, schedule, rawData } = analytics;

  // Chart data
  const performanceChartData = {
    labels: rawData.performance.slice(0, 7).map(p => new Date(p.date).toLocaleDateString()),
    datasets: [{
      label: 'Accuracy %',
      data: rawData.performance.slice(0, 7).map(p => p.accuracy),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const studyTimeChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Study Time (minutes)',
      data: [45, 60, 30, 75, 90, 20, 0],
      backgroundColor: '#8b5cf6',
      borderRadius: 4
    }]
  };

  const learningStyleData = {
    labels: ['Visual', 'Auditory', 'Kinesthetic', 'Reading/Writing'],
    datasets: [{
      data: analysis.learningStyle.scores.map(s => s.score),
      backgroundColor: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
      borderWidth: 0
    }]
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'declining': return <TrendingDown className="w-5 h-5 text-red-400" />;
      default: return <Activity className="w-5 h-5 text-blue-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-green-500 bg-green-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Study Analytics</h2>
          <p className="text-gray-400">AI-powered insights into your learning patterns</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            {getTrendIcon(analysis.performanceTrends.trend)}
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {Math.round(analysis.performanceTrends.recentAverage)}%
          </div>
          <div className="text-sm text-gray-400">Average Performance</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-sm text-gray-400">Optimal</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {analysis.timeAnalysis.optimalTime}:00
          </div>
          <div className="text-sm text-gray-400">Best Study Time</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Target className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-sm text-gray-400 capitalize">
              {analysis.learningStyle.primary}
            </span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {analysis.learningStyle.confidence}
          </div>
          <div className="text-sm text-gray-400">Learning Style</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-sm text-gray-400">Confidence</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {analysis.confidence}
          </div>
          <div className="text-sm text-gray-400">Analysis Quality</div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">Performance Trend</h3>
          </div>
          <div className="h-64">
            <Line 
              data={performanceChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                  },
                  x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                  }
                }
              }}
            />
          </div>
        </motion.div>

        {/* Learning Style Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center mb-4">
            <PieChart className="w-5 h-5 text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">Learning Style</h3>
          </div>
          <div className="h-64">
            <Doughnut 
              data={learningStyleData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8' }
                  }
                }
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
      >
        <div className="flex items-center mb-6">
          <Lightbulb className="w-5 h-5 text-yellow-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">AI Recommendations</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-white">{rec.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                  rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {rec.priority}
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-3">{rec.description}</p>
              <div className="text-xs text-gray-400">
                💡 {rec.action}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Personalized Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
      >
        <div className="flex items-center mb-6">
          <Calendar className="w-5 h-5 text-green-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Personalized Study Schedule</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(schedule.schedule).map(([time, session]) => (
            session && (
              <div key={time} className="bg-slate-700/50 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2 capitalize">{time}</div>
                <div className="text-lg font-semibold text-white mb-1">{session.time}</div>
                <div className="text-sm text-gray-300 mb-2">
                  {session.activities.join(', ')}
                </div>
                <div className="text-xs text-purple-400">
                  {session.duration} minutes
                </div>
              </div>
            )
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-white mb-3">Study Tips</h4>
          {schedule.recommendations.map((tip, index) => (
            <div key={index} className="flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-300">{tip}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default StudyAnalytics;
