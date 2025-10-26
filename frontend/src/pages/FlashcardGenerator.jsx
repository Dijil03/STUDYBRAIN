import React, { useState } from "react";
import api from "../utils/axios";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import {
  BoltIcon,
  DocumentTextIcon,
  FolderIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  BookOpenIcon,
  TrashIcon,
  SparklesIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  StarIcon,
  FireIcon,
  TrophyIcon,
  HeartIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ClockIcon,
  EyeIcon,
  PlusIcon,
  XMarkIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

const FlashcardGenerator = () => {
  const userId = localStorage.getItem("userId");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [cards, setCards] = useState([]);
  const [saved, setSaved] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMode, setGenerationMode] = useState('auto'); // 'auto', 'manual'
  const [previewMode, setPreviewMode] = useState(false);
  const [stats, setStats] = useState({
    totalGenerated: 0,
    timeSaved: 0,
    accuracy: 0
  });

  // --- Core Logic (Unchanged) ---
  const handleGenerate = () => {
    setIsGenerating(true);
    // Brief delay for UX feedback
    setTimeout(() => {
      const lines = notes.split("\n").filter((line) => line.includes(":"));
      const generated = lines.map((line) => {
        const [question, answer] = line.split(":");
        return {
          question: question.trim(),
          answer: answer.trim(),
        };
      });
      setCards(generated);
      setSaved(false);
      setIsGenerating(false);
    }, 300);
  };

  const handleSave = async () => {
    try {
      // Updated API call to send cards directly instead of notes,
      // as the cards state is the source of truth after generation/editing.
      await api.post(`/flashcards/${userId}/save`, {
        title,
        cards, // Saving the processed/edited cards
      });
      toast.success("Flashcards saved successfully");
      setSaved(true);
    } catch (err) {
      console.error("Error saving flashcards:", err);
    }
  };

  const handleEditCard = (index, field, value) => {
    const updated = [...cards];
    updated[index][field] = value;
    setCards(updated);
  };

  const handleDeleteCard = (index) => {
    const updated = cards.filter((_, i) => i !== index);
    setCards(updated);
  };
  // --- End Core Logic ---

  return (
    <>
      <Navbar />
      
      {/* Stunning Background with Animated Elements */}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
          {/* Stunning Header */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur-lg opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-2xl">
                    <RocketLaunchIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-black text-white mb-2 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                    Flashcard Generator
                  </h1>
                  <p className="text-yellow-200 text-lg font-medium">
                    Transform your notes into powerful study cards instantly!
                  </p>
                </div>
              </div>
              
              {/* Generation Stats */}
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{stats.totalGenerated}</div>
                  <div className="text-white/60 text-sm">Cards Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{stats.timeSaved}m</div>
                  <div className="text-white/60 text-sm">Time Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">{stats.accuracy}%</div>
                  <div className="text-white/60 text-sm">Accuracy</div>
                </div>
              </div>
          </div>

            {/* Generation Mode Selector */}
            <div className="flex gap-3">
              {[
                { id: 'auto', label: 'Auto Generate', icon: BoltIcon, color: 'from-blue-500 to-cyan-500' },
                { id: 'manual', label: 'Manual Entry', icon: PlusIcon, color: 'from-green-500 to-emerald-500' }
              ].map(mode => (
                <motion.button
                  key={mode.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setGenerationMode(mode.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                    generationMode === mode.id
                      ? `bg-gradient-to-r ${mode.color} text-white shadow-lg`
                      : 'bg-white/10 text-white/80 hover:bg-white/20 backdrop-blur-sm border border-white/20'
                  }`}
                >
                  <mode.icon className="w-5 h-5" />
                  {mode.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Input Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mb-8"
          >
            <div className="grid md:grid-cols-2 gap-8">
            {/* Title Input */}
            <div>
                <div className="flex items-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl blur-lg opacity-75"></div>
                    <div className="relative bg-gradient-to-r from-blue-400 to-cyan-500 p-3 rounded-xl">
                      <FolderIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white ml-4">Study Set Title</h3>
                </div>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-lg font-medium placeholder-white/60 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 backdrop-blur-sm"
                placeholder="e.g. History - Roman Republic"
              />
            </div>

            {/* Notes Input */}
            <div className="md:col-span-2">
                <div className="flex items-center mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur-lg opacity-75"></div>
                    <div className="relative bg-gradient-to-r from-green-400 to-emerald-500 p-3 rounded-xl">
                      <DocumentTextIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white ml-4">Paste Your Notes Here</h3>
                </div>
              <textarea
                id="notes"
                  rows={8}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-lg font-medium placeholder-white/60 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300 backdrop-blur-sm resize-none"
                  placeholder="Example:&#10;Invention of the Printing Press: Johannes Gutenberg&#10;Year the Berlin Wall fell: 1989&#10;Capital of France: Paris"
                />
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <p className="text-white/80 text-lg font-medium flex items-center">
                    <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-400" />
                    Pro Tip: Each card should be on a new line and use a colon (:) to separate the Question and Answer!
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Generate Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-lg opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                    <BoltIcon className="w-6 h-6 text-white" />
            </div>
                </div>
                <h3 className="text-2xl font-bold text-white">Generate Your Cards</h3>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center bg-white/10 text-white px-4 py-2 rounded-xl font-bold backdrop-blur-sm border border-white/20"
              >
                {previewMode ? <EyeIcon className="w-5 h-5 mr-2" /> : <EyeIcon className="w-5 h-5 mr-2" />}
                {previewMode ? 'Hide Preview' : 'Show Preview'}
              </motion.button>
          </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            onClick={handleGenerate}
            disabled={!notes.trim() || isGenerating}
              className={`w-full flex items-center justify-center px-8 py-6 text-xl font-bold rounded-2xl transition-all duration-300 ${
              !notes.trim() || isGenerating
                  ? "bg-white/10 text-white/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg shadow-lg"
            }`}
          >
            {isGenerating ? (
              <>
                <svg
                    className="animate-spin -ml-1 mr-4 h-8 w-8 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                  <span className="text-2xl">⚡</span>
                  <span className="ml-3">Unleashing Study Power...</span>
              </>
            ) : (
              <>
                  <BoltIcon className="w-8 h-8 mr-4" />
                  <span className="text-2xl">🚀</span>
                  <span className="ml-3">Generate Flashcards Instantly</span>
              </>
            )}
            </motion.button>
          </motion.div>

          {/* Stunning Flashcards Display Section */}
          <AnimatePresence>
          {cards.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.6 }}
                className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mb-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur-lg opacity-75"></div>
                      <div className="relative bg-gradient-to-r from-green-400 to-emerald-500 p-3 rounded-xl">
                        <BookOpenIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">Your Generated Cards</h3>
                      <p className="text-white/60 text-lg">{cards.length} cards ready to study!</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-4xl font-black text-white">{cards.length}</div>
                    <div className="text-white/60 text-sm">Cards Generated</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {cards.map((card, index) => (
                    <motion.div
                    key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
                    >
                      <div className="grid grid-cols-1 gap-6">
                      {/* Question Input */}
                      <div>
                          <label className="flex items-center text-sm font-bold text-white/80 mb-3">
                            <QuestionMarkCircleIcon className="w-5 h-5 mr-2 text-red-400" />
                          Question
                        </label>
                        <input
                          type="text"
                          value={card.question}
                          onChange={(e) =>
                            handleEditCard(index, "question", e.target.value)
                          }
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-lg font-medium placeholder-white/60 focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all duration-300"
                            placeholder="Enter your question..."
                        />
                      </div>

                      {/* Answer Input */}
                      <div>
                          <label className="flex items-center text-sm font-bold text-white/80 mb-3">
                            <CheckCircleIcon className="w-5 h-5 mr-2 text-green-400" />
                          Answer
                        </label>
                        <input
                          type="text"
                          value={card.answer}
                          onChange={(e) =>
                            handleEditCard(index, "answer", e.target.value)
                          }
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white text-lg font-medium placeholder-white/60 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300"
                            placeholder="Enter your answer..."
                        />
                      </div>
                    </div>

                    {/* Delete Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteCard(index)}
                        className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-300 bg-white/10 rounded-xl transition-all duration-300"
                      title="Delete Card"
                    >
                      <TrashIcon className="w-5 h-5" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stunning Save Section */}
          {cards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur-lg opacity-75"></div>
                    <div className="relative bg-gradient-to-r from-green-400 to-emerald-500 p-3 rounded-xl">
                      <TrophyIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Save Your Study Set</h3>
                    <p className="text-white/60 text-lg">
                      {saved ? "Your masterpiece is saved! Ready to study!" : "Ready to save your progress?"}
                    </p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={saved || !title.trim() || cards.length === 0}
                  className={`px-8 py-4 flex items-center text-xl font-bold rounded-2xl transition-all duration-300 ${
                    saved || !title.trim() || cards.length === 0
                      ? "bg-white/10 text-white/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg shadow-lg"
                  }`}
                >
                  {saved ? (
                    <>
                      <CheckCircleIcon className="w-6 h-6 mr-3" />
                      <span className="text-2xl mr-2">🎉</span>
                      Set Saved!
                    </>
                  ) : (
                    <>
                      <StarIcon className="w-6 h-6 mr-3" />
                      <span className="text-2xl mr-2">⭐</span>
                      Save & Conquer
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default FlashcardGenerator;
