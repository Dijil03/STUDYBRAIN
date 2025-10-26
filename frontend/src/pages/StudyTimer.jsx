import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Plane,
  Box,
  Cylinder,
  Sphere,
  Text3D,
  Float,
  Sparkles,
  Stars
} from "@react-three/drei";
import * as THREE from "three";
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  Settings,
  Brain,
  Zap,
  Trophy,
  Target,
  Clock,
  CheckCircle,
  Star,
  Sparkles as SparklesIcon,
  Music,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Coffee,
  BookOpen,
  Heart,
  Rocket,
  BarChart3
} from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../utils/axios";

// 3D Scene Components
const FloatingParticles = () => {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[0.1, 16, 16]} position={[0, 2, 0]}>
        <meshStandardMaterial color="#A855F7" emissive="#A855F7" emissiveIntensity={0.3} />
      </Sphere>
    </Float>
  );
};

const StudyEnvironment = ({ mode, isRunning }) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current && isRunning) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  const getEnvironmentColor = () => {
    switch (mode) {
      case "Study": return "#1E40AF"; // Blue
      case "Short Break": return "#059669"; // Green
      case "Long Break": return "#DC2626"; // Red
      default: return "#7C3AED"; // Purple
    }
  };

  return (
    <group ref={groupRef}>
      <Environment preset="night" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[0, 10, 0]} intensity={0.5} color={getEnvironmentColor()} />
      
      {/* Floating study elements */}
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <Box args={[0.3, 0.3, 0.3]} position={[-2, 1, -2]}>
          <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.2} />
        </Box>
      </Float>
      
      <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
        <Cylinder args={[0.2, 0.2, 0.4]} position={[2, 1, -2]}>
          <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={0.2} />
        </Cylinder>
      </Float>
      
      <FloatingParticles />
    </group>
  );
};

const TimerDisplay = ({ timeLeft, mode, isRunning }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="relative">
      <motion.div
        animate={{ 
          scale: isRunning ? [1, 1.05, 1] : 1,
          rotate: isRunning ? [0, 1, -1, 0] : 0
        }}
        transition={{ 
          duration: 2,
          repeat: isRunning ? Infinity : 0,
          ease: "easeInOut"
        }}
        className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </motion.div>
      
      <motion.div
        animate={{ opacity: isRunning ? [0.5, 1, 0.5] : 0.5 }}
        transition={{ 
          duration: 1,
          repeat: isRunning ? Infinity : 0
        }}
        className="absolute -top-4 -right-4"
      >
        <SparklesIcon className="h-8 w-8 text-yellow-400" />
      </motion.div>
    </div>
  );
};

