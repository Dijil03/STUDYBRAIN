import express from 'express';
import {
  getDashboard,
  getInsights,
  getPredictions,
  generateReport
} from '../controllers/analytics.controller.js';
import protectRoutes from '../middlewares/protectRoutes.js';

const router = express.Router();

// All routes are protected
router.get('/dashboard/:userId', protectRoutes, getDashboard);
router.get('/insights/:userId', protectRoutes, getInsights);
router.get('/predictions/:userId', protectRoutes, getPredictions);
router.post('/report/generate', protectRoutes, generateReport);

export default router;
