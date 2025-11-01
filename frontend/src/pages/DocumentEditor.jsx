import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save,
  Share,
  Users,
  MessageSquare,
  History,
  MoreVertical,
  ArrowLeft,
  Eye,
  Download,
  Star,
  Archive,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { io } from 'socket.io-client';
import api from '../utils/axios';
import FeatureGate from '../components/FeatureGate';
import { FEATURES, useDocumentLimits } from '../utils/featureGate';

// TipTap editor configuration
const editorExtensions = [
  StarterKit,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
];

const DocumentEditor = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const { maxDocuments, canCreateDocument, isUnlimited } = useDocumentLimits();
  
  const [document, setDocument] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [socket, setSocket] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [documentCount, setDocumentCount] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const isMountedRef = useRef(true);
  const fetchingRef = useRef(false);
  const currentDocumentIdRef = useRef(null);
  const isInitializingRef = useRef(false);
  const initializationTimeoutRef = useRef(null);
  const fetchTimeoutRef = useRef(null);

  // TipTap editor
  const editor = useEditor({
    extensions: editorExtensions,
    content: '',
    editable: true,
    onUpdate: ({ editor }) => {
      // Handle content changes
      if (socket && isMountedRef.current) {
        const content = editor.getHTML();
        socket.emit('content-change', {
          documentId,
          content: content,
          userId
        });
      }
    },
    onFocus: () => {
      console.log('Editor focused');
    },
    onBlur: () => {
      console.log('Editor blurred');
    },
  });

  useEffect(() => {
    console.log('DocumentEditor useEffect triggered');
    console.log('documentId:', documentId);
    console.log('userId:', userId);
    console.log('currentDocumentIdRef:', currentDocumentIdRef.current);
    console.log('isInitializingRef:', isInitializingRef.current);
    
    // Skip if we're already on the same document
    if (currentDocumentIdRef.current === documentId) {
      console.log('Already on same document, skipping fetch');
      return;
    }
    
    // Skip if we're already initializing
    if (isInitializingRef.current) {
      console.log('Already initializing, skipping fetch');
      return;
    }
    
    // Set initialization flag
    isInitializingRef.current = true;
    
    // Reset fetching flag when documentId changes
    fetchingRef.current = false;
    currentDocumentIdRef.current = documentId;
    
    if (documentId && documentId !== 'undefined') {
      console.log('Starting to fetch document...');
      
      // Clear any existing timeouts
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      // Use debounced fetch to prevent rapid re-initialization
      fetchTimeoutRef.current = setTimeout(async () => {
        if (!isMountedRef.current) return;
        
        const fetchAndSetup = async () => {
          try {
            await fetchDocument();
            setupSocket();
          } catch (error) {
            console.error('Error in fetchAndSetup:', error);
          } finally {
            // Only reset initialization flag if component is still mounted
            if (isMountedRef.current) {
              initializationTimeoutRef.current = setTimeout(() => {
                isInitializingRef.current = false;
              }, 1000);
            }
          }
        };
        
        fetchAndSetup();
      }, 100); // Small delay to debounce
      
      // Add timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        if (isMountedRef.current && loading) {
          console.error('Document loading timeout - forcing load to complete');
          setLoading(false);
          // Create a default document if loading times out
          const defaultDoc = { 
            _id: documentId, 
            title: 'Untitled Document', 
            content: '',
            userId: userId 
          };
          setDocument(defaultDoc);
          setTitle('Untitled Document');
          if (editor && isMountedRef.current) {
            editor.commands.setContent('');
          }
          isInitializingRef.current = false;
        }
      }, 10000); // 10 second timeout
      
      return () => {
        clearTimeout(timeout);
        if (initializationTimeoutRef.current) {
          clearTimeout(initializationTimeoutRef.current);
        }
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
        isInitializingRef.current = false;
        if (socket) {
          socket.disconnect();
        }
      };
    } else {
      console.log('Invalid documentId, setting loading to false');
      setLoading(false);
      isInitializingRef.current = false;
    }
  }, [documentId]);

  // Auto-save effect
  useEffect(() => {
    // Auto-save every 3 seconds
    const interval = setInterval(() => {
      if (isMountedRef.current && document && !saving && editor) {
        saveDocument();
      }
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [document, editor, saving]);

  // Editor initialization effect
  useEffect(() => {
    console.log('Editor initialization effect triggered');
    console.log('Editor exists:', !!editor);
    console.log('Document exists:', !!document);
    console.log('Is mounted:', isMountedRef.current);
    
    if (editor && document && isMountedRef.current) {
      console.log('Editor ready, setting content...');
      // Ensure editor is editable
      editor.setEditable(true);
      console.log('Editor editable:', editor.isEditable);
      // Focus the editor
      setTimeout(() => {
        if (editor && isMountedRef.current) {
          console.log('Focusing editor...');
          editor.commands.focus();
        }
      }, 100);
    }
  }, [editor, document]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Only set mounted to false on actual component unmount
      isMountedRef.current = false;
      isInitializingRef.current = false;
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  // Fetch document count for feature gating
  useEffect(() => {
    fetchDocumentCount();
  }, []);

  const fetchDocumentCount = async () => {
    try {
      const response = await api.get('/documents/count');
      if (response.status === 200) {
        setDocumentCount(response.data.count);
      }
    } catch (error) {
      console.error('Error fetching document count:', error);
    }
  };

  const fetchDocument = async () => {
    // Prevent multiple simultaneous fetches
    if (fetchingRef.current) {
      console.log('Already fetching document, skipping...');
      return;
    }
    
    try {
      fetchingRef.current = true;
      console.log('Fetching document:', documentId, 'for user:', userId);
      
      // Check if component is still mounted before setting loading
      if (!isMountedRef.current) {
        console.log('Component unmounted, aborting fetch');
        return;
      }
      
      // Set loading state more carefully
      if (isMountedRef.current) {
        setLoading(true);
      }
      
      const response = await api.get(`/documents/${userId}/${documentId}`);
      console.log('Document response:', response.data);
      
      // Check if component is still mounted before processing response
      if (!isMountedRef.current) {
        console.log('Component unmounted during fetch, aborting');
        return;
      }
      
      if (response.data && response.data.document) {
        console.log('Document found, setting state...');
        
        // Batch state updates to prevent unmounting
        if (isMountedRef.current) {
          setDocument(response.data.document);
          setTitle(response.data.document.title);
          
          // Set content in TipTap editor
          if (response.data.document.content) {
            try {
              // Try to parse as JSON first (for backward compatibility)
              const parsedContent = JSON.parse(response.data.document.content);
              if (editor && isMountedRef.current) {
                editor.commands.setContent(parsedContent);
              }
            } catch (error) {
              // If not JSON, treat as HTML
              if (editor && isMountedRef.current) {
                editor.commands.setContent(response.data.document.content);
              }
            }
          } else {
            console.log('No content found, creating empty editor');
            if (editor && isMountedRef.current) {
              editor.commands.setContent('');
            }
          }
        }
      } else {
        console.error('Invalid response structure:', response.data);
        // Create a default document if none exists
        if (isMountedRef.current) {
          const defaultDoc = { 
            _id: documentId, 
            title: 'Untitled Document', 
            content: '',
            userId: userId 
          };
          setDocument(defaultDoc);
          setTitle('Untitled Document');
          if (editor && isMountedRef.current) {
            editor.commands.setContent('');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Handle 404 or document not found
      if (error.response?.status === 404) {
        console.log('Document not found, creating new document');
        if (isMountedRef.current) {
          const newDoc = { 
            _id: documentId, 
            title: 'Untitled Document', 
            content: '',
            userId: userId 
          };
          setDocument(newDoc);
          setTitle('Untitled Document');
          if (editor && isMountedRef.current) {
            editor.commands.setContent('');
          }
        }
      } else {
        // For other errors, create empty editor
        if (isMountedRef.current) {
          const errorDoc = { 
            _id: documentId, 
            title: 'Untitled Document', 
            content: '',
            userId: userId 
          };
          setDocument(errorDoc);
          setTitle('Untitled Document');
          if (editor && isMountedRef.current) {
            editor.commands.setContent('');
          }
        }
      }
    } finally {
      fetchingRef.current = false;
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const setupSocket = () => {
    try {
      const socketUrl = import.meta.env.VITE_SOCKET_URL 
        ? import.meta.env.VITE_SOCKET_URL
        : import.meta.env.VITE_API_URL
          ? import.meta.env.VITE_API_URL.replace('/api', '')
          : import.meta.env.PROD
            ? '' // Will use same origin
            : 'http://localhost:5001';
      const newSocket = io(socketUrl || undefined, {
        transports: ['websocket', 'polling']
      });
      
      newSocket.emit('join-document', {
        documentId,
        userId,
        username: localStorage.getItem('username') || 'Anonymous'
      });

      newSocket.on('content-change', (data) => {
        if (isMountedRef.current && data.userId !== userId && editor) {
          try {
            // Try to parse as JSON first, then as HTML
            const content = JSON.parse(data.content);
            editor.commands.setContent(content);
          } catch (error) {
            // If not JSON, treat as HTML
            editor.commands.setContent(data.content);
          }
        }
      });

      newSocket.on('user-joined', (data) => {
        if (isMountedRef.current) {
          setCollaborators(prev => [...prev, data]);
        }
      });

      newSocket.on('user-left', (data) => {
        if (isMountedRef.current) {
          setCollaborators(prev => prev.filter(user => user.userId !== data.userId));
        }
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Error setting up socket connection:', error);
    }
  };

  const saveDocument = async () => {
    if (!document || !isMountedRef.current || !editor) return;
    
    try {
      if (isMountedRef.current) {
        setSaving(true);
      }
      const content = editor.getHTML();
      await api.put(`/documents/${userId}/${documentId}`, {
        title,
        content
      });
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  // Toolbar component for TipTap
  const Toolbar = () => {
    if (!editor) return null;

    return (
      <div className="bg-gray-100 border-b border-gray-300 p-2 flex items-center space-x-2 flex-wrap">
        {/* Font Size Dropdown */}
        <div className="relative">
          <select
            onChange={(e) => {
              const fontSize = e.target.value;
              if (fontSize) {
                // Apply font size using CSS
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  const span = document.createElement('span');
                  span.style.fontSize = fontSize;
                  range.surroundContents(span);
                }
              }
            }}
            className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
            defaultValue=""
          >
            <option value="">Font Size</option>
            <option value="8px">8px</option>
            <option value="9px">9px</option>
            <option value="10px">10px</option>
            <option value="11px">11px</option>
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="24px">24px</option>
            <option value="30px">30px</option>
            <option value="36px">36px</option>
            <option value="48px">48px</option>
            <option value="60px">60px</option>
            <option value="72px">72px</option>
            <option value="96px">96px</option>
          </select>
        </div>

        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded ${editor.isActive('strike') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
        >
          <Underline className="w-4 h-4" />
        </button>

        {/* Text Alignment */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
        >
          <AlignRight className="w-4 h-4" />
        </button>

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
        >
          <List className="w-4 h-4" />
        </button>
              <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}
        >
          <ListOrdered className="w-4 h-4" />
              </button>
      </div>
    );
  };

  const handleSave = () => {
    saveDocument();
  };

  if (loading && !document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading document...</p>
          <p className="text-slate-400 text-sm mt-2">Document ID: {documentId}</p>
          <p className="text-slate-400 text-sm">User ID: {userId}</p>
          <p className="text-slate-400 text-sm mt-2">If this takes too long, check the console for errors</p>
          <div className="mt-4 space-x-4">
          <button 
            onClick={() => {
              setLoading(false);
                const defaultDoc = { 
                  _id: documentId, 
                  title: 'Untitled Document', 
                  content: '',
                  userId: userId 
                };
                setDocument(defaultDoc);
                setTitle('Untitled Document');
                if (editor && isMountedRef.current) {
            editor.commands.setContent('');
          }
              }}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Create New Document
          </button>
            <button 
              onClick={() => navigate('/documents')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Documents
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Document Not Found</h2>
          <p className="text-slate-400 mb-6">The document you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/documents')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Back to Documents
          </button>
        </div>
      </div>
    );
  }

  if (!documentId || documentId === 'undefined') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Document Not Found</h2>
          <p className="text-slate-400 mb-6">The document you're looking for doesn't exist or you need to create a new one.</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/documents')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              View Documents
            </button>
            <button
              onClick={() => navigate('/documents')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
            >
              Create New Document
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/documents')}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </motion.button>
            
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="text-xl font-semibold bg-transparent text-white border-none outline-none"
              placeholder="Untitled Document"
            />
            
            {saving && (
              <div className="flex items-center text-slate-400 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500 mr-2"></div>
                Saving...
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Collaborators */}
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.userId}
                className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium"
                title={collaborator.username}
              >
                {collaborator.username.charAt(0).toUpperCase()}
              </div>
            ))}

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSave}
              className="p-2 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              <Save className="h-5 w-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowComments(!showComments)}
              className={`p-2 rounded-lg transition-colors ${
                showComments 
                  ? 'bg-purple-500/20 text-purple-300' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-lg transition-colors ${
                showHistory 
                  ? 'bg-purple-500/20 text-purple-300' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <History className="h-5 w-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowShare(true)}
              className="p-2 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              <Share className="h-5 w-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-700/50"
            >
              <MoreVertical className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Document Limit Warning */}
      {!isUnlimited && documentCount >= maxDocuments && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">⚠️</span>
              </div>
              <div>
                <p className="text-white font-semibold">Document Limit Reached</p>
                <p className="text-white/70 text-sm">
                  You've reached your limit of {maxDocuments} documents. 
                  {maxDocuments === 3 ? ' Upgrade to Study Pro for unlimited documents!' : ' Upgrade to Study Master for unlimited documents!'}
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/pricing'}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Editor */}
        <div className="flex-1">
          <div className="h-full">
            {/* Toolbar */}
            <Toolbar />
            
            {/* Editor */}
            <div className="h-full bg-white">
              {editor ? (
                <div 
                  onClick={() => {
                    console.log('Editor container clicked, focusing editor...');
                    if (editor) {
                      editor.commands.focus();
                    }
                  }}
                  className="h-full"
                >
                  <EditorContent 
                    editor={editor} 
                    className="prose max-w-none p-4 h-full focus:outline-none cursor-text"
                    style={{ minHeight: '500px' }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-500">Loading editor...</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <AnimatePresence>
          {(showComments || showHistory) && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-slate-800/50 backdrop-blur-xl border-l border-slate-700/50"
            >
              {showComments && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Comments</h3>
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment._id} className="bg-slate-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">{comment.userId}</span>
                          <span className="text-xs text-slate-400">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                      rows={3}
                    />
                    <button
                      onClick={() => {
                        // Handle comment submission
                        setNewComment('');
                      }}
                      className="mt-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                      Add Comment
                    </button>
                  </div>
                </div>
              )}

              {showHistory && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Version History</h3>
                  <div className="space-y-3">
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">Current Version</span>
                        <span className="text-xs text-slate-400">Now</span>
                      </div>
                      <p className="text-xs text-slate-400">Auto-saved</p>
                    </div>
                    {/* Add more version history items here */}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DocumentEditor;