import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  X, 
  Check, 
  Car, 
  Bike, 
  Plane, 
  Ship, 
  Rocket, 
  Heart, 
  Star, 
  Crown, 
  Zap, 
  Shield,
  User,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import api from '../utils/axios';

// Predefined avatar options
const PREDEFINED_AVATARS = [
  { id: 'car', name: 'Car', icon: Car, color: 'from-blue-500 to-blue-600' },
  { id: 'bike', name: 'Bike', icon: Bike, color: 'from-green-500 to-green-600' },
  { id: 'plane', name: 'Plane', icon: Plane, color: 'from-sky-500 to-sky-600' },
  { id: 'ship', name: 'Ship', icon: Ship, color: 'from-indigo-500 to-indigo-600' },
  { id: 'rocket', name: 'Rocket', icon: Rocket, color: 'from-purple-500 to-purple-600' },
  { id: 'heart', name: 'Heart', icon: Heart, color: 'from-pink-500 to-pink-600' },
  { id: 'star', name: 'Star', icon: Star, color: 'from-yellow-500 to-yellow-600' },
  { id: 'crown', name: 'Crown', icon: Crown, color: 'from-orange-500 to-orange-600' },
  { id: 'zap', name: 'Lightning', icon: Zap, color: 'from-cyan-500 to-cyan-600' },
  { id: 'shield', name: 'Shield', icon: Shield, color: 'from-red-500 to-red-600' }
];

const AvatarManager = ({ 
  currentAvatar, 
  username, 
  onAvatarUpdate, 
  userId,
  size = '2xl' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('predefined'); // 'predefined' or 'upload'
  const fileInputRef = useRef(null);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-24 h-24 text-2xl'
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (name) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
      'bg-gradient-to-br from-red-500 to-red-600'
    ];
    
    const index = name.length % colors.length;
    return colors[index];
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      setSelectedAvatar(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarSelect = (avatarId) => {
    setSelectedAvatar(avatarId);
    setUploadedImage(null);
    setError('');
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      let avatarData = selectedAvatar;

      // If it's an uploaded image, we need to upload it to the server
      if (uploadedImage) {
        const formData = new FormData();
        const file = fileInputRef.current.files[0];
        formData.append('avatar', file);
        formData.append('userId', userId);

        const response = await api.post('/auth/upload-avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        avatarData = response.data.avatarUrl;
      } else {
        // For predefined avatars, just store the ID
        await api.post('/auth/update-avatar', {
          userId,
          avatarId: selectedAvatar
        });
      }

      // Update local storage
      localStorage.setItem('userAvatar', avatarData);
      
      // Call the parent callback
      if (onAvatarUpdate) {
        onAvatarUpdate(avatarData);
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Error updating avatar:', error);
      setError('Failed to update avatar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setSelectedAvatar(null);
    setUploadedImage(null);
    setError('');
  };

  const getCurrentAvatarDisplay = () => {
    if (selectedAvatar && selectedAvatar.startsWith('data:image')) {
      return (
        <img
          src={selectedAvatar}
          alt="Current avatar"
          className="w-full h-full rounded-full object-cover border-2 border-white/20"
        />
      );
    }

    if (selectedAvatar) {
      const predefinedAvatar = PREDEFINED_AVATARS.find(avatar => avatar.id === selectedAvatar);
      if (predefinedAvatar) {
        return (
          <div className={`w-full h-full rounded-full flex items-center justify-center text-white border-2 border-white/20 bg-gradient-to-br ${predefinedAvatar.color}`}>
            <predefinedAvatar.icon className="w-1/2 h-1/2" />
          </div>
        );
      }
    }

    return (
      <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold border-2 border-white/20 ${getRandomColor(username)}`}>
        {getInitials(username)}
      </div>
    );
  };

  return (
    <>
      {/* Avatar Display */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`${sizeClasses[size]} relative group cursor-pointer`}
        onClick={() => setIsOpen(true)}
      >
        {getCurrentAvatarDisplay()}
        
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
        >
          <Camera className="w-3 h-3" />
        </motion.div>
      </motion.div>

      {/* Avatar Manager Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Choose Your Avatar</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-6 bg-white/5 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('predefined')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'predefined'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Predefined
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'upload'
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Upload
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Predefined Avatars Tab */}
              {activeTab === 'predefined' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-5 gap-3">
                    {PREDEFINED_AVATARS.map((avatar) => (
                      <motion.button
                        key={avatar.id}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAvatarSelect(avatar.id)}
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatar.color} flex items-center justify-center text-white hover:shadow-lg transition-all ${
                          selectedAvatar === avatar.id ? 'ring-2 ring-white' : ''
                        }`}
                      >
                        <avatar.icon className="w-6 h-6" />
                      </motion.button>
                    ))}
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={handleRemoveAvatar}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove Avatar</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Upload Tab */}
              {activeTab === 'upload' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    {uploadedImage ? (
                      <div className="space-y-4">
                        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-white/20">
                          <img
                            src={uploadedImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => fileInputRef.current.click()}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Choose Different Image
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-white/50" />
                        </div>
                        <div>
                          <button
                            onClick={() => fileInputRef.current.click()}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Choose Image
                          </button>
                          <p className="text-white/70 text-sm mt-2">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Preview */}
              <div className="mt-6 p-4 bg-white/5 rounded-xl">
                <h4 className="text-white font-medium mb-3">Preview</h4>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
                    {getCurrentAvatarDisplay()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{username}</p>
                    <p className="text-white/70 text-sm">Your new avatar</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-white/10 text-white px-4 py-3 rounded-xl font-medium hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Avatar</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AvatarManager;
