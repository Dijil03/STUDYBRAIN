import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import api from "../utils/axios";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
// Importing icons from lucide-react
import {
  Sparkles,
  BarChart2,
  Target,
  BookOpen,
  Award,
  Music,
  Palette,
  Image,
  ChevronDown,
  ChevronUp,
  PlusCircle,
  Loader2,
  Save,
  Edit3,
  Trash2,
  X,
  Check,
  Heart,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import MotivationalMessage from "../components/MotivationalMessage";

// --- REFINED: A simple, stylish Card component for reuse (ULTRA POLISH) ---
const Card = ({ children, icon, title, className = "" }) => (
  // Enhanced: Soft, elegant glassmorphism with better hover transform
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ 
      scale: 1.02, 
      y: -5,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
    }}
    transition={{ duration: 0.3 }}
    className={`
      bg-white/75 backdrop-blur-2xl rounded-3xl p-8
      shadow-3xl shadow-indigo-300/60 hover:shadow-indigo-400/80
      transition-all duration-700 border border-white/80
      transform hover:scale-[1.01] hover:rotate-z-1 
      ${className}
    `}
  >
    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-fuchsia-600 mb-6 flex items-center">
      {/* Icon with a sparkling gradient background circle */}
      <motion.span 
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="p-3 mr-3 rounded-full bg-gradient-to-br from-yellow-100 to-pink-100 border-2 border-white shadow-lg shadow-pink-300/50"
      >
        {icon}
      </motion.span>
      {/* Title with deeper shadow */}
      <span className="tracking-tight drop-shadow-md">{title}</span>
    </h2>
    {children}
  </motion.div>
);

// --- REFINED: Loading Skeleton Component (Matches new Aesthetic) ---
const LoadingSkeleton = () => (
  <div className="space-y-12 animate-pulse pt-12">
    <div className="h-10 bg-indigo-300/70 rounded-full w-2/5 mx-auto mb-12"></div>
    {/* Progress Bar Skeleton */}
    <div className="h-28 bg-white/70 rounded-3xl shadow-xl"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="h-56 bg-white/70 rounded-3xl shadow-xl"></div>
      <div className="h-56 bg-white/70 rounded-3xl shadow-xl"></div>
      <div className="h-56 bg-white/70 rounded-3xl shadow-xl"></div>
    </div>
    {/* Journal Skeleton */}
    <div className="h-72 bg-white/70 rounded-3xl shadow-xl"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="h-48 bg-white/70 rounded-3xl shadow-xl"></div>
      <div className="h-48 bg-white/70 rounded-3xl shadow-xl"></div>
    </div>
  </div>
);

