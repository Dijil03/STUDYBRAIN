/**
 * Spaced Repetition Algorithm Implementation
 * Based on the SM-2 algorithm with enhancements for study optimization
 */

// Performance levels for user responses
export const PERFORMANCE_LEVELS = {
  AGAIN: 0,      // Complete blackout - repeat immediately
  HARD: 1,       // Incorrect response; correct one remembered
  GOOD: 2,       // Correct response after hesitation
  EASY: 3        // Perfect response
};

// Initial intervals for new cards (in days)
const INITIAL_INTERVALS = [1, 6, 16, 30, 60, 120, 240, 480];

/**
 * Calculate the next review date for a flashcard based on performance
 * @param {Object} card - The flashcard object
 * @param {number} performance - User's performance level (0-3)
 * @returns {Object} Updated card with new review date and intervals
 */
export const calculateNextReview = (card, performance) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Initialize card if it's new
  if (!card.repetitions) {
    card.repetitions = 0;
    card.interval = 1;
    card.easeFactor = 2.5;
    card.lastReviewed = null;
  }

  let newInterval;
  let newRepetitions = card.repetitions;
  let newEaseFactor = card.easeFactor;

  if (performance < PERFORMANCE_LEVELS.GOOD) {
    // Failed - reset to beginning
    newRepetitions = 0;
    newInterval = 1;
  } else {
    // Passed - update intervals and ease factor
    newRepetitions += 1;
    
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(card.interval * newEaseFactor);
    }

    // Update ease factor based on performance
    newEaseFactor = card.easeFactor + (0.1 - (3 - performance) * (0.08 + (3 - performance) * 0.02));
    
    // Ensure ease factor doesn't go below 1.3
    newEaseFactor = Math.max(1.3, newEaseFactor);
  }

  // Calculate next review date
  const nextReviewDate = new Date(today);
  nextReviewDate.setDate(today.getDate() + newInterval);

  return {
    ...card,
    repetitions: newRepetitions,
    interval: newInterval,
    easeFactor: newEaseFactor,
    lastReviewed: today.toISOString(),
    nextReview: nextReviewDate.toISOString(),
    performance: performance,
    streak: performance >= PERFORMANCE_LEVELS.GOOD ? (card.streak || 0) + 1 : 0
  };
};

/**
 * Get cards that are due for review
 * @param {Array} cards - Array of flashcard objects
 * @returns {Array} Cards that are due for review
 */
export const getDueCards = (cards) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return cards.filter(card => {
    if (!card.nextReview) return true; // New cards
    const reviewDate = new Date(card.nextReview);
    reviewDate.setHours(0, 0, 0, 0);
    return reviewDate <= today;
  });
};

/**
 * Get cards that are overdue (past their review date)
 * @param {Array} cards - Array of flashcard objects
 * @returns {Array} Overdue cards
 */
export const getOverdueCards = (cards) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return cards.filter(card => {
    if (!card.nextReview) return false;
    const reviewDate = new Date(card.nextReview);
    reviewDate.setHours(0, 0, 0, 0);
    return reviewDate < today;
  });
};

/**
 * Calculate study session statistics
 * @param {Array} cards - Array of flashcard objects
 * @returns {Object} Study statistics
 */
export const calculateStudyStats = (cards) => {
  const totalCards = cards.length;
  const dueCards = getDueCards(cards).length;
  const overdueCards = getOverdueCards(cards).length;
  const newCards = cards.filter(card => !card.repetitions || card.repetitions === 0).length;
  
  // Calculate average ease factor
  const cardsWithEase = cards.filter(card => card.easeFactor);
  const avgEaseFactor = cardsWithEase.length > 0 
    ? cardsWithEase.reduce((sum, card) => sum + card.easeFactor, 0) / cardsWithEase.length 
    : 2.5;

  // Calculate retention rate (cards with good performance)
  const reviewedCards = cards.filter(card => card.lastReviewed);
  const retentionRate = reviewedCards.length > 0 
    ? reviewedCards.filter(card => card.performance >= PERFORMANCE_LEVELS.GOOD).length / reviewedCards.length 
    : 0;

  return {
    totalCards,
    dueCards,
    overdueCards,
    newCards,
    avgEaseFactor: Math.round(avgEaseFactor * 100) / 100,
    retentionRate: Math.round(retentionRate * 100),
    studyLoad: dueCards + overdueCards
  };
};

