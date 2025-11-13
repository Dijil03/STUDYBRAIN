import express from 'express';
import {
  getDashboard,
  getInsights,
  getPredictions,
  getTrends,
  generateReport
} from '../controllers/analytics.controller.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router();

// All routes are protected
router.get('/dashboard/:userId', protectRoutes, getDashboard);
router.get('/insights/:userId', protectRoutes, getInsights);
router.get('/predictions/:userId', protectRoutes, getPredictions);
router.get('/trends/:userId', protectRoutes, getTrends);
router.post('/report/generate', protectRoutes, generateReport);

export default router;
