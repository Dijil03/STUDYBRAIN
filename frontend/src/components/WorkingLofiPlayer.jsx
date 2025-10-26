import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Music, 
  SkipBack, 
  SkipForward,
  RotateCcw,
  ExternalLink
} from 'lucide-react';

const WorkingLofiPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showYouTube, setShowYouTube] = useState(false);
  const audioRef = useRef(null);

  // Working lofi music tracks with real audio files
  const tracks = [
    {
      name: "Lofi Hip Hop",
      artist: "Chilled Cow",
      youtubeId: "jfKfPfyJRdk",
      audioUrl: "https://www.bensound.com/bensound-music/bensound-sunny.mp3", // Free audio file
      description: "Relaxing hip hop beats for studying"
    },
    {
      name: "Study Beats",
      artist: "Lofi Girl",
      youtubeId: "5qap5aO4i9A",
      audioUrl: "https://www.bensound.com/bensound-music/bensound-creativeminds.mp3", // Free audio file
      description: "Perfect background music for focus"
    },
    {
      name: "Focus Music",
      artist: "Chillhop",
      youtubeId: "DWcJFNfaw9c",
      audioUrl: "https://www.bensound.com/bensound-music/bensound-ukulele.mp3", // Free audio file
      description: "Ambient sounds for deep concentration"
    },
    {
      name: "Ambient Study",
      artist: "Ambient",
      youtubeId: "7NOSDKb0HlU",
      audioUrl: "https://www.bensound.com/bensound-music/bensound-tenderness.mp3", // Free audio file
      description: "Calm ambient music for studying"
    }
  ];

  const currentTrackData = tracks[currentTrack];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.log('Audio play failed:', error);
          // If audio fails, show YouTube option
          setShowYouTube(true);
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

  const nextTrack = () => {
    const next = (currentTrack + 1) % tracks.length;
    setCurrentTrack(next);
    if (isPlaying) {
      audioRef.current?.play().catch(() => setShowYouTube(true));
    }
  };

  const previousTrack = () => {
    const prev = currentTrack === 0 ? tracks.length - 1 : currentTrack - 1;
    setCurrentTrack(prev);
    if (isPlaying) {
      audioRef.current?.play().catch(() => setShowYouTube(true));
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume;
    }
  };

  const openYouTube = () => {
    window.open(`https://www.youtube.com/watch?v=${currentTrackData.youtubeId}`, '_blank');
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
          {isPlaying ? 'Playing' : 'Music'}
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
        src={currentTrackData.audioUrl}
        loop
        onEnded={nextTrack}
        onError={() => setShowYouTube(true)}
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

            {/* Track Info */}
            <div className="p-4">
              <div className="text-center mb-4">
                <h4 className="text-white font-semibold text-lg">{currentTrackData.name}</h4>
                <p className="text-white/60 text-sm">{currentTrackData.artist}</p>
                <p className="text-white/50 text-xs mt-1">{currentTrackData.description}</p>
              </div>

              {/* Progress Bar (Visual only) */}
              <div className="w-full bg-white/10 rounded-full h-1 mb-4">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full"
                  animate={{ width: isPlaying ? "100%" : "0%" }}
                  transition={{ duration: 30, repeat: isPlaying ? Infinity : 0 }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4 mb-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={previousTrack}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlayPause}
                  className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextTrack}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
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

              {/* YouTube Option */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openYouTube}
                className="w-full bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 text-red-300 hover:text-red-200 hover:bg-red-500/30 px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm font-medium">Open on YouTube</span>
              </motion.button>

              {/* Track List */}
              <div className="mt-4 space-y-1">
                <p className="text-white/60 text-xs font-medium mb-2">Playlist</p>
                {tracks.map((track, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentTrack(index)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                      index === currentTrack
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{track.name}</p>
                        <p className="text-xs opacity-60">{track.artist}</p>
                      </div>
                      {index === currentTrack && isPlaying && (
                        <motion.div
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-2 h-2 bg-purple-400 rounded-full"
                        />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkingLofiPlayer;