/**
 * Get optimal study order for cards (prioritize overdue, then due, then new)
 * @param {Array} cards - Array of flashcard objects
 * @returns {Array} Cards in optimal study order
 */
export const getOptimalStudyOrder = (cards) => {
  const overdueCards = getOverdueCards(cards);
  const dueCards = getDueCards(cards).filter(card => !overdueCards.includes(card));
  const newCards = cards.filter(card => !card.repetitions || card.repetitions === 0);
  
  // Sort each group by ease factor (harder cards first)
  const sortByDifficulty = (cardList) => 
    cardList.sort((a, b) => (a.easeFactor || 2.5) - (b.easeFactor || 2.5));

  return [
    ...sortByDifficulty(overdueCards),
    ...sortByDifficulty(dueCards),
    ...sortByDifficulty(newCards)
  ];
};

/**
 * Calculate study session recommendations
 * @param {Array} cards - Array of flashcard objects
 * @returns {Object} Study recommendations
 */
export const getStudyRecommendations = (cards) => {
  const stats = calculateStudyStats(cards);
  const recommendations = [];

  if (stats.overdueCards > 0) {
    recommendations.push({
      type: 'urgent',
      message: `You have ${stats.overdueCards} overdue cards. Review these first to maintain retention.`,
      priority: 'high'
    });
  }

  if (stats.avgEaseFactor < 2.0) {
    recommendations.push({
      type: 'difficulty',
      message: 'Your cards seem difficult. Consider breaking them into smaller, more manageable pieces.',
      priority: 'medium'
    });
  }

  if (stats.retentionRate < 70) {
    recommendations.push({
      type: 'retention',
      message: 'Your retention rate is below 70%. Focus on understanding before memorizing.',
      priority: 'high'
    });
  }

  if (stats.studyLoad > 50) {
    recommendations.push({
      type: 'workload',
      message: `You have ${stats.studyLoad} cards to review. Consider splitting into multiple sessions.`,
      priority: 'medium'
    });
  }

  return {
    stats,
    recommendations,
    suggestedSessionLength: Math.min(30, Math.max(10, Math.ceil(stats.studyLoad * 2)))
  };
};

/**
 * Initialize a new flashcard with spaced repetition properties
 * @param {Object} cardData - Basic card data
 * @returns {Object} Card with spaced repetition properties
 */
export const initializeCard = (cardData) => {
  return {
    ...cardData,
    repetitions: 0,
    interval: 1,
    easeFactor: 2.5,
    lastReviewed: null,
    nextReview: new Date().toISOString(),
    performance: null,
    streak: 0,
    totalReviews: 0,
    correctReviews: 0
  };
};

/**
 * Update card statistics after a review
 * @param {Object} card - The flashcard object
 * @param {number} performance - User's performance level
 * @returns {Object} Updated card with statistics
 */
export const updateCardStats = (card, performance) => {
  const updatedCard = calculateNextReview(card, performance);
  
  return {
    ...updatedCard,
    totalReviews: (card.totalReviews || 0) + 1,
    correctReviews: (card.correctReviews || 0) + (performance >= PERFORMANCE_LEVELS.GOOD ? 1 : 0),
    accuracy: Math.round(((card.correctReviews || 0) + (performance >= PERFORMANCE_LEVELS.GOOD ? 1 : 0)) / ((card.totalReviews || 0) + 1) * 100)
  };
};
