import express from 'express';
import {
  getDailyCoaching,
  getSessionGuidance,
  getWeeklyReport
} from '../controllers/studyCoach.controller.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router();

// All routes are protected
router.get('/daily/:userId', protectRoutes, getDailyCoaching);
router.post('/session-guidance', protectRoutes, getSessionGuidance);
router.get('/weekly/:userId', protectRoutes, getWeeklyReport);

export default router;

