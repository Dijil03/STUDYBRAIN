import { v4 as uuidv4 } from 'uuid';

const userPatterns = new Map();
const userMaterials = new Map();
const userRecommendations = new Map();
const tutorSessions = new Map();

const getDefaultPattern = () => ({
  performance: {
    totalSessions: 0,
    totalQuestions: 0,
    averageSatisfactionRating: 4.2,
    averageSessionDuration: 18,
  },
  focusAreas: [
    { subject: 'mathematics', mastery: 68 },
    { subject: 'science', mastery: 62 },
    { subject: 'english', mastery: 74 },
  ],
  studyHabits: {
    preferredTimes: ['morning', 'evening'],
    averageSessionMinutes: 25,
    streakDays: 3,
  },
});

const getDefaultRecommendations = () => ({
  recommendations: [
    {
      type: 'study_plan',
      priority: 'high',
      reason: 'You have an upcoming exam. Focus on summary revision.',
    },
    {
      type: 'practice',
      priority: 'medium',
      reason: 'Complete two practice quizzes to reinforce today’s topic.',
    },
    {
      type: 'concept_review',
      priority: 'low',
      reason: 'Review key concepts covered earlier this week.',
    },
  ],
});

const getLearningPattern = (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    if (!userPatterns.has(userId)) {
      userPatterns.set(userId, getDefaultPattern());
    }

    return res.status(200).json({
      success: true,
      data: userPatterns.get(userId),
    });
  } catch (error) {
    console.error('Error getting learning pattern:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load learning pattern',
    });
  }
};

const getStudyMaterials = (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    if (!userMaterials.has(userId)) {
      userMaterials.set(userId, []);
    }

    return res.status(200).json({
      success: true,
      data: userMaterials.get(userId),
    });
  } catch (error) {
    console.error('Error getting study materials:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load study materials',
    });
  }
};

const generateStudyMaterial = (req, res) => {
  try {
    const {
      userId,
      subject = 'general',
      topic = 'General Study',
      difficulty = 'intermediate',
      materialType = 'summary',
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    const material = {
      id: uuidv4(),
      title: `${topic} - ${materialType.replace('_', ' ')}`,
      description: `AI-generated ${materialType.replace('_', ' ')} for ${topic}.`,
      subject,
      difficulty,
      createdAt: new Date(),
    };

    if (!userMaterials.has(userId)) {
      userMaterials.set(userId, []);
    }
    userMaterials.get(userId).unshift(material);

    return res.status(200).json({
      success: true,
      data: material,
    });
  } catch (error) {
    console.error('Error generating study material:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate study material',
    });
  }
};

const getRecommendations = (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    if (!userRecommendations.has(userId)) {
      userRecommendations.set(userId, getDefaultRecommendations());
    }

    return res.status(200).json({
      success: true,
      data: userRecommendations.get(userId),
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load recommendations',
    });
  }
};

const createTutorSession = (req, res) => {
  try {
    const {
      userId = 'anonymous',
      userName = 'Student',
      subject = 'general',
      topic = 'General Help',
      difficulty = 'intermediate',
    } = req.body;

    const sessionId = uuidv4();
    tutorSessions.set(sessionId, {
      userId,
      userName,
      subject,
      topic,
      difficulty,
      startedAt: new Date(),
      messages: [],
      stats: {
        totalMessages: 0,
        questionsAsked: 0,
        explanationsGiven: 0,
        problemsSolved: 0,
        sessionDuration: 0,
      },
      isActive: true,
    });

    if (!userPatterns.has(userId)) {
      userPatterns.set(userId, getDefaultPattern());
    }

    return res.status(201).json({
      success: true,
      data: {
        sessionId,
        message: 'AI tutor session created successfully',
      },
    });
  } catch (error) {
    console.error('Error creating tutor session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create tutor session',
    });
  }
};

const sendTutorMessage = (req, res) => {
  try {
    const {
      sessionId,
      message,
      messageType = 'text',
      subject = 'general',
      topic = 'General Help',
    } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and message are required',
      });
    }

    const session = tutorSessions.get(sessionId);
    if (!session || !session.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Tutor session not found',
      });
    }

    // Store user message
    session.messages.push({
      role: 'user',
      content: message,
      messageType,
      timestamp: new Date(),
    });
    session.stats.totalMessages += 1;
    session.stats.questionsAsked += 1;

    // Generate a playful AI response
    const aiResponse = `Great question! Here's a helpful tip about ${topic.toLowerCase()}:\n\n• Focus on the key concepts first.\n• Practice with example problems.\n• Teach the concept to someone else to test your understanding.\n\nWould you like a summary, practice questions, or a concept map next?`;

    const aiMessage = {
      role: 'assistant',
      content: aiResponse,
      messageType: 'text',
      timestamp: new Date(),
      metadata: {
        subject: session.subject || subject,
        topic,
        difficulty: session.difficulty,
        hasExplanation: true,
      },
    };

    session.messages.push(aiMessage);
    session.stats.totalMessages += 1;
    session.stats.explanationsGiven += 1;
    session.stats.sessionDuration = Math.round(
      (Date.now() - session.startedAt.getTime()) / 60000
    );

    return res.status(200).json({
      success: true,
      data: {
        response: aiResponse,
        messageType: 'text',
        metadata: aiMessage.metadata,
        sessionStats: session.stats,
      },
    });
  } catch (error) {
    console.error('Error handling tutor message:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process tutor message',
    });
  }
};

const endTutorSession = (req, res) => {
  try {
    const { sessionId, rating = 5 } = req.body;
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    const session = tutorSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      session.endedAt = new Date();
      session.stats.sessionDuration = Math.round(
        (session.endedAt.getTime() - session.startedAt.getTime()) / 60000
      );

      const userPattern = userPatterns.get(session.userId) || getDefaultPattern();
      userPattern.performance.totalSessions += 1;
      userPattern.performance.totalQuestions += session.stats.questionsAsked;
      userPattern.performance.averageSessionDuration = Math.round(
        (userPattern.performance.averageSessionDuration * (userPattern.performance.totalSessions - 1) +
          session.stats.sessionDuration) / userPattern.performance.totalSessions
      );
      userPattern.performance.averageSatisfactionRating =
        (userPattern.performance.averageSatisfactionRating * (userPattern.performance.totalSessions - 1) +
          rating) / userPattern.performance.totalSessions;
      userPatterns.set(session.userId, userPattern);
    }

    return res.status(200).json({
      success: true,
      message: 'Session ended successfully',
    });
  } catch (error) {
    console.error('Error ending tutor session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to end tutor session',
    });
  }
};

export {
  getLearningPattern,
  getStudyMaterials,
  generateStudyMaterial,
  getRecommendations,
  createTutorSession,
  sendTutorMessage,
  endTutorSession,
};
