/**
 * Spaced Repetition Service
 * Implements the SM-2 (SuperMemo 2) algorithm for optimal review scheduling
 */

/**
 * Calculate next review date and update difficulty based on performance
 * @param {Object} revision - Revision item with current spaced repetition data
 * @param {Number} quality - User's performance rating (0-5)
 *   0-1: Complete blackout (forgot completely)
 *   2-3: Incorrect response (remembered with difficulty)
 *   4-5: Correct response (easy recall)
 * @returns {Object} Updated revision data
 */
export function calculateNextReview(revision, quality) {
  let { difficulty, interval, repetitions } = revision;
  
  // Quality must be between 0 and 5
  quality = Math.max(0, Math.min(5, quality));
  
  // Update ease factor (difficulty)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // Minimum EF is 1.3
  difficulty = difficulty + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  difficulty = Math.max(1.3, difficulty);
  
  // Update repetitions based on quality
  if (quality < 3) {
    // If quality is less than 3, reset repetitions
    repetitions = 0;
  } else {
    // Otherwise, increment repetitions
    repetitions += 1;
  }
  
  // Calculate new interval
  if (repetitions === 0) {
    interval = 1; // Review again tomorrow
  } else if (repetitions === 1) {
    interval = 6; // Review in 6 days
  } else {
    // interval = previous interval * EF
    interval = Math.round(interval * difficulty);
  }
  
  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);
  
  // Calculate mastery level (0-100%)
  // Based on repetitions and difficulty
  let masteryLevel = 0;
  if (repetitions >= 5 && difficulty >= 2.0) {
    masteryLevel = 100;
  } else if (repetitions >= 3) {
    masteryLevel = 60 + (repetitions - 3) * 15;
  } else if (repetitions >= 1) {
    masteryLevel = 30 + (repetitions - 1) * 15;
  } else {
    masteryLevel = Math.min(30, repetitions * 15);
  }
  
  // Update status
  let status = revision.status;
  if (masteryLevel >= 90 && repetitions >= 5) {
    status = 'mastered';
  } else if (status === 'mastered' && quality < 3) {
    status = 'active'; // Demote if performance drops
  }
  
  return {
    difficulty,
    interval,
    repetitions,
    nextReview,
    masteryLevel,
    status,
    lastReviewed: new Date()
  };
}

/**
 * Get items due for review
 * @param {Date} date - Date to check (defaults to now)
 * @returns {Object} Query object for MongoDB
 */
export function getDueItemsQuery(date = new Date()) {
  return {
    nextReview: { $lte: date },
    status: 'active'
  };
}

/**
 * Calculate initial review schedule for new item
 * @returns {Object} Initial spaced repetition data
 */
export function getInitialSchedule() {
  return {
    difficulty: 2.5,
    interval: 1,
    repetitions: 0,
    nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    masteryLevel: 0,
    status: 'active'
  };
}

/**
 * Get review statistics
 * @param {Array} revisions - Array of revision items
 * @returns {Object} Statistics object
 */
export function getReviewStatistics(revisions) {
  const now = new Date();
  const dueToday = revisions.filter(r => {
    const reviewDate = new Date(r.nextReview);
    return reviewDate <= now && r.status === 'active';
  }).length;
  
  const dueThisWeek = revisions.filter(r => {
    const reviewDate = new Date(r.nextReview);
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return reviewDate <= weekFromNow && r.status === 'active';
  }).length;
  
  const mastered = revisions.filter(r => r.status === 'mastered').length;
  const active = revisions.filter(r => r.status === 'active').length;
  
  const averageMastery = revisions.length > 0
    ? revisions.reduce((sum, r) => sum + (r.masteryLevel || 0), 0) / revisions.length
    : 0;
  
  return {
    total: revisions.length,
    active,
    mastered,
    dueToday,
    dueThisWeek,
    averageMastery: Math.round(averageMastery)
  };
}

/**
 * Estimate optimal study time based on due items
 * @param {Array} revisions - Array of revision items due for review
 * @param {Number} minutesPerItem - Average minutes per item (default: 5)
 * @returns {Number} Estimated minutes needed
 */
export function estimateStudyTime(revisions, minutesPerItem = 5) {
  return revisions.length * minutesPerItem;
}

