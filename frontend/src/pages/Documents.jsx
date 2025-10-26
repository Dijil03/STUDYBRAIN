import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Share, 
  Folder,
  FileText,
  Clock,
  User,
  Star,
  Archive
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FeatureGate from '../components/FeatureGate';
import { FEATURES, useDocumentLimits } from '../utils/featureGate';
import api from '../utils/axios';

const Documents = () => {
  // Debug: Log FEATURES
  console.log('Documents - FEATURES:', FEATURES);
  console.log('Documents - BASIC_DOCUMENTS:', FEATURES.BASIC_DOCUMENTS);
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [filterBy, setFilterBy] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDocumentTitle, setNewDocumentTitle] = useState('');
  const [creating, setCreating] = useState(false);
  
  const { maxDocuments, canCreateDocument, isUnlimited } = useDocumentLimits();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('No user ID found');
        setDocuments([]);
        return;
      }
      
      const response = await api.get(`/documents/${userId}`);
      if (response.status === 200) {
        // Ensure response.data is an array
        const documentsData = Array.isArray(response.data) ? response.data : [];
        setDocuments(documentsData);
      } else {
        console.error('Failed to fetch documents:', response.status);
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    if (!newDocumentTitle.trim()) return;

    if (!canCreateDocument(documents.length)) {
      alert(`You've reached your limit of ${maxDocuments} documents. Upgrade to create more!`);
      return;
    }

    try {
      setCreating(true);
      const userId = localStorage.getItem('userId');
      const response = await api.post(`/documents/${userId}`, {
        title: newDocumentTitle.trim()
      });
      
      if (response.status === 201) {
        setDocuments([response.data, ...documents]);
        setNewDocumentTitle('');
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating document:', error);
      alert('Error creating document. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const userId = localStorage.getItem('userId');
      await api.delete(`/documents/${userId}/${documentId}`);
      setDocuments(documents.filter(doc => doc._id !== documentId));
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document. Please try again.');
    }
  };

  const filteredDocuments = (Array.isArray(documents) ? documents : [])
    .filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterBy === 'all' || 
        (filterBy === 'recent' && new Date(doc.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
        (filterBy === 'starred' && doc.starred);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'updatedAt':
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Documents</h1>
              <p className="text-white/70">
                {documents.length} {isUnlimited ? 'documents' : `of ${maxDocuments} documents`}
              </p>
            </div>
            
            <FeatureGate feature={FEATURES.BASIC_DOCUMENTS}>
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={!canCreateDocument(documents.length)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                <span>New Document</span>
              </button>
            </FeatureGate>
          </div>

          {/* Document Limit Warning */}
          {!isUnlimited && documents.length >= maxDocuments && (
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">⚠️</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Document Limit Reached</p>
                    <p className="text-white/70 text-sm">
                      You've reached your limit of {maxDocuments} documents. 
                      Upgrade to Study Pro for unlimited documents!
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
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="updatedAt">Last Modified</option>
                  <option value="createdAt">Date Created</option>
                  <option value="title">Title</option>
                </select>

                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Documents</option>
                  <option value="recent">Recent</option>
                  <option value="starred">Starred</option>
                </select>

                <div className="flex bg-white/10 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white/20' : ''}`}
                  >
                    <Grid className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white/20' : ''}`}
                  >
                    <List className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Documents Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white/70 mb-2">No documents found</h3>
              <p className="text-white/50 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first document to get started'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                >
                  Create Document
                </button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredDocuments.map((document, index) => (
                <motion.div
                  key={document._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 cursor-pointer ${
                    viewMode === 'list' ? 'flex items-center justify-between' : ''
                  }`}
                  onClick={() => window.location.href = `/document-editor/${document._id}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{document.title}</h3>
                      <p className="text-white/70 text-sm mb-2">
                        {new Date(document.updatedAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-white/50">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(document.updatedAt).toLocaleTimeString()}
                        </span>
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          You
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mt-4 lg:mt-0" onClick={(e) => e.stopPropagation()}>
                    <Link
                      to={`/document-editor/${document._id}`}
                      className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      <Share className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      <Star className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(document._id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Create Document Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold text-white mb-6">Create New Document</h3>
                <form onSubmit={handleCreateDocument}>
                  <div className="mb-6">
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={newDocumentTitle}
                      onChange={(e) => setNewDocumentTitle(e.target.value)}
                      placeholder="Enter document title..."
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newDocumentTitle.trim() || creating}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creating ? 'Creating...' : 'Create Document'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Documents;
