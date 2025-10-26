import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 'medium', 
  variant = 'spinner', 
  color = 'primary',
  text = '',
  fullScreen = false 
}) => {
  // Size configurations
  const sizes = {
    small: { width: 24, height: 24 },
    medium: { width: 40, height: 40 },
    large: { width: 60, height: 60 },
    xl: { width: 80, height: 80 }
  };

  // Color configurations
  const colors = {
    primary: 'from-blue-500 to-purple-600',
    secondary: 'from-gray-400 to-gray-600',
    success: 'from-green-400 to-green-600',
    warning: 'from-yellow-400 to-orange-500',
    error: 'from-red-400 to-red-600',
    white: 'from-white to-gray-200',
    dark: 'from-gray-800 to-gray-900'
  };

  const currentSize = sizes[size] || sizes.medium;
  const currentColor = colors[color] || colors.primary;

  // Spinner variant
  const SpinnerLoader = () => (
    <motion.div
      className={`w-${currentSize.width/4} h-${currentSize.height/4} border-4 border-gray-200 border-t-transparent rounded-full bg-gradient-to-r ${currentColor}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      style={{ width: currentSize.width, height: currentSize.height }}
    />
  );

  // Dots variant
  const DotsLoader = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`w-3 h-3 rounded-full bg-gradient-to-r ${currentColor}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  );

  // Pulse variant
  const PulseLoader = () => (
    <motion.div
      className={`w-${currentSize.width/4} h-${currentSize.height/4} rounded-full bg-gradient-to-r ${currentColor}`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{ width: currentSize.width, height: currentSize.height }}
    />
  );

  // Wave variant
  const WaveLoader = () => (
    <div className="flex space-x-1">
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className={`w-1 h-${currentSize.height/4} bg-gradient-to-r ${currentColor} rounded-full`}
          animate={{
            height: [currentSize.height * 0.3, currentSize.height, currentSize.height * 0.3]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.1
          }}
          style={{ height: currentSize.height }}
        />
      ))}
    </div>
  );

  // Orbit variant
  const OrbitLoader = () => (
    <div className="relative" style={{ width: currentSize.width, height: currentSize.height }}>
      <motion.div
        className={`absolute w-${currentSize.width/4} h-${currentSize.height/4} rounded-full bg-gradient-to-r ${currentColor}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        style={{
          width: currentSize.width * 0.3,
          height: currentSize.height * 0.3,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
      <motion.div
        className={`absolute w-${currentSize.width/6} h-${currentSize.height/6} rounded-full bg-gradient-to-r ${currentColor}`}
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        style={{
          width: currentSize.width * 0.2,
          height: currentSize.height * 0.2,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
    </div>
  );

  // Bounce variant
  const BounceLoader = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`w-${currentSize.width/8} h-${currentSize.width/8} rounded-full bg-gradient-to-r ${currentColor}`}
          animate={{
            y: [0, -20, 0]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.2
          }}
          style={{ width: currentSize.width * 0.2, height: currentSize.width * 0.2 }}
        />
      ))}
    </div>
  );

  // Glow variant
  const GlowLoader = () => (
    <motion.div
      className={`w-${currentSize.width/4} h-${currentSize.height/4} rounded-full bg-gradient-to-r ${currentColor} shadow-lg`}
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{ 
        width: currentSize.width, 
        height: currentSize.height,
        boxShadow: `0 0 20px ${color === 'primary' ? '#3b82f6' : color === 'success' ? '#10b981' : '#6b7280'}`
      }}
    />
  );

  // Render the appropriate loader
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader />;
      case 'pulse':
        return <PulseLoader />;
      case 'wave':
        return <WaveLoader />;
      case 'orbit':
        return <OrbitLoader />;
      case 'bounce':
        return <BounceLoader />;
      case 'glow':
        return <GlowLoader />;
      default:
        return <SpinnerLoader />;
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {renderLoader()}
      {text && (
        <motion.p
          className={`text-sm font-medium ${
            color === 'white' ? 'text-white' : 
            color === 'dark' ? 'text-gray-800' : 
            'text-gray-600'
          }`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl"
        >
          {content}
        </motion.div>
      </motion.div>
    );
  }

  return content;
};

export default LoadingSpinner;
