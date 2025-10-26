import React from 'react';
import { motion } from 'framer-motion';
import { 
  Car, 
  Bike, 
  Plane, 
  Ship, 
  Rocket, 
  Heart, 
  Star, 
  Crown, 
  Zap, 
  Shield 
} from 'lucide-react';

// Predefined avatar options (same as AvatarManager)
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

const AvatarDisplay = ({ 
  currentAvatar, 
  username, 
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
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

  const getAvatarDisplay = () => {
    // Check if currentAvatar is a predefined avatar
    const predefinedAvatar = PREDEFINED_AVATARS.find(avatar => avatar.id === currentAvatar);
    
    if (predefinedAvatar) {
      return (
        <div className={`w-full h-full rounded-full flex items-center justify-center text-white border-2 border-white/20 bg-gradient-to-br ${predefinedAvatar.color}`}>
          <predefinedAvatar.icon className="w-1/2 h-1/2" />
        </div>
      );
    }
    
    // Check if it's a URL
    if (currentAvatar && currentAvatar.startsWith('http')) {
      return (
        <img
          src={currentAvatar}
          alt={username}
          className="w-full h-full rounded-full object-cover border-2 border-white/20"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      );
    }
    
    // Default to initials
    return (
      <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold border-2 border-white/20 ${getRandomColor(username)}`}>
        {getInitials(username)}
      </div>
    );
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} relative ${className}`}
    >
      {getAvatarDisplay()}
      
      {/* Fallback for broken images */}
      {currentAvatar && currentAvatar.startsWith('http') && (
        <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold border-2 border-white/20 hidden ${getRandomColor(username)}`}>
          {getInitials(username)}
        </div>
      )}
    </motion.div>
  );
};

export default AvatarDisplay;
