import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  BookOpen,
  Lightbulb,
  Target,
  Brain,
  Zap,
  Star,
  Clock,
  MessageSquare,
  Settings,
  Download,
  Share,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Play,
  Pause,
  Square,
  ChevronDown,
  ChevronUp,
  Bot,
  User,
  Sparkles,
  TrendingUp,
  Award,
  FileText,
  Image,
  Code,
  Calculator,
  Globe,
  Microscope,
  Palette,
  Music,
  Book
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import api from '../utils/axios';
import { toast } from 'react-toastify';

const AITutor = ({ onClose }) => {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSubject, setCurrentSubject] = useState('General');
  const [currentTopic, setCurrentTopic] = useState('General Help');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [showSettings, setShowSettings] = useState(false);
  const [learningPattern, setLearningPattern] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    totalMessages: 0,
    questionsAsked: 0,
    explanationsGiven: 0,
    problemsSolved: 0,
    sessionDuration: 0
  });

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);

  const subjects = [
    { id: 'mathematics', name: 'Mathematics', icon: Calculator, color: 'text-blue-500' },
    { id: 'science', name: 'Science', icon: Microscope, color: 'text-green-500' },
    { id: 'english', name: 'English', icon: Book, color: 'text-purple-500' },
    { id: 'history', name: 'History', icon: Globe, color: 'text-amber-500' },
    { id: 'art', name: 'Art', icon: Palette, color: 'text-pink-500' },
    { id: 'music', name: 'Music', icon: Music, color: 'text-indigo-500' },
    { id: 'programming', name: 'Programming', icon: Code, color: 'text-orange-500' },
    { id: 'general', name: 'General', icon: Brain, color: 'text-gray-500' }
  ];

  const difficulties = [
    { id: 'beginner', name: 'Beginner', color: 'bg-green-500' },
    { id: 'intermediate', name: 'Intermediate', color: 'bg-yellow-500' },
    { id: 'advanced', name: 'Advanced', color: 'bg-red-500' }
  ];

  useEffect(() => {
    initializeSession();
    loadLearningPattern();
    setupVoiceRecognition();
    setupTextToSpeech();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSession = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('username') || 'Student';
      
      const response = await api.post('/ai-tutor/session/create', {
        userId,
        userName,
        subject: currentSubject,
        topic: currentTopic,
        difficulty
      });
      
      if (response.data.success) {
        setSessionId(response.data.data.sessionId);
        addWelcomeMessage();
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      toast.error('Failed to initialize AI tutor session');
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessage = {
      id: Date.now(),
      role: 'assistant',
      content: `Hello! I'm your AI tutor. I'm here to help you learn ${currentSubject.toLowerCase()}. What would you like to know about ${currentTopic.toLowerCase()}?`,
      timestamp: new Date(),
      messageType: 'text',
      metadata: {
        subject: currentSubject,
        topic: currentTopic,
        difficulty,
        hasVisual: false,
        hasCode: false,
        hasExplanation: false
      }
    };
    setMessages([welcomeMessage]);
  };

  const loadLearningPattern = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await api.get(`/ai-tutor/pattern/${userId}`);
      
      if (response.data.success) {
        setLearningPattern(response.data.data);
        loadRecommendations();
      }
    } catch (error) {
      console.error('Error loading learning pattern:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await api.get(`/ai-tutor/recommendations/${userId}`);
      
      if (response.data.success) {
        setRecommendations(response.data.data.recommendations || []);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const setupVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Speech recognition failed');
      };
    }
  };

  const setupTextToSpeech = () => {
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      messageType: 'text',
      metadata: {
        subject: currentSubject,
        topic: currentTopic,
        difficulty
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/ai-tutor/message/send', {
        sessionId,
        message: inputMessage,
        messageType: 'text',
        subject: currentSubject,
        topic: currentTopic
      });

      if (response.data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.data.data.response,
          timestamp: new Date(),
          messageType: response.data.data.messageType,
          metadata: response.data.data.metadata
        };

        setMessages(prev => [...prev, aiMessage]);
        setSessionStats(response.data.data.sessionStats);

        // Speak the response if voice is enabled
        if (isVoiceEnabled) {
          speakText(response.data.data.response);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speakText = (text) => {
    if (synthesisRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      synthesisRef.current.speak(utterance);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getSubjectIcon = (subject) => {
    const subjectData = subjects.find(s => s.id === subject);
    return subjectData ? subjectData.icon : Brain;
  };

  const getSubjectColor = (subject) => {
    const subjectData = subjects.find(s => s.id === subject);
    return subjectData ? subjectData.color : 'text-gray-500';
  };

  const getDifficultyColor = (diff) => {
    const diffData = difficulties.find(d => d.id === diff);
    return diffData ? diffData.color : 'bg-gray-500';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const endSession = async () => {
    try {
      if (sessionId) {
        await api.post('/ai-tutor/session/end', {
          sessionId,
          rating: 5 // Default rating
        });
      }
      onClose();
    } catch (error) {
      console.error('Error ending session:', error);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">AI Learning Assistant</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(difficulty)} text-white`}>
                  {difficulties.find(d => d.id === difficulty)?.name}
                </span>
                <span className="flex items-center gap-1">
                  {React.createElement(getSubjectIcon(currentSubject), { className: `w-4 h-4 ${getSubjectColor(currentSubject)}` })}
                  {subjects.find(s => s.id === currentSubject)?.name}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={endSession}
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              ×
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={currentSubject}
                    onChange={(e) => setCurrentSubject(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                  <input
                    type="text"
                    value={currentTopic}
                    onChange={(e) => setCurrentTopic(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter topic"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {difficulties.map(diff => (
                      <option key={diff.id} value={diff.id}>{diff.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <Lightbulb className="w-4 h-4" />
              {showRecommendations ? 'Hide' : 'Show'} Recommendations ({recommendations.length})
              {showRecommendations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            <AnimatePresence>
              {showRecommendations && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 space-y-2"
                >
                  {recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{rec.type.replace('_', ' ').toUpperCase()}</span>
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-96">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none 
                    prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-gray-900
                    prose-code:text-blue-600 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700
                    prose-blockquote:border-blue-500 prose-blockquote:text-gray-600
                    prose-table:text-gray-700 prose-th:bg-gray-200 prose-td:bg-gray-50
                    prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-blue-800
                    prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700">
                    <ReactMarkdown
                      components={{
                        // Render LaTeX math in paragraphs
                        p({ children }) {
                          const text = React.Children.toArray(children).join('');
                          const parts = [];
                          let lastIndex = 0;
                          
                          const inlineRegex = /\\\(([^\\]+?)\\\)/g;
                          let match;
                          
                          while ((match = inlineRegex.exec(text)) !== null) {
                            if (match.index > lastIndex) {
                              parts.push(text.slice(lastIndex, match.index));
                            }
                            try {
                              parts.push(<InlineMath key={match.index} math={match[1]} />);
                            } catch (e) {
                              parts.push(match[0]);
                            }
                            lastIndex = match.index + match[0].length;
                          }
                          
                          if (lastIndex < text.length) {
                            parts.push(text.slice(lastIndex));
                          }
                          
                          return <p>{parts.length > 0 ? parts : children}</p>;
                        },
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          const codeContent = String(children).replace(/\n$/, '');
                          
                          if (match && match[1] === 'math') {
                            try {
                              return <BlockMath math={codeContent} />;
                            } catch (e) {
                              return <code className="bg-gray-200 px-1.5 py-0.5 rounded text-blue-600 font-mono text-sm" {...props}>{children}</code>;
                            }
                          }
                          
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              className="rounded-lg my-2"
                              {...props}
                            >
                              {codeContent}
                            </SyntaxHighlighter>
                          ) : (
                            <code className="bg-gray-200 px-1.5 py-0.5 rounded text-blue-600 font-mono text-sm" {...props}>
                              {children}
                            </code>
                          );
                        },
                        table({ children }) {
                          return (
                            <div className="overflow-x-auto my-6 shadow-lg rounded-lg border border-gray-300">
                              <table className="min-w-full border-collapse bg-white">
                                {children}
                              </table>
                            </div>
                          );
                        },
                        thead({ children }) {
                          return <thead className="bg-gray-100">{children}</thead>;
                        },
                        tbody({ children }) {
                          return <tbody className="divide-y divide-gray-200">{children}</tbody>;
                        },
                        tr({ children }) {
                          return <tr className="hover:bg-gray-50 transition-colors">{children}</tr>;
                        },
                        th({ children }) {
                          const text = React.Children.toArray(children).join('');
                          const parts = [];
                          let lastIndex = 0;
                          
                          const inlineRegex = /\\\(([^\\]+?)\\\)/g;
                          let match;
                          
                          while ((match = inlineRegex.exec(text)) !== null) {
                            if (match.index > lastIndex) {
                              parts.push(text.slice(lastIndex, match.index));
                            }
                            try {
                              parts.push(<InlineMath key={match.index} math={match[1]} />);
                            } catch (e) {
                              parts.push(match[0]);
                            }
                            lastIndex = match.index + match[0].length;
                          }
                          
                          if (lastIndex < text.length) {
                            parts.push(text.slice(lastIndex));
                          }
                          
                          return (
                            <th className="border-b border-gray-300 px-4 py-3 bg-gray-100 font-semibold text-left text-gray-800 text-sm sticky top-0 z-10">
                              {parts.length > 0 ? parts : children}
                            </th>
                          );
                        },
                        td({ children }) {
                          const text = React.Children.toArray(children).join('');
                          const parts = [];
                          let lastIndex = 0;
                          
                          const inlineRegex = /\\\(([^\\]+?)\\\)/g;
                          let match;
                          
                          while ((match = inlineRegex.exec(text)) !== null) {
                            if (match.index > lastIndex) {
                              parts.push(text.slice(lastIndex, match.index));
                            }
                            try {
                              parts.push(<InlineMath key={match.index} math={match[1]} />);
                            } catch (e) {
                              parts.push(match[0]);
                            }
                            lastIndex = match.index + match[0].length;
                          }
                          
                          if (lastIndex < text.length) {
                            parts.push(text.slice(lastIndex));
                          }
                          
                          return (
                            <td className="border-b border-gray-200 px-4 py-3 text-gray-700 text-sm align-top">
                              <div className="max-w-md">{parts.length > 0 ? parts : children}</div>
                            </td>
                          );
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
                
                {message.metadata && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {message.metadata.hasVisual && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        <Image className="w-3 h-3 inline mr-1" />
                        Visual
                      </span>
                    )}
                    {message.metadata.hasCode && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        <Code className="w-3 h-3 inline mr-1" />
                        Code
                      </span>
                    )}
                    {message.metadata.hasExplanation && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        <BookOpen className="w-3 h-3 inline mr-1" />
                        Explanation
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your studies..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              rows="2"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={startVoiceInput}
              disabled={isListening || !isVoiceEnabled}
              className={`p-3 rounded-lg ${
                isListening 
                  ? 'bg-red-500 text-white' 
                  : isVoiceEnabled 
                    ? 'bg-blue-500 text-white hover:bg-blue-600' 
                    : 'bg-gray-300 text-gray-500'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={`p-3 rounded-lg ${
                isVoiceEnabled 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-300 text-gray-500'
              }`}
            >
              {isVoiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Session Stats */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {sessionStats.totalMessages} messages
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              {sessionStats.questionsAsked} questions
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {sessionStats.sessionDuration} min
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-gray-100 rounded">
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <ThumbsDown className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AITutor;