const MyWorld = () => {
  const { theme, changeTheme } = useTheme();
  const [world, setWorld] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullJournal, setShowFullJournal] = useState(false);
  const [newMoodImage, setNewMoodImage] = useState("");
  const [savingMood, setSavingMood] = useState(false);
  
  // New state for editing forms
  const [editingTheme, setEditingTheme] = useState(false);
  const [editingGoals, setEditingGoals] = useState(false);
  const [editingMotivation, setEditingMotivation] = useState(false);
  const [editingJournal, setEditingJournal] = useState(false);
  
  // Form states
  const [selectedTheme, setSelectedTheme] = useState("light");
  const [newGoal, setNewGoal] = useState("");
  const [motivationText, setMotivationText] = useState("");
  const [journalEntry, setJournalEntry] = useState("");
  
  // Loading states for different operations
  const [saving, setSaving] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);
  const [savingMotivation, setSavingMotivation] = useState(false);
  const [savingJournal, setSavingJournal] = useState(false);
  
  // Gamification state
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Motivational message state
  const [showMotivationalMessage, setShowMotivationalMessage] = useState(false);
  const [motivationalData, setMotivationalData] = useState({ duration: '', subject: '', type: 'success' });
  
  const userId = localStorage.getItem("userId");

  // Logic to save the new mood image
  const handleAddMoodImage = async () => {
    if (!newMoodImage.trim() || !userId) return;
    setSavingMood(true);
    try {
      const currentMoodBoard = Array.isArray(world?.moodBoard)
        ? world.moodBoard
        : [];

      const updatedBoard = [...currentMoodBoard, newMoodImage];

      const res = await api.post(`/myworld/${userId}/moodboard`, {
        moodBoard: updatedBoard,
      });

      // Update local state with the new data
      setWorld(res.data);
      setNewMoodImage("");
    } catch (err) {
      console.error("Error updating mood board:", err);
      // Implement toast.error here in a real app
    } finally {
      setSavingMood(false);
    }
  };

  // Theme update handler
  const handleThemeUpdate = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const res = await api.post(`/myworld/${userId}/theme`, {
        theme: selectedTheme,
      });
      setWorld(res.data);
      // Update global theme
      changeTheme(selectedTheme);
      setEditingTheme(false);
    } catch (err) {
      console.error("Error updating theme:", err);
    } finally {
      setSaving(false);
    }
  };

  // Goals update handler
  const handleGoalsUpdate = async () => {
    if (!userId) return;
    setSavingGoals(true);
    try {
      const currentGoals = Array.isArray(world?.goals) ? world.goals : [];
      const updatedGoals = newGoal.trim() 
        ? [...currentGoals, newGoal.trim()]
        : currentGoals;

      const res = await api.post(`/myworld/${userId}/goals`, {
        goals: updatedGoals,
      });
      setWorld(res.data);
      setNewGoal("");
      setEditingGoals(false);
      
      // Gamification: Award XP for setting goals
      if (newGoal.trim()) {
        const newXp = xp + 15;
        setXp(newXp);
        
        // Check for level up
        const newLevel = Math.floor(newXp / 100) + 1;
        if (newLevel > level) {
          setLevel(newLevel);
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000);
        }
        
        // Show motivational message
        setMotivationalData({
          duration: 'Goal',
          subject: newGoal.trim(),
          type: 'success'
        });
        setShowMotivationalMessage(true);
      }
    } catch (err) {
      console.error("Error updating goals:", err);
    } finally {
      setSavingGoals(false);
    }
  };

  // Remove goal handler
  const handleRemoveGoal = async (goalToRemove) => {
    if (!userId) return;
    setSavingGoals(true);
    try {
      const currentGoals = Array.isArray(world?.goals) ? world.goals : [];
      const updatedGoals = currentGoals.filter(goal => goal !== goalToRemove);

      const res = await api.post(`/myworld/${userId}/goals`, {
        goals: updatedGoals,
      });
      setWorld(res.data);
    } catch (err) {
      console.error("Error removing goal:", err);
    } finally {
      setSavingGoals(false);
    }
  };

  // Motivation update handler
  const handleMotivationUpdate = async () => {
    if (!userId) return;
    setSavingMotivation(true);
    try {
      const res = await api.post(`/myworld/${userId}/motivation`, {
        motivation: motivationText,
      });
      setWorld(res.data);
      setEditingMotivation(false);
    } catch (err) {
      console.error("Error updating motivation:", err);
    } finally {
      setSavingMotivation(false);
    }
  };

  // Journal entry handler
  const handleJournalEntry = async () => {
    if (!journalEntry.trim() || !userId) return;
    setSavingJournal(true);
    try {
      const res = await api.post(`/myworld/${userId}/journal`, {
        entry: {
          date: new Date(),
          entry: journalEntry.trim(),
        },
      });
      setWorld(res.data);
      setJournalEntry("");
      setEditingJournal(false);
      
      // Gamification: Award XP for journaling
      const newXp = xp + 20;
      setXp(newXp);
      
      // Check for level up
      const newLevel = Math.floor(newXp / 100) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
      
      // Show motivational message
      setMotivationalData({
        duration: 'Journal Entry',
        subject: 'Reflection',
        type: 'encouragement'
      });
      setShowMotivationalMessage(true);
    } catch (err) {
      console.error("Error adding journal entry:", err);
    } finally {
      setSavingJournal(false);
    }
  };

  // Combine fetching logic into a single function using useCallback
  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      console.error("User ID not found in localStorage.");
      return;
    }

    setLoading(true);

    const worldPromise = api.get(`/myworld/${userId}`).catch((err) => {
      console.error("Error loading My World:", err);
      return { data: null };
    });

    const progressPromise = api
      .get(`/homework/progress/${userId}`)
      .catch((err) => {
        console.error("Error loading progress:", err);
        return { data: null };
      });

    try {
      const [worldRes, progressRes] = await Promise.all([
        worldPromise,
        progressPromise,
      ]);

      if (worldRes.data) {
        setWorld(worldRes.data);
        // Initialize form states with existing data
        const userTheme = worldRes.data.theme || "light";
        setSelectedTheme(userTheme);
        setMotivationText(worldRes.data.motivation || "");
        // Update global theme
        changeTheme(userTheme);
      }
      if (progressRes.data) setProgress(progressRes.data);
    } catch (error) {
      console.error(
        "An unexpected error occurred during data fetching:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Use a fallback for progress percentage if data is loading or null
  const progressPercent = progress?.percent || 0;

  // Gamification functions
  const closeMotivationalMessage = () => {
    setShowMotivationalMessage(false);
  };

  // Daily motivation quotes
  const dailyQuotes = {
    Monday: "🚀 Start your week with energy and determination!",
    Tuesday: "💪 You're building momentum - keep going!",
    Wednesday: "🎯 Midweek focus - you're halfway there!",
    Thursday: "⚡ Push through - the weekend is almost here!",
    Friday: "🎉 Finish strong - TGIF energy!",
    Saturday: "🌟 Weekend productivity - you're unstoppable!",
    Sunday: "🔄 Reflect, recharge, and prepare for greatness!"
  };

  const getCurrentDayQuote = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return dailyQuotes[today] || "✨ Every day is a chance to be amazing!";
  };

  return (
    // REFINED: Background with richer, expansive gradient and minimal noise
    <>
      <Navbar />
    <div className="min-h-screen p-4 page-bg relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating geometric shapes */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20"
        />
        <motion.div
          animate={{ 
            y: [0, 30, 0],
            rotate: [360, 180, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg opacity-20"
        />
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, -180, -360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
          className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-20"
        />
        <motion.div
          animate={{ 
            y: [0, 25, 0],
            rotate: [360, 0, -360],
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-20 right-1/3 w-14 h-14 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg opacity-20"
        />
        
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
            className="absolute w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
        
        {/* Floating emojis */}
        {['🎯', '⭐', '🚀', '💪', '🎉', '🔥', '✨', '🌟'].map((emoji, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -80, 0],
              rotate: [0, 360, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
            className="absolute text-2xl opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* REFINED: Header with dramatic, spaced typography */}
        <h1 className="text-7xl md:text-8xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 mb-6 tracking-tight drop-shadow-xl animate-fade-in">
          <Sparkles className="inline w-14 h-14 md:w-16 md:h-16 text-yellow-500 mr-3 animate-spin-slow" />
          My World Canvas
        </h1>

        <p className="text-center text-gray-700 mb-16 text-2xl italic font-serif max-w-3xl mx-auto border-b-2 border-pink-200/50 pb-4">
          "The world is a **canvas** for your imagination. Paint your success."
        </p>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-12">
            {/* Progress Chart */}
            {progress && (
              <Card
                icon={
                  <BarChart2 className="w-8 h-8 text-green-500 stroke-[1.5]" />
                }
                title="Momentum Tracker"
                className="lg:col-span-2"
              >
                <div className="w-full bg-indigo-100/70 rounded-full h-12 overflow-hidden shadow-inner mt-4 border border-indigo-200/50">
                  <div
                    className="bg-gradient-to-r from-green-500 to-teal-600 h-full transition-all duration-[2000ms] ease-out flex items-center justify-end pr-5 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  >
                    <span className="text-white text-xl font-black drop-shadow-lg">
                      {progressPercent}%
                    </span>
                  </div>
                </div>
                <p className="mt-8 text-gray-800 text-center font-extrabold text-xl p-4 bg-yellow-50/50 rounded-xl border-l-8 border-yellow-400">
                  **{progress.completed}** / **{progress.total}** missions
                  completed. You're building an incredible track record!
                </p>
              </Card>
            )}

            {/* Gamification Card */}
            <Card
              icon={<Award className="w-8 h-8 text-yellow-500 fill-yellow-500" />}
              title="Your Progress Level"
              className="lg:col-span-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Level Display */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <span className="text-white font-bold text-2xl">{level}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Level</h3>
                  <p className="text-gray-600">Your current level</p>
                </div>

                {/* XP Progress */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <span className="text-white font-bold text-lg">{xp}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Experience</h3>
                  <p className="text-gray-600">{xp % 100}/100 XP</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(xp % 100)}%` }}
                    />
                  </div>
                </div>

                {/* Streak */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <span className="text-white font-bold text-lg">{streak}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Streak</h3>
                  <p className="text-gray-600">Days active</p>
                </div>

                {/* Daily Quote */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Heart className="w-8 h-8 text-white fill-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Today's Quote</h3>
                  <p className="text-gray-600 text-sm italic">{getCurrentDayQuote()}</p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Motivation */}
              <Card
                icon={
                  <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
                }
                title="Daily Motivation"
              >
                <div className="space-y-4">
                  {!editingMotivation ? (
                    <div className="relative">
                      <p className="text-xl text-gray-800 leading-relaxed font-serif p-5 bg-pink-100/70 rounded-xl border border-pink-300/70 border-l-8 border-pink-500 shadow-inner italic">
                        {world?.motivation ||
                          "Keep going, you're doing great! Every step counts."}
                      </p>
                      <button
                        onClick={() => setEditingMotivation(true)}
                        className="absolute top-2 right-2 text-pink-600 hover:text-pink-800 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        value={motivationText}
                        onChange={(e) => setMotivationText(e.target.value)}
                        placeholder="Write your daily motivation..."
                        rows={4}
                        className="w-full p-4 border border-pink-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleMotivationUpdate}
                          disabled={savingMotivation || !motivationText.trim()}
                          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center"
                        >
                          {savingMotivation ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          {savingMotivation ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => setEditingMotivation(false)}
                          className="text-gray-600 hover:text-gray-800 transition-colors px-4 py-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Goals */}
              <Card
                icon={
                  <Target className="w-8 h-8 text-fuchsia-600 stroke-[1.5]" />
                }
                title="Core Goals"
              >
                <div className="space-y-4">
                  {/* Goals List */}
                  <ul className="space-y-3 text-gray-800 text-lg">
                    {world?.goals?.length > 0 ? (
                      world.goals.map((goal, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between bg-fuchsia-50/70 p-3 rounded-xl border border-fuchsia-200/50"
                        >
                          <div className="flex items-start">
                            <span className="text-fuchsia-500 mr-3 text-xl font-black">
                              •
                            </span>
                            <span className="font-semibold">{goal}</span>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemoveGoal(goal)}
                            disabled={savingGoals}
                            className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </motion.li>
                      ))
                    ) : (
                      <p className="text-gray-500 italic text-lg">
                        Set some **goals** to start building your world!
                      </p>
                    )}
                  </ul>

                  {/* Add Goal Form */}
                  {editingGoals ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newGoal}
                          onChange={(e) => setNewGoal(e.target.value)}
                          placeholder="Enter a new goal..."
                          className="flex-1 p-3 border border-fuchsia-300 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500"
                        />
                        <button
                          onClick={handleGoalsUpdate}
                          disabled={savingGoals || !newGoal.trim()}
                          className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center"
                        >
                          {savingGoals ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <PlusCircle className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingGoals(false)}
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setEditingGoals(true)}
                      className="w-full bg-fuchsia-100 hover:bg-fuchsia-200 text-fuchsia-700 py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center shadow-lg hover:shadow-xl"
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add New Goal
                    </motion.button>
                  )}
                </div>
              </Card>

              {/* Theme & Soundtrack (Vibe Check) */}
              <Card
                icon={
                  <Palette className="w-8 h-8 text-purple-600 stroke-[1.5]" />
                }
                title="Vibe Check"
              >
                <div className="space-y-4">
                  {/* Theme Selection */}
                  <div className="p-4 bg-purple-100/60 rounded-xl border border-purple-300/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-purple-800 flex items-center">
                        <Palette className="w-5 h-5 mr-2" /> Theme:
                      </span>
                      {!editingTheme ? (
                        <button
                          onClick={() => setEditingTheme(true)}
                          className="text-purple-600 hover:text-purple-800 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={handleThemeUpdate}
                            disabled={saving}
                            className="text-green-600 hover:text-green-800 transition-colors disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingTheme(false)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {editingTheme ? (
                      <div className="space-y-3">
                        <select
                          value={selectedTheme}
                          onChange={(e) => setSelectedTheme(e.target.value)}
                          className="w-full p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="light">
                            <Sun className="w-4 h-4 inline mr-2" />
                            Light Mode
                          </option>
                          <option value="dark">
                            <Moon className="w-4 h-4 inline mr-2" />
                            Dark Mode
                          </option>
                          <option value="solarized">
                            <Monitor className="w-4 h-4 inline mr-2" />
                            Solarized
                          </option>
                        </select>
                        {saving && (
                          <div className="flex items-center text-purple-600">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving theme...
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center text-lg">
                        {selectedTheme === "light" && <Sun className="w-5 h-5 mr-2 text-yellow-500" />}
                        {selectedTheme === "dark" && <Moon className="w-5 h-5 mr-2 text-blue-500" />}
                        {selectedTheme === "solarized" && <Monitor className="w-5 h-5 mr-2 text-green-500" />}
                        <span className="capitalize">{selectedTheme} Mode</span>
                      </div>
                    )}
                  </div>

                  {/* Soundtrack */}
                  <div className="p-4 bg-purple-100/60 rounded-xl border border-purple-300/50">
                    <span className="font-bold text-purple-800 flex items-center mb-2">
                      <Music className="w-5 h-5 mr-2" /> Soundtrack:
                    </span>
                    <p className="text-gray-700">
                      {world?.soundtrack || "None selected - Add some motivation!"}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Journal */}
            <Card
              icon={
                <BookOpen className="w-8 h-8 text-indigo-700 stroke-[1.5]" />
              }
              title="Reflection Journal"
              className="lg:col-span-3"
            >
              <div className="space-y-6">
                {/* Add New Journal Entry */}
                {editingJournal ? (
                  <div className="bg-indigo-50/70 p-6 rounded-xl border border-indigo-200/50">
                    <h3 className="text-lg font-semibold text-indigo-800 mb-4">Add New Entry</h3>
                    <div className="space-y-4">
                      <textarea
                        value={journalEntry}
                        onChange={(e) => setJournalEntry(e.target.value)}
                        placeholder="What's on your mind today? Reflect on your learning journey..."
                        rows={4}
                        className="w-full p-4 border border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleJournalEntry}
                          disabled={savingJournal || !journalEntry.trim()}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center"
                        >
                          {savingJournal ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          {savingJournal ? "Saving..." : "Save Entry"}
                        </button>
                        <button
                          onClick={() => setEditingJournal(false)}
                          className="text-gray-600 hover:text-gray-800 transition-colors px-4 py-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setEditingJournal(true)}
                    className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center shadow-lg hover:shadow-xl"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add New Journal Entry
                  </motion.button>
                )}

                {/* Journal Entries */}
                {world?.journal?.length > 0 ? (
                  <>
                    <ul className="space-y-6 text-gray-700">
                      {(showFullJournal
                        ? world.journal
                        : world.journal.slice(0, 3)
                      ).map((entry, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border-l-8 border-indigo-400 pl-6 py-4 bg-indigo-50/70 rounded-xl transition-shadow hover:shadow-2xl hover:shadow-indigo-200/50"
                        >
                          <p className="font-extrabold text-md text-indigo-800 mb-2 flex justify-between items-center">
                            <span>Entry #{world.journal.length - index}</span>
                            {entry.date && (
                              <span className="text-gray-500 font-normal text-sm">
                                {new Date(entry.date).toLocaleDateString()}
                              </span>
                            )}
                          </p>
                          <p className="text-lg leading-relaxed italic">
                            {entry.entry}
                          </p>
                        </motion.li>
                      ))}
                    </ul>
                    {world.journal.length > 3 && (
                      <button
                        onClick={() => setShowFullJournal(!showFullJournal)}
                        className="mt-8 text-fuchsia-600 hover:text-fuchsia-800 transition duration-300 font-bold flex items-center text-xl p-3 rounded-full hover:bg-fuchsia-100 shadow-md transform hover:scale-[1.02]"
                      >
                        {showFullJournal ? (
                          <>
                            <ChevronUp className="w-6 h-6 mr-2" />
                            Hide Older Entries
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-6 h-6 mr-2" />
                            {`View All ${world.journal.length} Entries`}
                          </>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 italic text-lg text-center py-8">
                    No journal entries yet. Start writing to **track your journey**!
                  </p>
                )}
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Achievements */}
              <Card
                icon={
                  <Award className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                }
                title="Triumphs & Achievements"
              >
                <ul className="flex flex-wrap gap-4">
                  {world?.achievements?.length > 0 ? (
                    world.achievements.map((badge, index) => (
                      <li
                        key={index}
                        className="bg-purple-600 text-white px-6 py-3 rounded-full text-lg font-extrabold shadow-lg shadow-purple-400/70 hover:scale-[1.07] hover:bg-purple-700 transition-all duration-300 cursor-pointer flex items-center border border-white"
                      >
                        <Award className="w-5 h-5 mr-3" />
                        {badge}
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500 italic text-lg">
                      Keep working toward your **first achievement**!
                    </p>
                  )}
                </ul>
              </Card>

              {/* Mood Board - Now a proper Card component */}
              <Card
                icon={<Image className="w-8 h-8 text-green-600 stroke-[1.5]" />}
                title="Mood Board"
              >
                <div className="flex flex-wrap gap-4 mb-5 max-h-56 overflow-y-auto p-2">
                  {world?.moodBoard?.length > 0 ? (
                    world.moodBoard.map((item, index) => (
                      <img
                        key={index}
                        src={item}
                        alt={`Mood ${index + 1}`}
                        // REFINED: Image styling
                        className="w-24 h-24 object-cover rounded-xl shadow-xl shadow-gray-400/50 border-4 border-white transition-transform hover:scale-110 duration-300"
                        loading="lazy"
                      />
                    ))
                  ) : (
                    <p className="text-gray-500 text-lg italic">
                      No mood board items yet. **Inspire yourself!**
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-stretch mt-4">
                  <input
                    type="url"
                    value={newMoodImage}
                    onChange={(e) => setNewMoodImage(e.target.value)}
                    placeholder="Paste image URL here"
                    className="flex-1 p-4 border border-gray-300 rounded-xl shadow-inner focus:ring-4 focus:ring-indigo-400 focus:border-indigo-400 transition"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddMoodImage}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-bold shadow-xl shadow-green-400/50 flex items-center justify-center transition-all duration-300 disabled:opacity-50"
                    disabled={savingMood || !newMoodImage.trim()}
                  >
                    {savingMood ? (
                      <Loader2 className="animate-spin w-6 h-6 mr-3 text-white" />
                    ) : (
                      <PlusCircle className="w-6 h-6 mr-3" />
                    )}
                    {savingMood ? "Saving..." : "Add Image"}
                  </motion.button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
      
      {/* Level Up Celebration */}
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 0.5,
              repeat: 3
            }}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-8 rounded-3xl text-center shadow-2xl"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold mb-2">Level Up!</h2>
            <p className="text-xl">You've reached Level {level}!</p>
          </motion.div>
        </motion.div>
      )}
      
      {/* Motivational Message */}
      {showMotivationalMessage && (
        <MotivationalMessage
          isVisible={showMotivationalMessage}
          onClose={closeMotivationalMessage}
          duration={motivationalData.duration}
          subject={motivationalData.subject}
          type={motivationalData.type}
        />
      )}
    </div>
    </>
  );
};

export default MyWorld;
