import { OpenAI } from "openai";
import { v4 as uuidv4 } from 'uuid';

const userPatterns = new Map();
const userMaterials = new Map();
const userRecommendations = new Map();
const tutorSessions = new Map();

// Get list of models to try (in order of preference)
const getTutorModels = () => {
  // Priority: Environment variable > High-quality models > Fallback
  if (process.env.AI_TUTOR_MODEL) {
    return [process.env.AI_TUTOR_MODEL, 'deepseek-ai/DeepSeek-V3.2-Exp:novita'];
  }
  
  // Try high-quality models (in order of preference)
  return [
    'meta-llama/Llama-3.1-70B-Instruct',  // High-quality, widely available
    'mistralai/Mixtral-8x7B-Instruct-v0.1', // Excellent for instruction following
    'Qwen/Qwen2.5-72B-Instruct', // Strong reasoning capabilities
    'openai/gpt-oss-120b',  // User's preferred model (may not be available via router)
    'deepseek-ai/DeepSeek-V3.2-Exp:novita', // Reliable fallback
  ];
};

let tutorClient = null;
const getTutorClient = () => {
  if (!tutorClient) {
    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      throw new Error('HF_TOKEN environment variable is not set. Please add HF_TOKEN to your Render environment variables.');
    }
    const originalKey = process.env.OPENAI_API_KEY;
    try {
      process.env.OPENAI_API_KEY = hfToken;
      tutorClient = new OpenAI({
        baseURL: "https://router.huggingface.co/v1",
        apiKey: hfToken,
      });
    } finally {
      if (originalKey) {
        process.env.OPENAI_API_KEY = originalKey;
      } else {
        delete process.env.OPENAI_API_KEY;
      }
    }
  }
  return tutorClient;
};

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

const generateStudyMaterial = async (req, res) => {
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

    const client = getTutorClient();
    const materialPrompt = `You are Brain's AI tutor creating ${materialType.replace('_', ' ')} materials.
Subject: ${subject}
Topic: ${topic}
Learner difficulty: ${difficulty}

Produce structured output with:
1. Key concepts (bullet list)
2. Step-by-step explanation
3. Practical example or scenario
4. Quick quiz or reflection question
5. Suggested next steps`;

    const modelsToTry = getTutorModels();
    let completion;
    let lastError = null;
    let usedModel = null;
    
    // Try each model in sequence until one works
    for (const model of modelsToTry) {
      try {
        console.log(`🤖 AI Tutor (Materials): Trying model: ${model}`);
        completion = await client.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: 'You craft concise, student-friendly study aids.' },
            { role: 'user', content: materialPrompt },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        });
        usedModel = model;
        console.log(`✅ AI Tutor (Materials): Successfully using model: ${model}`);
        break; // Success, exit the loop
      } catch (modelError) {
        lastError = modelError;
        console.warn(`⚠️ AI Tutor (Materials): Model ${model} failed:`, modelError.message);
        // Continue to next model
      }
    }
    
    // If all models failed, throw the last error
    if (!completion) {
      console.error(`❌ AI Tutor (Materials): All models failed. Last error:`, lastError?.message);
      throw lastError || new Error('All AI models failed');
    }

    const generatedContent = completion.choices?.[0]?.message?.content?.trim() ??
      'Study material could not be generated at this time.';

    const material = {
      id: uuidv4(),
      title: `${topic} - ${materialType.replace('_', ' ')}`,
      description: `AI-generated ${materialType.replace('_', ' ')} for ${topic}.`,
      subject,
      difficulty,
      createdAt: new Date(),
      content: generatedContent,
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

const sendTutorMessage = async (req, res) => {
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

    session.messages.push({
      role: 'user',
      content: message,
      messageType,
      timestamp: new Date(),
    });
    session.stats.totalMessages += 1;
    session.stats.questionsAsked += 1;

    const client = getTutorClient();
    const systemPrompt = `You are Brain's personalised AI tutor. Tailor explanations to the learner's subject focus (${subject}) and current topic (${topic}).
Provide step-by-step guidance, encourage active recall, and end with a friendly follow-up question or suggested next action.`;

    const messagesForAI = [
      { role: 'system', content: systemPrompt },
      ...session.messages.map((msg) => ({ role: msg.role, content: msg.content })),
    ];

    const modelsToTry = getTutorModels();
    let completion;
    let lastError = null;
    let usedModel = null;
    
    // Try each model in sequence until one works
    for (const model of modelsToTry) {
      try {
        console.log(`🤖 AI Tutor: Trying model: ${model}`);
        completion = await client.chat.completions.create({
          model,
          messages: messagesForAI,
          max_tokens: 800,
          temperature: 0.65,
        });
        usedModel = model;
        console.log(`✅ AI Tutor: Successfully using model: ${model}`);
        break; // Success, exit the loop
      } catch (modelError) {
        lastError = modelError;
        console.warn(`⚠️ AI Tutor: Model ${model} failed:`, modelError.message);
        // Continue to next model
      }
    }
    
    // If all models failed, throw the last error
    if (!completion) {
      console.error(`❌ AI Tutor: All models failed. Last error:`, lastError?.message);
      throw lastError || new Error('All AI models failed');
    }

    const aiResponse = completion.choices?.[0]?.message?.content?.trim() ??
      "I'm still thinking about that. Could you rephrase the question?";

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
