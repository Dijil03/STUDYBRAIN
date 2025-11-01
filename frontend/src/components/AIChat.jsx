import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  RotateCcw, 
  Loader2, 
  Sparkles,
  MessageCircle,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import api from '../utils/axios';

const AIChat = ({ isOpen, onClose, isMinimized, onToggleMinimize }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !sessionId) {
      createNewSession();
    }
  }, [isOpen, sessionId]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const createNewSession = async () => {
    try {
      const response = await api.post('/ai/sessions');
      if (response.data.success) {
        setSessionId(response.data.data.sessionId);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || !sessionId) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await api.post('/ai/chat', {
        sessionId,
        message: inputMessage
      });

      if (response.data.success) {
        const aiMessage = {
          role: 'assistant',
          content: response.data.data.message,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const clearChat = async () => {
    if (!sessionId) return;
    
    try {
      await api.delete(`/ai/sessions/${sessionId}/messages`);
      setMessages([]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const startNewChat = () => {
    setSessionId(null);
    setMessages([]);
    createNewSession();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`fixed bottom-4 right-4 z-50 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
      } bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
          >
            <Bot className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h3 className="text-white font-bold text-sm">AI Assistant</h3>
            <p className="text-white/60 text-xs">Powered by DeepSeek</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleMinimize}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[400px]">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mb-4"
                >
                  <Sparkles className="w-8 h-8 text-purple-400" />
                </motion.div>
                <h4 className="text-white font-bold text-lg mb-2">Welcome to AI Assistant!</h4>
                <p className="text-white/60 text-sm mb-4">
                  I'm here to help you with your studies, answer questions, and provide guidance.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Help me study for exams",
                    "Explain this concept",
                    "Create a study plan",
                    "Quiz me on topics"
                  ].map((suggestion, index) => (
                    <motion.button
                      key={suggestion}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setInputMessage(suggestion)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded-full transition-all duration-200"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-[80%] ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
                          : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className={`px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white'
                          : message.isError
                          ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-200'
                          : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start space-x-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-purple-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-purple-400 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-purple-400 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-slate-800/50">
            <form onSubmit={sendMessage} className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about your studies..."
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent disabled:opacity-50"
                />
              </div>
              <div className="flex items-center space-x-2">
                {messages.length > 0 && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={clearChat}
                      className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                      title="Clear chat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={startNewChat}
                      className="p-2 text-white/60 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                      title="New chat"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </motion.button>
                  </>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default AIChat;
