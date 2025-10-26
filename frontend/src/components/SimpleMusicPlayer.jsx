import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Music, 
  RotateCcw
} from 'lucide-react';

const SimpleMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef(null);

  // Using a free, working audio file
  const audioUrl = "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav";

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.log('Audio play failed:', error);
          alert('Audio failed to load. This might be due to CORS restrictions. Try the YouTube option instead.');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume;
    }
  };

  const lofiOptions = [
    {
      name: "Lofi Hip Hop Radio",
      url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
      description: "24/7 lofi hip hop radio"
    },
    {
      name: "Study Music",
      url: "https://www.youtube.com/watch?v=5qap5aO4i9A", 
      description: "Perfect for studying"
    },
    {
      name: "Focus Music",
      url: "https://www.youtube.com/watch?v=DWcJFNfaw9c",
      description: "Deep focus beats"
    },
    {
      name: "Chill Beats",
      url: "https://www.youtube.com/watch?v=7NOSDKb0HlU",
      description: "Relaxing ambient music"
    }
  ];

  const [selectedLofi, setSelectedLofi] = useState(0);

  const openYouTubeLofi = () => {
    window.open(lofiOptions[selectedLofi].url, '_blank');
  };

  return (
    <div className="relative">
      {/* Compact Music Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-medium transition-all duration-300 ${
          isPlaying
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
        }`}
      >
        <motion.div
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
        >
          <Music className="w-4 h-4" />
        </motion.div>
        <span className="text-sm hidden sm:block">
          {isPlaying ? 'Playing' : 'Lofi'}
        </span>
        {isPlaying && (
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-2 bg-green-400 rounded-full"
          />
        )}
      </motion.button>

      {/* Audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        loop
        onError={() => console.log('Audio failed to load')}
      />

      {/* Expanded Music Player */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-80 bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
                    transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
                    className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                  >
                    <Music className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Lofi Study Music</h3>
                    <p className="text-white/60 text-xs">Focus & Study</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsExpanded(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="text-center mb-4">
                <h4 className="text-white font-semibold text-lg">Lofi Hip Hop</h4>
                <p className="text-white/60 text-sm">Chilled Cow</p>
                <p className="text-white/50 text-xs mt-1">Relaxing beats for studying</p>
              </div>

              {/* Progress Bar (Visual only) */}
              <div className="w-full bg-white/10 rounded-full h-1 mb-4">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full"
                  animate={{ width: isPlaying ? "100%" : "0%" }}
                  transition={{ duration: 30, repeat: isPlaying ? Infinity : 0 }}
                />
              </div>

              {/* Play Button */}
              <div className="flex justify-center mb-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlayPause}
                  className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </motion.button>
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-3 mb-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMute}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </motion.button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-white/60 text-xs w-8">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>

              {/* Lofi Options */}
              <div className="space-y-2 mb-4">
                <p className="text-white/60 text-xs font-medium">Choose your lofi vibe:</p>
                {lofiOptions.map((option, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedLofi(index)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                      index === selectedLofi
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{option.name}</p>
                        <p className="text-xs opacity-60">{option.description}</p>
                      </div>
                      {index === selectedLofi && (
                        <motion.div
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 bg-red-400 rounded-full"
                        />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* YouTube Option */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openYouTubeLofi}
                className="w-full bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-300 hover:text-red-200 hover:bg-red-500/30 px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Music className="w-4 h-4" />
                <span className="text-sm font-medium">Open {lofiOptions[selectedLofi].name}</span>
              </motion.button>

              {/* Quick Access */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <p className="text-white/60 text-xs font-medium mb-2">Quick Access:</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open('https://www.youtube.com/watch?v=jfKfPfyJRdk', '_blank')}
                  className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 hover:text-purple-200 hover:bg-purple-500/30 px-3 py-2 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 text-sm"
                >
                  <Music className="w-4 h-4" />
                  <span>24/7 Lofi Hip Hop Radio</span>
                </motion.button>
              </div>

              <div className="mt-3 text-center">
                <p className="text-white/50 text-xs">
                  🎧 Opens YouTube in a new tab for continuous lofi music
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimpleMusicPlayer;
