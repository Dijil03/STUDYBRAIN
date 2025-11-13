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
    Plus,
    BookOpen, // Added a new icon for a prompt
    Feather, // Added a new icon for a prompt
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import Navbar from '../components/Navbar';
import api from '../utils/axios';

// --- API Configuration (Kept as is) ---
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
    // --- State and Refs (Kept as is) ---
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
    
    // --- Constants for Styling (Kept as is) ---
    const ACCENT_COLOR = 'indigo'; 
    const ACCENT_COLOR_CLASS = `bg-${ACCENT_COLOR}-600 hover:bg-${ACCENT_COLOR}-700 text-white`;
    const USER_MESSAGE_CLASS = `bg-${ACCENT_COLOR}-700 text-white shadow-xl shadow-${ACCENT_COLOR}-900/50`;
    const AI_MESSAGE_CLASS = `bg-gray-800 text-gray-100 border border-gray-700/50 shadow-lg shadow-gray-900/50`;
    const ERROR_MESSAGE_CLASS = `bg-red-900/30 text-red-300 border border-red-700/50`;


    // --- Scroll Handlers (Improved) ---
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

    // useEffect for scrolling 
    useEffect(() => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
            if (isAtBottom || messages.length === 1) {
                scrollToBottom();
            }
        }
    }, [messages.length]); 

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

    // --- Streaming Logic (Kept as is for functionality) ---
    const updateStreamingContent = (messageId, newContent) => {
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
        
        // Throttling: Update only if it's been at least 150ms
        if (timeSinceLastUpdate < 150 && pendingContentRef.current === '') {
            pendingContentRef.current = newContent;
            return;
        }
        
        if (streamingUpdateRef.current) {
            cancelAnimationFrame(streamingUpdateRef.current);
        }

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

    // --- Session and Message Functions (Kept as is for functionality) ---
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
        streamingBufferRef.current = ''; 
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
                throw new Error(`Network response was not ok: ${response.status} - ${errorText}`);
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
                                streamingBufferRef.current += data.content || '';
                                const bufferLength = streamingBufferRef.current.length;
                                const shouldUpdate = bufferLength % 25 === 0 || data.content.length > 30;
                                
                                if (shouldUpdate) {
                                    updateStreamingContent(aiMessageId, streamingBufferRef.current);
                                } else {
                                    pendingContentRef.current = streamingBufferRef.current;
                                }
                            } else if (data.type === 'complete') {
                                setMessages(prev => prev.map(msg => 
                                    msg.id === aiMessageId 
                                        ? { ...msg, isStreaming: false, content: data.content || streamingBufferRef.current }
                                        : msg
                                ));
                                if (pendingContentRef.current) {
                                    updateStreamingContent(aiMessageId, streamingBufferRef.current);
                                }
                                streamingBufferRef.current = '';
                                pendingContentRef.current = '';
                                setIsLoading(false);
                                setIsTyping(false);
                                setTimeout(() => {
                                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                                }, 150);
                            } else if (data.type === 'error') {
                                setMessages(prev => prev.map(msg => 
                                    msg.id === aiMessageId 
                                        ? { 
                                            ...msg, 
                                            isStreaming: false, 
                                            content: data.content || 'Sorry, an error occurred during streaming.',
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


    // --- ENHANCED QUICK PROMPTS DATA ---
    const quickPrompts = [
        { prompt: "Help me brainstorm essay topics for a history class.", icon: BookOpen },
        { prompt: "Explain the concept of 'quantum entanglement' simply.", icon: Sparkles },
        { prompt: "Create a study schedule for my upcoming exams.", icon: RotateCcw },
        { prompt: "Generate 5 multiple-choice practice questions on cellular respiration.", icon: Feather },
    ];

    // --- ENHANCED QUICK PROMPT COMPONENT ---
    const QuickPrompt = ({ prompt, icon: Icon }) => (
        <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02, y: -4, boxShadow: `0 8px 16px rgba(99, 102, 241, 0.4)` }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setInputMessage(prompt)}
            className="p-5 bg-gray-800 border border-gray-700/50 rounded-xl text-left text-white transition-all duration-300 group shadow-lg hover:shadow-indigo-700/30 flex flex-col justify-start items-start space-y-3 cursor-pointer"
            style={{ willChange: 'transform, box-shadow' }}
        >
            <Icon className={`w-6 h-6 text-${ACCENT_COLOR}-500 group-hover:text-${ACCENT_COLOR}-400 transition-colors`} />
            <span className="font-semibold text-sm sm:text-base">{prompt}</span>
            <span className="text-gray-400 text-xs mt-1">Click to use this prompt.</span>
        </motion.button>
    );

    // --- NEW AVATAR COMPONENT ---
    const MessageAvatar = ({ role, accentColor }) => {
        if (role === 'user') {
            // Placeholder for user avatar (e.g., initials or profile picture)
            return (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold text-white shadow-md flex-shrink-0">
                    U
                </div>
            );
        }
        return (
            <div className={`w-8 h-8 rounded-full bg-${accentColor}-700 flex items-center justify-center shadow-md flex-shrink-0`}>
                <Bot className={`w-5 h-5 text-white`} />
            </div>
        );
    };


    // --- Memoized MessageBubble (Enhanced) ---
    const MessageBubble = React.memo(({ message, index }) => {
        const isUser = message.role === 'user';
        const isStreaming = message.isStreaming;
        
        const bubbleClass = isUser 
            ? USER_MESSAGE_CLASS 
            : (message.isError ? ERROR_MESSAGE_CLASS : AI_MESSAGE_CLASS);

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
                style={{ willChange: 'transform, opacity' }}
            >
                <div className={`max-w-[90%] md:max-w-[75%] lg:max-w-[65%] flex items-start ${isUser ? 'flex-row-reverse space-x-reverse' : 'space-x-3'} space-x-3`} style={{ contain: 'layout' }}>
                    
                    <div className="flex-shrink-0 mt-1">
                        <MessageAvatar role={message.role} accentColor={ACCENT_COLOR} />
                    </div>
                    
                    <div className={`
                        px-5 py-3 rounded-3xl 
                        ${isUser ? 'rounded-br-md ' + bubbleClass : 'rounded-tl-md ' + bubbleClass}
                        transition-colors duration-200
                    `} style={{ contain: 'layout style paint' }}>
                        <div className="text-sm sm:text-base leading-relaxed prose prose-invert max-w-none 
                            prose-headings:text-gray-100 prose-p:text-gray-200 prose-strong:text-white
                            prose-code:text-indigo-300 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700
                            prose-blockquote:border-indigo-500 prose-blockquote:text-gray-300
                            prose-table:text-gray-200 prose-th:bg-gray-800 prose-td:bg-gray-800/50
                            prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:text-indigo-300
                            prose-ul:text-gray-200 prose-ol:text-gray-200 prose-li:text-gray-200">
                            {!isUser ? (
                                <ReactMarkdown
                                    components={{
                                        // Render LaTeX math in paragraphs and text
                                        p({ children }) {
                                            // Process children recursively to find and render LaTeX in strings only
                                            const processChildren = (children, key = 0) => {
                                                if (children === null || children === undefined) return null;
                                                
                                                // If it's a string, process it for LaTeX (both inline and block)
                                                if (typeof children === 'string') {
                                                    const parts = [];
                                                    let lastIndex = 0;
                                                    
                                                    // First, handle block math \[ ... \] or [ ... ] (only if it contains backslash, indicating LaTeX)
                                                    const blockRegex = /\\\[([\s\S]*?)\\\]|\[([\s\S]*?\\[^\]]*?)\]/g;
                                                    let blockMatch;
                                                    const blockMatches = [];
                                                    
                                                    while ((blockMatch = blockRegex.exec(children)) !== null) {
                                                        blockMatches.push({
                                                            index: blockMatch.index,
                                                            length: blockMatch[0].length,
                                                            content: blockMatch[1] || blockMatch[2]
                                                        });
                                                    }
                                                    
                                                    // Then handle inline math \( ... \)
                                                    const inlineRegex = /\\\(([^\\]+?)\\\)/g;
                                                    let inlineMatch;
                                                    const inlineMatches = [];
                                                    
                                                    while ((inlineMatch = inlineRegex.exec(children)) !== null) {
                                                        inlineMatches.push({
                                                            index: inlineMatch.index,
                                                            length: inlineMatch[0].length,
                                                            content: inlineMatch[1]
                                                        });
                                                    }
                                                    
                                                    // Combine and sort all matches
                                                    const allMatches = [
                                                        ...blockMatches.map(m => ({ ...m, isBlock: true })),
                                                        ...inlineMatches.map(m => ({ ...m, isBlock: false }))
                                                    ].sort((a, b) => a.index - b.index);
                                                    
                                                    // Process matches
                                                    for (const match of allMatches) {
                                                        if (match.index > lastIndex) {
                                                            parts.push(children.slice(lastIndex, match.index));
                                                        }
                                                        try {
                                                            if (match.isBlock) {
                                                                parts.push(<BlockMath key={`block-math-${key}-${match.index}`} math={match.content.trim()} />);
                                                            } else {
                                                                parts.push(<InlineMath key={`inline-math-${key}-${match.index}`} math={match.content.trim()} />);
                                                            }
                                                        } catch (e) {
                                                            parts.push(match.isBlock ? `[${match.content}]` : `\\(${match.content}\\)`);
                                                        }
                                                        lastIndex = match.index + match.length;
                                                    }
                                                    
                                                    if (lastIndex < children.length) {
                                                        parts.push(children.slice(lastIndex));
                                                    }
                                                    
                                                    return parts.length > 1 ? parts : children;
                                                }
                                                
                                                // If it's a number, convert to string
                                                if (typeof children === 'number') {
                                                    return String(children);
                                                }
                                                
                                                // If it's an array, process each element
                                                if (Array.isArray(children)) {
                                                    return children.map((child, idx) => processChildren(child, `${key}-${idx}`));
                                                }
                                                
                                                // If it's a React element, clone it and process its children
                                                if (React.isValidElement(children)) {
                                                    const processedChildren = processChildren(children.props.children, key);
                                                    return React.cloneElement(children, {
                                                        key: children.key || key,
                                                        children: processedChildren
                                                    });
                                                }
                                                
                                                // For anything else, return null (don't render objects)
                                                return null;
                                            };
                                            
                                            const processed = processChildren(children);
                                            return <p>{processed !== null ? processed : children}</p>;
                                        },
                                        // Render block math in code blocks or separate blocks
                                        code({ node, inline, className, children, ...props }) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            const codeContent = String(children).replace(/\n$/, '');
                                            
                                            // Check if it's a math code block
                                            if (match && match[1] === 'math') {
                                                try {
                                                    return <BlockMath math={codeContent} />;
                                                } catch (e) {
                                                    return <code className="bg-gray-800/50 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-sm" {...props}>{children}</code>;
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
                                                <code className="bg-gray-800/50 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-sm" {...props}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                        th({ children }) {
                                            // Process children recursively to find and render LaTeX in strings only
                                            const processChildren = (children, key = 0) => {
                                                if (children === null || children === undefined) return null;
                                                
                                                if (typeof children === 'string') {
                                                    const parts = [];
                                                    let lastIndex = 0;
                                                    
                                                    // Handle block math \[ ... \] or [ ... ] (only if it contains backslash, indicating LaTeX)
                                                    const blockRegex = /\\\[([\s\S]*?)\\\]|\[([\s\S]*?\\[^\]]*?)\]/g;
                                                    let blockMatch;
                                                    const blockMatches = [];
                                                    
                                                    while ((blockMatch = blockRegex.exec(children)) !== null) {
                                                        blockMatches.push({
                                                            index: blockMatch.index,
                                                            length: blockMatch[0].length,
                                                            content: blockMatch[1] || blockMatch[2],
                                                            isBlock: true
                                                        });
                                                    }
                                                    
                                                    // Handle inline math \( ... \)
                                                    const inlineRegex = /\\\(([^\\]+?)\\\)/g;
                                                    let inlineMatch;
                                                    const inlineMatches = [];
                                                    
                                                    while ((inlineMatch = inlineRegex.exec(children)) !== null) {
                                                        inlineMatches.push({
                                                            index: inlineMatch.index,
                                                            length: inlineMatch[0].length,
                                                            content: inlineMatch[1],
                                                            isBlock: false
                                                        });
                                                    }
                                                    
                                                    // Combine and sort all matches
                                                    const allMatches = [...blockMatches, ...inlineMatches].sort((a, b) => a.index - b.index);
                                                    
                                                    // Process matches
                                                    for (const match of allMatches) {
                                                        if (match.index > lastIndex) {
                                                            parts.push(children.slice(lastIndex, match.index));
                                                        }
                                                        try {
                                                            if (match.isBlock) {
                                                                parts.push(<BlockMath key={`block-math-${key}-${match.index}`} math={match.content.trim()} />);
                                                            } else {
                                                                parts.push(<InlineMath key={`inline-math-${key}-${match.index}`} math={match.content.trim()} />);
                                                            }
                                                        } catch (e) {
                                                            parts.push(match.isBlock ? `[${match.content}]` : `\\(${match.content}\\)`);
                                                        }
                                                        lastIndex = match.index + match.length;
                                                    }
                                                    
                                                    if (lastIndex < children.length) {
                                                        parts.push(children.slice(lastIndex));
                                                    }
                                                    
                                                    return parts.length > 1 ? parts : children;
                                                }
                                                
                                                if (typeof children === 'number') return String(children);
                                                if (Array.isArray(children)) {
                                                    return children.map((child, idx) => processChildren(child, `${key}-${idx}`));
                                                }
                                                if (React.isValidElement(children)) {
                                                    const processedChildren = processChildren(children.props.children, key);
                                                    return React.cloneElement(children, {
                                                        key: children.key || key,
                                                        children: processedChildren
                                                    });
                                                }
                                                return null;
                                            };
                                            
                                            const processed = processChildren(children);
                                            return (
                                                <th className="border-b border-gray-700 px-4 py-3 bg-gray-800/90 font-semibold text-left text-gray-100 text-sm sticky top-0 z-10">
                                                    {processed !== null ? processed : children}
                                                </th>
                                            );
                                        },
                                        td({ children }) {
                                            // Process children recursively to find and render LaTeX in strings only
                                            const processChildren = (children, key = 0) => {
                                                if (children === null || children === undefined) return null;
                                                
                                                if (typeof children === 'string') {
                                                    const parts = [];
                                                    let lastIndex = 0;
                                                    
                                                    // Handle block math \[ ... \] or [ ... ] (only if it contains backslash, indicating LaTeX)
                                                    const blockRegex = /\\\[([\s\S]*?)\\\]|\[([\s\S]*?\\[^\]]*?)\]/g;
                                                    let blockMatch;
                                                    const blockMatches = [];
                                                    
                                                    while ((blockMatch = blockRegex.exec(children)) !== null) {
                                                        blockMatches.push({
                                                            index: blockMatch.index,
                                                            length: blockMatch[0].length,
                                                            content: blockMatch[1] || blockMatch[2],
                                                            isBlock: true
                                                        });
                                                    }
                                                    
                                                    // Handle inline math \( ... \)
                                                    const inlineRegex = /\\\(([^\\]+?)\\\)/g;
                                                    let inlineMatch;
                                                    const inlineMatches = [];
                                                    
                                                    while ((inlineMatch = inlineRegex.exec(children)) !== null) {
                                                        inlineMatches.push({
                                                            index: inlineMatch.index,
                                                            length: inlineMatch[0].length,
                                                            content: inlineMatch[1],
                                                            isBlock: false
                                                        });
                                                    }
                                                    
                                                    // Combine and sort all matches
                                                    const allMatches = [...blockMatches, ...inlineMatches].sort((a, b) => a.index - b.index);
                                                    
                                                    // Process matches
                                                    for (const match of allMatches) {
                                                        if (match.index > lastIndex) {
                                                            parts.push(children.slice(lastIndex, match.index));
                                                        }
                                                        try {
                                                            if (match.isBlock) {
                                                                parts.push(<BlockMath key={`block-math-${key}-${match.index}`} math={match.content.trim()} />);
                                                            } else {
                                                                parts.push(<InlineMath key={`inline-math-${key}-${match.index}`} math={match.content.trim()} />);
                                                            }
                                                        } catch (e) {
                                                            parts.push(match.isBlock ? `[${match.content}]` : `\\(${match.content}\\)`);
                                                        }
                                                        lastIndex = match.index + match.length;
                                                    }
                                                    
                                                    if (lastIndex < children.length) {
                                                        parts.push(children.slice(lastIndex));
                                                    }
                                                    
                                                    return parts.length > 1 ? parts : children;
                                                }
                                                
                                                if (typeof children === 'number') return String(children);
                                                if (Array.isArray(children)) {
                                                    return children.map((child, idx) => processChildren(child, `${key}-${idx}`));
                                                }
                                                if (React.isValidElement(children)) {
                                                    const processedChildren = processChildren(children.props.children, key);
                                                    return React.cloneElement(children, {
                                                        key: children.key || key,
                                                        children: processedChildren
                                                    });
                                                }
                                                return null;
                                            };
                                            
                                            const processed = processChildren(children);
                                            return (
                                                <td className="border-b border-gray-700/50 px-4 py-3 text-gray-200 text-sm align-top">
                                                    <div className="max-w-md">{processed !== null ? processed : children}</div>
                                                </td>
                                            );
                                        },
                                        table({ children }) {
                                            return (
                                                <div className="overflow-x-auto my-6 shadow-lg rounded-lg border border-gray-700/50">
                                                    <table className="min-w-full border-collapse bg-gray-900/50">
                                                        {children}
                                                    </table>
                                                </div>
                                            );
                                        },
                                        thead({ children }) {
                                            return <thead className="bg-gray-800/80">{children}</thead>;
                                        },
                                        tbody({ children }) {
                                            return <tbody className="divide-y divide-gray-700/50">{children}</tbody>;
                                        },
                                        tr({ children }) {
                                            return <tr className="hover:bg-gray-800/30 transition-colors">{children}</tr>;
                                        },
                                    }}
                                >
                                    {message.content}
                                </ReactMarkdown>
                            ) : (
                                <span className="whitespace-pre-wrap">{message.content}</span>
                            )}
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
                                    className={`inline-block w-0.5 h-4 bg-${ACCENT_COLOR}-400 ml-1 rounded-sm`}
                                    style={{ 
                                        verticalAlign: 'middle',
                                        display: 'inline-block',
                                        willChange: 'opacity'
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }, (prevProps, nextProps) => {
        // Custom comparison function for optimization
        const contentChanged = prevProps.message.content !== nextProps.message.content;
        const significantChange = contentChanged && 
            Math.abs(nextProps.message.content.length - prevProps.message.content.length) > 10;
        const streamingChanged = prevProps.message.isStreaming !== nextProps.message.isStreaming;
        const errorChanged = prevProps.message.isError !== nextProps.message.isError;
        
        return !significantChange && !streamingChanged && !errorChanged && 
                    prevProps.message.id === nextProps.message.id;
    });
    

    // --- Component Render ---
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
                    <div className="flex-1 flex flex-col px-4 min-h-0 pb-36"> {/* Added padding-bottom to account for sticky footer */}
                        {messages.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center p-6">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-center max-w-4xl mx-auto w-full"
                                >
                                    <MessageCircle className={`w-16 h-16 mx-auto mb-4 text-${ACCENT_COLOR}-500`} />
                                    <h2 className="text-4xl font-extrabold text-white mb-2">
                                        Your <span className={`text-${ACCENT_COLOR}-400`}>AI Study Buddy</span>
                                    </h2>
                                    <p className="text-gray-400 mb-10 text-lg">
                                        I'm here to help you learn, study, and create.
                                    </p>
                                    
                                    {/* Quick Prompts Grid (Enhanced) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {quickPrompts.map((item, index) => (
                                            <QuickPrompt key={index} prompt={item.prompt} icon={item.icon} />
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full h-full">
                                {/* Chat Action Buttons (Enhanced Layout) */}
                                <div className="flex justify-between items-center p-2 border-b border-gray-800 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
                                    <p className="text-sm text-gray-500 font-medium hidden sm:block">
                                        Session ID: <span className="text-gray-400 font-normal">{sessionId ? sessionId.slice(0, 8) + '...' : 'New'}</span>
                                    </p>
                                    <div className="flex space-x-3 ml-auto sm:ml-0">
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
                                </div>

                                {/* Messages Container - Fixed Height with Scroll */}
                                <div 
                                    ref={messagesContainerRef}
                                    className="messages-container flex-1 overflow-y-auto px-4 py-6 space-y-6 min-h-0"
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
                                    
                                    {/* Scroll to Top Button (Positioned relative to viewport) */}
                                    <AnimatePresence>
                                        {showScrollToTop && (
                                            <motion.button
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 30 }}
                                                whileHover={{ scale: 1.1, boxShadow: `0 0 10px rgba(99, 102, 241, 0.6)` }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={scrollToTop}
                                                className={`fixed bottom-[110px] right-6 w-12 h-12 ${ACCENT_COLOR_CLASS} rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-50`}
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

                    {/* Input Area - STICKY FOOTER (Enhanced) */}
                    <div className="w-full bg-gray-900/90 backdrop-blur-sm fixed bottom-0 left-0 right-0 z-20 pt-3 pb-6 border-t border-gray-800 shadow-2xl shadow-gray-950/70">
                        <div className="w-full max-w-4xl mx-auto px-4">
                            <div className="relative">
                                <div className="flex items-end bg-gray-800 border border-gray-700/70 rounded-3xl p-3">
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
            </div>
        </>
    );
};

export default AI;