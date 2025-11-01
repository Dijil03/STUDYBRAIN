import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // <-- New Import
import { Brain, Zap, ArrowRight, Bot, Stars } from 'lucide-react';

const FloatingAIButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate(); // <-- Hook is now used

  const handleNavigation = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Floating AI button clicked, navigating to /ai');
    navigate('/ai'); // <-- Navigation is now active
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      // Use a strong, slightly delayed spring for the dramatic entrance
      transition={{ duration: 0.8, delay: 1.2, type: "spring", stiffness: 200, damping: 15 }}
      className="fixed bottom-8 right-8 z-[99999] cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      // Enable mouse events on the main container
      style={{ pointerEvents: 'auto' }}
    >
      {/* 1. Main Outer Pulse/Glow */}
      <motion.div
        animate={{ 
          scale: [1, 1.4, 1],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{ 
          duration: 4.5, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-2xl"
      />

      {/* 2. Secondary Outer Pulse/Glow (for depth) */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.7, 0.3]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
        className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-cyan-500/40 to-purple-500/40 rounded-full blur-xl"
      />
      
      {/* Main Button Container (w-20 h-20 for a compact FAB) */}
      <motion.button
        whileHover={{ 
          scale: 1.15, 
          y: -5,
          boxShadow: "0 20px 40px rgba(168, 85, 247, 0.6), 0 0 80px rgba(236, 72, 153, 0.4)" // Deeper, more intense shadow on hover
        }}
        whileTap={{ scale: 0.9 }}
        onClick={handleNavigation}
        className="relative w-20 h-20 bg-gradient-to-br from-purple-700 via-pink-700 to-purple-800 text-white rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center group overflow-hidden border-4 border-white/30 cursor-pointer"
        style={{ zIndex: 1000 }}
      >
        {/* Animated Background Layers for subtle color shift */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 15, // Slower rotation
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute inset-0 bg-gradient-to-r from-purple-400/50 via-pink-400/50 to-cyan-400/50 rounded-full"
        />
        
        {/* Icon Container with subtle "breathing" motion */}
        <motion.div
          animate={{ 
            scale: isHovered ? [1, 1.2, 1] : [1, 1.03, 1],
            rotate: isHovered ? [0, 8, -8, 0] : 0
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative z-10 flex items-center justify-center"
        >
          <Bot className="w-10 h-10 drop-shadow-xl" />
        </motion.div>
        
        {/* Sparkle/Accent Effects on Hover */}
        <AnimatePresence>
          {isHovered && (
            <>
              {/* Star 1 (Top Right) */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1.2, 0],
                  opacity: [0, 1, 0],
                  x: [0, 20, 0],
                  y: [0, -20, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute top-1 right-1"
              >
                <Stars className="w-4 h-4 text-yellow-300 drop-shadow-lg" />
              </motion.div>
              {/* Zap 2 (Bottom Left) */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: [0, -15, 0],
                  y: [0, 15, 0],
                  rotate: [0, -180, -360]
                }}
                transition={{ duration: 1.8, repeat: Infinity, delay: 0.4 }}
                className="absolute bottom-1 left-1"
              >
                <Zap className="w-4 h-4 text-cyan-300 drop-shadow-lg" />
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        {/* Inner Highlight for depth */}
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-2 bg-white/10 rounded-full blur-sm"
        />
      </motion.button>
      
      {/* The AI Badge Block was deleted here as requested */}
      
      {/* Enhanced Hover Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            className="absolute right-24 top-1/2 transform -translate-y-1/2 bg-slate-800/90 backdrop-blur-md text-white px-5 py-3 rounded-xl text-sm font-bold shadow-2xl shadow-slate-900/50 border border-white/20 whitespace-nowrap z-[1001]"
          >
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="w-5 h-5 text-purple-400" />
              </motion.div>
              <div className="flex flex-col leading-tight">
                <span className="text-white font-bold">AI Assistant</span>
                <span className="text-white/70 text-xs font-normal">Start Chatting</span>
              </div>
              <motion.div
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ArrowRight className="w-4 h-4 text-purple-400" />
              </motion.div>
            </div>
            {/* Tooltip Arrow */}
            <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-3 h-3 bg-slate-800 rotate-45 border-r border-b border-white/20"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FloatingAIButton;
