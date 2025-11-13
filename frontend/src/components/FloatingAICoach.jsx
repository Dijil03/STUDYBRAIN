import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Sparkles, Loader2 } from 'lucide-react';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const FloatingAICoach = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Initialize session on mount
    initializeSession();
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addWelcomeMessage();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSession = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const response = await api.post('/ai/chat/session', { userId });
      if (response.data.success) {
        setSessionId(response.data.data.sessionId);
      }
    } catch (error) {
      console.error('Error initializing AI coach session:', error);
    }
  };

  const addWelcomeMessage = async () => {
    try {
      // Get daily coaching from Study Coach API
      const userId = localStorage.getItem('userId');
      if (userId) {
        const response = await api.get(`/study-coach/daily/${userId}`);
        if (response.data.success && response.data.data.coaching) {
          const coaching = response.data.data.coaching;
          const welcomeMessage = {
            id: 'welcome',
            role: 'assistant',
            content: `${coaching.greeting}\n\n${coaching.message}\n\n💡 **Today's Tip:** ${coaching.tip}\n\n${coaching.encouragement}`,
            timestamp: new Date()
          };
          setMessages([welcomeMessage]);
          return;
        }
      }
    } catch (error) {
      console.error('Error loading daily coaching:', error);
    }
    
    // Fallback welcome message
    const welcomeMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hi! How are you doing today?\n\nI'm Coach Brain, your AI Study Coach! I'm here to help you with:\n\n✨ **Study Planning** - Create personalized study schedules\n📊 **Performance Analysis** - Understand your learning patterns\n🎯 **Goal Setting** - Set and track your academic goals\n💡 **Study Tips** - Get personalized study strategies\n📚 **Subject Help** - Get guidance on any subject\n\nWhat would you like help with today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      if (!sessionId) {
        await initializeSession();
      }

      // Get user analytics and coaching context
      let userContext = '';
      try {
        const [analyticsResponse, coachingResponse] = await Promise.all([
          api.get(`/analytics/dashboard/${userId}?timeRange=week`),
          api.get(`/study-coach/daily/${userId}`).catch(() => null)
        ]);
        
        if (analyticsResponse.data.success) {
          const data = analyticsResponse.data.data;
          userContext = `User's recent study data: ${data.overview?.totalStudyTime || 0} min studied, ${data.overview?.sessionsCompleted || 0} sessions, ${data.performance?.averageAccuracy || 0}% average performance.`;
        }
        
        if (coachingResponse?.data?.success) {
          const coaching = coachingResponse.data.data.coaching;
          userContext += ` As Coach Brain, remember: ${coaching.insight || 'Focus on consistency'}.`;
        }
      } catch (err) {
        // Continue without context if analytics fail
      }

      // Use AI chat endpoint with study coach context
      const API_BASE_URL = api.defaults?.baseURL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/ai/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          sessionId: sessionId || 'coach-session',
          message: `${userContext ? `[Context: ${userContext}] ` : ''}As Coach Brain, the AI Study Coach, respond to: ${userMessage.content}`,
          context: 'study_coach'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true
      };

      setMessages(prev => [...prev, aiMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'content' && data.content) {
                fullResponse += data.content;
                setMessages(prev => {
                  const updated = [...prev];
                  const lastMsg = updated[updated.length - 1];
                  if (lastMsg && lastMsg.role === 'assistant' && lastMsg.isStreaming) {
                    lastMsg.content = fullResponse;
                  }
                  return updated;
                });
              } else if (data.type === 'complete') {
                setMessages(prev => {
                  const updated = [...prev];
                  const lastMsg = updated[updated.length - 1];
                  if (lastMsg && lastMsg.role === 'assistant') {
                    lastMsg.content = data.content || fullResponse;
                    lastMsg.isStreaming = false;
                  }
                  return updated;
                });
                break;
              } else if (data.type === 'error') {
                throw new Error(data.content || 'AI service error');
              }
            } catch (parseError) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again in a moment.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-purple-500/50 transition-all duration-300 group"
        aria-label="Open AI Study Coach"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Bot className="w-8 h-8" />
        </motion.div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-50 blur-xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Chat Window */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-6 right-6 w-96 h-[600px] bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30 z-50 flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-2 bg-white/20 rounded-full"
                  >
                    <Bot className="w-5 h-5 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-white font-bold text-lg">AI Study Coach</h3>
                    <p className="text-white/80 text-xs">Always here to help</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : message.isError
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-slate-800 text-gray-100 border border-slate-700'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div className="prose prose-invert prose-sm max-w-none
                          prose-headings:text-gray-100 prose-p:text-gray-200 prose-strong:text-white
                          prose-code:text-purple-300 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700
                          prose-blockquote:border-purple-500 prose-blockquote:text-gray-300
                          prose-a:text-purple-400 prose-a:no-underline hover:prose-a:text-purple-300
                          prose-ul:text-gray-200 prose-ol:text-gray-200 prose-li:text-gray-200">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p({ children }) {
                                const processChildren = (children, key = 0) => {
                                  if (typeof children === 'string') {
                                    const parts = [];
                                    let lastIndex = 0;
                                    const blockRegex = /\\\[([\s\S]*?)\\\]|\[([\s\S]*?\\[^\]]*?)\]/g;
                                    const inlineRegex = /\\\(([^\\]+?)\\\)/g;
                                    
                                    const allMatches = [];
                                    let match;
                                    
                                    while ((match = blockRegex.exec(children)) !== null) {
                                      allMatches.push({
                                        index: match.index,
                                        length: match[0].length,
                                        content: match[1] || match[2],
                                        isBlock: true
                                      });
                                    }
                                    
                                    while ((match = inlineRegex.exec(children)) !== null) {
                                      allMatches.push({
                                        index: match.index,
                                        length: match[0].length,
                                        content: match[1],
                                        isBlock: false
                                      });
                                    }
                                    
                                    allMatches.sort((a, b) => a.index - b.index);
                                    
                                    for (const m of allMatches) {
                                      if (m.index > lastIndex) {
                                        parts.push(children.slice(lastIndex, m.index));
                                      }
                                      try {
                                        if (m.isBlock) {
                                          parts.push(<BlockMath key={`block-${key}-${m.index}`} math={m.content.trim()} />);
                                        } else {
                                          parts.push(<InlineMath key={`inline-${key}-${m.index}`} math={m.content.trim()} />);
                                        }
                                      } catch (e) {
                                        parts.push(m.isBlock ? `[${m.content}]` : `\\(${m.content}\\)`);
                                      }
                                      lastIndex = m.index + m.length;
                                    }
                                    
                                    if (lastIndex < children.length) {
                                      parts.push(children.slice(lastIndex));
                                    }
                                    
                                    return parts.length > 1 ? parts : children;
                                  }
                                  return children;
                                };
                                
                                return <p>{processChildren(children)}</p>;
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                          {message.isStreaming && (
                            <motion.span
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1.2, repeat: Infinity }}
                              className="inline-block w-1 h-4 bg-purple-400 ml-1"
                            />
                          )}
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 rounded-2xl px-4 py-2 flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                      <span className="text-gray-300 text-sm">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700">
                <div className="flex items-center space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask your study coach..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={!inputMessage.trim() || isLoading}
                    className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAICoach;

