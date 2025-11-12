import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Loader2,
  Trash2,
  RotateCcw,
  MessageCircle,
  Plus
} from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../utils/axios';

const API_BASE_URL = (() => {
  if (api.defaults?.baseURL) {
    return api.defaults.baseURL.replace(/\/$/, '');
  }
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.endsWith('/api')
      ? import.meta.env.VITE_API_URL
      : `${import.meta.env.VITE_API_URL}/api`;
    return url.replace(/\/$/, '');
  }
  return '/api';
})();

const AI = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const streamingBufferRef = useRef('');
  const streamingUpdateRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);
  const pendingContentRef = useRef('');
  
  // --- Constants for Styling ---
  const ACCENT_COLOR = 'indigo'; 
  const ACCENT_COLOR_CLASS = `bg-${ACCENT_COLOR}-600 hover:bg-${ACCENT_COLOR}-700 text-white`;
  const USER_MESSAGE_CLASS = `bg-${ACCENT_COLOR}-700 text-white shadow-xl shadow-${ACCENT_COLOR}-900/50`;
  const AI_MESSAGE_CLASS = `bg-gray-800 text-gray-100 border border-gray-700/50 shadow-lg shadow-gray-900/50`;
  const ERROR_MESSAGE_CLASS = `bg-red-900/30 text-red-300 border border-red-700/50`;


  const scrollToBottom = () => {
    // Only scroll if near the bottom already, or if a new message is streaming/just finished
    if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
        if (isAtBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    messagesContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop } = messagesContainerRef.current;
      const isNearTop = scrollTop < 200;
      const hasManyMessages = messages.length > 5;
      const shouldShow = !isNearTop && hasManyMessages;
      
      setShowScrollToTop(shouldShow);
    }
  };

  // useEffect for scrolling - optimized to prevent excessive re-renders
  useEffect(() => {
    // Only scroll if near the bottom
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
      if (isAtBottom || messages.length === 1) {
        scrollToBottom();
      }
    }
  }, [messages.length]); // Only depend on length, not entire messages array

  // useEffect for scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [messages.length]);

  // Smooth streaming update with aggressive throttling to prevent shaking
  const updateStreamingContent = (messageId, newContent) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
    
    // Only update if it's been at least 150ms since last update (reduce frequency)
    if (timeSinceLastUpdate < 150 && pendingContentRef.current === '') {
      pendingContentRef.current = newContent;
      return;
    }
    
    // Cancel any pending update
    if (streamingUpdateRef.current) {
      cancelAnimationFrame(streamingUpdateRef.current);
    }

    // Batch updates
    streamingUpdateRef.current = requestAnimationFrame(() => {
      const contentToUpdate = pendingContentRef.current || newContent;
      pendingContentRef.current = '';
      lastUpdateTimeRef.current = Date.now();
      
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId && msg.isStreaming) {
          return { ...msg, content: contentToUpdate };
        }
        return msg;
      }));
      
      // Auto-scroll if near bottom - use instant scroll during streaming
      const container = messagesContainerRef.current;
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
        if (isAtBottom) {
          // Use instant scroll during streaming to prevent shake
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
        }
      }
    });
  };

  // useEffect for session creation
  useEffect(() => {
    createNewSession();
  }, []);

  const createNewSession = async () => {
    setMessages([]);
    setIsLoading(true);
    try {
      const response = await api.post('/ai/sessions');
      if (response.data.success) {
        setSessionId(response.data.data.sessionId);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setMessages([{ id: 'session-error', role: 'assistant', content: 'Could not start a new chat session. Please check your network.', isError: true }]);
    } finally {
        setIsLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || !sessionId) return;

    const userMessage = {
      id: Date.now() + 1,
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    const aiMessageId = Date.now();
    const aiMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };
    streamingBufferRef.current = ''; // Reset buffer for new message
    pendingContentRef.current = '';
    lastUpdateTimeRef.current = 0;
    setMessages(prev => [...prev, aiMessage]);

    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: messageToSend
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'content') {
                // Accumulate content in buffer
                streamingBufferRef.current += data.content || '';
                // Only update UI every 20-30 characters or every few chunks to reduce shaking
                const bufferLength = streamingBufferRef.current.length;
                const shouldUpdate = bufferLength % 25 === 0 || data.content.length > 30;
                
                if (shouldUpdate) {
                  updateStreamingContent(aiMessageId, streamingBufferRef.current);
                } else {
                  // Store pending content for next update
                  pendingContentRef.current = streamingBufferRef.current;
                }
              } else if (data.type === 'complete') {
                // Final update with complete content
                setMessages(prev => prev.map(msg => 
                  msg.id === aiMessageId 
                    ? { ...msg, isStreaming: false, content: data.content || streamingBufferRef.current }
                    : msg
                ));
                // Final update with any pending content
                if (pendingContentRef.current) {
                  updateStreamingContent(aiMessageId, streamingBufferRef.current);
                }
                streamingBufferRef.current = '';
                pendingContentRef.current = '';
                setIsLoading(false);
                setIsTyping(false);
                // Smooth scroll on completion
                setTimeout(() => {
                  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              } else if (data.type === 'error') {
                setMessages(prev => prev.map(msg => 
                  msg.id === aiMessageId 
                    ? { 
                        ...msg, 
                        isStreaming: false, 
                        content: data.content || 'Sorry, an error occurred.',
                        isError: true 
                      }
                    : msg
                ));
                streamingBufferRef.current = '';
                setIsLoading(false);
                setIsTyping(false);
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { 
              ...msg, 
              isStreaming: false, 
              content: 'Sorry, I encountered a connection error. Please try again.',
              isError: true 
            }
          : msg
      ));
      streamingBufferRef.current = '';
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      // Clean up animation frame on error
      if (streamingUpdateRef.current) {
        cancelAnimationFrame(streamingUpdateRef.current);
      }
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
    createNewSession();
  };

  const quickPrompts = [
    "Help me brainstorm essay topics for a history class.",
    "Explain the concept of 'quantum entanglement' simply.",
    "Create a study schedule for my upcoming exams.",
    "Generate 5 multiple-choice practice questions on cellular respiration.",
  ];

  const QuickPrompt = ({ prompt }) => (
    <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02, y: -4, boxShadow: `0 8px 16px rgba(99, 102, 241, 0.4)` }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setInputMessage(prompt)}
        className="p-5 bg-gray-800 border border-gray-700 rounded-xl text-left text-white transition-all duration-300 group shadow-lg flex flex-col justify-start items-start space-y-2"
    >
        <Sparkles className={`w-5 h-5 text-${ACCENT_COLOR}-400 group-hover:text-${ACCENT_COLOR}-300`} />
        <span className="font-medium text-sm sm:text-base">{prompt}</span>
    </motion.button>
  );

  // Memoized MessageBubble to prevent unnecessary re-renders
  const MessageBubble = React.memo(({ message, index }) => {
    const isUser = message.role === 'user';
    const isStreaming = message.isStreaming;
    
    return (
        <motion.div
            key={message.id || index}
            initial={{ opacity: 0, y: isUser ? 5 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
                type: "spring", 
                stiffness: 80, 
                damping: 25,
                duration: 0.6
            }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            style={{ willChange: 'auto' }}
        >
            <div className={`max-w-[90%] md:max-w-[70%] lg:max-w-[60%] flex items-start space-x-3`} style={{ contain: 'layout' }}>
                {!isUser && (
                    <div className="flex-shrink-0 mt-1">
                        <Bot className={`w-6 h-6 text-${ACCENT_COLOR}-500`} />
                    </div>
                )}
                
                <div className={`
                    px-5 py-3 rounded-3xl 
                    ${isUser ? 'rounded-br-md ' + USER_MESSAGE_CLASS : 'rounded-tl-md ' + (message.isError ? ERROR_MESSAGE_CLASS : AI_MESSAGE_CLASS)}
                `} style={{ contain: 'layout style paint' }}>
                    <div className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none">
                        <span className="inline-block">{message.content}</span>
                        {isStreaming && (
                            <motion.span
                                key={`cursor-${message.id}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0.3, 1, 0.3] }} 
                                transition={{ 
                                    duration: 1.2, 
                                    repeat: Infinity, 
                                    ease: "easeInOut",
                                    repeatDelay: 0.2
                                }} 
                                className="inline-block w-0.5 h-4 bg-indigo-400 ml-1 rounded-sm"
                                style={{ 
                                    verticalAlign: 'middle',
                                    display: 'inline-block',
                                    willChange: 'opacity'
                                }}
                            />
                        )}
                    </div>
                </div>

                {isUser && (
                    <div className="flex-shrink-0 mt-1">
                        <MessageCircle className="w-6 h-6 text-gray-500" />
                    </div>
                )}
            </div>
        </motion.div>
    );
  }, (prevProps, nextProps) => {
    // Custom comparison function to prevent re-renders unless content actually changed
    // Only update if content changed significantly (more than 10 chars difference or streaming status changed)
    const contentChanged = prevProps.message.content !== nextProps.message.content;
    const significantChange = contentChanged && 
      Math.abs(nextProps.message.content.length - prevProps.message.content.length) > 10;
    const streamingChanged = prevProps.message.isStreaming !== nextProps.message.isStreaming;
    const errorChanged = prevProps.message.isError !== nextProps.message.isError;
    
    return !significantChange && !streamingChanged && !errorChanged && 
           prevProps.message.id === nextProps.message.id;
  });
  

  return (
    <>
      <style jsx>{`
        /* Custom Scrollbar for a more premium look */
        .messages-container::-webkit-scrollbar {
          width: 6px;
        }
        .messages-container::-webkit-scrollbar-track {
          background: #1f2937; /* Dark track */
        }
        .messages-container::-webkit-scrollbar-thumb {
          background: #4b5563; /* Gray thumb */
          border-radius: 3px;
        }
        .messages-container::-webkit-scrollbar-thumb:hover {
          background: #6b7280; /* Lighter thumb on hover */
        }
        /* Custom scroll behavior for smoother scrolling when using the scroll-to-top button */
        .messages-container {
            scroll-behavior: smooth;
        }
        /* Style for multiline textarea */
        .input-textarea {
            overflow-y: hidden;
            height: auto;
            min-height: 1.5rem;
            max-height: 10rem;
        }
      `}</style>
      <div className="min-h-screen bg-gray-900 relative overflow-hidden">
        {/* Subtle Background Gradient for Depth */}
        <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 opacity-95 z-0`}></div>
        <Navbar />
        
        <div className="flex flex-col h-screen pt-16 relative z-10 overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col px-4 min-h-0">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center max-w-4xl mx-auto w-full"
                >
                  <MessageCircle className={`w-16 h-16 mx-auto mb-4 text-${ACCENT_COLOR}-500`} />
                  <h2 className="text-4xl font-extrabold text-white mb-10">
                    <span className={`text-${ACCENT_COLOR}-400`}>AI Study Buddy</span>
                  </h2>
                  
                  {/* Quick Prompts Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {quickPrompts.map((prompt, index) => (
                      <QuickPrompt key={index} prompt={prompt} />
                    ))}
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full h-full">
                {/* Chat Action Buttons */}
                <div className="flex justify-end space-x-3 p-2">
                    <motion.button
                        onClick={startNewChat}
                        disabled={isLoading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center space-x-2 px-3 py-1 text-sm rounded-full transition-colors duration-200 bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-50`}
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>New Chat</span>
                    </motion.button>
                    <motion.button
                        onClick={clearChat}
                        disabled={isLoading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center space-x-2 px-3 py-1 text-sm rounded-full transition-colors duration-200 bg-red-900/40 border border-red-700/40 text-red-300 hover:text-red-100 hover:bg-red-900/60 disabled:opacity-50`}
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear History</span>
                    </motion.button>
                </div>

                {/* Messages Container - Fixed Height with Scroll */}
                <div 
                  ref={messagesContainerRef}
                  className="messages-container flex-1 overflow-y-auto px-4 py-6 space-y-6 min-h-0 max-h-[calc(100vh-200px)]"
                  style={{ 
                    scrollBehavior: 'auto',
                    contain: 'layout style paint',
                    willChange: 'auto'
                  }}
                >
                  {messages.map((message, index) => (
                    <MessageBubble key={message.id || `msg-${index}`} message={message} index={index} />
                  ))}
                  <div ref={messagesEndRef} />
                  
                  {/* Scroll to Top Button */}
                  <AnimatePresence>
                    {showScrollToTop && (
                      <motion.button
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        whileHover={{ scale: 1.1, boxShadow: `0 0 10px rgba(99, 102, 241, 0.6)` }}
                        whileTap={{ scale: 0.95 }}
                        onClick={scrollToTop}
                        className={`fixed bottom-24 right-6 w-12 h-12 ${ACCENT_COLOR_CLASS} rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-50`}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* Input Area - ChatGPT Style */}
          <div className="w-full max-w-4xl mx-auto px-4 pb-6 pt-3">
            <div className="relative">
              <div className="flex items-end bg-gray-800 border border-gray-700 rounded-3xl p-3 shadow-2xl shadow-gray-950/70">
                {/* Plus Icon (Placeholder for file upload, etc.) */}
                <button 
                    className="flex-shrink-0 p-2 text-gray-500 hover:text-white mr-2 transition-colors duration-200"
                    aria-label="Attach file"
                >
                  <Plus className="w-5 h-5" />
                </button>
                
                {/* Input Field and Send Button */}
                <form onSubmit={sendMessage} className="flex-1 flex items-end">
                  <textarea
                    rows={1}
                    value={inputMessage}
                    onChange={(e) => {
                        setInputMessage(e.target.value);
                        // Optional: Auto-grow textarea height
                        const textarea = e.target;
                        textarea.style.height = 'auto';
                        textarea.style.height = textarea.scrollHeight + 'px';
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage(e);
                        }
                    }}
                    placeholder={isLoading ? "Waiting for response..." : "Ask your AI Study Buddy..."}
                    className="input-textarea flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-base resize-none overflow-y-hidden pr-2"
                    disabled={isLoading}
                    // Removed inline style for height, using CSS class
                  />
                  
                  {/* Send Button */}
                  <motion.button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`flex-shrink-0 ml-3 p-2 rounded-xl ${ACCENT_COLOR_CLASS} disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300`}
                    aria-label="Send message"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5 -rotate-45" />
                    )}
                  </motion.button>
                </form>
              </div>
              <p className="text-center text-xs text-gray-600 mt-2">
                AI can make mistakes. Consider checking important information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AI;