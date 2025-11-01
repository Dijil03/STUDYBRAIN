import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import api from '../utils/axios';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Star,
  StarIcon,
  Archive,
  Tag,
  BookOpen,
  Filter,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';

const Notes = () => {
  const userId = localStorage.getItem('userId');
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStarred, setFilterStarred] = useState(false);
  
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    subject: '',
    tags: [],
    color: '#3B82F6',
    isStarred: false
  });
  
  const subjects = ['All', 'Mathematics', 'Science', 'English', 'History', 'Other'];
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, searchTerm, filterStarred]);

  const fetchNotes = async () => {
    try {
      const response = await api.get(`/notes/${userId}`);
      setNotes(response.data);
      setFilteredNotes(response.data);
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    let filtered = [...notes];
    
    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStarred) {
      filtered = filtered.filter(note => note.isStarred);
    }
    
    setFilteredNotes(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNote) {
        await api.put(`/notes/${userId}/${editingNote._id}`, noteForm);
        toast.success('Note updated!');
      } else {
        await api.post(`/notes/${userId}`, noteForm);
        toast.success('Note created!');
      }
      setShowModal(false);
      resetForm();
      fetchNotes();
    } catch (error) {
      toast.error('Failed to save note');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await api.delete(`/notes/${userId}/${id}`);
        toast.success('Note deleted');
        fetchNotes();
      } catch (error) {
        toast.error('Failed to delete note');
      }
    }
  };

  const handleToggleStar = async (note) => {
    try {
      await api.put(`/notes/${userId}/${note._id}`, { isStarred: !note.isStarred });
      fetchNotes();
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      subject: note.subject,
      tags: note.tags || [],
      color: note.color,
      isStarred: note.isStarred
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingNote(null);
    setNoteForm({
      title: '',
      content: '',
      subject: '',
      tags: [],
      color: '#3B82F6',
      isStarred: false
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="text-white text-xl">Loading notes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📝 My Notes</h1>
            <p className="text-gray-300">Organize your study notes</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Note
          </motion.button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setFilterStarred(!filterStarred)}
            className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 ${
              filterStarred
                ? 'bg-yellow-500 text-gray-900'
                : 'bg-white/10 text-white border border-white/20'
            }`}
          >
            <Star className="w-5 h-5" />
            Starred
          </button>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-24 h-24 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No notes yet. Create your first note!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all cursor-pointer"
                onClick={() => handleEdit(note)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-1 h-12 rounded-full"
                    style={{ backgroundColor: note.color }}
                  />
                  <div className="flex-1 ml-3">
                    <h3 className="text-white font-semibold text-lg mb-1">{note.title}</h3>
                    {note.subject && (
                      <span className="text-xs px-2 py-1 bg-white/20 rounded-full text-gray-300">
                        {note.subject}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStar(note);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg"
                  >
                    {note.isStarred ? (
                      <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                    ) : (
                      <Star className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
                
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {note.content}
                </p>

                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {note.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-white/10 rounded-full text-xs text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(note);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(note._id);
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                {editingNote ? 'Edit Note' : 'New Note'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Subject</label>
                <select
                  value={noteForm.subject}
                  onChange={(e) => setNoteForm({ ...noteForm, subject: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {subjects.filter(s => s !== 'All').map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Content</label>
                <textarea
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  rows="8"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="text-gray-300">Color</label>
                <div className="flex gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNoteForm({ ...noteForm, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        noteForm.color === color ? 'border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={noteForm.isStarred}
                  onChange={(e) => setNoteForm({ ...noteForm, isStarred: e.target.checked })}
                  className="w-5 h-5"
                />
                <label className="text-gray-300">Star this note</label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  {editingNote ? 'Update' : 'Create'} Note
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Notes;
