import express from 'express';
import {
  createChatSession,
  sendMessage,
  getChatHistory,
  getUserChatSessions,
  deleteChatSession,
  clearChatHistory,
  generateAssessment
} from '../controllers/ai.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// For now, make authentication optional for AI routes
// In production, you might want to require authentication
// router.use(protect);

// Create a new chat session
router.post('/sessions', createChatSession);

// Send a message to AI
router.post('/chat', sendMessage);

// Get chat history for a specific session
router.get('/sessions/:sessionId', getChatHistory);

// Get all chat sessions for the user
router.get('/sessions', getUserChatSessions);

// Delete a chat session
router.delete('/sessions/:sessionId', deleteChatSession);

// Clear chat history (keep session)
router.delete('/sessions/:sessionId/messages', clearChatHistory);

// Generate AI-powered assessment
router.post('/generate-assessment', generateAssessment);

export default router;
