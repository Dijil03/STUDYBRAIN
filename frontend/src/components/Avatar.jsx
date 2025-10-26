import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, User, Check, X, Car, Bike, Plane, Ship, Rocket, Heart, Star, Crown, Zap, Shield } from 'lucide-react';
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

const Avatar = ({ 
  userId, 
  currentAvatar, 
  username, 
  size = 'md', 
  editable = false, 
  onAvatarUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Get avatar from localStorage or use currentAvatar prop
  const userAvatar = currentAvatar || localStorage.getItem('userAvatar');

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-24 h-24 text-2xl'
  };

  const handleAvatarUpdate = async (avatarId) => {
    setLoading(true);
    try {
      // Store avatar in localStorage for Clerk users
      localStorage.setItem('userAvatar', avatarId);
      
      if (onAvatarUpdate) {
        onAvatarUpdate(avatarId);
      }
      
      setShowAvatarPicker(false);
      
      // Show success message
      console.log('Avatar updated successfully!');
    } catch (error) {
      console.error('Error updating avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowAvatarPicker(false);
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

  const getAvatarDisplay = () => {
    // Check if userAvatar is a predefined avatar
    const predefinedAvatar = PREDEFINED_AVATARS.find(avatar => avatar.id === userAvatar);
    
    if (predefinedAvatar) {
      return {
        type: 'predefined',
        avatar: predefinedAvatar
      };
    }
    
    // Check if it's a URL
    if (userAvatar && userAvatar.startsWith('http')) {
      return {
        type: 'url',
        url: userAvatar
      };
    }
    
    return {
      type: 'initials'
    };
  };

  const avatarDisplay = getAvatarDisplay();

  if (showAvatarPicker) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        {/* Avatar Picker Modal */}
        <div className="absolute top-0 left-0 z-50 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl min-w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Choose Your Avatar</h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCancel}
              className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </motion.button>
          </div>
          
          <div className="grid grid-cols-5 gap-3">
            {PREDEFINED_AVATARS.map((avatar) => (
              <motion.button
                key={avatar.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAvatarUpdate(avatar.id)}
                disabled={loading}
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatar.color} flex items-center justify-center text-white hover:shadow-lg transition-all ${
                  userAvatar === avatar.id ? 'ring-2 ring-white' : ''
                }`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <avatar.icon className="w-6 h-6" />
                )}
              </motion.button>
            ))}
          </div>
          
          <p className="text-gray-300 text-sm mt-3 text-center">
            Click any icon to set as your avatar
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={editable ? { scale: 1.05 } : {}}
      className={`${sizeClasses[size]} relative group`}
    >
      {avatarDisplay.type === 'predefined' ? (
        <div className={`w-full h-full rounded-full flex items-center justify-center text-white border-2 border-white/20 bg-gradient-to-br ${avatarDisplay.avatar.color}`}>
          <avatarDisplay.avatar.icon className="w-1/2 h-1/2" />
        </div>
      ) : avatarDisplay.type === 'url' ? (
        <img
          src={avatarDisplay.url}
          alt={username}
          className="w-full h-full rounded-full object-cover border-2 border-white/20"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : (
        <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold border-2 border-white/20 ${getRandomColor(username)}`}>
          {getInitials(username)}
        </div>
      )}
      
      {/* Fallback for broken images */}
      {avatarDisplay.type === 'url' && (
        <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold border-2 border-white/20 hidden ${getRandomColor(username)}`}>
          {getInitials(username)}
        </div>
      )}

      {editable && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAvatarPicker(true)}
          className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
        >
          <Camera className="w-3 h-3" />
        </motion.button>
      )}
    </motion.div>
  );
};

export default Avatar;
