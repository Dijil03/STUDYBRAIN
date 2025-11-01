import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Brain, 
  BookOpen, 
  Lightbulb, 
  Target, 
  Zap, 
  Star, 
  TrendingUp,
  MessageSquare,
  Mic,
  Volume2,
  Settings,
  Download,
  Share,
  Award,
  Clock,
  Users,
  BarChart3,
  FileText,
  Image,
  Code,
  Calculator,
  Microscope,
  Palette,
  Music,
  Globe,
  Book,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/axios';
import Navbar from '../components/Navbar';
import AITutor from '../components/AITutor';
import FeatureGate from '../components/FeatureGate';
import { useAIQueryLimits, FEATURES } from '../utils/featureGate';

const AITutorPage = () => {
  const [userId, setUserId] = useState(null);
  const [showTutor, setShowTutor] = useState(false);
  const [learningPattern, setLearningPattern] = useState(null);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('general');
  const [selectedTopic, setSelectedTopic] = useState('General Help');
  const [selectedDifficulty, setSelectedDifficulty] = useState('intermediate');
  const [todayQueryCount, setTodayQueryCount] = useState(0);
  
  const { canMakeQuery, maxQueriesPerDay, isUnlimited, remainingQueries } = useAIQueryLimits();

  const subjects = [
    { id: 'mathematics', name: 'Mathematics', icon: Calculator, color: 'from-blue-500 to-blue-600', description: 'Algebra, Calculus, Geometry, Statistics' },
    { id: 'science', name: 'Science', icon: Microscope, color: 'from-green-500 to-green-600', description: 'Physics, Chemistry, Biology, Earth Science' },
    { id: 'english', name: 'English', icon: Book, color: 'from-purple-500 to-purple-600', description: 'Literature, Grammar, Writing, Reading' },
    { id: 'history', name: 'History', icon: Globe, color: 'from-amber-500 to-amber-600', description: 'World History, Geography, Social Studies' },
    { id: 'art', name: 'Art', icon: Palette, color: 'from-pink-500 to-pink-600', description: 'Visual Arts, Design, Art History' },
    { id: 'music', name: 'Music', icon: Music, color: 'from-indigo-500 to-indigo-600', description: 'Music Theory, Composition, History' },
    { id: 'programming', name: 'Programming', icon: Code, color: 'from-orange-500 to-orange-600', description: 'Coding, Algorithms, Software Development' },
    { id: 'general', name: 'General', icon: Brain, color: 'from-gray-500 to-gray-600', description: 'General Help and Study Tips' }
  ];

  const difficulties = [
    { id: 'beginner', name: 'Beginner', description: 'New to the subject', color: 'bg-green-500' },
    { id: 'intermediate', name: 'Intermediate', description: 'Some knowledge', color: 'bg-yellow-500' },
    { id: 'advanced', name: 'Advanced', description: 'Experienced learner', color: 'bg-red-500' }
  ];

  const features = [
    {
      icon: MessageSquare,
      title: 'Real-time Chat',
      description: 'Ask questions and get instant answers from our AI tutor',
      color: 'text-blue-500'
    },
    {
      icon: Mic,
      title: 'Voice Interaction',
      description: 'Speak your questions and hear responses',
      color: 'text-green-500'
    },
    {
      icon: Lightbulb,
      title: 'Smart Explanations',
      description: 'Get step-by-step explanations tailored to your level',
      color: 'text-yellow-500'
    },
    {
      icon: Target,
      title: 'Personalized Learning',
      description: 'Adapts to your learning style and progress',
      color: 'text-purple-500'
    },
    {
      icon: FileText,
      title: 'Study Materials',
      description: 'AI-generated summaries, notes, and practice questions',
      color: 'text-indigo-500'
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Monitor your learning progress and achievements',
      color: 'text-orange-500'
    }
  ];

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      loadData(storedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadData = async (userId) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      const [patternResponse, materialsResponse, recommendationsResponse] = await Promise.all([
        api.get(`/ai-tutor/pattern/${userId}`),
        api.get(`/ai-tutor/materials?userId=${userId}`),
        api.get(`/ai-tutor/recommendations/${userId}`)
      ]);

      if (patternResponse.data.success) {
        setLearningPattern(patternResponse.data.data);
      }

      if (materialsResponse.data.success) {
        setStudyMaterials(materialsResponse.data.data);
      }

      if (recommendationsResponse.data.success) {
        setRecommendations(recommendationsResponse.data.data.recommendations || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load AI tutor data';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startTutorSession = () => {
    setShowTutor(true);
  };

  const generateStudyMaterial = async (subject, topic, difficulty, materialType) => {
    if (!userId) {
      toast.error('Please log in to generate study materials');
      return;
    }
    
    // Check AI query limit
    if (!canMakeQuery(todayQueryCount)) {
      const remaining = remainingQueries(todayQueryCount);
      toast.error(`You've reached your daily limit of ${maxQueriesPerDay} AI queries. Upgrade to unlimited!`);
      return;
    }
    
    try {
      const response = await api.post('/ai-tutor/materials/generate', {
        userId,
        subject,
        topic,
        difficulty,
        materialType
      });

      if (response.data.success) {
        setTodayQueryCount(prev => prev + 1);
        toast.success('Study material generated successfully!');
        loadData(userId); // Reload materials
      }
    } catch (error) {
      console.error('Error generating study material:', error);
      const errorMessage = error.response?.data?.message || 'Failed to generate study material';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI tutor...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please log in to access AI tutor</h1>
          <p className="text-gray-600">You need to be logged in to use the AI learning assistant.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">AI Learning Assistant</h1>
              <p className="text-gray-600">Your personal AI tutor for any subject</p>
            </div>
          </div>
          
          <button
            onClick={startTutorSession}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg text-lg font-semibold"
          >
            Start Learning Session
          </button>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${feature.color} bg-opacity-10`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">{feature.title}</h3>
              </div>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Subject Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Choose Your Subject</h2>
            <div className="grid grid-cols-2 gap-3">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => setSelectedSubject(subject.id)}
                  className={`p-4 rounded-lg text-left transition-all ${
                    selectedSubject === subject.id
                      ? 'bg-gradient-to-r ' + subject.color + ' text-white shadow-lg'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <subject.icon className="w-5 h-5" />
                    <span className="font-semibold">{subject.name}</span>
                  </div>
                  <p className="text-sm opacity-80">{subject.description}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Difficulty Selection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Select Difficulty</h2>
            <div className="space-y-3">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty.id}
                  onClick={() => setSelectedDifficulty(difficulty.id)}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    selectedDifficulty === difficulty.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${difficulty.color}`}></div>
                    <div>
                      <div className="font-semibold">{difficulty.name}</div>
                      <div className="text-sm opacity-80">{difficulty.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Learning Pattern Stats */}
        {learningPattern && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-white rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Learning Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{learningPattern.performance.totalSessions}</div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{learningPattern.performance.totalQuestions}</div>
                <div className="text-sm text-gray-600">Questions Asked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(learningPattern.performance.averageSatisfactionRating * 10) / 10}
                </div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(learningPattern.performance.averageSessionDuration)} min
                </div>
                <div className="text-sm text-gray-600">Avg Session</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-white rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">AI Recommendations</h2>
            <div className="space-y-3">
              {recommendations.slice(0, 5).map((rec, index) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-blue-800">
                      {rec.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-gray-700">{rec.reason}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Study Materials */}
        {studyMaterials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-white rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Study Materials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studyMaterials.slice(0, 6).map((material, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-gray-800">{material.title}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{material.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded">{material.subject}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">{material.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-white rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => generateStudyMaterial(selectedSubject, selectedTopic, selectedDifficulty, 'summary')}
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              <FileText className="w-6 h-6 text-blue-500 mb-2" />
              <div className="font-semibold">Generate Summary</div>
              <div className="text-sm text-gray-600">Create study summary</div>
            </button>
            
            <button
              onClick={() => generateStudyMaterial(selectedSubject, selectedTopic, selectedDifficulty, 'practice_questions')}
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
            >
              <Target className="w-6 h-6 text-green-500 mb-2" />
              <div className="font-semibold">Practice Questions</div>
              <div className="text-sm text-gray-600">Generate quiz questions</div>
            </button>
            
            <button
              onClick={() => generateStudyMaterial(selectedSubject, selectedTopic, selectedDifficulty, 'concept_map')}
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
            >
              <Brain className="w-6 h-6 text-purple-500 mb-2" />
              <div className="font-semibold">Concept Map</div>
              <div className="text-sm text-gray-600">Visual learning map</div>
            </button>
          </div>
        </motion.div>
      </div>

      {/* AI Tutor Modal */}
      {showTutor && (
        <AITutor 
          onClose={() => setShowTutor(false)}
        />
      )}
    </div>
  );
};

export default AITutorPage;
