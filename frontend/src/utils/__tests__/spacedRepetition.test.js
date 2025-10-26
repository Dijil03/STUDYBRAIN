import {
  calculateNextReview,
  getDueCards,
  getOverdueCards,
  calculateStudyStats,
  getOptimalStudyOrder,
  getStudyRecommendations,
  initializeCard,
  updateCardStats,
  PERFORMANCE_LEVELS
} from '../spacedRepetition';

describe('Spaced Repetition Algorithm', () => {
  const mockCard = {
    id: 'test-card-1',
    question: 'What is React?',
    answer: 'A JavaScript library',
    repetitions: 0,
    interval: 1,
    easeFactor: 2.5,
    lastReviewed: null,
    nextReview: new Date().toISOString()
  };

  describe('calculateNextReview', () => {
    it('should handle new cards correctly', () => {
      const newCard = { ...mockCard, repetitions: 0 };
      const result = calculateNextReview(newCard, PERFORMANCE_LEVELS.GOOD);
      
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBe(2.5);
      expect(result.streak).toBe(1);
    });

    it('should handle failed cards (AGAIN)', () => {
      const card = { ...mockCard, repetitions: 3, interval: 6, easeFactor: 2.3 };
      const result = calculateNextReview(card, PERFORMANCE_LEVELS.AGAIN);
      
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.streak).toBe(0);
    });

    it('should handle HARD performance', () => {
      const card = { ...mockCard, repetitions: 2, interval: 6, easeFactor: 2.3 };
      const result = calculateNextReview(card, PERFORMANCE_LEVELS.HARD);
      
      expect(result.repetitions).toBe(3);
      expect(result.interval).toBe(6);
      expect(result.easeFactor).toBeLessThan(2.3);
    });

    it('should handle GOOD performance', () => {
      const card = { ...mockCard, repetitions: 2, interval: 6, easeFactor: 2.3 };
      const result = calculateNextReview(card, PERFORMANCE_LEVELS.GOOD);
      
      expect(result.repetitions).toBe(3);
      expect(result.interval).toBeGreaterThan(6);
      expect(result.easeFactor).toBeGreaterThan(2.3);
    });

    it('should handle EASY performance', () => {
      const card = { ...mockCard, repetitions: 2, interval: 6, easeFactor: 2.3 };
      const result = calculateNextReview(card, PERFORMANCE_LEVELS.EASY);
      
      expect(result.repetitions).toBe(3);
      expect(result.interval).toBeGreaterThan(6);
      expect(result.easeFactor).toBeGreaterThan(2.3);
    });

    it('should maintain minimum ease factor of 1.3', () => {
      const card = { ...mockCard, easeFactor: 1.3 };
      const result = calculateNextReview(card, PERFORMANCE_LEVELS.AGAIN);
      
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe('getDueCards', () => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const cards = [
      { ...mockCard, nextReview: yesterday.toISOString() }, // Due yesterday
      { ...mockCard, nextReview: today.toISOString() }, // Due today
      { ...mockCard, nextReview: tomorrow.toISOString() }, // Due tomorrow
      { ...mockCard, nextReview: null } // New card
    ];

    it('should return cards due today or earlier', () => {
      const dueCards = getDueCards(cards);
      expect(dueCards).toHaveLength(3); // Yesterday, today, and new card
    });

    it('should include new cards (no nextReview)', () => {
      const newCards = cards.filter(card => !card.nextReview);
      const dueCards = getDueCards(cards);
      
      expect(dueCards).toEqual(expect.arrayContaining(newCards));
    });
  });

  describe('getOverdueCards', () => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const cards = [
      { ...mockCard, nextReview: yesterday.toISOString() }, // Overdue
      { ...mockCard, nextReview: today.toISOString() }, // Due today
      { ...mockCard, nextReview: tomorrow.toISOString() }, // Due tomorrow
    ];

    it('should return only overdue cards', () => {
      const overdueCards = getOverdueCards(cards);
      expect(overdueCards).toHaveLength(1);
      expect(overdueCards[0].nextReview).toBe(yesterday.toISOString());
    });
  });

  describe('calculateStudyStats', () => {
    const cards = [
      { ...mockCard, repetitions: 0, nextReview: new Date().toISOString() },
      { ...mockCard, repetitions: 2, interval: 6, easeFactor: 2.3, nextReview: new Date().toISOString() },
      { ...mockCard, repetitions: 5, interval: 30, easeFactor: 2.8, nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
    ];

    it('should calculate correct statistics', () => {
      const stats = calculateStudyStats(cards);
      
      expect(stats.totalCards).toBe(3);
      expect(stats.dueCards).toBe(2);
      expect(stats.newCards).toBe(1);
      expect(stats.avgEaseFactor).toBeCloseTo(2.53, 2);
    });
  });

  describe('getOptimalStudyOrder', () => {
    const cards = [
      { ...mockCard, id: 'card1', repetitions: 0, easeFactor: 2.5, nextReview: new Date().toISOString() },
      { ...mockCard, id: 'card2', repetitions: 2, easeFactor: 2.3, nextReview: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { ...mockCard, id: 'card3', repetitions: 5, easeFactor: 2.8, nextReview: new Date().toISOString() },
    ];

    it('should prioritize overdue cards first', () => {
      const orderedCards = getOptimalStudyOrder(cards);
      expect(orderedCards[0].id).toBe('card2'); // Overdue card
    });

    it('should sort by difficulty (lower ease factor first)', () => {
      const orderedCards = getOptimalStudyOrder(cards);
      const dueCards = orderedCards.filter(card => card.id !== 'card2');
      expect(dueCards[0].easeFactor).toBeLessThanOrEqual(dueCards[1].easeFactor);
    });
  });

  describe('getStudyRecommendations', () => {
    const mockCards = Array.from({ length: 10 }, (_, i) => ({
      ...mockCard,
      id: `card-${i}`,
      repetitions: i < 5 ? 0 : 2,
      easeFactor: 2.5 - (i * 0.1),
      nextReview: i < 3 ? new Date().toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }));

    it('should provide study recommendations', () => {
      const recommendations = getStudyRecommendations(mockCards);
      
      expect(recommendations.stats).toBeDefined();
      expect(recommendations.recommendations).toBeInstanceOf(Array);
      expect(recommendations.suggestedSessionLength).toBeGreaterThan(0);
    });

    it('should suggest appropriate session length', () => {
      const recommendations = getStudyRecommendations(mockCards);
      expect(recommendations.suggestedSessionLength).toBeGreaterThanOrEqual(10);
      expect(recommendations.suggestedSessionLength).toBeLessThanOrEqual(60);
    });
  });

  describe('initializeCard', () => {
    it('should initialize a new card with default values', () => {
      const cardData = {
        id: 'new-card',
        question: 'Test question?',
        answer: 'Test answer'
      };

      const initializedCard = initializeCard(cardData);
      
      expect(initializedCard.repetitions).toBe(0);
      expect(initializedCard.interval).toBe(1);
      expect(initializedCard.easeFactor).toBe(2.5);
      expect(initializedCard.streak).toBe(0);
      expect(initializedCard.totalReviews).toBe(0);
      expect(initializedCard.correctReviews).toBe(0);
    });
  });

  describe('updateCardStats', () => {
    it('should update card statistics correctly', () => {
      const card = { ...mockCard, totalReviews: 5, correctReviews: 3 };
      const updatedCard = updateCardStats(card, PERFORMANCE_LEVELS.GOOD);
      
      expect(updatedCard.totalReviews).toBe(6);
      expect(updatedCard.correctReviews).toBe(4);
      expect(updatedCard.accuracy).toBe(67); // 4/6 * 100
    });

    it('should handle incorrect answers', () => {
      const card = { ...mockCard, totalReviews: 5, correctReviews: 3 };
      const updatedCard = updateCardStats(card, PERFORMANCE_LEVELS.AGAIN);
      
      expect(updatedCard.totalReviews).toBe(6);
      expect(updatedCard.correctReviews).toBe(3);
      expect(updatedCard.accuracy).toBe(50); // 3/6 * 100
    });
  });

  describe('Performance Levels', () => {
    it('should have correct performance level values', () => {
      expect(PERFORMANCE_LEVELS.AGAIN).toBe(0);
      expect(PERFORMANCE_LEVELS.HARD).toBe(1);
      expect(PERFORMANCE_LEVELS.GOOD).toBe(2);
      expect(PERFORMANCE_LEVELS.EASY).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty card arrays', () => {
      expect(getDueCards([])).toEqual([]);
      expect(getOverdueCards([])).toEqual([]);
      expect(calculateStudyStats([])).toEqual({
        totalCards: 0,
        dueCards: 0,
        overdueCards: 0,
        newCards: 0,
        avgEaseFactor: 2.5,
        retentionRate: 0,
        studyLoad: 0
      });
    });

    it('should handle cards with missing properties', () => {
      const incompleteCard = { id: 'incomplete', question: 'Test?' };
      const result = calculateNextReview(incompleteCard, PERFORMANCE_LEVELS.GOOD);
      
      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBe(2.5);
    });

    it('should handle extreme ease factors', () => {
      const card = { ...mockCard, easeFactor: 0.5 };
      const result = calculateNextReview(card, PERFORMANCE_LEVELS.AGAIN);
      
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe('Integration Tests', () => {
    it('should work with a complete study session', () => {
      const cards = [
        initializeCard({ id: 'card1', question: 'Q1?', answer: 'A1' }),
        initializeCard({ id: 'card2', question: 'Q2?', answer: 'A2' }),
        initializeCard({ id: 'card3', question: 'Q3?', answer: 'A3' })
      ];

      // Study session
      const updatedCards = cards.map(card => 
        updateCardStats(card, PERFORMANCE_LEVELS.GOOD)
      );

      const stats = calculateStudyStats(updatedCards);
      expect(stats.totalCards).toBe(3);
      expect(stats.avgEaseFactor).toBeGreaterThan(2.5);
    });

    it('should maintain consistency across multiple reviews', () => {
      let card = initializeCard({ id: 'card1', question: 'Q1?', answer: 'A1' });
      
      // Simulate multiple reviews
      for (let i = 0; i < 5; i++) {
        card = updateCardStats(card, PERFORMANCE_LEVELS.GOOD);
      }

      expect(card.totalReviews).toBe(5);
      expect(card.correctReviews).toBe(5);
      expect(card.accuracy).toBe(100);
      expect(card.repetitions).toBeGreaterThan(1);
    });
  });
});
