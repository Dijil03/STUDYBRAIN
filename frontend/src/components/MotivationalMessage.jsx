import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Rocket, 
  Crown, 
  Flame, 
  Sparkles,
  Award,
  Heart,
  Bolt,
  Sun
} from 'lucide-react';

const MotivationalMessage = ({ 
  isVisible, 
  duration, 
  subject, 
  onClose, 
  type = 'success' // 'success', 'milestone', 'encouragement'
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentIcon, setCurrentIcon] = useState(null);

  const motivationalMessages = {
    success: [
      { text: "Amazing work! You're building great study habits! 🎉", icon: Trophy, color: "from-yellow-400 to-orange-500" },
      { text: "Excellent! Every minute of study counts! ⭐", icon: Star, color: "from-blue-400 to-purple-500" },
      { text: "Fantastic! You're on fire today! 🔥", icon: Flame, color: "from-red-400 to-pink-500" },
      { text: "Outstanding! Keep up the momentum! 🚀", icon: Rocket, color: "from-green-400 to-blue-500" },
      { text: "Brilliant! You're crushing your goals! 💪", icon: Target, color: "from-purple-400 to-pink-500" },
      { text: "Incredible! Your dedication is inspiring! ✨", icon: Sparkles, color: "from-cyan-400 to-blue-500" },
      { text: "Phenomenal! You're becoming unstoppable! ⚡", icon: Bolt, color: "from-yellow-400 to-red-500" },
      { text: "Magnificent! You're shining bright! ☀️", icon: Sun, color: "from-orange-400 to-yellow-500" }
    ],
    milestone: [
      { text: "🎊 MILESTONE ACHIEVED! You've logged 5+ sessions this week!", icon: Crown, color: "from-yellow-400 to-orange-500" },
      { text: "🏆 CHAMPION! You've studied for 2+ hours today!", icon: Award, color: "from-blue-400 to-purple-500" },
      { text: "💎 DIAMOND STATUS! You're on a 3-day study streak!", icon: Trophy, color: "from-green-400 to-blue-500" },
      { text: "🌟 SUPERSTAR! You've completed 10+ study sessions!", icon: Star, color: "from-purple-400 to-pink-500" },
      { text: "🔥 FIRE MODE! You're in the zone today!", icon: Flame, color: "from-red-400 to-orange-500" }
    ],
    encouragement: [
      { text: "You've got this! Every step forward is progress! 💪", icon: Heart, color: "from-pink-400 to-red-500" },
      { text: "Believe in yourself! You're capable of amazing things! ✨", icon: Sparkles, color: "from-cyan-400 to-blue-500" },
      { text: "Keep going! Success is just around the corner! 🎯", icon: Target, color: "from-green-400 to-blue-500" },
      { text: "You're doing great! Consistency is your superpower! ⚡", icon: Bolt, color: "from-yellow-400 to-orange-500" },
      { text: "Stay focused! Your future self will thank you! 🌟", icon: Star, color: "from-purple-400 to-pink-500" }
    ]
  };

  useEffect(() => {
    if (isVisible) {
      const messages = motivationalMessages[type];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setCurrentMessage(randomMessage.text);
      setCurrentIcon(randomMessage.icon);
    }
  }, [isVisible, type]);

  if (!isVisible) return null;

  const IconComponent = currentIcon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -50 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 25,
          duration: 0.6 
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Motivational Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="relative bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border-4 border-gradient-to-r from-purple-500 to-pink-500"
        >
          {/* Gradient Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-3xl p-1">
            <div className="bg-white dark:bg-gray-800 rounded-3xl h-full w-full"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Animated Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: 0.2, 
                type: "spring", 
                stiffness: 200 
              }}
              className="mb-6"
            >
              <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${currentIcon?.color || 'from-purple-400 to-pink-500'} shadow-lg`}>
                {IconComponent && (
                  <IconComponent className="w-12 h-12 text-white" />
                )}
              </div>
            </motion.div>

            {/* Message */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-gray-800 dark:text-white mb-4 leading-relaxed"
            >
              {currentMessage}
            </motion.h2>

            {/* Study Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 mb-6"
            >
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                <span className="font-semibold">📚 {subject}</span>
                <span className="font-semibold">⏱️ {duration} minutes</span>
              </div>
            </motion.div>

            {/* Encouraging Sub-message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-gray-600 dark:text-gray-400 text-lg mb-6"
            >
              {type === 'milestone' 
                ? "You're building an incredible study routine!" 
                : "Keep up the amazing work!"
              }
            </motion.p>

            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Continue Studying! 🚀
            </motion.button>
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: Math.random() * 400 - 200,
                  y: Math.random() * 400 - 200
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  y: [0, -100, -200]
                }}
                transition={{ 
                  delay: 0.5 + i * 0.1,
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MotivationalMessage;
