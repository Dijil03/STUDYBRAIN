import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Users, 
  BookOpen, 
  Globe, 
  Lock, 
  Shield, 
  Clock, 
  Target, 
  Tag,
  Plus,
  Minus,
  AlertCircle,
  Search,
  UserPlus,
  Mail,
  CheckCircle2
} from 'lucide-react';
import api from '../utils/axios';

const CreateGroupModal = ({ onClose, onCreate, creating, subjects, difficulties, schedules }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: 'General',
    privacy: 'public',
    memberLimit: 20,
    difficulty: 'intermediate',
    studySchedule: 'flexible',
    rules: 'Be respectful and supportive of all group members.',
    tags: []
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});
  
  // User invitation states
  const [showInviteSection, setShowInviteSection] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const privacyOptions = [
    {
      value: 'public',
      label: 'Public',
      description: 'Anyone can find and join this group',
      icon: Globe,
      color: 'text-green-400'
    },
    {
      value: 'invite-only',
      label: 'Invite Only',
      description: 'Users can request to join, admins approve',
      icon: Shield,
      color: 'text-yellow-400'
    },
    {
      value: 'private',
      label: 'Private',
      description: 'Only invited members can join',
      icon: Lock,
      color: 'text-red-400'
    }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Group name must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.memberLimit < 2) {
      newErrors.memberLimit = 'Minimum 2 members required';
    } else if (formData.memberLimit > 100) {
      newErrors.memberLimit = 'Maximum 100 members allowed';
    }

    if (formData.rules.length > 1000) {
      newErrors.rules = 'Rules must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Clean and prepare data
    const cleanData = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
      rules: formData.rules.trim(),
      tags: formData.tags.filter(tag => tag.trim()).slice(0, 5) // Max 5 tags
    };

    handleCreateWithInvites(cleanData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && formData.tags.length < 5 && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const adjustMemberLimit = (delta) => {
    const newLimit = Math.max(2, Math.min(100, formData.memberLimit + delta));
    handleInputChange('memberLimit', newLimit);
  };

  // User search and invitation functions
  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const currentUserId = localStorage.getItem('userId');
      const response = await api.get('/users/search', {
        params: { 
          q: query,
          limit: 10,
          userId: currentUserId
        }
      });

      if (response.data.success) {
        setSearchResults(response.data.data.users || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debounced search
    const newTimeout = setTimeout(() => {
      searchUsers(value);
    }, 300);
    
    setSearchTimeout(newTimeout);
  };

  const selectUser = (user) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeSelectedUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleCreateWithInvites = async (groupData) => {
    // First create the group
    const createdGroup = await onCreate(groupData);
    
    // If group was created successfully and we have users to invite
    if (createdGroup && selectedUsers.length > 0) {
      try {
        const currentUserId = localStorage.getItem('userId');
        const currentUserName = localStorage.getItem('username');
        
        const userIds = selectedUsers.map(user => user.id);
        
        await api.post(`/study-groups/${createdGroup._id}/invite-users`, {
          userIds,
          userId: currentUserId,
          userName: currentUserName
        });
        
        console.log(`Successfully invited ${selectedUsers.length} users to the group`);
      } catch (error) {
        console.error('Error inviting users:', error);
        // Don't block group creation if invites fail
      }
    }
  };

  // Clear search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-2xl font-bold text-white">Create Study Group</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-3 bg-slate-700/50 border ${
                errors.name ? 'border-red-500' : 'border-slate-600'
              } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              placeholder="Enter a catchy group name..."
              maxLength={100}
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.name}
              </p>
            )}
            <p className="text-slate-500 text-xs mt-1">{formData.name.length}/100</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-4 py-3 bg-slate-700/50 border ${
                errors.description ? 'border-red-500' : 'border-slate-600'
              } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none`}
              placeholder="Describe what your group is about, goals, and what members can expect..."
              rows={3}
              maxLength={500}
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.description}
              </p>
            )}
            <p className="text-slate-500 text-xs mt-1">{formData.description.length}/500</p>
          </div>

          {/* Subject and Difficulty Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <BookOpen className="w-4 h-4 inline mr-1" />
                Subject
              </label>
              <select
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject} className="bg-slate-800">
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Target className="w-4 h-4 inline mr-1" />
                Difficulty Level
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty} className="bg-slate-800">
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Privacy Settings
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {privacyOptions.map(option => {
                const IconComponent = option.icon;
                const isSelected = formData.privacy === option.value;
                
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleInputChange('privacy', option.value)}
                    className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <IconComponent className={`w-5 h-5 mr-2 ${option.color}`} />
                      <span className="font-medium text-white">{option.label}</span>
                    </div>
                    <p className="text-slate-400 text-xs">{option.description}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Study Schedule and Member Limit Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Study Schedule
              </label>
              <select
                value={formData.studySchedule}
                onChange={(e) => handleInputChange('studySchedule', e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {schedules.map(schedule => (
                  <option key={schedule} value={schedule} className="bg-slate-800">
                    {schedule.charAt(0).toUpperCase() + schedule.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Member Limit
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => adjustMemberLimit(-5)}
                  className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={formData.memberLimit}
                  onChange={(e) => handleInputChange('memberLimit', parseInt(e.target.value) || 2)}
                  className={`flex-1 px-4 py-3 bg-slate-700/50 border ${
                    errors.memberLimit ? 'border-red-500' : 'border-slate-600'
                  } rounded-xl text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  min="2"
                  max="100"
                />
                <button
                  type="button"
                  onClick={() => adjustMemberLimit(5)}
                  className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {errors.memberLimit && (
                <p className="text-red-400 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.memberLimit}
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Tags (Optional)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-purple-400 hover:text-purple-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              ))}
            </div>
            
            {formData.tags.length < 5 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Add a tag..."
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add
                </button>
              </div>
            )}
            <p className="text-slate-500 text-xs mt-1">
              {formData.tags.length}/5 tags • Tags help others find your group
            </p>
          </div>

          {/* Group Rules */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Group Rules (Optional)
            </label>
            <textarea
              value={formData.rules}
              onChange={(e) => handleInputChange('rules', e.target.value)}
              className={`w-full px-4 py-3 bg-slate-700/50 border ${
                errors.rules ? 'border-red-500' : 'border-slate-600'
              } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none`}
              placeholder="Set guidelines for your group members..."
              rows={3}
              maxLength={1000}
            />
            {errors.rules && (
              <p className="text-red-400 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.rules}
              </p>
            )}
            <p className="text-slate-500 text-xs mt-1">{formData.rules.length}/1000</p>
          </div>

          {/* User Invitations Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-300">
                <UserPlus className="w-4 h-4 inline mr-1" />
                Invite Users (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowInviteSection(!showInviteSection)}
                className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
              >
                {showInviteSection ? 'Hide' : 'Show'} Invitations
              </button>
            </div>

            {showInviteSection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 p-4 bg-slate-700/20 rounded-xl border border-slate-600/50"
              >
                {/* Selected Users */}
                {selectedUsers.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">
                      Selected Users ({selectedUsers.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedUsers.map(user => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-full text-sm border border-purple-500/30"
                        >
                          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white mr-2">
                            {user.profilePicture ? (
                              <img
                                src={user.profilePicture}
                                alt={user.username}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              user.username.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span>{user.username}</span>
                          <button
                            type="button"
                            onClick={() => removeSelectedUser(user.id)}
                            className="ml-2 text-purple-400 hover:text-purple-200 p-0.5 hover:bg-purple-500/20 rounded-full transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Search */}
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Search users by name or email..."
                    />
                    {searchLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                      </div>
                    )}
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto"
                    >
                      {searchResults.map(user => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => selectUser(user)}
                          disabled={selectedUsers.find(u => u.id === user.id)}
                          className="w-full px-4 py-3 text-left hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-b border-slate-700/50 last:border-b-0 flex items-center space-x-3"
                        >
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                            {user.profilePicture ? (
                              <img
                                src={user.profilePicture}
                                alt={user.username}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              user.username.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{user.username}</p>
                            <p className="text-slate-400 text-sm truncate">{user.email}</p>
                          </div>
                          {selectedUsers.find(u => u.id === user.id) && (
                            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                <p className="text-slate-500 text-xs">
                  <Mail className="w-3 h-3 inline mr-1" />
                  Invited users will receive a notification and can accept or decline the invitation.
                </p>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium"
            >
              Cancel
            </button>
            
            <motion.button
              type="submit"
              disabled={creating}
              whileHover={{ scale: creating ? 1 : 1.02 }}
              whileTap={{ scale: creating ? 1 : 0.98 }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {creating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {selectedUsers.length > 0 ? 'Creating & Inviting...' : 'Creating Group...'}
                </div>
              ) : (
                selectedUsers.length > 0 ? `Create & Invite ${selectedUsers.length} User${selectedUsers.length > 1 ? 's' : ''}` : 'Create Study Group'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateGroupModal;
