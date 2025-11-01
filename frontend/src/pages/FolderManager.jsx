import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, 
  FileText, 
  Plus, 
  Search, 
  Grid, 
  List, 
  Star, 
  Archive,
  MoreVertical,
  Edit,
  Trash2,
  Move,
  FolderPlus,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import api from '../utils/axios';
import Navbar from '../components/Navbar';
import SimpleGoogleDocsIntegration from '../components/SimpleGoogleDocsIntegration';
import { Globe, ExternalLink } from 'lucide-react';

const FolderManager = () => {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [googleDocs, setGoogleDocs] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showCreateDocument, setShowCreateDocument] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState('');
  const [newDocumentTitle, setNewDocumentTitle] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3B82F6');
  const [selectedFolderForDocument, setSelectedFolderForDocument] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchFolders();
    fetchDocuments();
    fetchGoogleDocs();
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [selectedFolder, searchQuery, sortBy, sortOrder]);

  const fetchFolders = async () => {
    try {
      const response = await api.get(`/folders/${userId}`);
      setFolders(response.data.folders);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedFolder) params.append('folderId', selectedFolder);
      if (searchQuery) params.append('search', searchQuery);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const response = await api.get(`/documents/${userId}?${params}`);
      setDocuments(response.data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoogleDocs = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5001');
      const apiUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase}/api`;
      const response = await fetch(`${apiUrl}/google-docs/${userId}/documents`);
      const data = await response.json();
      if (data.success) {
        setGoogleDocs(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching Google Docs:', error);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/folders/${userId}`, {
        name: newFolderName,
        color: newFolderColor
      });
      setNewFolderName('');
      setShowCreateFolder(false);
      fetchFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/documents/${userId}`, {
        title: newDocumentTitle,
        folderId: selectedFolderForDocument || selectedFolder
      });
      
      // Navigate to the newly created document
      if (response.data && response.data.document && response.data.document._id) {
        navigate(`/document-editor/${response.data.document._id}`);
      }
      
      setNewDocumentTitle('');
      setSelectedFolderForDocument(null);
      setShowCreateDocument(false);
      fetchDocuments();
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const openCreateDocumentModal = () => {
    setSelectedFolderForDocument(selectedFolder);
    setShowCreateDocument(true);
  };

  const handleDeleteFolder = async (folderId) => {
    if (window.confirm('Are you sure you want to delete this folder?')) {
      try {
        await api.delete(`/folders/${userId}/${folderId}`);
        fetchFolders();
        if (selectedFolder === folderId) {
          setSelectedFolder(null);
        }
      } catch (error) {
        console.error('Error deleting folder:', error);
      }
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await api.delete(`/documents/${userId}/${documentId}`);
        fetchDocuments();
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const handleContextMenu = (e, item, type) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
      type
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const folderColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Documents</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowCreateFolder(true)}
                className="p-2 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 transition-colors"
              >
                <FolderPlus className="h-5 w-5 text-purple-400" />
              </motion.button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Folder List */}
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedFolder(null)}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                  selectedFolder === null 
                    ? 'bg-purple-500/20 text-purple-300' 
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <FileText className="h-4 w-4 mr-3" />
                All Documents
              </motion.button>

              {folders.map((folder) => (
                <motion.button
                  key={folder._id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedFolder(folder._id)}
                  onContextMenu={(e) => handleContextMenu(e, folder, 'folder')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                    selectedFolder === folder._id 
                      ? 'bg-purple-500/20 text-purple-300' 
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <Folder className="h-4 w-4 mr-3" style={{ color: folder.color }} />
                  {folder.name}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {selectedFolder ? folders.find(f => f._id === selectedFolder)?.name : 'All Documents'}
                </h1>
                <p className="text-slate-400">
                  {documents.length + googleDocs.length} document{(documents.length + googleDocs.length) !== 1 ? 's' : ''}
                  {googleDocs.length > 0 && (
                    <span className="text-blue-400 ml-2">
                      ({googleDocs.length} Google Doc{googleDocs.length !== 1 ? 's' : ''})
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="updatedAt">Last Modified</option>
                  <option value="createdAt">Created</option>
                  <option value="title">Name</option>
                </select>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors"
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4 text-white" /> : <SortDesc className="h-4 w-4 text-white" />}
                </motion.button>

                {/* View Mode */}
                <div className="flex bg-slate-700/50 rounded-lg p-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-500/20 text-purple-300' : 'text-slate-400'}`}
                  >
                    <List className="h-4 w-4" />
                  </motion.button>
                </div>

                {/* Create Document */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openCreateDocumentModal}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  <Plus className="h-4 w-4 mr-2 inline" />
                  New Document
                </motion.button>
              </div>
            </div>
          </div>

          {/* Google Docs Integration */}
          <div className="p-6 border-b border-slate-700/50">
            <SimpleGoogleDocsIntegration 
              userId={userId}
              onDocumentCreated={(doc) => {
                console.log('Google Doc created:', doc);
                // Refresh both regular documents and Google Docs
                fetchDocuments();
                fetchGoogleDocs();
              }}
              onDocumentSelected={(doc) => {
                console.log('Google Doc selected:', doc);
                // Open in new tab or handle selection
                window.open(doc.webViewLink, '_blank');
              }}
            />
          </div>


          {/* Documents Grid/List */}
          <div className="flex-1 p-6 overflow-auto">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-slate-800/30 rounded-lg p-6 animate-pulse">
                    <div className="h-4 bg-slate-700 rounded mb-3"></div>
                    <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No documents found</h3>
                <p className="text-slate-400 mb-6">Create your first document to get started</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openCreateDocumentModal}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Create Document
                </motion.button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                : 'space-y-4'
              }>
                {/* Regular Documents */}
                {documents.map((document) => (
                  <motion.div
                    key={document._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate(`/document-editor/${document._id}`)}
                    onContextMenu={(e) => handleContextMenu(e, document, 'document')}
                    className={`bg-slate-800/30 backdrop-blur-xl rounded-lg border border-slate-700/50 hover:border-purple-500/50 transition-all cursor-pointer ${
                      viewMode === 'list' ? 'p-4 flex items-center' : 'p-6'
                    }`}
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <FileText className="h-8 w-8 text-purple-400" />
                          <button className="p-1 hover:bg-slate-700/50 rounded">
                            <MoreVertical className="h-4 w-4 text-slate-400" />
                          </button>
                        </div>
                        <h3 className="text-white font-semibold mb-2 truncate">{document.title}</h3>
                        <p className="text-slate-400 text-sm">
                          {new Date(document.updatedAt).toLocaleDateString()}
                        </p>
                      </>
                    ) : (
                      <>
                        <FileText className="h-6 w-6 text-purple-400 mr-4" />
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{document.title}</h3>
                          <p className="text-slate-400 text-sm">
                            {new Date(document.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button className="p-1 hover:bg-slate-700/50 rounded">
                          <MoreVertical className="h-4 w-4 text-slate-400" />
                        </button>
                      </>
                    )}
                  </motion.div>
                ))}

                {/* Google Docs */}
                {googleDocs.map((doc) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => window.open(doc.webViewLink, '_blank')}
                    className={`bg-gradient-to-br from-blue-500/10 to-red-500/10 backdrop-blur-xl rounded-lg border border-blue-500/30 hover:border-blue-400/50 transition-all cursor-pointer ${
                      viewMode === 'list' ? 'p-4 flex items-center' : 'p-6'
                    }`}
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Globe className="h-8 w-8 text-blue-400" />
                            <ExternalLink className="h-4 w-4 text-blue-300" />
                          </div>
                          <button className="p-1 hover:bg-slate-700/50 rounded">
                            <MoreVertical className="h-4 w-4 text-slate-400" />
                          </button>
                        </div>
                        <h3 className="text-white font-semibold mb-2 truncate">{doc.name}</h3>
                        <p className="text-slate-400 text-sm">
                          Google Doc • {new Date(doc.modifiedTime).toLocaleDateString()}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2 mr-4">
                          <Globe className="h-6 w-6 text-blue-400" />
                          <ExternalLink className="h-4 w-4 text-blue-300" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{doc.name}</h3>
                          <p className="text-slate-400 text-sm">
                            Google Doc • {new Date(doc.modifiedTime).toLocaleDateString()}
                          </p>
                        </div>
                        <button className="p-1 hover:bg-slate-700/50 rounded">
                          <MoreVertical className="h-4 w-4 text-slate-400" />
                        </button>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Folder Modal */}
      <AnimatePresence>
        {showCreateFolder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowCreateFolder(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-lg p-6 w-96 border border-slate-700/50"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Create New Folder</h3>
              <form onSubmit={handleCreateFolder}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Folder Name</label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Enter folder name"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Color</label>
                  <div className="flex space-x-2">
                    {folderColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewFolderColor(color)}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newFolderColor === color ? 'border-white' : 'border-slate-600'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateFolder(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    Create Folder
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Document Modal */}
      <AnimatePresence>
        {showCreateDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowCreateDocument(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-lg p-6 w-96 border border-slate-700/50"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Create New Document</h3>
              <form onSubmit={handleCreateDocument}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Document Title</label>
                  <input
                    type="text"
                    value={newDocumentTitle}
                    onChange={(e) => setNewDocumentTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Enter document title"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Save to Folder</label>
                  <select
                    value={selectedFolderForDocument || ''}
                    onChange={(e) => setSelectedFolderForDocument(e.target.value || null)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="">No folder (root)</option>
                    {folders.map((folder) => (
                      <option key={folder._id} value={folder._id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedFolderForDocument 
                      ? `Will save to: ${folders.find(f => f._id === selectedFolderForDocument)?.name || 'Selected folder'}`
                      : selectedFolder 
                        ? `Will save to: ${folders.find(f => f._id === selectedFolder)?.name || 'Current folder'}`
                        : 'Will save to root directory'
                    }
                  </p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateDocument(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    Create Document
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bg-slate-800 border border-slate-700/50 rounded-lg shadow-xl z-50"
            style={{
              left: contextMenu.x,
              top: contextMenu.y
            }}
            onClick={closeContextMenu}
          >
            <div className="py-2">
              <button className="w-full px-4 py-2 text-left text-white hover:bg-slate-700/50 flex items-center">
                <Edit className="h-4 w-4 mr-3" />
                Rename
              </button>
              <button className="w-full px-4 py-2 text-left text-white hover:bg-slate-700/50 flex items-center">
                <Move className="h-4 w-4 mr-3" />
                Move
              </button>
              <button 
                className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/20 flex items-center"
                onClick={() => {
                  if (contextMenu.type === 'folder') {
                    handleDeleteFolder(contextMenu.item._id);
                  } else {
                    handleDeleteDocument(contextMenu.item._id);
                  }
                  closeContextMenu();
                }}
              >
                <Trash2 className="h-4 w-4 mr-3" />
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FolderManager;
