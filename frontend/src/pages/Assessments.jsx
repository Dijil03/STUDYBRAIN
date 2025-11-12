import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/axios';
import PageSEO from '../components/PageSEO';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from '../components/Navbar';
import {
  Brain,
  Plus,
  Play,
  CheckCircle,
  Clock,
  Target,
  Trophy,
  Award,
  Star,
  Zap,
  BookOpen,
  BarChart3,
  TrendingUp,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Users,
  Timer,
  FileText,
  Edit3,
  Trash2,
  Eye,
  Share2,
  Download,
  Filter,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Settings,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import { saveUserSession } from '../utils/session';

const Assessments = () => {
  const [user, setUser] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showAIGeneratorModal, setShowAIGeneratorModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedData, setAiGeneratedData] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setUserLoading(true);
      
      // First, try to get userId from localStorage (faster, works even if API is down)
      let userId = localStorage.getItem('userId');
      
      // Then try to get user data from API session
      try {
        const response = await api.get('/auth/google/success');
        if (response.status === 200 && response.data.user) {
          const userData = response.data.user;
          userId = userData.id || userId;
          setUser(userData);
          saveUserSession(userData);
        }
      } catch (apiError) {
        console.warn('API auth check failed, using localStorage:', apiError.message);
        
        // If we have userId from localStorage, create a minimal user object
        if (userId) {
          const hasCompleted = localStorage.getItem('hasCompletedPersonalization') === 'true';
          setUser({
            id: userId,
            username: localStorage.getItem('username') || 'User',
            hasCompletedPersonalization: hasCompleted,
          });
        }
      }
      
      // Fetch assessments if we have a userId
      if (userId) {
        fetchAssessments(userId);
      } else {
        console.warn('No userId available, cannot fetch assessments');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setLoading(false);
      
      // Try to use localStorage as fallback
      const userId = localStorage.getItem('userId');
      if (userId) {
        const hasCompleted = localStorage.getItem('hasCompletedPersonalization') === 'true';
        setUser({
          id: userId,
          username: localStorage.getItem('username') || 'User',
          hasCompletedPersonalization: hasCompleted,
        });
        fetchAssessments(userId);
      }
    } finally {
      setUserLoading(false);
    }
  };

  const fetchAssessments = async (userId) => {
    try {
      setLoading(true);
      const response = await api.get(`/assessments/${userId}`);
      setAssessments(response.data);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const createAssessment = async (assessmentData) => {
    // Get userId - try user object first, then localStorage
    let userId = user?.id || localStorage.getItem('userId');
    
    if (!userId) {
      toast.error('User not loaded. Please wait and try again.');
      return;
    }
    
    try {
      const response = await api.post(`/assessments/${userId}`, assessmentData);
      setAssessments(prev => [response.data, ...prev]);
      setShowCreateModal(false);
      toast.success('Assessment created successfully!');
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast.error('Failed to create assessment');
    }
  };

  const generateAIAssessment = async (aiParams) => {
    try {
      setAiGenerating(true);
      const response = await api.post('/ai/generate-assessment', aiParams);
      
      if (response.data.success && response.data.data) {
        const aiAssessment = response.data.data;
        
        // Store AI-generated data to pass to the create modal
        setAiGeneratedData({
          title: aiAssessment.title,
          description: aiAssessment.description,
          questions: aiAssessment.questions
        });
        
        // Close AI modal and open create modal
        setShowAIGeneratorModal(false);
        setShowCreateModal(true);
        
        toast.success(`AI generated ${aiAssessment.questions.length} questions! Review and create the assessment.`);
      } else {
        throw new Error('Invalid response from AI service');
      }
    } catch (error) {
      console.error('Error generating AI assessment:', error);
      if (error.response?.status === 503) {
        toast.error('AI service is not available. Please use manual creation.');
      } else {
        toast.error('Failed to generate assessment with AI. Please try again.');
      }
    } finally {
      setAiGenerating(false);
    }
  };

  const startAssessment = (assessment) => {
    setCurrentAssessment(assessment);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentAssessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitAssessment();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitAssessment = async () => {
    if (!user || !user.id) {
      toast.error('User not loaded. Please wait and try again.');
      return;
    }
    
    try {
      const answers = Object.values(selectedAnswers);
      const response = await api.post(`/assessments/${user.id}/${currentAssessment._id}/submit`, {
        answers
      });
      
      const percentage = Math.round((response.data.score / response.data.total) * 100);
      setScore(percentage);
      setShowResults(true);
      
      // Refresh assessments to show updated data
      fetchAssessments(user.id);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('Failed to submit assessment');
    }
  };

  const resetAssessment = () => {
    setCurrentAssessment(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterStatus === 'completed') {
      matchesFilter = assessment.submissions && assessment.submissions.length > 0;
    } else if (filterStatus === 'pending') {
      matchesFilter = !assessment.submissions || assessment.submissions.length === 0;
    }
    
    return matchesSearch && matchesFilter;
  });

  const sortedAssessments = [...filteredAssessments].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner variant="orbit" size="large" color="primary" text={userLoading ? "Loading user..." : "Loading assessments..."} />
        </div>
      </div>
    );
  }

  if (currentAssessment && !showResults) {
    const currentQuestion = currentAssessment.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentAssessment.questions.length) * 100;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{currentAssessment.title}</h2>
                <p className="text-purple-200">Question {currentQuestionIndex + 1} of {currentAssessment.questions.length}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-white/80">
                  <Timer className="w-5 h-5 mr-2" />
                  <span>Progress</span>
                </div>
                <button
                  onClick={resetAssessment}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between text-sm text-white/60 mt-2">
                <span>{currentQuestionIndex + 1} of {currentAssessment.questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
            </div>

            {/* Question */}
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/10"
            >
              <div className="flex items-start mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                  <span className="text-white font-bold text-lg">{currentQuestionIndex + 1}</span>
                </div>
                <h3 className="text-xl font-semibold text-white leading-relaxed">
                  {currentQuestion.prompt}
                </h3>
              </div>
              
              <div className="space-y-4">
                {currentQuestion.choices.map((choice, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
                    className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 ${
                      selectedAnswers[currentQuestionIndex] === index
                        ? 'border-purple-500 bg-purple-500/20 text-white shadow-lg shadow-purple-500/25'
                        : 'border-white/20 bg-white/5 text-white/80 hover:border-white/40 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-4 font-semibold ${
                        selectedAnswers[currentQuestionIndex] === index
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/20 text-white/60'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="font-medium">{choice}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Navigation */}
            <div className="flex justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Previous
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextQuestion}
                disabled={selectedAnswers[currentQuestionIndex] === undefined}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/25"
              >
                {currentQuestionIndex === currentAssessment.questions.length - 1 ? 'Finish' : 'Next'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (currentAssessment && showResults) {
    const correctAnswers = Math.round((score / 100) * currentAssessment.questions.length);
    const incorrectAnswers = currentAssessment.questions.length - correctAnswers;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl text-center"
          >
            {/* Results Header */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/25">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-2">Assessment Complete!</h2>
              <div className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                {score}%
              </div>
              <p className="text-purple-200 text-lg">
                You scored {score}% on {currentAssessment.title}
              </p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="text-3xl font-bold text-white mb-2">{currentAssessment.questions.length}</div>
                <div className="text-purple-200">Total Questions</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="text-3xl font-bold text-green-400 mb-2">{correctAnswers}</div>
                <div className="text-purple-200">Correct Answers</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="text-3xl font-bold text-red-400 mb-2">{incorrectAnswers}</div>
                <div className="text-purple-200">Incorrect Answers</div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetAssessment}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg shadow-purple-500/25 flex items-center justify-center"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Take Another Assessment
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentAssessment(null);
                  setShowResults(false);
                }}
                className="px-8 py-4 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-200 flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Assessments
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageSEO 
        title="Assessments - StudyBrain"
        description="Test your knowledge with custom assessments and track your learning progress"
        keywords="assessments, quizzes, tests, learning, education, study tools"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center justify-between mb-8"
          >
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                <Brain className="w-10 h-10 mr-3 text-purple-400" />
                Assessments
              </h1>
              <p className="text-purple-200 text-lg">Test your knowledge and track your progress</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const userId = user?.id || localStorage.getItem('userId');
                  if (!userId) {
                    toast.error('Please wait for user to load or refresh the page');
                    return;
                  }
                  setShowAIGeneratorModal(true);
                }}
                disabled={(!user && !localStorage.getItem('userId') && userLoading) || aiGenerating}
                className="flex items-center justify-center px-5 sm:px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-sm sm:text-base">AI Generate</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const userId = user?.id || localStorage.getItem('userId');
                  if (!userId) {
                    toast.error('Please wait for user to load or refresh the page');
                    return;
                  }
                  setShowCreateModal(true);
                }}
                disabled={!user && !localStorage.getItem('userId') && userLoading}
                className="flex items-center justify-center px-5 sm:px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="text-sm sm:text-base">Create Manual</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" />
                  <input
                    type="text"
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Assessments</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">By Title</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Assessments Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {sortedAssessments.map((assessment, index) => (
              <motion.div
                key={assessment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-2xl"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{assessment.title}</h3>
                    {assessment.description && (
                      <p className="text-purple-200 text-sm mb-4">{assessment.description}</p>
                    )}
                  </div>
                  {assessment.submissions && assessment.submissions.length > 0 && (
                    <div className="flex items-center text-green-400 ml-4">
                      <CheckCircle className="w-5 h-5 mr-1" />
                      <span className="text-sm font-medium">
                        {Math.round((assessment.submissions[0].score / assessment.questions.length) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-white/60 text-sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {assessment.questions.length} questions
                  </div>
                  <div className="flex items-center text-white/60 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    {new Date(assessment.createdAt).toLocaleDateString()}
                  </div>
                  {assessment.submissions && assessment.submissions.length > 0 && (
                    <div className="flex items-center text-white/60 text-sm">
                      <Trophy className="w-4 h-4 mr-2" />
                      Last score: {Math.round((assessment.submissions[0].score / assessment.questions.length) * 100)}%
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startAssessment(assessment)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center shadow-lg shadow-purple-500/25"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {assessment.submissions && assessment.submissions.length > 0 ? 'Retake Assessment' : 'Start Assessment'}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {sortedAssessments.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                <Brain className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No assessments yet</h3>
              <p className="text-purple-200 mb-8 max-w-md mx-auto">
                Create your first assessment to start testing your knowledge and tracking your progress.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const userId = user?.id || localStorage.getItem('userId');
                    if (!userId) {
                      toast.error('Please wait for user to load or refresh the page');
                      return;
                    }
                    setShowAIGeneratorModal(true);
                  }}
                  disabled={(!user && !localStorage.getItem('userId') && userLoading) || aiGenerating}
                  className="flex items-center justify-center mx-auto px-5 sm:px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="text-sm sm:text-base">Generate with AI</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const userId = user?.id || localStorage.getItem('userId');
                    if (!userId) {
                      toast.error('Please wait for user to load or refresh the page');
                      return;
                    }
                    setShowCreateModal(true);
                  }}
                  disabled={!user && !localStorage.getItem('userId') && userLoading}
                  className="flex items-center justify-center mx-auto px-5 sm:px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="text-sm sm:text-base">Create Manually</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Create Assessment Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <CreateAssessmentModal
              onClose={() => {
                setShowCreateModal(false);
                setAiGeneratedData(null); // Clear AI data when closing
              }}
              onCreate={createAssessment}
              initialData={aiGeneratedData}
            />
          )}
        </AnimatePresence>

        {/* AI Generator Modal */}
        <AnimatePresence>
          {showAIGeneratorModal && (
            <AIGeneratorModal
              onClose={() => setShowAIGeneratorModal(false)}
              onGenerate={generateAIAssessment}
              generating={aiGenerating}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

// AI Generator Modal Component
const AIGeneratorModal = ({ onClose, onGenerate, generating }) => {
  const [aiParams, setAiParams] = useState({
    chapter: '',
    subject: '',
    difficulty: 'medium',
    numQuestions: 5,
    additionalContext: ''
  });

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!aiParams.chapter.trim() || !aiParams.subject.trim()) {
      toast.error('Please enter chapter and subject');
      return;
    }
    onGenerate(aiParams);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">AI Assessment Generator</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Subject *</label>
              <input
                type="text"
                value={aiParams.subject}
                onChange={(e) => setAiParams(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                placeholder="e.g., Mathematics, Science"
                required
                disabled={generating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Chapter/Topic *</label>
              <input
                type="text"
                value={aiParams.chapter}
                onChange={(e) => setAiParams(prev => ({ ...prev, chapter: e.target.value }))}
                className="w-full px-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                placeholder="e.g., Algebra, Photosynthesis"
                required
                disabled={generating}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Difficulty</label>
              <select
                value={aiParams.difficulty}
                onChange={(e) => setAiParams(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                disabled={generating}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Number of Questions</label>
              <input
                type="number"
                min="1"
                max="20"
                value={aiParams.numQuestions}
                onChange={(e) => setAiParams(prev => ({ ...prev, numQuestions: parseInt(e.target.value) || 5 }))}
                className="w-full px-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                disabled={generating}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Additional Context (Optional)</label>
            <textarea
              value={aiParams.additionalContext}
              onChange={(e) => setAiParams(prev => ({ ...prev, additionalContext: e.target.value }))}
              className="w-full px-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
              placeholder="Any specific topics or requirements..."
              rows={3}
              disabled={generating}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 sm:px-6 py-2.5 sm:py-3 text-white/60 hover:text-white transition-colors text-sm sm:text-base"
              disabled={generating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating || !aiParams.subject.trim() || !aiParams.chapter.trim()}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              {generating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Generate Assessment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Create Assessment Modal Component
const CreateAssessmentModal = ({ onClose, onCreate, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    questions: initialData?.questions || []
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    prompt: '',
    choices: ['', '', '', ''],
    correctIndex: 0
  });
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  // Update formData when initialData changes (e.g., when AI generates content)
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        questions: initialData.questions || []
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }
    onCreate(formData);
  };

  const addQuestion = () => {
    if (!currentQuestion.prompt.trim() || currentQuestion.choices.some(choice => !choice.trim())) {
      toast.error('Please fill in all question fields');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }));
    
    setCurrentQuestion({
      prompt: '',
      choices: ['', '', '', ''],
      correctIndex: 0
    });
    setShowQuestionForm(false);
    toast.success('Question added successfully!');
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create New Assessment</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter assessment title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter assessment description"
              />
            </div>
          </div>

          {/* Questions List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Questions ({formData.questions.length})</h3>
              <button
                type="button"
                onClick={() => setShowQuestionForm(true)}
                className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </button>
            </div>

            <div className="space-y-4 max-h-60 overflow-y-auto">
              {formData.questions.map((question, index) => (
                <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium mb-2">{question.prompt}</p>
                      <div className="space-y-1">
                        {question.choices.map((choice, choiceIndex) => (
                          <div key={choiceIndex} className="flex items-center text-sm">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs font-semibold ${
                              choiceIndex === question.correctIndex 
                                ? 'bg-green-500 text-white' 
                                : 'bg-white/20 text-white/60'
                            }`}>
                              {String.fromCharCode(65 + choiceIndex)}
                            </span>
                            <span className="text-white/80">{choice}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Question Form */}
          {showQuestionForm && (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4">Add New Question</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Question *</label>
                  <textarea
                    value={currentQuestion.prompt}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, prompt: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your question"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Answer Choices *</label>
                  <div className="space-y-3">
                    {currentQuestion.choices.map((choice, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-full bg-white/20 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <input
                          type="text"
                          value={choice}
                          onChange={(e) => {
                            const newChoices = [...currentQuestion.choices];
                            newChoices[index] = e.target.value;
                            setCurrentQuestion(prev => ({ ...prev, choices: newChoices }));
                          }}
                          className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        />
                        <button
                          type="button"
                          onClick={() => setCurrentQuestion(prev => ({ ...prev, correctIndex: index }))}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            currentQuestion.correctIndex === index
                              ? 'bg-green-500 text-white'
                              : 'bg-white/20 text-white/60 hover:bg-white/30'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowQuestionForm(false)}
                  className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Add Question
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg shadow-purple-500/25"
            >
              Create Assessment
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Assessments;