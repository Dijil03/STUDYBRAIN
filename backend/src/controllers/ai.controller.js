import { OpenAI } from "openai";
import AIChat from '../models/ai.model.js';
import { v4 as uuidv4 } from 'uuid';

// Lazy initialization of OpenAI client with Hugging Face
// Only initialize when needed and if HF_TOKEN is available
let client = null;

const getClient = () => {
  if (!client) {
    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      throw new Error('HF_TOKEN environment variable is not set. Please add HF_TOKEN to your Render environment variables.');
    }
    // OpenAI library checks for OPENAI_API_KEY env var, so we set it temporarily
    // to avoid the initialization error, then override with our apiKey option
    const originalKey = process.env.OPENAI_API_KEY;
    try {
      // Temporarily set OPENAI_API_KEY to prevent library error
      process.env.OPENAI_API_KEY = hfToken;
      client = new OpenAI({
        baseURL: "https://router.huggingface.co/v1",
        apiKey: hfToken,
      });
    } finally {
      // Restore original value (or delete if it didn't exist)
      if (originalKey) {
        process.env.OPENAI_API_KEY = originalKey;
      } else {
        delete process.env.OPENAI_API_KEY;
      }
    }
  }
  return client;
};

// Create a new chat session
export const createChatSession = async (req, res) => {
  try {
    // Get userId from req.user or use a fallback
    let userId = req.user?.userId || req.user?.id;

    // If no user is authenticated, create a temporary session
    if (!userId) {
      // For development/testing purposes, use a default user ID
      // In production, you might want to require authentication
      userId = 'anonymous_user';
      console.log('No authenticated user, using temporary ID:', userId);
    }

    const sessionId = uuidv4();

    const newChat = new AIChat({
      userId,
      sessionId,
      messages: []
    });

    await newChat.save();

    res.status(201).json({
      success: true,
      data: {
        sessionId,
        message: 'Chat session created successfully'
      }
    });
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat session',
      error: error.message
    });
  }
};

// Send a message and get AI response (streaming)
export const sendMessage = async (req, res) => {
  try {
    // Get userId from req.user or use a fallback
    let userId = req.user?.userId || req.user?.id;

    // If no user is authenticated, use a temporary ID
    if (!userId) {
      userId = 'anonymous_user';
      console.log('No authenticated user, using temporary ID:', userId);
    }

    const { sessionId, message, model = 'deepseek-ai/DeepSeek-V3.2-Exp:novita' } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and message are required'
      });
    }

    // Find the chat session
    let chat = await AIChat.findOne({ userId, sessionId, isActive: true });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Add user message to chat
    chat.messages.push({
      role: 'user',
      content: message
    });

    // Prepare messages for AI (include system message if needed)
    const messagesForAI = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant integrated into a study platform. Help users with their academic questions, study planning, and learning goals. Be encouraging and educational in your responses.'
      },
      ...chat.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Set up streaming response
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    let fullResponse = '';
    let tokenCount = 0;

    // Check if client is available
    const aiClient = getClient();
    
    // Create streaming completion
    const stream = await aiClient.chat.completions.create({
      model,
      messages: messagesForAI,
      max_tokens: 1000,
      temperature: 0.7,
      stream: true
    });

    // Process the stream
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        tokenCount++;

        // Send the chunk to the client
        res.write(`data: ${JSON.stringify({
          type: 'content',
          content: content,
          isComplete: false
        })}\n\n`);
      }
    }

    // Add AI response to chat
    chat.messages.push({
      role: 'assistant',
      content: fullResponse
    });

    // Update token count
    chat.totalTokens += tokenCount;
    await chat.save();

    // Send completion signal
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      content: fullResponse,
      isComplete: true,
      sessionId,
      totalTokens: chat.totalTokens,
      messageCount: chat.messages.length
    })}\n\n`);

    res.end();

  } catch (error) {
    console.error('Error sending message:', error);

    // Check if it's a missing token error
    if (error.message.includes('HF_TOKEN') || error.message.includes('OPENAI_API_KEY')) {
      res.write(`data: ${JSON.stringify({
        type: 'error',
        content: 'AI service is not configured. Please contact support.',
        isComplete: true,
        error: 'Missing HF_TOKEN environment variable'
      })}\n\n`);
    } else {
      // Send error in streaming format
      res.write(`data: ${JSON.stringify({
        type: 'error',
        content: 'Sorry, I encountered an error. Please try again.',
        isComplete: true,
        error: error.message
      })}\n\n`);
    }

    res.end();
  }
};

// Get chat history
export const getChatHistory = async (req, res) => {
  try {
    // Get userId from req.user or use a fallback
    let userId = req.user?.userId || req.user?.id;

    // If no user is authenticated, use a temporary ID
    if (!userId) {
      userId = 'anonymous_user';
      console.log('No authenticated user, using temporary ID:', userId);
    }

    const { sessionId } = req.params;

    const chat = await AIChat.findOne({ userId, sessionId, isActive: true });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        sessionId: chat.sessionId,
        messages: chat.messages,
        totalTokens: chat.totalTokens,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
      }
    });

  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat history',
      error: error.message
    });
  }
};

// Get all chat sessions for a user
export const getUserChatSessions = async (req, res) => {
  try {
    // Get userId from req.user or use a fallback
    let userId = req.user?.userId || req.user?.id;

    // If no user is authenticated, use a temporary ID
    if (!userId) {
      userId = 'anonymous_user';
      console.log('No authenticated user, using temporary ID:', userId);
    }

    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const chats = await AIChat.find({ userId, isActive: true })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('sessionId messages totalTokens createdAt updatedAt');

    const total = await AIChat.countDocuments({ userId, isActive: true });

    res.status(200).json({
      success: true,
      data: {
        chats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalChats: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error getting user chat sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat sessions',
      error: error.message
    });
  }
};

// Delete a chat session
export const deleteChatSession = async (req, res) => {
  try {
    // Get userId from req.user or use a fallback
    let userId = req.user?.userId || req.user?.id;

    // If no user is authenticated, use a temporary ID
    if (!userId) {
      userId = 'anonymous_user';
      console.log('No authenticated user, using temporary ID:', userId);
    }

    const { sessionId } = req.params;

    const chat = await AIChat.findOneAndUpdate(
      { userId, sessionId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Chat session deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat session',
      error: error.message
    });
  }
};

// Clear chat history (keep session but remove messages)
export const clearChatHistory = async (req, res) => {
  try {
    // Get userId from req.user or use a fallback
    let userId = req.user?.userId || req.user?.id;

    // If no user is authenticated, use a temporary ID
    if (!userId) {
      userId = 'anonymous_user';
      console.log('No authenticated user, using temporary ID:', userId);
    }

    const { sessionId } = req.params;

    const chat = await AIChat.findOneAndUpdate(
      { userId, sessionId, isActive: true },
      {
        messages: [],
        totalTokens: 0
      },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat history',
      error: error.message
    });
  }
};

// Generate AI-powered assessment
export const generateAssessment = async (req, res) => {
  try {
    const {
      chapter,
      subject,
      difficulty = 'medium',
      numQuestions = 5,
      questionType = 'multiple-choice',
      additionalContext = ''
    } = req.body;

    if (!chapter || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Chapter and subject are required'
      });
    }

    // Construct the AI prompt for assessment generation
    const systemPrompt = `You are an expert educational content creator. Generate a high-quality assessment with exactly ${numQuestions} multiple-choice questions about ${chapter} in ${subject}.

