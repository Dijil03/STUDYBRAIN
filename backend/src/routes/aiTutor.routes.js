import express from 'express';
import {
  getLearningPattern,
  getStudyMaterials,
  generateStudyMaterial,
  getRecommendations,
  createTutorSession,
  sendTutorMessage,
  endTutorSession,
} from '../controllers/aiTutor.controller.js';

const router = express.Router();

router.get('/pattern/:userId', getLearningPattern);
router.get('/materials', getStudyMaterials);
router.post('/materials/generate', generateStudyMaterial);
router.get('/recommendations/:userId', getRecommendations);

router.post('/session/create', createTutorSession);
router.post('/session/end', endTutorSession);
router.post('/message/send', sendTutorMessage);

export default router;
import express from 'express';
import {
    createSession,
    sendMessage,
    getConversationHistory,
    getLearningPattern,
    generateStudyMaterial,
    getStudyMaterials,
    getRecommendations,
    endSession,
    processVoiceMessage
} from '../controllers/aiTutor.controller.js';

const router = express.Router();

// Session management
router.post('/session/create', createSession);
router.post('/session/end', endSession);

// Messaging
router.post('/message/send', sendMessage);
router.post('/message/voice', processVoiceMessage);

// History and patterns
router.get('/conversations/:userId', getConversationHistory);
router.get('/pattern/:userId', getLearningPattern);

// Study materials
router.post('/materials/generate', generateStudyMaterial);
router.get('/materials', getStudyMaterials);

// Recommendations
router.get('/recommendations/:userId', getRecommendations);

export default router;
