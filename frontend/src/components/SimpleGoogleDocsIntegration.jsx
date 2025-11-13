import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  ExternalLink, 
  Share2, 
  Loader2,
  AlertCircle,
  Globe,
  CheckCircle
} from 'lucide-react';

const SimpleGoogleDocsIntegration = ({ userId, onDocumentCreated, onDocumentSelected }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDocumentTitle, setNewDocumentTitle] = useState('');
  const [newDocumentContent, setNewDocumentContent] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [sharingDocument, setSharingDocument] = useState(null);

  // Check if user is connected to Google
  const [isConnected, setIsConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);

  useEffect(() => {
    checkGoogleConnection();
  }, [userId]);

  const checkGoogleConnection = async () => {
    try {
      setCheckingConnection(true);
      const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5001');
      const apiUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
      const response = await fetch(`${apiUrl}/google-docs/${userId}/token`, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        if (response.status === 401 || response.status === 403) {
          setIsConnected(false);
          setError('Authentication required. Please log in.');
        } else {
          setIsConnected(false);
          setError(errorData.error || errorData.message || 'Failed to check Google connection');
        }
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(true);
        loadDocuments();
      } else {
        setIsConnected(false);
        setError(data.error || data.message);
      }
    } catch (err) {
      console.error('Error checking Google connection:', err);
      setIsConnected(false);
      setError('Failed to check Google connection');
    } finally {
      setCheckingConnection(false);
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5001');
      const apiUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
      const response = await fetch(`${apiUrl}/google-docs/${userId}/documents`, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        if (response.status === 401 || response.status === 403) {
          setError('Authentication required. Please connect your Google account.');
          setIsConnected(false);
        } else {
          setError(errorData.error || 'Failed to load documents');
        }
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.documents);
      } else {
        setError(data.error || 'Failed to load documents');
      }
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (e) => {
    e.preventDefault();
    if (!newDocumentTitle.trim()) return;

    try {
      setLoading(true);
      const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5001');
      const apiUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
      const response = await fetch(`${apiUrl}/google-docs/${userId}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newDocumentTitle,
          content: newDocumentContent
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setDocuments(prev => [data.document, ...prev]);
        setNewDocumentTitle('');
        setNewDocumentContent('');
        setShowCreateModal(false);
        
        if (onDocumentCreated) {
          onDocumentCreated(data.document);
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Error creating document:', err);
      setError('Failed to create document');
    } finally {
      setLoading(false);
    }
  };

  const openDocument = (document) => {
    if (onDocumentSelected) {
      onDocumentSelected(document);
    } else {
      window.open(document.webViewLink, '_blank');
    }
  };

  const shareDocument = async (documentId, email) => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5001');
      const apiUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
      const response = await fetch(`${apiUrl}/google-docs/${userId}/documents/${documentId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Document shared with ${email}`);
        setSharingDocument(null);
        setShareEmail('');
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Error sharing document:', err);
      setError('Failed to share document');
    }
  };

  // Show loading state while checking connection
  if (checkingConnection) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-xl p-8 text-center border border-white/10"
      >
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4">Checking Google Connection...</h3>
        <p className="text-white/70">Verifying your Google account connection.</p>
      </motion.div>
    );
  }

  // Show error state
  if (error && !isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-500/10 rounded-xl p-6 border border-red-500/30"
      >
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <h3 className="text-lg font-semibold text-red-300">Google Docs Not Connected</h3>
        </div>
        <p className="text-red-200 mb-4">{error}</p>
        <p className="text-red-200/70 text-sm mb-4">
          To use Google Docs integration, you need to connect your Google account first.
        </p>
        <button
          onClick={() => {
            const backendUrl = import.meta.env.VITE_API_URL 
              ? import.meta.env.VITE_API_URL.replace('/api', '')
              : import.meta.env.PROD 
                ? '' 
                : 'http://localhost:5001';
            window.location.href = `${backendUrl}/api/auth/google-docs`;
          }}
          className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          Connect Google Account
        </button>
      </motion.div>
    );
  }

  // Main interface
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 rounded-xl p-6 border border-white/10"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Google Docs</h3>
            <p className="text-white/70 text-sm">Connected to Google</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Doc</span>
          </button>
          <button
            onClick={loadDocuments}
            disabled={loading}
            className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        <h4 className="text-white font-medium mb-3">Your Documents</h4>
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-white/50 mx-auto mb-3 animate-spin" />
            <p className="text-white/70">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/70">No documents found</p>
            <p className="text-white/50 text-sm">Create your first document to get started</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {documents.map((doc) => (
              <motion.div
                key={doc.id}
                whileHover={{ scale: 1.01 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">{doc.name}</div>
                    <div className="text-white/70 text-sm">
                      Modified: {new Date(doc.modifiedTime).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => openDocument(doc)}
                    className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSharingDocument(doc)}
                    className="p-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Document Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Create New Document</h3>
            <form onSubmit={createDocument}>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Document Title</label>
                  <input
                    type="text"
                    value={newDocumentTitle}
                    onChange={(e) => setNewDocumentTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
                    placeholder="Enter document title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Initial Content (Optional)</label>
                  <textarea
                    value={newDocumentContent}
                    onChange={(e) => setNewDocumentContent(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500 h-24 resize-none"
                    placeholder="Enter initial content..."
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Document'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-white/10 text-white/70 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Share Document Modal */}
      {sharingDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Share Document</h3>
            <p className="text-white/70 mb-4">Share "{sharingDocument.name}" with someone</p>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Email Address</label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-6">
              <button
                onClick={() => shareDocument(sharingDocument.id, shareEmail)}
                disabled={!shareEmail}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                Share Document
              </button>
              <button
                onClick={() => {
                  setSharingDocument(null);
                  setShareEmail('');
                }}
                className="px-4 py-2 bg-white/10 text-white/70 rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default SimpleGoogleDocsIntegration;
