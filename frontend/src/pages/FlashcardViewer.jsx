import React, { useEffect, useState } from "react";
import api from "../utils/axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  AdjustmentsHorizontalIcon,
  FaceSmileIcon,
  FolderOpenIcon,
  CheckCircleIcon,
  BookOpenIcon,
  LightBulbIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import NavbarClerk from "../components/Navbar";
import Navbar from "../components/Navbar";

// Simple and Reliable Flashcard Component - Responsive
const Flashcard = ({ card, flipped, onClick, difficulty, streak }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      className="w-full h-64 sm:h-80 md:h-96 cursor-pointer mb-4 sm:mb-6 md:mb-8"
      onClick={onClick}
    >
      {/* Simple Flip Card */}
      <div className="relative w-full h-full">
        {/* Front Side (Question) */}
        <motion.div
          animate={{ 
            rotateY: flipped ? 180 : 0,
            opacity: flipped ? 0 : 1
          }}
          transition={{ duration: 0.6 }}
          className="absolute w-full h-full bg-gradient-to-br from-slate-800 via-purple-900 to-slate-800 p-8 rounded-3xl flex flex-col justify-center items-center text-center border border-white/20 backdrop-blur-xl"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          </div>
          
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-75"></div>
              <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl">
                <AcademicCapIcon className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4 md:mb-6 uppercase tracking-wider bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent"
            >
              Question
            </motion.h3>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight max-w-lg mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4 break-words"
            >
              {card.question}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center space-x-2 text-sm text-purple-300 font-bold"
            >
              <EyeIcon className="w-5 h-5" />
              <span>Click to Reveal Answer!</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Back Side (Answer) */}
        <motion.div
          animate={{ 
            rotateY: flipped ? 0 : -180,
            opacity: flipped ? 1 : 0
          }}
          transition={{ duration: 0.6 }}
          className="absolute w-full h-full bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-8 rounded-3xl flex flex-col justify-center items-center text-center border border-white/20 backdrop-blur-xl"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          </div>
          
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur-lg opacity-75"></div>
              <div className="relative bg-gradient-to-r from-green-400 to-emerald-500 p-4 rounded-2xl">
                <FaceSmileIcon className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4 md:mb-6 uppercase tracking-wider bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent"
            >
              Answer
            </motion.h3>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight max-w-lg mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4 break-words"
            >
              {card.answer}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center space-x-2 text-sm text-green-200 font-bold"
            >
              <CheckCircleIcon className="w-5 h-5" />
              <span>Excellent work! Keep studying!</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const FlashcardViewer = () => {
  const userId = localStorage.getItem("userId");
  const [sets, setSets] = useState([]);
  const [activeSet, setActiveSet] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [studyMode, setStudyMode] = useState('normal'); // 'normal', 'timed', 'review'
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [streak, setStreak] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [studyStats, setStudyStats] = useState({
    totalCards: 0,
    completedCards: 0,
    accuracy: 0,
    timeSpent: 0
  });

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const res = await api.get(`/flashcards/${userId}/all`);
        setSets(res.data);

        if (res.data.length > 0) {
          setActiveSet(res.data[0]);
          setFlipped(false);
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching flashcard sets:", err);
        setIsLoading(false);
      }
    };
    fetchSets();
  }, [userId]);

  const handleSelectSet = (set) => {
    setActiveSet(set);
    setCurrentIndex(0);
    setFlipped(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSet.cards.length);
    setFlipped(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? activeSet.cards.length - 1 : prev - 1
    );
    setFlipped(false);
  };

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      setFlipped(true);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <LightBulbIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-pulse" />
            </div>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 px-4">Loading your study sets...</p>
            <p className="text-purple-300 text-sm sm:text-base px-4">Preparing your learning experience</p>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavbarClerk />
      {/* Stunning Background with Animated Elements */}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          {/* Stunning Header - Responsive */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 shadow-2xl mb-4 sm:mb-6 md:mb-8"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 sm:mb-6 gap-4 lg:gap-0">
              <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6 flex-1">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl blur-lg opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl">
                    <LightBulbIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-1 sm:mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent break-words">
                    Flashcard Master
                  </h1>
                  <p className="text-purple-200 text-sm sm:text-base md:text-lg font-medium break-words">
                    {activeSet ? `Studying: ${activeSet.title}` : 'Select a study set to begin'}
                  </p>
                </div>
              </div>
              
              {/* Study Stats - Responsive */}
              {activeSet && (
                <div className="flex items-center justify-between lg:justify-end space-x-3 sm:space-x-4 md:space-x-6 w-full lg:w-auto">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{streak}</div>
                    <div className="text-white/60 text-xs sm:text-sm">Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-400">{correctAnswers}</div>
                    <div className="text-white/60 text-xs sm:text-sm">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-400">{Math.round((correctAnswers / (currentIndex + 1)) * 100) || 0}%</div>
                    <div className="text-white/60 text-xs sm:text-sm">Accuracy</div>
                  </div>
                </div>
              )}
            </div>

            {/* Study Mode Selector - Responsive */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {[
                { id: 'normal', label: 'Normal', icon: BookOpenIcon, color: 'from-blue-500 to-cyan-500' },
                { id: 'timed', label: 'Timed', icon: ClockIcon, color: 'from-orange-500 to-red-500' },
                { id: 'review', label: 'Review', icon: ArrowPathIcon, color: 'from-green-500 to-emerald-500' }
              ].map(mode => (
                <motion.button
                  key={mode.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStudyMode(mode.id)}
                  className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold transition-all duration-300 w-full sm:w-auto ${
                    studyMode === mode.id
                      ? `bg-gradient-to-r ${mode.color} text-white shadow-lg`
                      : 'bg-white/10 text-white/80 hover:bg-white/20 backdrop-blur-sm border border-white/20'
                  }`}
                >
                  <mode.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{mode.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Flashcard Set Selector - Responsive */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 shadow-2xl mb-4 sm:mb-6 md:mb-8"
          >
            <div className="flex items-center mb-3 sm:mb-4 md:mb-6">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg sm:rounded-xl blur-lg opacity-75"></div>
                <div className="relative bg-gradient-to-r from-blue-400 to-cyan-500 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                  <AdjustmentsHorizontalIcon className="w-4 h-4 sm:w-5 sm:h-6 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white ml-2 sm:ml-3 md:ml-4 break-words">Select Study Set</h3>
            </div>
            
            <select
              onChange={(e) =>
                handleSelectSet(sets.find((s) => s._id === e.target.value))
              }
              value={activeSet ? activeSet._id : ""}
              className="w-full px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white text-sm sm:text-base md:text-lg font-medium focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm"
            >
              {sets.length === 0 ? (
                <option value="" className="text-white/60">
                  No sets found. Time to create some!
                </option>
              ) : (
                sets.map((set) => (
                  <option
                    key={set._id}
                    value={set._id}
                    className="bg-slate-800 text-white"
                  >
                    {set.title} ({set.cards.length} cards)
                  </option>
                ))
              )}
            </select>
          </motion.div>

          {/* Main Flashcard Display Area */}
          <AnimatePresence mode="wait">
            {activeSet && activeSet.cards.length > 0 ? (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 shadow-2xl"
              >
                {/* Timer Display for Timed Mode - Responsive */}
                {studyMode === 'timed' && (
                  <div className="flex justify-center mb-4 sm:mb-5 md:mb-6">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white font-bold text-lg sm:text-xl">
                      <ClockIcon className="w-4 h-4 sm:w-5 sm:h-6 md:w-6 md:h-6 inline mr-2" />
                      <span>{timeLeft}s</span>
                    </div>
                  </div>
                )}

                {/* Debug: Show flip state - Responsive */}
                <div className="text-center mb-3 sm:mb-4">
                  <div className="bg-white/20 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 inline-block">
                    <span className="text-white font-bold text-xs sm:text-sm md:text-base">
                      Card State: {flipped ? 'Answer' : 'Question'}
                    </span>
                  </div>
                </div>

                {/* The Stunning 3D Flashcard */}
                <Flashcard
                  card={activeSet.cards[currentIndex]}
                  flipped={flipped}
                  onClick={() => {
                    console.log('Card clicked, current flipped state:', flipped);
                    setFlipped(!flipped);
                  }}
                  difficulty={studyMode}
                  streak={streak}
                />

                {/* Enhanced Navigation - Responsive */}
                <div className="flex justify-between items-center px-2 sm:px-4 pt-4 sm:pt-5 md:pt-6 gap-2 sm:gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrev}
                    className="flex items-center justify-center bg-white/10 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl hover:bg-white/20 transition-all duration-300 text-sm sm:text-base font-bold backdrop-blur-sm border border-white/20"
                  >
                    <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </motion.button>

                  <div className="text-center flex-1 min-w-0 mx-2">
                    <div className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1 sm:mb-2">
                      {currentIndex + 1} / {activeSet.cards.length}
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1.5 sm:h-2 max-w-xs mx-auto">
                      <motion.div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 sm:h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / activeSet.cards.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 text-sm sm:text-base font-bold shadow-lg"
                  >
                    <span>Next</span>
                    <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 flex-shrink-0" />
                  </motion.button>
                </div>

                {/* Study Mode Controls - Responsive */}
                <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center mt-4 sm:mt-5 md:mt-6 gap-2 sm:gap-4">
                  {studyMode === 'timed' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setIsTimerRunning(!isTimerRunning);
                        if (!isTimerRunning) setTimeLeft(30);
                      }}
                      className="flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold w-full sm:w-auto"
                    >
                      {isTimerRunning ? <PauseIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" /> : <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />}
                      <span>{isTimerRunning ? 'Pause' : 'Start'} Timer</span>
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFlipped(!flipped)}
                    className="flex items-center justify-center bg-white/10 text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold backdrop-blur-sm border border-white/20 w-full sm:w-auto"
                  >
                    {flipped ? <EyeSlashIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" /> : <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />}
                    <span>{flipped ? 'Hide' : 'Show'} Answer</span>
                  </motion.button>
                </div>

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-white/60 mt-4 sm:mt-5 md:mt-6 text-sm sm:text-base md:text-lg px-2"
                >
                  🎯 You're doing great! Click the card to test your knowledge!
                </motion.p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 border border-white/20 shadow-2xl text-center"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <FolderOpenIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 px-4 break-words">
                  {sets.length === 0 ? "Ready to Start Learning?" : "Select a Study Set"}
                </h3>
                <p className="text-white/60 text-sm sm:text-base md:text-lg px-4 break-words">
                  {sets.length === 0
                    ? "Create your first flashcard set to begin your learning journey!"
                    : "Choose a study set from the dropdown above to begin your session."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default FlashcardViewer;