Requirements:
- Difficulty level: ${difficulty}
- Each question should have exactly 4 answer choices (A, B, C, D)
- Only one correct answer per question
- Questions should test understanding, not just memorization
- Cover different aspects of the topic
- Make questions clear and unambiguous
- Avoid trick questions

${additionalContext ? `Additional context: ${additionalContext}` : ''}

Return your response in the following JSON format:
{
  "title": "Assessment title",
  "description": "Brief description of the assessment",
  "questions": [
    {
      "prompt": "Question text here?",
      "choices": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0
    }
  ]
}

Generate ${numQuestions} well-crafted questions now:`;

    // Check if client is available
    const aiClient = getClient();
    
    // Call AI to generate assessment
    const completion = await aiClient.chat.completions.create({
      model: 'deepseek-ai/DeepSeek-V3.2-Exp:novita',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Create an assessment for: "${chapter}" in ${subject} (${difficulty} difficulty, ${numQuestions} questions)`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;

    // Try to parse the JSON response
    let assessmentData;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        assessmentData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('AI Response:', aiResponse);

      // Fallback: create a basic assessment structure
      assessmentData = {
        title: `${subject} - ${chapter} Assessment`,
        description: `AI-generated assessment covering ${chapter}`,
        questions: [
          {
            prompt: `What is the main concept covered in ${chapter}?`,
            choices: [
              "Concept A",
              "Concept B",
              "Concept C",
              "Concept D"
            ],
            correctIndex: 0
          }
        ]
      };
    }

    // Validate the assessment structure
    if (!assessmentData.questions || !Array.isArray(assessmentData.questions)) {
      throw new Error('Invalid assessment structure generated');
    }

    // Ensure all questions have the required structure
    assessmentData.questions = assessmentData.questions.map((q, index) => ({
      prompt: q.prompt || `Question ${index + 1}`,
      choices: Array.isArray(q.choices) && q.choices.length === 4
        ? q.choices
        : ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex <= 3
        ? q.correctIndex
        : 0
    }));

    res.status(200).json({
      success: true,
      data: {
        title: assessmentData.title || `${subject} - ${chapter} Assessment`,
        description: assessmentData.description || `AI-generated assessment covering ${chapter}`,
        questions: assessmentData.questions,
        metadata: {
          chapter,
          subject,
          difficulty,
          numQuestions: assessmentData.questions.length,
          questionType,
          generatedAt: new Date().toISOString(),
          generatedBy: 'AI'
        }
      }
    });

  } catch (error) {
    console.error('Error generating assessment:', error);
    
    // Check if it's a missing token error
    if (error.message.includes('HF_TOKEN') || error.message.includes('OPENAI_API_KEY')) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not configured. Please contact support.',
        error: 'Missing HF_TOKEN environment variable'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate assessment',
      error: error.message
    });
  }
};
