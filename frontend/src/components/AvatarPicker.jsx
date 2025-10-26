import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Bike, Plane, Ship, Rocket, Heart, Star, Crown, Zap, Shield } from 'lucide-react';

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

const AvatarPicker = ({ onAvatarSelect, currentAvatar }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || localStorage.getItem('userAvatar'));

  const handleAvatarSelect = (avatarId) => {
    setSelectedAvatar(avatarId);
    localStorage.setItem('userAvatar', avatarId);
    if (onAvatarSelect) {
      onAvatarSelect(avatarId);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
      <h3 className="text-white text-xl font-bold mb-4 text-center">Choose Your Avatar</h3>
      
      <div className="grid grid-cols-5 gap-4">
        {PREDEFINED_AVATARS.map((avatar) => (
          <motion.button
            key={avatar.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleAvatarSelect(avatar.id)}
            className={`w-16 h-16 rounded-xl bg-gradient-to-br ${avatar.color} flex items-center justify-center text-white hover:shadow-lg transition-all ${
              selectedAvatar === avatar.id ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
            }`}
          >
            <avatar.icon className="w-8 h-8" />
          </motion.button>
        ))}
      </div>
      
      <p className="text-gray-300 text-sm mt-4 text-center">
        Click any icon to set as your avatar
      </p>
    </div>
  );
};

export default AvatarPicker;