const StudyTimer = () => {
  const [mode, setMode] = useState("Study");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState(0);
  const [settings, setSettings] = useState({
    studyTime: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStart: false,
    soundEnabled: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const userId = localStorage.getItem("userId");

  const modes = {
    Study: { duration: settings.studyTime * 60, color: "from-blue-500 to-cyan-500", icon: Brain },
    "Short Break": { duration: settings.shortBreak * 60, color: "from-green-500 to-emerald-500", icon: Coffee },
    "Long Break": { duration: settings.longBreak * 60, color: "from-orange-500 to-red-500", icon: Heart }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    }
  }, [timeLeft, isRunning]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    setTimeLeft(modes[mode].duration);
    
    if (mode === "Study") {
      setSessionsCompleted(prev => prev + 1);
      setTotalStudyTime(prev => prev + settings.studyTime);
      setCurrentStreak(prev => prev + 1);
      
      // Check for achievements
      checkAchievements();
      
      // Save session to backend
      try {
        await api.post(`/studytime/${userId}`, {
          subject: "Study Session",
          duration: settings.studyTime,
          productivity: 8,
          notes: `Completed ${sessionsCompleted + 1} study sessions`
        });
      } catch (error) {
        console.error("Error saving study session:", error);
      }
      
      toast.success("🎉 Study session completed! Great job!");
      
      // Auto-start break after study
      if (sessionsCompleted % 4 === 3) {
        setMode("Long Break");
        setTimeLeft(settings.longBreak * 60);
        toast.info("Time for a long break! You've earned it!");
      } else {
        setMode("Short Break");
        setTimeLeft(settings.shortBreak * 60);
        toast.info("Time for a short break!");
      }
    } else {
      // Break completed, return to study
      setMode("Study");
      setTimeLeft(settings.studyTime * 60);
      toast.info("Break time over! Ready to study again?");
    }
  };

  const checkAchievements = () => {
    const newAchievements = [];
    
    if (sessionsCompleted === 0) {
      newAchievements.push({ id: 1, name: "First Session", icon: Star, color: "text-yellow-500" });
    }
    if (sessionsCompleted === 4) {
      newAchievements.push({ id: 2, name: "Study Streak", icon: Zap, color: "text-blue-500" });
    }
    if (sessionsCompleted === 10) {
      newAchievements.push({ id: 3, name: "Dedicated Learner", icon: Trophy, color: "text-purple-500" });
    }
    if (totalStudyTime >= 100) {
      newAchievements.push({ id: 4, name: "Century Club", icon: Target, color: "text-green-500" });
    }
    
    setAchievements(prev => [...prev, ...newAchievements]);
  };

  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(modes[mode].duration);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(modes[newMode].duration);
    setIsRunning(false);
    setIsPaused(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeIcon = () => {
    const ModeIcon = modes[mode].icon;
    return <ModeIcon className="h-8 w-8" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mr-4">
              <Timer className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Focus Timer
          </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Boost your productivity with the Pomodoro Technique. Focus, take breaks, and achieve your goals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Timer Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 shadow-2xl"
            >
              {/* 3D Scene */}
              <div className="h-96 mb-8 rounded-2xl overflow-hidden">
                <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
                  <StudyEnvironment mode={mode} isRunning={isRunning} />
                  <OrbitControls enableZoom={false} enablePan={false} />
                </Canvas>
              </div>

              {/* Timer Display */}
              <div className="text-center mb-8">
                <motion.div
                  animate={{ 
                    scale: isRunning ? [1, 1.02, 1] : 1,
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: isRunning ? Infinity : 0
                  }}
                  className="mb-6"
                >
                  <TimerDisplay timeLeft={timeLeft} mode={mode} isRunning={isRunning} />
                </motion.div>

                {/* Mode Selector */}
                <div className="flex justify-center space-x-4 mb-8">
                  {Object.keys(modes).map((modeName) => (
                    <motion.button
                      key={modeName}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => switchMode(modeName)}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                        mode === modeName
                          ? `bg-gradient-to-r ${modes[modeName].color} text-white shadow-lg`
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      {React.createElement(modes[modeName].icon, { className: "h-5 w-5" })}
                      <span>{modeName}</span>
                    </motion.button>
                  ))}
              </div>

                {/* Timer Controls */}
                <div className="flex justify-center space-x-4">
                  {!isRunning ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startTimer}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                    >
                      <Play className="h-6 w-6" />
                      <span>Start</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={pauseTimer}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                    >
                      <Pause className="h-6 w-6" />
                      <span>Pause</span>
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetTimer}
                    className="bg-slate-700 text-white px-6 py-4 rounded-xl font-semibold hover:bg-slate-600 transition-all duration-300 flex items-center space-x-2"
                  >
                    <RotateCcw className="h-5 w-5" />
                    <span>Reset</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSettings(!showSettings)}
                    className="bg-slate-700 text-white px-6 py-4 rounded-xl font-semibold hover:bg-slate-600 transition-all duration-300 flex items-center space-x-2"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats and Achievements Sidebar */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 shadow-xl"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <BarChart3 className="h-6 w-6 mr-2 text-purple-400" />
                Today's Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Sessions Completed</span>
                  <span className="text-2xl font-bold text-white">{sessionsCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Study Time</span>
                  <span className="text-2xl font-bold text-white">{totalStudyTime}m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Current Streak</span>
                  <span className="text-2xl font-bold text-white">{currentStreak}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Longest Streak</span>
                  <span className="text-2xl font-bold text-white">{longestStreak}</span>
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 shadow-xl"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Trophy className="h-6 w-6 mr-2 text-yellow-400" />
                Recent Achievements
              </h3>
              <div className="space-y-3">
                {achievements.slice(-3).map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-xl"
                  >
                    <achievement.icon className={`h-6 w-6 ${achievement.color}`} />
                    <span className="text-white font-medium">{achievement.name}</span>
                  </motion.div>
                ))}
                {achievements.length === 0 && (
                  <p className="text-gray-400 text-center py-4">Complete study sessions to earn achievements!</p>
                )}
            </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 shadow-xl"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Rocket className="h-6 w-6 mr-2 text-pink-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/study-notes'}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 rounded-xl font-medium flex items-center space-x-2"
                >
                  <BookOpen className="h-5 w-5" />
                  <span>Study Notes</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/goals'}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl font-medium flex items-center space-x-2"
                >
                  <Target className="h-5 w-5" />
                  <span>My Goals</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-xl font-medium flex items-center space-x-2"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Dashboard</span>
                </motion.button>
              </div>
            </motion.div>
              </div>
            </div>

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowSettings(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold text-white mb-6">Timer Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Study Time (minutes)</label>
                    <input
                      type="number"
                      value={settings.studyTime}
                      onChange={(e) => setSettings({...settings, studyTime: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="1"
                      max="60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Short Break (minutes)</label>
                    <input
                      type="number"
                      value={settings.shortBreak}
                      onChange={(e) => setSettings({...settings, shortBreak: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="1"
                      max="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Long Break (minutes)</label>
                    <input
                      type="number"
                      value={settings.longBreak}
                      onChange={(e) => setSettings({...settings, longBreak: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      min="1"
                      max="60"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="soundEnabled"
                      checked={settings.soundEnabled}
                      onChange={(e) => setSettings({...settings, soundEnabled: e.target.checked})}
                      className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="soundEnabled" className="text-gray-300">Enable Sound Notifications</label>
            </div>
          </div>
                <div className="flex space-x-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSettings(false)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold"
                  >
                    Save Settings
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSettings(false)}
                    className="flex-1 bg-slate-700 text-white py-3 rounded-xl font-semibold hover:bg-slate-600"
                  >
                    Cancel
                  </motion.button>
        </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default StudyTimer;