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
