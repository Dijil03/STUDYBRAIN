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
  Image as ImageIcon,
  Video,
  Music,
  Link as LinkIcon,
  Star,
  Archive,
  X,
  Tag,
  BookOpen,
  Download,
  Eye,
  File,
  FolderPlus,
  CheckSquare,
  Square,
  Globe,
  ExternalLink,
  Import
} from 'lucide-react';
import Navbar from '../components/Navbar';
import SimpleGoogleDocsIntegration from '../components/SimpleGoogleDocsIntegration';
import api from '../utils/axios';
import { toast } from 'react-toastify';

const StudyMaterialLibrary = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showStarred, setShowStarred] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [tags, setTags] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [googleDocs, setGoogleDocs] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedGoogleDoc, setSelectedGoogleDoc] = useState(null);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    type: 'note',
    subject: 'general',
    content: '',
    linkUrl: '',
    tags: [],
    folderId: null
  });
  const [newTag, setNewTag] = useState('');

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      fetchMaterials();
      fetchTags();
      fetchSubjects();
      fetchGoogleDocs();
    }
  }, [userId, selectedSubject, selectedType, selectedTag, showArchived, showStarred, sortBy, sortOrder]);

  useEffect(() => {
    filterAndSortMaterials();
  }, [materials, searchTerm]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        subject: selectedSubject,
        type: selectedType,
        tag: selectedTag,
        archived: showArchived.toString(),
        starred: showStarred.toString(),
        sortBy,
        sortOrder
      });

      const response = await api.get(`/study-materials/${userId}?${params}`);
      if (response.data.success) {
        setMaterials(response.data.data.materials);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await api.get(`/study-materials/${userId}/tags`);
      if (response.data.success) {
        setTags(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get(`/study-materials/${userId}/subjects`);
      if (response.data.success) {
        setSubjects(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
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

  const handleImportGoogleDoc = async (googleDoc, subject = 'general', tags = []) => {
    try {
      const response = await api.post(`/study-materials/${userId}`, {
        title: googleDoc.name,
        description: `Imported from Google Docs - ${new Date(googleDoc.modifiedTime).toLocaleDateString()}`,
        type: 'link',
        subject: subject,
        linkUrl: googleDoc.webViewLink,
        tags: ['google-docs', ...tags],
        metadata: {
          googleDocId: googleDoc.id,
          importedAt: new Date().toISOString(),
          modifiedTime: googleDoc.modifiedTime
        }
      });

      if (response.data.success) {
        toast.success('Google Doc imported successfully!');
        setShowImportModal(false);
        setSelectedGoogleDoc(null);
        fetchMaterials();
        fetchTags();
        fetchSubjects();
      }
    } catch (error) {
      console.error('Error importing Google Doc:', error);
      toast.error('Failed to import Google Doc');
    }
  };

  const filterAndSortMaterials = () => {
    let filtered = [...materials];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchLower) ||
        material.description?.toLowerCase().includes(searchLower) ||
        material.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    setFilteredMaterials(filtered);
  };

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/study-materials/${userId}`, newMaterial);
      if (response.data.success) {
        toast.success('Material created successfully!');
        setShowCreateModal(false);
        setNewMaterial({
          title: '',
          description: '',
          type: 'note',
          subject: 'general',
          content: '',
          linkUrl: '',
          tags: [],
          folderId: null
        });
        fetchMaterials();
        fetchTags();
        fetchSubjects();
      }
    } catch (error) {
      console.error('Error creating material:', error);
      toast.error('Failed to create material');
    }
  };

  const handleUpdateMaterial = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/study-materials/${editingMaterial._id}`, editingMaterial);
      if (response.data.success) {
        toast.success('Material updated successfully!');
        setShowEditModal(false);
        setEditingMaterial(null);
        fetchMaterials();
        fetchTags();
        fetchSubjects();
      }
    } catch (error) {
      console.error('Error updating material:', error);
      toast.error('Failed to update material');
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    try {
      const response = await api.delete(`/study-materials/${materialId}`);
      if (response.data.success) {
        toast.success('Material deleted successfully!');
        fetchMaterials();
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete material');
    }
  };

  const handleToggleStar = async (material) => {
    try {
      const response = await api.put(`/study-materials/${material._id}`, {
        isStarred: !material.isStarred
      });
      if (response.data.success) {
        fetchMaterials();
      }
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const handleToggleArchive = async (material) => {
    try {
      const response = await api.put(`/study-materials/${material._id}`, {
        isArchived: !material.isArchived
      });
      if (response.data.success) {
        fetchMaterials();
      }
    } catch (error) {
      console.error('Error toggling archive:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMaterials.length === 0) return;
    if (!window.confirm(`Delete ${selectedMaterials.length} material(s)?`)) return;

    try {
      const response = await api.delete(`/study-materials/${userId}/bulk-delete`, {
        data: { materialIds: selectedMaterials }
      });
      if (response.data.success) {
        toast.success(`${response.data.data.deleted} material(s) deleted!`);
        setSelectedMaterials([]);
        fetchMaterials();
      }
    } catch (error) {
      console.error('Error bulk deleting:', error);
      toast.error('Failed to delete materials');
    }
  };

  const handleBulkStar = async () => {
    if (selectedMaterials.length === 0) return;

    try {
      const response = await api.patch(`/study-materials/${userId}/bulk-update`, {
        materialIds: selectedMaterials,
        updates: { isStarred: true }
      });
      if (response.data.success) {
        toast.success(`${response.data.data.modified} material(s) starred!`);
        setSelectedMaterials([]);
        fetchMaterials();
      }
    } catch (error) {
      console.error('Error bulk starring:', error);
      toast.error('Failed to star materials');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return <FileText className="w-5 h-5" />;
      case 'image':
        return <ImageIcon className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'audio':
        return <Music className="w-5 h-5" />;
      case 'link':
        return <LinkIcon className="w-5 h-5" />;
      case 'note':
        return <FileText className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-500/20 text-red-400';
      case 'image':
        return 'bg-purple-500/20 text-purple-400';
      case 'video':
        return 'bg-blue-500/20 text-blue-400';
      case 'audio':
        return 'bg-green-500/20 text-green-400';
      case 'link':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'note':
        return 'bg-indigo-500/20 text-indigo-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const MaterialCard = ({ material }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative group bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 ${
        selectedMaterials.includes(material._id) ? 'ring-2 ring-purple-500' : ''
      }`}
    >
      {/* Selection checkbox */}
      <button
        onClick={() => {
          if (selectedMaterials.includes(material._id)) {
            setSelectedMaterials(selectedMaterials.filter(id => id !== material._id));
          } else {
            setSelectedMaterials([...selectedMaterials, material._id]);
          }
        }}
        className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {selectedMaterials.includes(material._id) ? (
          <CheckSquare className="w-5 h-5 text-purple-400" />
        ) : (
          <Square className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Type icon and badge */}
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${getTypeColor(material.type)}`}>
          {getTypeIcon(material.type)}
        </div>
        <div className="flex items-center gap-2">
          {material.isStarred && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
          {material.isArchived && <Archive className="w-4 h-4 text-gray-400" />}
          <div className="relative">
            <button className="p-1 hover:bg-slate-700 rounded">
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold mb-2 line-clamp-2">{material.title}</h3>

      {/* Description */}
      {material.description && (
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{material.description}</p>
      )}

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span className="capitalize">{material.subject}</span>
        {material.fileSize > 0 && <span>{formatFileSize(material.fileSize)}</span>}
      </div>

      {/* Tags */}
      {material.tags && material.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {material.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
            >
              {tag}
            </span>
          ))}
          {material.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
              +{material.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Eye className="w-3 h-3" />
          <span>{material.viewCount || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleStar(material)}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors"
          >
            <Star
              className={`w-4 h-4 ${
                material.isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
              }`}
            />
          </button>
          <button
            onClick={() => {
              setEditingMaterial(material);
              setShowEditModal(true);
            }}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors"
          >
            <Edit className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => handleDeleteMaterial(material._id)}
            className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const MaterialListItem = ({ material }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`group flex items-center gap-4 p-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-all ${
        selectedMaterials.includes(material._id) ? 'ring-2 ring-purple-500' : ''
      }`}
    >
      <button
        onClick={() => {
          if (selectedMaterials.includes(material._id)) {
            setSelectedMaterials(selectedMaterials.filter(id => id !== material._id));
          } else {
            setSelectedMaterials([...selectedMaterials, material._id]);
          }
        }}
      >
        {selectedMaterials.includes(material._id) ? (
          <CheckSquare className="w-5 h-5 text-purple-400" />
        ) : (
          <Square className="w-5 h-5 text-gray-400" />
        )}
      </button>

      <div className={`p-3 rounded-lg ${getTypeColor(material.type)}`}>
        {getTypeIcon(material.type)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-white font-semibold truncate">{material.title}</h3>
          {material.isStarred && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
        </div>
        {material.description && (
          <p className="text-gray-400 text-sm truncate">{material.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span className="capitalize">{material.subject}</span>
          {material.fileSize > 0 && <span>• {formatFileSize(material.fileSize)}</span>}
          <span>• {material.viewCount || 0} views</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {material.tags && material.tags.length > 0 && (
          <div className="flex gap-1">
            {material.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <button
          onClick={() => handleToggleStar(material)}
          className="p-2 hover:bg-slate-700 rounded"
        >
          <Star
            className={`w-4 h-4 ${
              material.isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
            }`}
          />
        </button>
        <button
          onClick={() => {
            setEditingMaterial(material);
            setShowEditModal(true);
          }}
          className="p-2 hover:bg-slate-700 rounded"
        >
          <Edit className="w-4 h-4 text-gray-400" />
        </button>
        <button
          onClick={() => handleDeleteMaterial(material._id)}
          className="p-2 hover:bg-red-500/20 rounded"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen page-bg relative overflow-hidden">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Study Material Library</h1>
              <p className="text-gray-400">Organize and manage all your study materials</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Material
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-sm text-gray-400">Total Materials</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                <div className="text-2xl font-bold text-white">{formatFileSize(stats.totalSize)}</div>
                <div className="text-sm text-gray-400">Total Size</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                <div className="text-2xl font-bold text-white">
                  {materials.filter(m => m.isStarred).length}
                </div>
                <div className="text-sm text-gray-400">Starred</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                <div className="text-2xl font-bold text-white">{tags.length}</div>
                <div className="text-sm text-gray-400">Tags</div>
              </div>
            </div>
          )}

          {/* Google Docs Integration */}
          <div className="mt-6 mb-6">
            <SimpleGoogleDocsIntegration 
              userId={userId}
              onDocumentCreated={(doc) => {
                console.log('Google Doc created:', doc);
                fetchGoogleDocs();
              }}
              onDocumentSelected={(doc) => {
                console.log('Google Doc selected:', doc);
                // Open in new tab or show import modal
                setSelectedGoogleDoc(doc);
                setShowImportModal(true);
              }}
            />
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject.name} value={subject.name}>
                  {subject.name} ({subject.count})
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="note">Note</option>
              <option value="link">Link</option>
              <option value="document">Document</option>
            </select>

            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
                <option key={tag.name} value={tag.name}>
                  {tag.name} ({tag.count})
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowStarred(!showStarred)}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                showStarred
                  ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                  : 'bg-slate-800/50 border-slate-700/50 text-gray-400'
              }`}
            >
              <Star className="w-4 h-4" />
              Starred
            </button>

            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                showArchived
                  ? 'bg-gray-500/20 border-gray-500/50 text-gray-300'
                  : 'bg-slate-800/50 border-slate-700/50 text-gray-400'
              }`}
            >
              <Archive className="w-4 h-4" />
              Archived
            </button>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="lastAccessed-desc">Recently Viewed</option>
              <option value="viewCount-desc">Most Viewed</option>
            </select>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-slate-800/50 text-gray-400'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-slate-800/50 text-gray-400'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bulk actions */}
          {selectedMaterials.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-purple-500/20 border border-purple-500/50 rounded-lg">
              <span className="text-purple-300">{selectedMaterials.length} selected</span>
              <button
                onClick={handleBulkStar}
                className="px-3 py-1 bg-purple-500/30 text-purple-300 rounded hover:bg-purple-500/40 transition-colors"
              >
                Star
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-500/30 text-red-300 rounded hover:bg-red-500/40 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedMaterials([])}
                className="px-3 py-1 bg-gray-500/30 text-gray-300 rounded hover:bg-gray-500/40 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Materials Grid/List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400">Loading materials...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No materials found</h3>
            <p className="text-gray-400 mb-4">Start by adding your first study material</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              Add Material
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-3'
            }
          >
            {filteredMaterials.map((material) =>
              viewMode === 'grid' ? (
                <MaterialCard key={material._id} material={material} />
              ) : (
                <MaterialListItem key={material._id} material={material} />
              )
            )}

            {/* Google Docs */}
            {googleDocs.map((doc) => (
              viewMode === 'grid' ? (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group bg-gradient-to-br from-blue-500/10 to-red-500/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30 hover:border-blue-400/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-blue-400" />
                      <ExternalLink className="w-4 h-4 text-blue-300" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGoogleDoc(doc);
                          setShowImportModal(true);
                        }}
                        className="p-1.5 hover:bg-blue-500/20 rounded transition-colors"
                        title="Import to Library"
                      >
                        <Import className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(doc.webViewLink, '_blank');
                        }}
                        className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-white font-semibold mb-2 line-clamp-2">{doc.name}</h3>
                  <p className="text-gray-400 text-xs mb-3">
                    Google Doc • {new Date(doc.modifiedTime).toLocaleDateString()}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-blue-500/20">
                    <span className="text-xs text-blue-300">Google Docs</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(doc.webViewLink, '_blank');
                      }}
                      className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs hover:bg-blue-500/30 transition-colors"
                    >
                      Open
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="group flex items-center gap-4 p-4 bg-gradient-to-br from-blue-500/10 to-red-500/10 backdrop-blur-sm rounded-xl border border-blue-500/30 hover:border-blue-400/50 transition-all"
                >
                  <div className="flex items-center space-x-2">
                    <Globe className="h-6 w-6 text-blue-400" />
                    <ExternalLink className="h-4 w-4 text-blue-300" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold truncate">{doc.name}</h3>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>Google Doc</span>
                      <span>•</span>
                      <span>{new Date(doc.modifiedTime).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedGoogleDoc(doc);
                        setShowImportModal(true);
                      }}
                      className="p-2 hover:bg-blue-500/20 rounded"
                      title="Import to Library"
                    >
                      <Import className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => window.open(doc.webViewLink, '_blank')}
                      className="p-2 hover:bg-slate-700 rounded"
                    >
                      <ExternalLink className="w-4 h-4 text-blue-300" />
                    </button>
                  </div>
                </motion.div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Add New Material</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-slate-800 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleCreateMaterial} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                    <input
                      type="text"
                      value={newMaterial.title}
                      onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type *</label>
                    <select
                      value={newMaterial.type}
                      onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="note">Note</option>
                      <option value="pdf">PDF</option>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="audio">Audio</option>
                      <option value="link">Link</option>
                      <option value="document">Document</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                    <input
                      type="text"
                      value={newMaterial.subject}
                      onChange={(e) => setNewMaterial({ ...newMaterial, subject: e.target.value })}
                      placeholder="e.g., Mathematics, Physics"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={newMaterial.description}
                      onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {newMaterial.type === 'link' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Link URL</label>
                      <input
                        type="url"
                        value={newMaterial.linkUrl}
                        onChange={(e) => setNewMaterial({ ...newMaterial, linkUrl: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}

                  {newMaterial.type === 'note' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                      <textarea
                        value={newMaterial.content}
                        onChange={(e) => setNewMaterial({ ...newMaterial, content: e.target.value })}
                        rows={6}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newMaterial.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm flex items-center gap-2"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              setNewMaterial({
                                ...newMaterial,
                                tags: newMaterial.tags.filter((_, i) => i !== idx)
                              });
                            }}
                            className="hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newTag.trim() && !newMaterial.tags.includes(newTag.trim())) {
                              setNewMaterial({
                                ...newMaterial,
                                tags: [...newMaterial.tags, newTag.trim()]
                              });
                              setNewTag('');
                            }
                          }
                        }}
                        placeholder="Add tag and press Enter"
                        className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newTag.trim() && !newMaterial.tags.includes(newTag.trim())) {
                            setNewMaterial({
                              ...newMaterial,
                              tags: [...newMaterial.tags, newTag.trim()]
                            });
                            setNewTag('');
                          }
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                    >
                      Create Material
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && editingMaterial && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Edit Material</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-slate-800 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleUpdateMaterial} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                    <input
                      type="text"
                      value={editingMaterial.title}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, title: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                    <input
                      type="text"
                      value={editingMaterial.subject}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, subject: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={editingMaterial.description || ''}
                      onChange={(e) => setEditingMaterial({ ...editingMaterial, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {editingMaterial.type === 'link' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Link URL</label>
                      <input
                        type="url"
                        value={editingMaterial.linkUrl || ''}
                        onChange={(e) => setEditingMaterial({ ...editingMaterial, linkUrl: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}

                  {editingMaterial.type === 'note' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                      <textarea
                        value={editingMaterial.content || ''}
                        onChange={(e) => setEditingMaterial({ ...editingMaterial, content: e.target.value })}
                        rows={6}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(editingMaterial.tags || []).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm flex items-center gap-2"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMaterial({
                                ...editingMaterial,
                                tags: editingMaterial.tags.filter((_, i) => i !== idx)
                              });
                            }}
                            className="hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newTag.trim() && !editingMaterial.tags.includes(newTag.trim())) {
                              setEditingMaterial({
                                ...editingMaterial,
                                tags: [...(editingMaterial.tags || []), newTag.trim()]
                              });
                              setNewTag('');
                            }
                          }
                        }}
                        placeholder="Add tag and press Enter"
                        className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newTag.trim() && !editingMaterial.tags.includes(newTag.trim())) {
                            setEditingMaterial({
                              ...editingMaterial,
                              tags: [...(editingMaterial.tags || []), newTag.trim()]
                            });
                            setNewTag('');
                          }
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingMaterial.isStarred || false}
                        onChange={(e) => setEditingMaterial({ ...editingMaterial, isStarred: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-gray-300">Starred</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingMaterial.isArchived || false}
                        onChange={(e) => setEditingMaterial({ ...editingMaterial, isArchived: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-gray-300">Archived</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-6 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                    >
                      Update Material
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Import Google Doc Modal */}
      <AnimatePresence>
        {showImportModal && selectedGoogleDoc && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowImportModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Globe className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Import Google Doc</h2>
                      <p className="text-sm text-gray-400">Add to your study materials</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="p-2 hover:bg-slate-800 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <h3 className="text-white font-semibold truncate">{selectedGoogleDoc.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400">
                    Modified: {new Date(selectedGoogleDoc.modifiedTime).toLocaleDateString()}
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    handleImportGoogleDoc(
                      selectedGoogleDoc,
                      formData.get('subject') || 'general',
                      formData.get('tags')?.split(',').map(t => t.trim()).filter(Boolean) || []
                    );
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                    <select
                      name="subject"
                      defaultValue="general"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="general">General</option>
                      {subjects.map((subject) => (
                        <option key={subject.name} value={subject.name}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
                    <input
                      type="text"
                      name="tags"
                      placeholder="e.g., notes, important, exam-prep"
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowImportModal(false)}
                      className="px-6 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center gap-2"
                    >
                      <Import className="w-4 h-4" />
                      Import
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudyMaterialLibrary;

