import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target, 
  TrendingUp,
  Brain,
  Zap,
  Star,
  BarChart3
} from 'lucide-react';
import { 
  calculateNextReview, 
  getDueCards, 
  getOptimalStudyOrder, 
  getStudyRecommendations,
  updateCardStats,
  PERFORMANCE_LEVELS 
} from '../utils/spacedRepetition';

const EnhancedFlashcardViewer = ({ sets, onUpdateCard }) => {
  const [activeSet, setActiveSet] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState('spaced'); // 'spaced', 'normal', 'cram'
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    correct: 0,
    incorrect: 0,
    timeSpent: 0,
    startTime: null
  });
  const [showStats, setShowStats] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    if (sets && sets.length > 0) {
      setActiveSet(sets[0]);
      const stats = getStudyRecommendations(sets[0].cards || []);
      setRecommendations(stats);
    }
  }, [sets]);

  const getStudyCards = () => {
    if (!activeSet?.cards) return [];
    
    switch (studyMode) {
      case 'spaced':
        return getOptimalStudyOrder(activeSet.cards);
      case 'cram':
        return activeSet.cards.filter(card => card.difficulty === 'hard' || !card.easeFactor);
      default:
        return activeSet.cards;
    }
  };

  const studyCards = getStudyCards();
  const currentCard = studyCards[currentIndex];

  const handlePerformance = (performance) => {
    if (!currentCard) return;

    const updatedCard = updateCardStats(currentCard, performance);
    onUpdateCard?.(updatedCard);

    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + (performance >= PERFORMANCE_LEVELS.GOOD ? 1 : 0),
      incorrect: prev.incorrect + (performance < PERFORMANCE_LEVELS.GOOD ? 1 : 0),
      total: prev.total + 1
    }));

    // Move to next card
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setFlipped(false);
    } else {
      // Session complete
      setShowStats(true);
    }
  };

  const startSession = () => {
    setSessionStats({
      total: 0,
      correct: 0,
      incorrect: 0,
      timeSpent: 0,
      startTime: new Date()
    });
    setCurrentIndex(0);
    setFlipped(false);
    setShowStats(false);
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setShowStats(false);
    setSessionStats(prev => ({ ...prev, total: 0, correct: 0, incorrect: 0 }));
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case PERFORMANCE_LEVELS.AGAIN: return 'text-red-500 bg-red-500/20';
      case PERFORMANCE_LEVELS.HARD: return 'text-orange-500 bg-orange-500/20';
      case PERFORMANCE_LEVELS.GOOD: return 'text-green-500 bg-green-500/20';
      case PERFORMANCE_LEVELS.EASY: return 'text-blue-500 bg-blue-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getPerformanceLabel = (performance) => {
    switch (performance) {
      case PERFORMANCE_LEVELS.AGAIN: return 'Again';
      case PERFORMANCE_LEVELS.HARD: return 'Hard';
      case PERFORMANCE_LEVELS.GOOD: return 'Good';
      case PERFORMANCE_LEVELS.EASY: return 'Easy';
      default: return 'Unknown';
    }
  };

  if (!activeSet) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No flashcard sets available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">{activeSet.title}</h2>
          <div className="flex items-center space-x-2">
            <select
              value={studyMode}
              onChange={(e) => setStudyMode(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="spaced">Spaced Repetition</option>
              <option value="normal">Normal</option>
              <option value="cram">Cram Mode</option>
            </select>
          </div>
        </div>

        {/* Study Recommendations */}
        {recommendations && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 rounded-xl p-4 mb-4"
          >
            <div className="flex items-center mb-3">
              <Target className="w-5 h-5 text-purple-400 mr-2" />
              <h3 className="text-white font-semibold">Study Recommendations</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{recommendations.stats.dueCards}</div>
                <div className="text-sm text-gray-400">Due Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{recommendations.stats.retentionRate}%</div>
                <div className="text-sm text-gray-400">Retention Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{recommendations.suggestedSessionLength}min</div>
                <div className="text-sm text-gray-400">Suggested Time</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Session Stats */}
        {sessionStats.startTime && (
          <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{currentIndex + 1} / {studyCards.length}</div>
                  <div className="text-sm text-gray-400">Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{sessionStats.correct}</div>
                  <div className="text-sm text-gray-400">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-400">{sessionStats.incorrect}</div>
                  <div className="text-sm text-gray-400">Incorrect</div>
                </div>
              </div>
              <button
                onClick={() => setShowStats(true)}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View Stats</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Flashcard */}
      {!showStats && currentCard && (
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="mb-6"
        >
          <div className="bg-slate-800/50 rounded-2xl p-8 min-h-[400px] flex items-center justify-center">
            <div className="text-center w-full">
              <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                className="transform-gpu"
              >
                <div className="text-2xl font-bold text-white mb-4">
                  {flipped ? currentCard.answer : currentCard.question}
                </div>
                {!flipped && (
                  <button
                    onClick={() => setFlipped(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Show Answer
                  </button>
                )}
              </motion.div>

              {flipped && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <div className="text-lg text-gray-300 mb-6">How well did you know this?</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(PERFORMANCE_LEVELS).map(([key, value]) => (
                      <motion.button
                        key={key}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePerformance(value)}
                        className={`p-4 rounded-lg border-2 transition-all ${getPerformanceColor(value)}`}
                      >
                        <div className="font-semibold">{getPerformanceLabel(value)}</div>
                        <div className="text-sm opacity-75">
                          {value === PERFORMANCE_LEVELS.AGAIN && 'Repeat immediately'}
                          {value === PERFORMANCE_LEVELS.HARD && 'Review in 1 day'}
                          {value === PERFORMANCE_LEVELS.GOOD && 'Review in 6 days'}
                          {value === PERFORMANCE_LEVELS.EASY && 'Review in 16 days'}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Session Complete Stats */}
      {showStats && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800/50 rounded-2xl p-8 text-center"
        >
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Session Complete!</h3>
            <p className="text-gray-400">Great job on your study session</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{sessionStats.total}</div>
              <div className="text-sm text-gray-400">Total Cards</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{sessionStats.correct}</div>
              <div className="text-sm text-gray-400">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">{sessionStats.incorrect}</div>
              <div className="text-sm text-gray-400">Incorrect</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">
                {Math.round((sessionStats.correct / sessionStats.total) * 100)}%
              </div>
              <div className="text-sm text-gray-400">Accuracy</div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={startSession}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Start New Session
            </button>
            <button
              onClick={resetSession}
              className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Reset Session
            </button>
          </div>
        </motion.div>
      )}

      {/* Start Session Button */}
      {!sessionStats.startTime && !showStats && (
        <div className="text-center">
          <button
            onClick={startSession}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Start Study Session
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedFlashcardViewer;
